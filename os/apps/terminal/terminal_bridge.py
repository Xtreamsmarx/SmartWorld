from __future__ import annotations

import json
import re
import os
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import request, error
from urllib.parse import parse_qs, quote, unquote, urlparse

HOST = "127.0.0.1"
PORT = 8765
WORKSPACE = Path(__file__).resolve().parents[3]
OLLAMA_API = "http://127.0.0.1:11434/api/generate"


def extract_page_text(html: str) -> str:
    cleaned = re.sub(r"<script[\\s\\S]*?</script>", " ", html, flags=re.IGNORECASE)
    cleaned = re.sub(r"<style[\\s\\S]*?</style>", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = re.sub(r"\\s+", " ", cleaned).strip()
    return cleaned


def extract_title(html: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return ""
    return re.sub(r"\\s+", " ", match.group(1)).strip()


def fetch_webpage(url: str) -> dict:
    if not url:
        return {"ok": False, "error": "Missing URL"}

    target = url.strip()
    if not target.lower().startswith(("http://", "https://", "file://")):
        if re.match(r"^[\\w.-]+\\.[a-z]{2,}($|/)", target, flags=re.IGNORECASE):
            target = f"https://{target}"

    req = request.Request(
        target,
        headers={
            "User-Agent": "SmartWorldBrowser/1.0 (+local-bridge)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        method="GET",
    )

    try:
        with request.urlopen(req, timeout=20) as response:
            content_type = response.headers.get("Content-Type", "")
            charset = "utf-8"
            if "charset=" in content_type:
                charset = content_type.split("charset=")[-1].split(";")[0].strip()
            raw = response.read().decode(charset, errors="replace")
            return {
                "ok": True,
                "url": target,
                "title": extract_title(raw),
                "text": extract_page_text(raw)[:20000],
            }
    except Exception as exc:
        return {"ok": False, "error": str(exc), "url": target}


def _strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def web_search(query: str, limit: int = 8) -> dict:
    q = (query or "").strip()
    if not q:
        return {"ok": False, "error": "Missing query"}

    safe_limit = max(1, min(int(limit or 8), 12))
    search_url = f"https://duckduckgo.com/html/?q={quote(q)}"
    req = request.Request(
        search_url,
        headers={
            "User-Agent": "SmartWorldBrowser/1.0 (+local-bridge)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        method="GET",
    )

    try:
        with request.urlopen(req, timeout=20) as response:
            html = response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        return {"ok": False, "error": str(exc)}

    pattern = re.compile(
        r'<a[^>]*class="result__a"[^>]*href="(?P<href>[^"]+)"[^>]*>(?P<title>[\s\S]*?)</a>',
        flags=re.IGNORECASE,
    )

    results = []
    for match in pattern.finditer(html):
        href = match.group("href")
        title_html = match.group("title")
        title = _strip_html(title_html)
        if href.startswith("/"):
            href = f"https://duckduckgo.com{href}"

        if "uddg=" in href:
            parsed = urlparse(href)
            params = parse_qs(parsed.query)
            uddg = params.get("uddg", [])
            if uddg:
                href = unquote(uddg[0])

        if not href.lower().startswith(("http://", "https://")):
            continue

        results.append({"title": title or href, "url": href})
        if len(results) >= safe_limit:
            break

    return {"ok": True, "query": q, "results": results}


def normalize_cwd(raw: str | None) -> Path:
    if not raw:
        return WORKSPACE
    try:
        candidate = Path(raw)
        if not candidate.is_absolute():
            candidate = (WORKSPACE / candidate).resolve()
        else:
            candidate = candidate.resolve()
    except Exception:
        return WORKSPACE

    try:
        candidate.relative_to(WORKSPACE)
    except ValueError:
        return WORKSPACE
    return candidate if candidate.exists() else WORKSPACE


def build_result(command: str, cwd: Path) -> dict:
    stripped = command.strip()
    if not stripped:
        return {"ok": True, "stdout": "", "stderr": "", "code": 0, "cwd": str(cwd)}

    if stripped.lower() == "pwd":
        return {"ok": True, "stdout": str(cwd), "stderr": "", "code": 0, "cwd": str(cwd)}

    if stripped.lower().startswith("cd"):
        target_raw = stripped[2:].strip() or "."
        target = normalize_cwd(str((cwd / target_raw).resolve()) if not Path(target_raw).is_absolute() else target_raw)
        if not target.exists() or not target.is_dir():
            return {
                "ok": False,
                "stdout": "",
                "stderr": f"The system cannot find the path specified: {target_raw}",
                "code": 1,
                "cwd": str(cwd),
            }
        return {"ok": True, "stdout": str(target), "stderr": "", "code": 0, "cwd": str(target)}

    completed = subprocess.run(
        ["powershell", "-NoProfile", "-Command", stripped],
        cwd=str(cwd),
        capture_output=True,
        text=True,
        timeout=25,
    )
    return {
        "ok": completed.returncode == 0,
        "stdout": completed.stdout,
        "stderr": completed.stderr,
        "code": completed.returncode,
        "cwd": str(cwd),
    }


def ask_ollama(model: str, prompt: str) -> dict:
    body = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode("utf-8")
    req = request.Request(OLLAMA_API, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=60) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw)
            return {
                "ok": True,
                "response": data.get("response", "").strip(),
                "model": data.get("model", model),
                "done": data.get("done", True),
            }
    except error.HTTPError as exc:
        return {"ok": False, "error": f"Ollama HTTP error: {exc.code}"}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send(200, {"ok": True})

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send(200, {"ok": True, "workspace": str(WORKSPACE), "port": PORT})
            return
        self._send(404, {"ok": False, "error": "Not found"})

    def do_POST(self) -> None:
        if self.path not in {"/execute", "/ollama/generate", "/web/fetch", "/web/search"}:
            self._send(404, {"ok": False, "error": "Not found"})
            return
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            self._send(400, {"ok": False, "error": "Invalid JSON"})
            return

        try:
            if self.path == "/execute":
                command = str(payload.get("command", ""))
                cwd = normalize_cwd(payload.get("cwd"))
                result = build_result(command, cwd)
                self._send(200, result)
                return

            if self.path == "/web/fetch":
                url = str(payload.get("url", ""))
                result = fetch_webpage(url)
                self._send(200, result)
                return

            if self.path == "/web/search":
                query = str(payload.get("query", ""))
                limit = int(payload.get("limit", 8))
                result = web_search(query, limit)
                self._send(200, result)
                return

            model = str(payload.get("model", "qwen2.5-coder:3b"))
            prompt = str(payload.get("prompt", ""))
            result = ask_ollama(model, prompt)
            self._send(200, result)
        except subprocess.TimeoutExpired:
            self._send(200, {"ok": False, "stdout": "", "stderr": "Command timed out after 25 seconds", "code": 124, "cwd": str(cwd)})
        except Exception as exc:
            self._send(500, {"ok": False, "error": str(exc)})

    def log_message(self, format: str, *args) -> None:
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Smart World terminal bridge listening on http://{HOST}:{PORT}")
    print(f"Workspace: {WORKSPACE}")
    server.serve_forever()
