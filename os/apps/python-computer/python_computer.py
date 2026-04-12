"""
UND Python Computer — terminal / REPL mode
Run:  python os/apps/python-computer/python_computer.py
      python -i os/apps/python-computer/python_computer.py   (interactive after script)
"""

import math
import csv
import os
import sys
import textwrap
from pathlib import Path


# ── Sample programs that ship with the computer ──────────────────────────────

SAMPLES: dict[str, str] = {
    "math": textwrap.dedent("""
        import math
        radius = 7
        area = math.pi * radius ** 2
        print(f"Circle area (r={radius}): {area:.4f}")

        data = [10, 42, 7, 95, 33]
        print(f"Max: {max(data)}, Min: {min(data)}, Sum: {sum(data)}")
        for i in range(1, 6):
            print(f"  {i}^2 = {i**2}")
    """).strip(),

    "csv": textwrap.dedent("""
        import csv, pathlib
        p = pathlib.Path(__file__).parent / "data.csv"
        with open(p, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                print(row)
    """).strip(),

    "stats": textwrap.dedent("""
        data = [23, 45, 12, 67, 34, 89, 56, 11, 78, 90]
        mean = sum(data) / len(data)
        variance = sum((x - mean) ** 2 for x in data) / len(data)
        std = variance ** 0.5
        print(f"Data : {data}")
        print(f"Mean : {mean:.2f}")
        print(f"StDev: {std:.2f}")
        print(f"Range: {max(data) - min(data)}")
    """).strip(),
}


# ── CSV helper ────────────────────────────────────────────────────────────────

def show_csv() -> None:
    csv_path = Path(__file__).parent / "data.csv"
    if not csv_path.exists():
        print("data.csv not found.")
        return
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    if not rows:
        print("data.csv is empty.")
        return
    headers = list(rows[0].keys())
    col_w = {h: max(len(h), max(len(r[h]) for r in rows)) for h in headers}
    header_line = " | ".join(h.ljust(col_w[h]) for h in headers)
    print(header_line)
    print("-" * len(header_line))
    for row in rows:
        print(" | ".join(row[h].ljust(col_w[h]) for h in headers))


# ── REPL ──────────────────────────────────────────────────────────────────────

BANNER = """
╔══════════════════════════════════════════════╗
║  UND Python Computer                         ║
║  Type  help  for commands • exit  to quit    ║
╚══════════════════════════════════════════════╝
"""

HELP_TEXT = """
Commands
  run math     — run built-in math sample
  run csv      — run built-in CSV reader sample
  run stats    — run built-in statistics sample
  show csv     — pretty-print data.csv
  clear        — clear the screen
  exit / quit  — exit the computer

Any other input is executed as Python code.
Press Ctrl+C to cancel the current line.
"""


def run_sample(name: str) -> None:
    src = SAMPLES.get(name)
    if src is None:
        print(f"No sample named '{name}'. Available: {', '.join(SAMPLES)}")
        return
    print(f"--- running sample: {name} ---")
    exec(src, {"__name__": "__main__"})  # noqa: S102


def repl() -> None:
    print(BANNER)
    buf: list[str] = []

    while True:
        prompt = "... " if buf else "py> "
        try:
            line = input(prompt)
        except (EOFError, KeyboardInterrupt):
            print()
            break

        low = line.strip().lower()

        # ── built-in commands ────────────────────────────
        if low in {"exit", "quit"}:
            print("Bye.")
            break
        if low == "help":
            print(HELP_TEXT)
            continue
        if low == "clear":
            os.system("cls" if sys.platform == "win32" else "clear")
            continue
        if low == "show csv":
            show_csv()
            continue
        if low.startswith("run "):
            run_sample(low[4:].strip())
            continue

        # ── accumulate multi-line blocks ──────────────────
        buf.append(line)
        src = "\n".join(buf)

        try:
            code = compile(src, "<input>", "exec")
        except SyntaxError as err:
            # Might be incomplete (e.g. open if/for block).
            if "unexpected EOF" in str(err) or "was never closed" in str(err):
                continue   # wait for more input
            print(f"SyntaxError: {err}")
            buf.clear()
            continue

        buf.clear()
        try:
            exec(code, {})  # noqa: S102
        except Exception as exc:
            print(f"{type(exc).__name__}: {exc}")


if __name__ == "__main__":
    repl()

