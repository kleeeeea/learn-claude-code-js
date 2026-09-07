# Keep under 3 line, just add a port 80 parameter to serve.sh
exec bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/serve.sh" --sudo --host 0.0.0.0 "$@"
