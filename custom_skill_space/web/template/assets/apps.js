// 下游应用页：从 apps.json 渲染 5 个 L1 分类 / 15 个 L2 用例，点开看真实运行结果。
// 附一个够用的 markdown 渲染器（标题/表格/列表/引用/代码/加粗），不引第三方库。

(function () {
	// 每个 L1 的定位说明（图谱数据里没有这层语义，写在这里）
	const CAT_INFO = {
		A1: { input: "编号 / 年级 / 领域", output: "原文 + 解读 + 页码", dir: "编号 → 内容（正查）" },
		A2: { input: "题目 / 教案 / 课件文本", output: "命中编号 + 依据 + 置信度", dir: "内容 → 编号（反查）" },
		A3: { input: "错题记录 / 答题表现", output: "薄弱编号 + 前置链 + 补救顺序", dir: "编号 → 纵向前置" },
		A4: { input: "年级 + 单元 + 课时数", output: "教学序列，每课时挂编号", dir: "编号集合 → 排序" },
		A5: { input: "编号集合 + 题量/题型", output: "题目 + 评分要点 + 细目表", dir: "编号 → 可测行为" },
	};

	const el = {
		overview: document.getElementById("overview"),
		cats: document.getElementById("cats"),
		pills: document.getElementById("run-pills"),
		modal: document.getElementById("case-modal"),
		mTitle: document.getElementById("m-title"),
		mBody: document.getElementById("m-body"),
	};
	document.getElementById("m-close").addEventListener("click", () => el.modal.close());

	fetch("assets/data/apps.json").then((r) => r.json()).then(render).catch((e) => {
		el.cats.innerHTML = `<p class="muted">数据加载失败：${e.message}。先跑 build_data.py。</p>`;
	});

	function render(data) {
		const cases = data.categories.flatMap((c) => c.cases);
		const passed = cases.filter((c) => c.passed).length;
		const codes = new Set(cases.flatMap((c) => c.codes_valid));
		const tools = cases.reduce((s, c) => s + c.tool_calls.length, 0);
		const secs = cases.reduce((s, c) => s + c.elapsed_s, 0);

		el.pills.innerHTML = [
			`run ${data.run}`,
			`${cases[0] ? cases[0].provider + "/" + cases[0].model : ""}`,
			`${passed}/${cases.length} 通过`,
			`${Math.round(secs)}s 总耗时`,
		].filter(Boolean).map((t) => `<span class="pill">${t}</span>`).join("");

		el.overview.innerHTML = [
			["用例", `${cases.length}`, `${data.categories.length} 个一级分类`],
			["通过", `${passed}/${cases.length}`, "回表核对判定"],
			["去重编号", `${codes.size}`, "被引用且真实存在"],
			["工具调用", `${tools}`, "read / bash 查表"],
		].map(([label, num, sub]) =>
			`<div class="stat card"><div class="num">${num}</div><div class="label">${label}</div>` +
			`<div class="faint" style="font-size:12px">${sub}</div></div>`
		).join("");

		el.cats.innerHTML = data.categories.map((cat) => {
			const info = CAT_INFO[cat.id] || {};
			return `<section class="app-cat" id="${cat.id}" style="border:0;padding:0">
				<div class="app-cat-head">
					<span class="l1">${cat.id}</span>
					<h3>${escapeHtml(cat.name)}</h3>
					<span class="count">${cat.cases.length} 个用例</span>
				</div>
				<div class="pill-row">
					<span class="pill">输入：${escapeHtml(info.input || "")}</span>
					<span class="pill">输出：${escapeHtml(info.output || "")}</span>
					<span class="pill">${escapeHtml(info.dir || "")}</span>
				</div>
				<div class="grid grid-3">
					${cat.cases.map((c) => caseCard(c)).join("")}
				</div>
			</section>`;
		}).join("");

		el.cats.querySelectorAll(".case-card").forEach((card) => {
			card.addEventListener("click", () => {
				const c = cases.find((x) => x.id === card.dataset.id);
				if (c) openCase(c);
			});
		});
	}

	function caseCard(c) {
		return `<article class="card case-card" data-id="${c.id}">
			<span class="tag ${c.passed ? "tag-live" : "tag-soon"}">${c.passed ? "PASS" : "FAIL"}</span>
			<div class="l2">${c.id}</div>
			<div class="prompt-preview">${escapeHtml(c.prompt)}</div>
			<div class="case-meta">
				<span class="chip">${c.elapsed_s}s</span>
				<span class="chip">${c.codes_valid.length} 个编号</span>
				<span class="chip">${c.tool_calls.length} 次工具</span>
			</div>
		</article>`;
	}

	function openCase(c) {
		el.mTitle.textContent = `${c.id} · ${c.codes_valid.length} 个课标编号`;
		const u = c.usage || {};
		el.mBody.innerHTML =
			`<div class="pill-row">
				<span class="pill">${c.provider}/${c.model}</span>
				<span class="pill">${c.elapsed_s}s</span>
				<span class="pill">正文 ${c.answer_chars} 字</span>
				<span class="pill">thinking ${c.thinking_chars} 字</span>
				<span class="pill">tokens ${u.totalTokens || 0}</span>
				<span class="pill">session ${String(c.session_id).slice(0, 8)}</span>
			</div>
			<h4>PROMPT</h4>
			<div class="code" style="white-space:pre-wrap">${escapeHtml(c.prompt)}</div>
			<h4>引用到的课标编号（均已回表核对）</h4>
			<div class="pill-row">${c.codes_valid.map((x) => `<span class="pill">${x}</span>`).join("") || "<span class='muted'>无</span>"}</div>
			<h4>工具调用</h4>
			<div class="pill-row">${c.tool_calls.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join("") || "<span class='muted'>无</span>"}</div>
			<h4>模型回答</h4>
			<div class="answer">${md(c.answer)}</div>`;
		el.modal.showModal();
		el.mBody.scrollTop = 0;
	}

	// ── 够用的 markdown 渲染：标题 / 表格 / 列表 / 引用 / 代码 / 加粗 / 行内码 ──
	function md(src) {
		const lines = String(src || "").split("\n");
		const out = [];
		let i = 0;
		while (i < lines.length) {
			const line = lines[i];

			// 围栏代码块
			if (/^```/.test(line)) {
				const body = [];
				i++;
				while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++]);
				i++;
				out.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
				continue;
			}
			// 表格：当前行有 | 且下一行是分隔行
			if (line.includes("|") && /^\s*\|?[\s:-]*\|[\s:|-]*$/.test(lines[i + 1] || "")) {
				const head = splitRow(line);
				i += 2;
				const rows = [];
				while (i < lines.length && lines[i].includes("|")) rows.push(splitRow(lines[i++]));
				out.push(
					`<table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead>` +
					`<tbody>${rows.map((r) => `<tr>${r.map((d) => `<td>${inline(d)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
				);
				continue;
			}
			// 标题
			const h = line.match(/^(#{1,6})\s+(.*)$/);
			if (h) { out.push(`<h${Math.min(6, h[1].length + 2)}>${inline(h[2])}</h${Math.min(6, h[1].length + 2)}>`); i++; continue; }
			// 引用
			if (/^>\s?/.test(line)) {
				const body = [];
				while (i < lines.length && /^>\s?/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ""));
				out.push(`<blockquote>${inline(body.join("<br>"))}</blockquote>`);
				continue;
			}
			// 列表
			if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
				const ordered = /^\s*\d+[.)]\s+/.test(line);
				const items = [];
				while (i < lines.length && (/^\s*[-*+]\s+/.test(lines[i]) || /^\s*\d+[.)]\s+/.test(lines[i]))) {
					items.push(lines[i++].replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""));
				}
				out.push(`<${ordered ? "ol" : "ul"}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
				continue;
			}
			// 分隔线 / 空行
			if (/^\s*---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
			if (!line.trim()) { i++; continue; }
			// 普通段落
			const para = [];
			while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|```|\s*[-*+]\s|\s*\d+[.)]\s)/.test(lines[i])
				&& !(lines[i].includes("|") && /^\s*\|?[\s:-]*\|[\s:|-]*$/.test(lines[i + 1] || ""))) {
				para.push(lines[i++]);
			}
			if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
			else i++;
		}
		return out.join("\n");
	}

	function splitRow(line) {
		return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((s) => s.trim());
	}

	function inline(s) {
		return escapeHtml(s)
			.replace(/`([^`]+)`/g, "<code>$1</code>")
			.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
			.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
	}

	function escapeHtml(s) {
		return String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => (
			{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
		));
	}
})();
