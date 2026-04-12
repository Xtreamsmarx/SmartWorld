from __future__ import annotations

import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import request, error

HOST = "127.0.0.1"
PORT = 8765
WORKSPACE = Path(__file__).resolve().parents[3]
OLLAMA_API = "http://127.0.0.1:11434/api/generate"


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
        if self.path not in {"/execute", "/ollama/generate"}:
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
