# Contributing — StudyBot

## Project Setup

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)
- Python 3.12+ (only for Ruff linting)

### Installation

```bash
cd StudyBot
npm install
npm run dev        # starts dev server at http://localhost:3000
npm test           # run unit tests
npm run test:coverage  # run tests with coverage report
```

### Known Windows Issue
On Windows, `npm` must be called as `npm.cmd` in subprocess contexts. This is already handled in the codebase (see commit `3a21058`). If you see `ENOENT` errors with npm, check your PATH.

---

## New Project Checklist

Before the first commit on any new project:

- [ ] Add `.gitignore` (node_modules/, .env, coverage/, .ruff_cache/, dist/)
- [ ] Add `README.md` with setup instructions
- [ ] Set up the test framework and verify it runs
- [ ] Create a feature branch — never commit directly to `main`

---

## Branch & PR Workflow

1. Create a branch: `git checkout -b feature/<short-name>`
2. Make your changes and commit (see commit conventions below)
3. Before opening a PR, confirm the feature runs locally
4. Open a Pull Request on GitHub — no direct pushes to `main`
5. PRs are merged after self-review

**Spike branches:** For any new technology or library, first open a `spike/<name>` branch. Max 2 hours of exploration. Only proceed with a full feature branch if the spike confirms it's feasible.

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, config, CI changes |
| `ci:` | Changes to GitHub Actions workflows |
| `revert:` | Reverting a previous commit |

**Examples:**
```
feat: add keyboard navigation for flashcards
fix: use npm.cmd on Windows for subprocess compatibility
ci: add Vitest job to GitHub Actions workflow
```

No WIP commits on shared branches. Use `git stash` instead.

---

## CI Pipeline

Every push to `main` and every PR runs two checks automatically:

| Check | Tool | Threshold |
|---|---|---|
| Python linting | Ruff | Zero errors |
| JavaScript tests | Vitest | All tests must pass |

PRs should only be merged when both checks are green.

---

## Task Tracking

- All planned work is tracked via **GitHub Issues**
- At the start of each week: open issues, assign owners, add labels
- Labels: `feature`, `bug`, `docs`, `test`, `chore`
- At least 2 issues per active week per person
