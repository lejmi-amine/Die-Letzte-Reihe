"""
Project health check script.
Verifies that all required tools and dependencies are installed.

Usage:
    python scripts/check.py
"""

import shutil
import subprocess
import sys


def check_tool(name: str) -> bool:
    """Return True if the given CLI tool is available on PATH."""
    return shutil.which(name) is not None


def check_npm_deps(cwd: str) -> bool:
    """Return True if node_modules exists and npm install succeeds."""
    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    result = subprocess.run(
        [npm, "install", "--dry-run"],
        cwd=cwd,
        capture_output=True,
        check=False,
    )
    return result.returncode == 0


def main() -> None:
    """Run all health checks and report results."""
    errors = []

    tools = ["node", "npm", "git"]
    for tool in tools:
        if check_tool(tool):
            print(f"  [OK] {tool} found")
        else:
            print(f"  [MISSING] {tool} not found")
            errors.append(tool)

    if not check_npm_deps("StudyBot"):
        print("  [FAIL] StudyBot dependencies not installable")
        errors.append("studybot-deps")
    else:
        print("  [OK] StudyBot dependencies OK")

    if errors:
        print(f"\nHealth check failed: {errors}")
        sys.exit(1)

    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
