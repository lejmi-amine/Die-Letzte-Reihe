# Finale Präsentation — StudyBot
**Software Engineering | DHBW | 22. Mai 2026**
**Team: Die Letzte Reihe — Amine Lejmi & David Liebermann**
**Dauer: 20–30 Minuten**

---

## Zeitplan

| Abschnitt | Inhalt | Zeit |
|---|---|---|
| 1 | Motivation & Pitch | ~4 min |
| 2 | Wie funktioniert das System | ~5 min |
| 3 | Live-Demo | ~5 min |
| 4 | Code-Walkthrough | ~8 min |
| 5 | Recap & Lessons Learned | ~5 min |
| — | Puffer / Fragen | ~3 min |

---

## 1. Motivation & Pitch (~4 min)

### Das Problem

Studierende verbringen viel Zeit damit, Vorlesungsskripte manuell aufzubereiten:
- Text in Tool A für Karteikarten einfügen
- Text in Tool B für eine Zusammenfassung einfügen
- Quizfragen selbst formulieren

Jedes dieser Tools braucht einen Account, speichert Daten auf fremden Servern und kostet Zeit.

### Die Lösung: StudyBot

> „Turn any lecture text into flashcards, a summary, and a quiz — instantly, in your browser."

- **Ein Klick** — Text einfügen, Generate drücken, fertig
- **Kein Account, kein API-Key, keine Daten verlassen das Gerät**
- **Läuft komplett offline** nach dem ersten Laden

### Zielgruppe (aus den User Stories)

| Persona | Profil | Kernbedürfnis |
|---|---|---|
| **Lena** | Vollzeit-Studentin, BWL 3. Sem. | Schnell Lernmaterial aus Skripten erstellen |
| **Tobias** | Autodidakt, lernt abends | Interaktives Selbsttesten mit sofortigem Feedback |
| **Sarah** | Lernt nachts, wechselt Geräte | Einheitliches UI, Dark Mode, funktioniert mobil |

---

## 2. Wie funktioniert das System (~5 min)

### Architektur in einem Satz

StudyBot ist eine **clientseitige React-SPA** — kein Backend, keine Datenbank, keine externen API-Calls nach dem Seitenaufruf.

### Warum kein KI-Modell?

Wir haben Transformers.js (distilbart-cnn-6-6) versucht:
- Ergebnis: **350 MB Download beim ersten Start** — App praktisch unnutzbar
- Entscheidung: Custom TF-IDF + deutscher Suffix-Stemmer
- Ergebnis: **< 30 ms Verarbeitung**, keine Abhängigkeiten, läuft offline

### Die NLP-Pipeline

```
Eingabetext
    │
    ▼
1. extractSentences()
   Aufteilen an . ! ?  ·  Sätze < 20 Zeichen herausfiltern
    │
    ▼
2. stem() + extractKeyTerms()
   Deutsche Suffixe abschneiden  ·  Stopwörter (DE + EN + generische Adjektive) filtern
   TF-IDF-Score: belohnt seltene, lange, spezifische Begriffe
   → Top-20-Begriffe
    │
    ├──► generateFlashcards()
    │    Begriff → passendster Satz → Frage/Antwort-Karte
    │
    ├──► generateSummary()
    │    Überblick: erster Satz
    │    Kernpunkte: top 5 Sätze nach Termdichte, in Lesereihenfolge
    │    Fazit: beste 2 Sätze aus letzten 40% des Textes
    │
    └──► generateQuiz()
         Begriff → richtiger Antwort-Satz + 3 konstruierte Falschantworten
         Position der richtigen Antwort: Math.random()
```

### Architekturentscheidung: Single Responsibility Split

```
src/
├── studybot.logic.js   ← Reine NLP-Funktionen  (kein React, kein DOM, vollständig testbar)
└── StudyBot.jsx        ← React-Komponente       (UI, State, Events — kein Business Logic)
```

**Warum das die wichtigste Entscheidung war:**
- Alle 76 Unit Tests laufen in **< 40 ms** direkt in Node — ohne Browser, ohne jsdom
- Logik und UI konnten **parallel entwickelt** werden
- Parallele Arbeit ohne Merge-Konflikte im Kern

---

## 3. Live-Demo (~5 min)

**URL:** [studybot-8we9za292-lejmi-amines-projects.vercel.app](https://studybot-8we9za292-lejmi-amines-projects.vercel.app/)

### Demo-Ablauf

**Eingabe:**
```
Photosynthese ist der Prozess, durch den Pflanzen Sonnenlicht in Energie umwandeln.
Chlorophyll ist das Pigment, das Licht absorbiert und die Reaktion ermöglicht.
Wasser und Kohlendioxid werden dabei in Glukose und Sauerstoff umgewandelt.
Die Lichtreaktion findet in den Thylakoiden statt, die Dunkelreaktion im Stroma.
Ohne ausreichend Licht und Kohlendioxid kommt die Photosynthese zum Erliegen.
```

**Schritte zeigen:**
1. Text einfügen → Zeichenzähler und Fortschrittsbalken beobachten
2. **Generate** drücken → Ladeanimation mit Statustext
3. **Karteikarten** — Karte umdrehen (Flip-Animation), Pfeil-Navigation, Shuffle
4. **Grid-Ansicht** — alle Karten auf einen Blick
5. **Zusammenfassung** — 4 Abschnitte (Überblick · Kernpunkte · Schlüsselbegriffe · Fazit), In Zwischenablage kopieren
6. **Quiz** — Antwort auswählen, auswerten, Score-Badge
7. **Dark Mode** toggle
8. **Pomodoro-Timer** im Header

---

## 4. Code-Walkthrough (~8 min)

> Editor öffnen: `StudyBot/src/studybot.logic.js` und `StudyBot/src/StudyBot.jsx`

### 4.1 Projektstruktur (1 min)

```
Die-Letzte-Reihe/
├── StudyBot/
│   ├── src/
│   │   ├── studybot.logic.js       ← NLP-Logik  (289 Zeilen, vollständig getestet)
│   │   └── StudyBot.jsx            ← React-UI   (957 Zeilen, alle Features)
│   └── tests/
│       └── studybot.logic.test.js  ← 76 Unit Tests
├── Docs/                           ← Alle Dokumentation
└── .github/workflows/lint.yml      ← CI/CD Pipeline
```

### 4.2 studybot.logic.js — Wichtigste Funktionen (4 min)

**`extractKeyTerms(text)` — das Herzstück**
- Zeige die Stopwort-Liste (DE + EN + generische Adjektive wie `"wichtig"`, `"groß"`, `"künstlich"`)
- Zeige `stem()` — 23 Suffix-Muster, Minimum 4 Zeichen Stammwort
- Zeige die TF-IDF-Formel: `score = termCount × log((S+1)/df) × (1 + log(length/4))`

**`generateSummary(text)` — extraktive Zusammenfassung**
- Sätze nach Termdichte bewerten (hits / sqrt(Wortanzahl))
- Körper (erste 60%) und Schluss (letzte 40%) getrennt auswählen
- Kernpunkte: top 5 nach Score, dann zurück in Lesereihenfolge sortiert

**`generateQuiz(text)` — Multiple-Choice-Generierung**
- Richtige Antwort aus dem Text
- 3 konstruierte Falschantworten über andere Schlüsselbegriffe
- `Math.random()` platziert die richtige Antwort an zufälligem Index 0–3

### 4.3 Tests & CI (3 min)

**Testdatei öffnen: `tests/studybot.logic.test.js`**

```
76 Tests · 13 describe-Blöcke · < 40 ms Laufzeit
100% Statements · 100% Functions · 100% Lines · 91.76% Branches
```

Zeigen:
- Ein Beispiel-Test mit `vi.spyOn(Math, 'random')` → deterministisch
- Boundary-Tests (MAX_CHARS-1, MAX_CHARS, MAX_CHARS+1)
- Integration-Test (Full pipeline ohne Absturz bei Leerstring)

**CI/CD — `.github/workflows/lint.yml`:**
- 2 parallele Jobs: Ruff Linter (Python) + Vitest (JavaScript)
- Laufen auf jedem Push und jedem Pull Request
- Kein Merge möglich, wenn Tests fehlschlagen

---

## 5. Recap & Lessons Learned (~5 min)

### Was gut funktioniert hat

| Entscheidung | Warum es gut war |
|---|---|
| **Logic/UI-Trennung** | 76 Tests ohne Browser, parallele Entwicklung ohne Konflikte |
| **Vitest statt Jest** | Native ESM, kein Babel, läuft in derselben Vite-Config |
| **Custom TF-IDF** | Kein 350-MB-Download, läuft offline, < 30 ms |
| **Branch-Workflow mit PRs** | Keine direkten Pushes auf main mehr, Arbeit sichtbar für beide |
| **Conventional Commits** | Git-History ist lesbar wie ein Changelog |

### Was nicht funktioniert hat

| Problem | Root Cause | Was wir gelernt haben |
|---|---|---|
| **Transformers.js gescheitert** | Drauflos gebaut ohne Proof-of-Concept | Erst Spike-Branch (max 2h), dann implementieren |
| **Kein Task-Tracking** | Koordination nur über Discord-Chat | GitHub Issues hätten Arbeit sichtbar gemacht |
| **node_modules committed** | Keine .gitignore beim Projektstart | Checkliste für neues Projekt: .gitignore zuerst |
| **Branch-Coverage anfangs 83%** | Zu viele Happy-Path-Tests | Coverage-Report früh lesen, Lücken systematisch schließen |

### Maßnahmen — was wir in Iteration 3 umgesetzt haben

| Maßnahme | Status |
|---|---|
| Spike-Branches vor großen Änderungen | Eingeführt |
| GitHub Issues für Aufgaben-Tracking | Eingeführt ab 28. April |
| Branch-Coverage ≥ 90% + CI-Enforcement | Erreicht: 91.76% |
| CONTRIBUTING.md mit Setup-Guide | Fertig |

### Fazit

> StudyBot macht genau das, was es soll — schnell, offline, ohne Account.  
> Das Projekt hat uns gezeigt, dass **Architekturentscheidungen am Anfang** (Logic/UI-Split) mehr Einfluss haben als Features am Ende.

---

## Anhang — Demo-Text für die Präsentation

Für eine längere Demo mit mehr Output:

```
Photosynthese ist der Prozess, durch den Pflanzen Sonnenlicht in chemische Energie umwandeln.
Chlorophyll ist das grüne Pigment in den Chloroplasten, das Licht absorbiert und die Reaktion ermöglicht.
Wasser und Kohlendioxid werden dabei in Glukose und Sauerstoff umgewandelt.
Die Lichtreaktion findet in den Thylakoiden statt und erzeugt ATP und NADPH.
Die Dunkelreaktion, auch Calvin-Zyklus genannt, läuft im Stroma der Chloroplasten ab.
Ohne ausreichend Licht und Kohlendioxid kommt die Photosynthese zum Erliegen.
Die Effizienz der Photosynthese hängt von Temperatur, Lichtintensität und CO2-Konzentration ab.
Pflanzen nutzen nur etwa 1-2% der auftreffenden Lichtenergie für die Photosynthese.
Der Prozess ist die Grundlage der meisten Nahrungsketten auf der Erde.
Ohne Photosynthese gäbe es keinen freien Sauerstoff in der Erdatmosphäre.
```
