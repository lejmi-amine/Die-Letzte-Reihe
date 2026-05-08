# Software Architecture — StudyBot

## 1. Introduction

StudyBot is a client-side Single Page Application (SPA) built with React 18 and Vite. It converts raw lecture text into interactive study material — flashcards, summaries, and quizzes — entirely in the browser, with no server, no API calls, and no data leaving the user's device.

**Architectural Goal:** Clean separation of business logic from UI rendering, full testability without a browser environment, and zero external runtime dependencies.

---

## 2. Architectural Overview

### 2.1 Single-Page Application (Client-Side Only)

- **No backend:** All NLP processing runs in the user's browser via JavaScript
- **No API calls at runtime:** No network requests after the initial page load
- **No data persistence beyond `localStorage`:** Study session history is stored locally

### 2.2 Core Pattern: Single Responsibility Split

The single most important architectural decision is the strict separation of business logic from the React UI:

```
src/
├── studybot.logic.js   ← Pure NLP functions (no React, no DOM, fully testable)
└── StudyBot.jsx        ← React component (UI, state, event handlers only)
```

This separation enables:
- **Full unit testability** in Node.js without a browser or React test renderer
- **Parallel development** — logic and UI can be developed independently
- **Clean testing** — no DOM or React setup needed in tests

### 2.3 Layered Architecture

| Layer | File | Responsibility |
|:------|:-----|:---------------|
| **Presentation** | `StudyBot.jsx` | React components, state management, user events, theme system |
| **Logic** | `studybot.logic.js` | NLP pipeline: sentence extraction, TF-IDF scoring, content generation |
| **Tests** | `tests/studybot.logic.test.js` | 76 unit tests covering the logic layer exclusively |
| **Config** | `vite.config.js` | Build configuration and coverage thresholds |
| **CI** | `.github/workflows/lint.yml` | Ruff linter + Vitest on every push and pull request |

---

## 3. NLP Pipeline Architecture

The entire NLP pipeline runs in `studybot.logic.js` as a chain of pure functions:

```
Input Text
    │
    ▼
extractSentences()
    splits on . ! ? · filters sentences < 20 chars
    │
    ▼
extractKeyTerms()
    lowercase · strip stopwords (DE + EN + generic adjectives)
    → group by German suffix stem
    → TF-IDF score + length bonus
    → top 20 terms
    │
    ├──▶ generateFlashcards()
    │        term → best matching sentence → front/back card pair
    │
    ├──▶ generateSummary()
    │        intro:      sentences[0]
    │        key points: body sentences scored by term density,
    │                    top 5 selected, re-sorted into narrative order
    │        key terms:  top 5, capitalized
    │        fazit:      best 2 sentences from last 40% of text,
    │                    joined in reading order
    │
    └──▶ generateQuiz()
             term → correct answer from text + 3 constructed wrong answers
             → correct answer placed at random index 0–3
```

### 3.1 German Suffix Stemmer

A custom suffix stemmer (`stem()`) groups inflected German word forms under a shared stem key. This prevents "Photosynthese", "Photosynthesen", and "Photosyntheses" from being counted as three separate terms.

Suffixes stripped in priority order:
```
ungen, schaft, heit, keit, lich, isch, ung, ern, eln, ster, sten,
ende, enden, ender, ens, ers, est, em, er, es, en, e, s
```

Minimum stem length: 4 characters. Any stripping that would leave fewer than 4 characters is skipped.

### 3.2 TF-IDF Scoring Formula

```
score = termCount × log((totalSentences + 1) / documentFrequency) × (1 + log(termLength / 4))
```

| Factor | Purpose |
|:-------|:--------|
| `termCount` | Raw frequency of the stem group |
| `log((S+1)/df)` | IDF: rewards terms specific to few sentences |
| `(1 + log(length/4))` | Length bonus: longer terms tend to be more domain-specific in German |

### 3.3 Stopword Filtering

The stopword list covers ~200 entries across three categories:
- **German function words:** articles, prepositions, conjunctions, pronouns
- **English function words:** for texts with mixed-language content (e.g. lecture slides)
- **Generic German adjectives:** common modifiers that are almost never domain-specific (`wichtig*`, `groß*`, `neu*`, `möglich*`, `künstlich*`, etc.)

---

## 4. React Component Architecture

`StudyBot.jsx` is a single-file component that manages all application state. Sub-components are co-located in the same file:

| Component | Purpose |
|:----------|:--------|
| `StudyBot` (default export) | Root component — all state lives here |
| `FlashcardComp` | Single flashcard with 3D flip animation and drag-and-drop support |
| `MiniCard` | Compact card tile for grid view |
| `QuizQuestion` | Quiz question with 4 answer options and reveal state |
| `Loader` | Spinner shown during content generation |
| `PomodoroTimer` | 25/5/15-minute Pomodoro timer in the header |
| `LernkalenderComp` | Monthly calendar visualizing study history from `localStorage` |

### 4.1 State Overview

All state lives in the root `StudyBot` component and is passed down as props:

| State | Type | Description |
|:------|:-----|:------------|
| `theme` | `"dark" \| "light"` | Active color theme |
| `activeTab` | string | Current tab id (`input`, `cards`, `summary`, `quiz`, `history`) |
| `inputText` | string | User's raw lecture text |
| `cards` | Card[] | Generated flashcards |
| `deck` | number[] | Weighted card ordering for Spaced Repetition |
| `cardRatings` | object | Per-card `easy / medium / hard` rating |
| `summary` | string | Generated summary text |
| `quiz` | Question[] | Generated quiz questions |
| `cardCount` | `6 \| 9 \| 12 \| 15` | Number of cards to generate |

### 4.2 Theme System

Colors are defined in a `THEMES` constant with `dark` and `light` keys. Every inline style in the component reads from `THEMES[theme]`. No hardcoded color values exist outside this object, which makes dark/light switching a single state toggle.

---

## 5. Data Flow

```
User types text
    │
    ▼
[inputText state]
    │
    ▼
generate() ──► studybot.logic.js
                    │
                    ├── generateFlashcards(inputText, cardCount)
                    ├── generateSummary(inputText)
                    └── generateQuiz(inputText)
                    │
                    ▼
            [cards, summary, quiz states updated]
                    │
                    ▼
            React re-render → navigate to "Karteikarten" tab
```

---

## 6. Folder Structure

```
Die-Letzte-Reihe/
├── StudyBot/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              ← Vite + coverage config
│   ├── src/
│   │   ├── main.jsx                ← React entry point (StrictMode)
│   │   ├── StudyBot.jsx            ← UI component (presentation layer)
│   │   └── studybot.logic.js       ← NLP logic (logic layer, test target)
│   └── tests/
│       └── studybot.logic.test.js  ← 76 unit tests
├── Docs/
│   ├── Architecture.md             ← this file
│   ├── TechStack.md
│   ├── Unit-Tests.md
│   ├── user-stories.md
│   └── retrospective.md
├── .github/
│   └── workflows/
│       └── lint.yml                ← CI pipeline (Ruff + Vitest)
├── CONTRIBUTING.md
└── retrospective.md
```

---

## 7. Architecture Decision Records (ADRs)

### ADR-001 — Logic Extraction into `studybot.logic.js`

| | |
|---|---|
| **Status** | Accepted |
| **Context** | `StudyBot.jsx` started as a single file containing both UI and NLP logic |
| **Decision** | Extract all pure functions into `studybot.logic.js` |
| **Rationale** | Enables unit testing in Node without React/DOM; enforces SRP; allows parallel development |
| **Consequences** | All generators and analyzers are pure functions with no side effects; imports are explicit |

### ADR-002 — No External AI API (Custom NLP Instead)

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Initial attempt to use Transformers.js (distilbart-cnn-6-6) for abstractive summarization |
| **Decision** | Implement extractive NLP with TF-IDF + German suffix stemmer |
| **Rationale** | 350 MB model download made the app unusable; no API key required; no user data leaves the device |
| **Consequences** | Output is extractive (sentences selected from text), not abstractive (sentences generated) |

### ADR-003 — Vite over Create React App

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Need for fast development iteration and native ESM module support |
| **Decision** | Use Vite 6 with `@vitejs/plugin-react` |
| **Rationale** | Near-instant HMR, native ESM aligns with Vitest, minimal configuration overhead |
| **Consequences** | Less documentation available than CRA, but significantly better developer experience |

### ADR-004 — Vitest over Jest

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Testing a Vite-based project with `"type": "module"` in package.json |
| **Decision** | Use Vitest instead of Jest |
| **Rationale** | Native ESM support without Babel transforms; shares Vite config; faster for pure function tests |
| **Consequences** | Smaller ecosystem than Jest, but fully sufficient for logic-only unit tests |

---

## 8. Non-Functional Requirements

| Requirement | Approach |
|:------------|:---------|
| **Performance** | Full NLP pipeline completes in < 30 ms for 10,000-character input |
| **Privacy** | Zero network calls at runtime; no user data transmitted anywhere |
| **Testability** | 76 unit tests; 100% statement, function, and line coverage |
| **Maintainability** | SRP: logic ↔ UI split; named exports; Conventional Commits format |
| **Offline capability** | App functions without internet connection after the initial page load |
