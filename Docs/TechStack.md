# Tech Stack — StudyBot

## Overview

StudyBot is a fully client-side React SPA with no backend. All NLP processing runs in the user's browser. The stack was chosen for simplicity, testability, and zero runtime dependencies on external services.

---

## Frontend

| Category | Technology | Version | Description |
|:----------|:------------|:--------|:-------------|
| **UI Framework** | React | 18.x | Component-based UI with Hooks |
| **Language** | JavaScript | ES2022 | Native ESM modules, no TypeScript |
| **Styling** | CSS-in-JS (inline styles) | — | Theme object in `StudyBot.jsx`; no external CSS framework |
| **State Management** | React `useState` / `useCallback` | — | Local component state only; no external store |
| **Build Tool** | Vite | 6.x | Fast HMR, native ESM, minimal config |
| **Entry Point** | `src/main.jsx` | — | `ReactDOM.createRoot` with `React.StrictMode` |

---

## Business Logic

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **NLP Engine** | Custom (`studybot.logic.js`) | Fully client-side; no external NLP library |
| **Sentence Splitting** | Regex-based (`extractSentences`) | Splits on `.` `!` `?`; filters sentences < 20 chars |
| **Key Term Extraction** | TF-IDF + stem grouping (`extractKeyTerms`) | Groups inflected word forms; rewards specific, domain-relevant terms |
| **German Stemmer** | Custom suffix stemmer (`stem`) | 23 suffix patterns, minimum 4-char stem |
| **Stopword List** | Custom bilingual (DE + EN) | ~200 entries: function words + generic adjectives/participles |
| **Summarization** | Extractive sentence selection (`generateSummary`) | Body: top 5 by term density, narrative order · Fazit: best 2 from last 40% |
| **Flashcard Generation** | Term-to-sentence matching (`generateFlashcards`) | Configurable count: 6 / 9 / 12 / 15 cards |
| **Quiz Generation** | Term-based MCQ (`generateQuiz`) | Up to 5 questions; correct answer at random index via `Math.random` |
| **Spaced Repetition** | Weighted deck (`buildWeightedDeck`) | easy→1×, medium→2×, hard→3× repetitions in next round |

---

## Testing

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **Test Runner** | Vitest | 2.1.9 — native ESM, shared Vite config, no Babel |
| **Coverage Provider** | @vitest/coverage-v8 | HTML + text reporter |
| **Mocking** | `vi.spyOn` | Used only for `Math.random` in quiz placement tests |
| **Test Count** | 76 unit tests | 13 `describe` blocks — pure Node execution, no DOM |
| **Coverage** | 91.76% branches · 100% statements/functions/lines | Threshold enforced in `vite.config.js` |

---

## Infrastructure / CI

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **CI/CD** | GitHub Actions | Two jobs: Ruff linter + Vitest test suite on every push and PR |
| **Linter** | Ruff | Python linter used in CI for the repo's Python files |
| **Version Control** | Git + GitHub | Feature branches with pull request workflow |
| **Package Manager** | npm | `package-lock.json` committed for reproducible installs |

---

## Key Dependencies

| Package | Purpose |
|:--------|:--------|
| `react` `react-dom` | UI rendering |
| `vite` `@vitejs/plugin-react` | Build tool + JSX transform |
| `vitest` `@vitest/coverage-v8` | Test runner + coverage |

No runtime API dependencies. No database. No authentication. No server.

---

## Decision Rationale

### Why no TypeScript?

The project is a semester SPA with a two-person team on a short timeline. The configuration overhead (tsconfig, type definitions for React) was not justified. JavaScript with descriptive naming provides adequate documentation.

### Why inline CSS-in-JS instead of Tailwind or CSS modules?

The entire theme system lives in a single `THEMES` constant in `StudyBot.jsx`. Every color reads from this object — no hardcoded values exist elsewhere. Dark/light switching is a single state toggle with no class-name or CSS-variable infrastructure needed.

### Why no state management library (Zustand / Redux)?

All state lives in the root `StudyBot` component. The app has no routing and no shared state between independent component trees. An external store would add complexity without benefit.

### Why Vitest over Jest?

The project uses Vite with `"type": "module"` in `package.json`. Vitest runs with the same Vite config — no Babel transform is needed. It is also significantly faster for a pure-function test suite with no DOM setup.

### Why no external NLP library?

The initial attempt to use Transformers.js (distilbart-cnn-6-6) failed due to a 350 MB model download on first use. The custom TF-IDF + German suffix stemmer delivers adequate quality for German lecture text with zero runtime dependencies and < 30 ms processing time.

---

## Alternatives Considered

| Decision | Alternative | Chosen | Reason |
|:---------|:------------|:-------|:-------|
| **Styling** | Tailwind CSS / CSS Modules | Inline CSS-in-JS | No build complexity; theme switching trivial with a JS object |
| **NLP** | Transformers.js (distilbart) | Custom TF-IDF | 350 MB model unusable; custom solution is faster and dependency-free |
| **Testing** | Jest | Vitest | Native ESM support, shared Vite config, faster execution |
| **State** | Zustand | React `useState` | No cross-tree state sharing needed in a single-component app |
| **Language** | TypeScript | JavaScript | Lower setup overhead for a semester project |
| **Summarization** | Abstractive (LLM) | Extractive (TF-IDF) | No API key, no cost, no privacy concerns, offline-capable |
