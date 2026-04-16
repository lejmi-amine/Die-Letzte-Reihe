"""
Startup helper script for the Die-Letzte-Reihe project.
Launches the StudyBot dev server or runs the test suite.

Usage:
    python main.py dev      # Start StudyBot dev server
    python main.py test     # Run unit tests
    python main.py coverage # Run tests with coverage report
"""

import subprocess
import sys


def run(command: list[str], cwd: str) -> None:
    """Run a shell command in the given working directory."""
    result = subprocess.run(command, cwd=cwd, check=False)
    if result.returncode != 0:
        sys.exit(result.returncode)


def main() -> None:
    """Entry point — dispatch based on CLI argument."""
    commands = {
        "dev": ["npm", "run", "dev"],
        "test": ["npm", "test"],
        "coverage": ["npm", "run", "test:coverage"],
    }

    arg = sys.argv[1] if len(sys.argv) > 1 else "dev"

    if arg not in commands:
        print(f"Unknown command: {arg}")
        print(f"Available: {', '.join(commands.keys())}")
        sys.exit(1)

    run(commands[arg], cwd="StudyBot")


if __name__ == "__main__":
    main()
