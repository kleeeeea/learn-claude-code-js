// 全站共用：主题切换 + 数字滚动 + 当前导航高亮。无依赖。

(function () {
	// ── 主题：跟随系统，用户选过就记住 ──
	const KEY = "standards-atlas-theme";
	const root = document.documentElement;
	const saved = localStorage.getItem(KEY);
	const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
	root.dataset.theme = saved || (prefersDark ? "dark" : "light");

	const toggle = document.getElementById("theme-toggle");
	if (toggle) {
		toggle.addEventListener("click", () => {
			root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
			localStorage.setItem(KEY, root.dataset.theme);
			document.dispatchEvent(new CustomEvent("themechange"));
		});
	}

	// ── 统计数字滚动：进入视口才跑一次 ──
	const nums = document.querySelectorAll("[data-count]");
	if (nums.length && "IntersectionObserver" in window) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				io.unobserve(entry.target);
				countUp(entry.target);
			});
		}, { threshold: 0.4 });
		nums.forEach((n) => io.observe(n));
	}

	function countUp(el) {
		const target = Number(el.dataset.count || 0);
		const suffix = el.dataset.suffix || "";
		const dur = 900;
		const t0 = performance.now();
		function tick(now) {
			const p = Math.min(1, (now - t0) / dur);
			// easeOutCubic
			const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
			el.textContent = v.toLocaleString("en-US") + suffix;
			if (p < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}

	// ── 导航高亮当前页 ──
	const here = location.pathname.split("/").pop() || "index.html";
	document.querySelectorAll(".nav-links a").forEach((a) => {
		const href = a.getAttribute("href") || "";
		if (href === here) a.classList.add("active");
	});
})();
