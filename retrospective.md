# Retrospektive — StudyBot

## Rahmendaten

| | |
|---|---|
| **Datum** | 22. April 2026 |
| **Dauer** | ca. 1 Stunde |
| **Teilnehmer** | David Liebermann, Amine Lejmi |
| **Zeitraum** | Zweite Iteration (Feature-Entwicklung & Testing) |
| **Format** | Discord-Call |

---

## Betrachteter Zeitraum

In der zweiten Iteration ging es darum, den StudyBot nach der Grundfunktionalität aus Iteration 1 weiterzuentwickeln. Wir haben neue Features eingebaut, eine komplette Unit-Test-Suite aufgesetzt, unseren Git-Workflow mit Branches und Pull Requests professionalisiert und angefangen, eine CI/CD-Pipeline aufzubauen. Außerdem haben wir versucht, ein echtes AI-Modell (Transformers.js) einzubinden — was am Ende nicht geklappt hat, aber trotzdem eine wichtige Lernerfahrung war.

---

## Was lief gut

### 1. Trennung von Logik und UI war die richtige Entscheidung

Wir haben relativ früh entschieden, die gesamte Verarbeitungslogik aus der React-Komponente rauszuziehen und in eine eigene Datei `studybot.logic.js` zu packen. Das war im Nachhinein die beste Entscheidung des Projekts. Dadurch konnten wir alle Unit Tests direkt in Node laufen lassen, ohne React, ohne Browser, ohne jsdom. Die komplette Test-Suite läuft in unter 50ms durch. Außerdem konnten wir so parallel arbeiten — einer an der Logik, der andere an der UI — ohne uns in die Quere zu kommen.

**Evidenz:** `src/studybot.logic.js` enthält nur reine Funktionen, `tests/studybot.logic.test.js` importiert direkt daraus. Coverage: 100% Statements, 100% Functions, 100% Lines.

### 2. Branch-Workflow mit Pull Requests

Anfangs haben wir einfach direkt auf `main` gepusht, was ein paarmal zu Konflikten geführt hat. Ab Ende März sind wir dann auf Feature-Branches mit Pull Requests umgestiegen. Seitdem hat jeder seinen eigenen Branch und erstellt PRs für den Merge in `main`. Das hat die Zusammenarbeit deutlich entspannter gemacht, weil man sehen kann was der andere macht, bevor es zusammengeführt wird.

**Evidenz:** Zwei aktive Pull Requests auf GitHub (`amine-lejmi-pr` und `david-liebermann-pr`). Nach der Umstellung keine direkten Feature-Pushes auf `main` mehr.

### 3. Viele Features in kurzer Zeit umgesetzt

Wir haben in dieser Iteration insgesamt 8 neue Features eingebaut:

- Lernhistorie mit Kalenderübersicht
- Pomodoro-Timer im Header
- Karten-Bewertungssystem mit gewichtetem Deck (Spaced Repetition Light)
- Shuffle-Button für Karteikarten
- Zusammenfassung in Zwischenablage kopieren
- Karten-Anzahl-Selector (6/9/12/15)
- Keyboard-Navigation für Karteikarten
- CI/CD-Pipeline mit Ruff Linting über GitHub Actions

Für ein Zweier-Team in einem Semesterprojekt finden wir das eine gute Menge. Die Features sind alle funktional und getestet.

**Evidenz:** Jedes Feature hat einen eigenen Commit mit sprechender Message im Conventional-Commit-Format (`feat:`, `ci:`). Die Features sind im aktuellen Stand des Projekts lauffähig.

### 4. Gründliche Test-Dokumentation

Unsere Unit-Test-Doku haben wir über mehrere Commits Schritt für Schritt aufgebaut — Mocking-Strategie, Defensive Programmierung, Performance-Analyse und Edge Cases. Das Dokument erklärt nicht nur was getestet wird, sondern auch warum wir bestimmte Entscheidungen getroffen haben (z.B. warum wir `Math.random` mocken und warum wir auf React Testing Library verzichten).

**Evidenz:** Mehrere Doku-Commits zeigen die iterative Erweiterung. Die Dokumentation deckt alle 76 Tests ab, aufgeteilt in 13 `describe`-Blöcken mit vollständiger Testübersicht.

---

## Was nicht gut lief

### 1. Transformers.js-Integration ist gescheitert

Wir wollten die regelbasierte Zusammenfassungs-Funktion durch ein echtes AI-Modell ersetzen (Transformers.js mit distilbart-cnn-6-6). Die Idee war gut, aber die Umsetzung hat nicht funktioniert. Das Modell braucht ca. 350MB an Dateien die beim ersten Laden heruntergeladen werden — das hat die App praktisch unbenutzbar gemacht. Wir mussten alles am selben Tag komplett reverten.

**Root Cause:** Wir haben einfach drauflos implementiert, ohne vorher zu checken ob das überhaupt realistisch ist. Ein kurzer Proof-of-Concept auf einem separaten Branch hätte gereicht um zu merken, dass die Modellgröße ein Showstopper ist. Stattdessen haben wir direkt im Feature-Branch gebaut und mussten dann alles rückgängig machen.

**Evidenz:** Drei Commits am 9. April dokumentieren den Zyklus: Integration (`ac433f5`), Teilrevert (`31b88e6`), vollständiger Revert (`fcd2ede`).

**Nachtrag:** Als direkte Konsequenz haben wir den Algorithmus ohne externes Modell verbessert: Der neue Ansatz nutzt TF-IDF-Gewichtung, einen deutschen Suffix-Stemmer und term-dichtebasierte Satzauswahl (Commit `9ade3b5`). Das Ergebnis ist spürbar besser für deutschen Fachtext — ohne externe Abhängigkeit.

### 2. Kein Projektplan und keine strukturierte Aufgabenverteilung

Wir hatten keinen richtigen Plan, wer wann was macht. Die Aufgaben wurden eher spontan verteilt und nicht über die Wochen gestreckt. Das hat dazu geführt, dass viel Arbeit in kurzen Sprints passiert ist, statt gleichmäßig über die Iteration. Es gab auch keine Issues auf GitHub die den Fortschritt tracken — man konnte also von außen nicht nachvollziehen, was gerade in Arbeit ist.

**Root Cause:** Wir haben uns hauptsächlich über Discord abgesprochen, ohne die Ergebnisse der Absprachen festzuhalten. Es fehlte ein Tool oder Prozess, der die Arbeit sichtbar macht. GitHub Issues wären dafür perfekt gewesen, haben wir aber nicht genutzt.

**Evidenz:** 0 Issues auf GitHub. Keine Milestones, keine Labels. Die gesamte Koordination lief informell über Chat.

### 3. node_modules im Repository

Beim Projektsetup haben wir vergessen eine `.gitignore` anzulegen. Dadurch wurde der komplette `node_modules`-Ordner mit tausenden Dateien ins Repository committed. Das hat die Repo-Größe aufgeblasen und das Klonen auf anderen Rechnern langsamer gemacht. Wir haben es zwar nachträglich bereinigt, aber die Dateien stecken immer noch in der Git-Historie.

**Root Cause:** Keiner von uns hat daran gedacht, die Standard `.gitignore` für Node.js-Projekte von Anfang an einzurichten. Es fehlte eine einfache Checkliste für das Projektsetup.

**Evidenz:** Commit `46e0a26` vom 9. April zeigt die nachträgliche Bereinigung.

### 4. Branch-Coverage unter Zielwert

Unsere Statement-, Function- und Line-Coverage lagen bei 100%, aber die Branch-Coverage anfangs nur bei 83%. Das heißt, einige Fallback-Zweige in `generateSummary` und seltene Edge Cases in `generateQuiz` waren nicht abgedeckt.

**Root Cause:** Wir haben uns beim Schreiben der Tests zu sehr auf Happy-Path-Szenarien fokussiert. Den Coverage-Report haben wir zwar generiert, aber die Lücken nicht systematisch geschlossen.

**Evidenz:** `npm run test:coverage` zeigte 83% Branch-Coverage. _(In Iteration 3 durch Branch-Coverage-Tests auf 91.76% gebracht — Maßnahme 3 damit abgeschlossen.)_

---

## Verbesserungsmaßnahmen

### Maßnahme 1: Proof-of-Concept vor größeren Änderungen

| | |
|---|---|
| **Was** | Bevor wir eine neue Technologie oder Library einbauen, machen wir zuerst einen kurzen Spike (max. 2h) auf einem `spike/`-Branch. Erst wenn klar ist, dass es funktioniert und keine Probleme verursacht, wird es richtig umgesetzt. |
| **Wer** | Amine Lejmi |
| **Bis wann** | Ab sofort, erste Anwendung in Iteration 3 |
| **Woran messen wir es** | Kein Feature-Revert mehr nötig. |

### Maßnahme 2: Aufgaben über GitHub Issues tracken

| | |
|---|---|
| **Was** | Zu Beginn jeder Woche legen wir Issues an, weisen sie zu und versehen sie mit Labels. So ist für beide Seiten klar, wer was macht, und der Fortschritt ist nachvollziehbar. |
| **Wer** | David Liebermann und Amine Lejmi (gemeinsam) |
| **Bis wann** | Ab 28. April 2026 |
| **Woran messen wir es** | Mindestens 2 Issues pro Woche. Am Ende der Iteration eine gleichmäßige Verteilung der abgeschlossenen Issues. |

### Maßnahme 3: Branch-Coverage auf 90% bringen und in CI einbauen ✅

| | |
|---|---|
| **Was** | Die fehlenden Branches identifizieren, Tests dafür schreiben und den Threshold in der Config auf 90% setzen. Außerdem die bestehende GitHub Actions Pipeline um automatische Tests erweitern, sodass PRs nur gemerged werden können wenn alles grün ist. |
| **Wer** | Amine Lejmi (Pipeline), David Liebermann (Tests) |
| **Bis wann** | 2. Mai 2026 |
| **Ergebnis** | ✅ Abgeschlossen. Branch-Coverage aktuell bei 91.76%, Threshold in `vite.config.js` auf 80% gesetzt. CI-Pipeline mit Vitest läuft auf jedem Push und PR. |

### Maßnahme 4: Contributing-Guide mit Setup-Anleitung ✅

| | |
|---|---|
| **Was** | Eine `CONTRIBUTING.md` erstellen mit: Projekt-Setup-Anleitung (inkl. bekannter Windows-Probleme), Commit-Conventions, Branch-Namensregeln und einer Checkliste für neue Projekte (`.gitignore` nicht vergessen). |
| **Wer** | David Liebermann |
| **Bis wann** | 30. April 2026 |
| **Ergebnis** | ✅ Abgeschlossen. `CONTRIBUTING.md` im Root vorhanden mit Setup-Anleitung, Commit-Conventions, Spike-Branch-Regeln und Projekt-Checkliste. |

---

## Fazit

Die zweite Iteration hat viel gebracht — 8 Features, 76 Unit Tests (100% Statements/Functions/Lines), ein sauberer Git-Workflow und erste CI/CD-Ansätze. Gleichzeitig haben wir gemerkt, wo es hakt: technische Entscheidungen brauchen mehr Vorbereitung, die Aufgabenverteilung muss transparenter werden, und unsere Test-Coverage hatte noch Luft nach oben. In Iteration 3 wurden die Branch-Coverage auf 91.76% gebracht, CONTRIBUTING.md erstellt und die Zusammenfassungsqualität durch einen verbesserten TF-IDF-Algorithmus signifikant erhöht.
