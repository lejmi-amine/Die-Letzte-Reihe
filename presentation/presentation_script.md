# StudyBot Presentation Script — Detailed Version

## Files / Navigation

- Presentation file: `studybot_presentation.html`
- Use `Arrow Right`, `Space`, or `Page Down` to go forward.
- Use `Arrow Left`, `Backspace`, or `Page Up` to go back.
- Press `F` for fullscreen.

---

## Important Style

Do **not** read like a robot.

For each slide, memorize:
1. the first sentence,
2. the last sentence,
3. 2–3 keywords in the middle.

You should sound confident, natural and slightly relaxed.

---

## Speaking Split

| Slide | Topic | Speaker |
|---|---|---|
| 1 | Cinematic intro / Title | Amine |
| 2 | Problem | Amine |
| 3 | Solution | Amine |
| 4 | Target users | David |
| 5 | How it works / NLP | Amine |
| 6 | Architecture | Amine |
| 7 | Code: stem() | Amine |
| 8 | Code: TF-IDF scoring | Amine |
| 9 | Code: generateFlashcards() | Amine |
| 10 | Features | David |
| 11 | Real demo flow | Amine + David |
| 12 | Testing | Amine |
| 13 | CI/CD | David |
| 14 | Big fail | Amine |
| 15 | Lessons learned | Amine |
| 16 | Tech stack | David |
| 17 | Deployed & live | David |
| 18 | Final / memorial joke | Amine |

---

# Slide 1 — Cinematic Intro / Title

**Speaker:** Amine  
**Goal:** Catch attention immediately.

## What happens visually

The slide first shows:

> 22 Uhr.  
> Klausur morgen früh.  
> Wo fängst du an?

Then it reveals:

> StudyBot  
> Vom Vorlesungstext zum Lernmaterial — in 2 Sekunden.

## Script

Guten Tag zusammen.

Stellt euch kurz diese Situation vor: Es ist 22 Uhr, die Klausur ist morgen früh, und man hat noch sehr viel Skriptmaterial vor sich.

Genau aus diesem Problem heraus ist unser Projekt entstanden.

Wir sind die Gruppe **Die letzte Reihe** und wir stellen euch heute unser Software-Engineering-Projekt **StudyBot** vor.

StudyBot verwandelt Vorlesungstexte in Karteikarten, eine Zusammenfassung und ein Quiz — direkt im Browser, ohne Account und ohne externe API.

## Transition

Bevor wir zeigen, was StudyBot kann, starten wir mit dem eigentlichen Problem.

---

# Slide 2 — The Problem

**Speaker:** Amine  
**Goal:** Make everyone relate emotionally.

## Keywords

- Klausurstress
- Viele Skripte
- Zu viele Tools
- Kein klarer Lernfluss

## Script

Jeder Student kennt diese Situation: Die Klausur kommt näher, man hat viele Seiten Skript, aber noch keine klare Lernstruktur.

Das Problem ist meistens nicht, dass man gar nicht lernen will. Das Problem ist, dass man zuerst sehr viel Material in eine lernbare Form bringen muss.

Normalerweise braucht man dafür mehrere Tools: eins für Karteikarten, eins für Zusammenfassungen und vielleicht noch eins für Quizfragen.

Dazu kommen Accounts, Copy-Paste, verschiedene Oberflächen und oft auch Datenschutzfragen.

Genau diesen Bruch im Lernprozess wollten wir lösen.

## Transition

Unsere Lösung sollte deshalb so einfach wie möglich sein: ein Text, ein Klick, mehrere Lernformate.

---

# Slide 3 — The Solution

**Speaker:** Amine  
**Goal:** Explain the product simply.

## Keywords

- Ein Text
- Ein Klick
- Drei Lernformate
- Kein Account
- Keine Serveranfrage

## Script

Unsere Lösung heißt **StudyBot**.

Die Idee ist einfach: Der Nutzer fügt einen Vorlesungstext ein, klickt auf **Lernmaterial generieren**, und bekommt sofort drei Ergebnisse.

Erstens: Karteikarten.  
Zweitens: eine strukturierte Zusammenfassung.  
Drittens: ein Multiple-Choice-Quiz.

Besonders wichtig war uns: kein Account, kein API-Key und keine Datenübertragung an externe Server.

Alles läuft direkt im Browser.

## Transition

Damit wir nicht nur für uns selbst entwickeln, haben wir zuerst typische Nutzer betrachtet.

---

# Slide 4 — Target Users

**Speaker:** David  
**Goal:** Show software-engineering thinking through personas.

## Keywords

- Personas
- Lena
- Tobias
- Sarah
- Anforderungen

## Script

Bevor wir entwickelt haben, haben wir uns gefragt: Für wen bauen wir das eigentlich?

Dafür haben wir drei Personas definiert.

Lena steht für klassische Studierende in der Prüfungsphase. Sie sammelt viele Skripte und braucht schnell brauchbares Lernmaterial.

Tobias steht für Selbstlerner, die nach der Arbeit lernen und sich aktiv testen möchten.

Sarah steht für Nutzer, die spät lernen, zwischen Geräten wechseln und Wert auf Dark Mode und Responsive Design legen.

Diese Personas haben uns geholfen, unsere Anforderungen klarer zu formulieren und den Fokus auf echte Lernprobleme zu behalten.

## Transition

Jetzt schauen wir uns an, wie StudyBot technisch aus einem Text Lernmaterial erzeugt.

---

# Slide 5 — How It Works

**Speaker:** Amine  
**Goal:** Explain the NLP pipeline clearly.

## Keywords

- Kein externer AI-Service
- Sentence extraction
- TF-IDF
- German stemmer
- Client-side

## Script

Technisch basiert StudyBot nicht auf einer externen KI-API, sondern auf einer eigenen lokalen NLP-Pipeline.

Der Text wird zuerst validiert und dann in Sätze zerlegt.

Danach extrahieren wir Schlüsselbegriffe. Dafür verwenden wir eine TF-IDF-basierte Logik und einen deutschen Suffix-Stemmer.

Das bedeutet: ähnliche Wortformen werden besser zusammengeführt, zum Beispiel bei deutschen Begriffen mit unterschiedlichen Endungen.

Auf dieser Basis erzeugen wir dann Karteikarten, die Zusammenfassung und das Quiz.

Der gesamte Prozess läuft komplett im Browser und dauert bei 10.000 Zeichen unter 30 Millisekunden.

## Transition

Damit diese Logik sauber testbar bleibt, war unsere Architekturentscheidung sehr wichtig.

---

# Slide 6 — Architecture Decision

**Speaker:** Amine  
**Goal:** Show serious engineering.

## Keywords

- Separation of concerns
- `studybot.logic.js`
- `StudyBot.jsx`
- Testbarkeit

## Script

Eine unserer wichtigsten Architekturentscheidungen war die klare Trennung zwischen Logik und Benutzeroberfläche.

In `studybot.logic.js` befinden sich die reinen Funktionen für Textanalyse und Generierung.

In `StudyBot.jsx` befindet sich die React-Oberfläche mit State Management, Tabs, Animationen und Benutzerinteraktion.

Der Vorteil ist: Unsere Logik ist unabhängig von React testbar.

Man könnte die NLP-Logik theoretisch auch in Node, in einem Service Worker oder in einer anderen Oberfläche wiederverwenden.

## Transition

Jetzt schauen wir uns den Code direkt an — in drei konkreten Teilen.

---

# Slide 7 — Code: stem()

**Speaker:** Amine  
**Goal:** Show the German stemmer — the most linguistically interesting part of the codebase.

## Keywords

- Suffix-Stripping
- 23 Muster
- Prioritätsreihenfolge
- Mindestlänge 4

## What's on the slide

- Left: explanation + transformation table (5 before/after examples in red → green)
- Right: full `stem()` function with syntax highlighting

## Script

Jetzt schauen wir uns konkret an, wie dieser Stemmer aussieht.

Die Funktion heißt `stem` und bekommt ein einzelnes Wort übergeben.

Zuerst definiert sie eine Liste von 23 deutschen Suffixmustern. Diese sind **strikt priorisiert**: längere Suffixe wie `"ungen"` oder `"schaft"` stehen ganz oben — damit „Auflösungen" nicht erst auf `"s"` matcht und seinen Stamm falsch abschneidet.

Die Schleife geht die Liste von oben nach unten durch. Beim ersten Treffer gibt die Funktion sofort zurück. Außerdem gilt: Der verbleibende Stamm muss mindestens **4 Zeichen** lang sein — damit kurze Wörter wie „die" nicht auf ein einzelnes Zeichen reduziert werden.

Auf der linken Seite seht ihr fünf konkrete Beispiele: `Photosynthesen` wird zu `Photosynthes`, `lernende` zu `lern`, `Schlüsselbegriffe` zu `Schlüsselbegriff`. Alle diese Formen landen danach beim TF-IDF unter demselben Eintrag — als wären sie ein Begriff.

Das ist kein Machine Learning, das ist regelbasierte Linguistik. Deterministisch, erklärbar, testbar.

## Transition

Mit diesen Stämmen geht es weiter in den Scoring-Schritt.

---

# Slide 8 — Code: TF-IDF Scoring

**Speaker:** Amine  
**Goal:** Explain the intelligence behind term selection — this is the hardest but most impressive part.

## Keywords

- stemGroups
- docFreq
- idf = log((S+1)/df)
- lengthBonus
- score = count × idf × lengthBonus

## What's on the slide

- Left: the 3-step scoring core from `extractKeyTerms()` with syntax highlighting
- Right: formula breakdown + two concrete examples

## Script

Slide 8 zeigt das eigentliche Gehirn hinter der Begriffsauswahl.

Der Code hat drei Schritte.

**Schritt 1:** Alle Wörter werden in Gruppen nach ihrem Stamm zusammengefasst. `stemGroups` speichert, wie oft jeder Stamm vorkommt und welche Wortformen aufgetreten sind.

**Schritt 2:** Für jeden Stamm zählen wir, in wie vielen Sätzen er vorkommt — die sogenannte Dokumentfrequenz `df`.

**Schritt 3:** Der Score wird berechnet nach der Formel: `count × idf × lengthBonus`.

Was bedeutet das konkret?

- `count` — wie oft taucht das Wort auf.
- `idf` — das ist `log((Sätze + 1) / df)`. Je seltener ein Begriff in verschiedenen Sätzen vorkommt, desto höher dieser Wert. Das bestraft generische Wörter, die überall stehen.
- `lengthBonus` — `1 + log(Länge / 4)`. Längere Wörter sind im Deutschen oft domänenspezifisch. `Chloroplast` ist relevanter als `gut`.

Auf der rechten Seite seht ihr zwei Beispiele: „Photosynthese" — 13 Zeichen, häufig im Text, aber nicht in jedem Satz — bekommt einen hohen Score. „wichtig" dagegen ist ein generisches Adjektiv und ist manuell in der Stopword-Liste blockiert.

Das Ergebnis: Die Top-20 Begriffe mit dem höchsten Score werden zurückgegeben — und aus denen entstehen Karten, Zusammenfassung und Quiz.

## Transition

Und jetzt sehen wir, wie aus diesen Begriffen konkrete Karteikarten werden.

---

# Slide 9 — Code: generateFlashcards()

**Speaker:** Amine  
**Goal:** Show how terms become usable study material — the output layer.

## Keywords

- extractKeyTerms → top 20
- findSentencesWith
- usedSentences Set (no duplicates)
- 6 Fragetypen
- cards.length % 6

## What's on the slide

- Left: full `generateFlashcards()` function with syntax highlighting
- Right: the 6 question templates + 3 pills (No Duplicates, 6 Fragetypen, max 200 Zeichen)

## Script

Der dritte Code-Teil zeigt, wie aus den Top-20-Begriffen konkrete Karteikarten entstehen.

Die Funktion `generateFlashcards` bekommt den Rohtext und eine gewünschte Kartenzahl — standardmäßig 6.

Zuerst werden Sätze extrahiert, dann die Top-Begriffe. Dann läuft eine Schleife über jeden Begriff.

Für jeden Begriff sucht `findSentencesWith` nach allen Sätzen im Text, die diesen Begriff enthalten. Der **erste passende Satz**, der noch nicht verwendet wurde, wird als Kartenrückseite genommen. Das `Set` namens `usedSentences` stellt sicher, dass kein Satz zweimal vorkommt.

Die Vorderseite der Karte — also die Frage — kommt aus einem Array von **6 verschiedenen Fragetypen**: „Was versteht man unter …?", „Welche Rolle spielt …?", und so weiter. Der Index `cards.length % 6` rotiert durch alle 6 Typen, damit die Karten abwechslungsreich bleiben.

Das Ergebnis ist ein Array von Karten-Objekten mit `front` und `back`. Jede Karte ist direkt anzeigbar.

Fertig — 289 Zeilen, 8 Exports, 76 Tests, null externe Dependencies.

## Transition

Jetzt schauen wir uns an, was StudyBot in der Praxis kann — live.

---

# Slide 10 — Features Overview

**Speaker:** David  
**Goal:** Summarize the product features.

## Keywords

- Flashcards
- Summary
- Quiz
- Pomodoro
- Learning history
- Dark mode

## Script

StudyBot besteht nicht nur aus einer einzelnen Funktion, sondern aus mehreren Bausteinen, die zusammen eine komplette Lernsitzung ergeben.

Dazu gehören Karteikarten mit 3D-Flip-Animation, eine strukturierte Zusammenfassung und ein Multiple-Choice-Quiz mit Auswertung.

Zusätzlich gibt es Features wie Pomodoro-Timer, Lernhistorie, Dark Mode, Drag-and-Drop-Dateiimport, Tastatur-Navigation und Kartenbewertung.

Der Nutzer soll nicht zwischen verschiedenen Tools wechseln müssen, sondern in einer Oberfläche lernen, testen und den Fortschritt sehen.

## Transition

Jetzt zeigen wir euch das Ganze einmal live.

---

# Slide 11 — Real Demo Flow

**Speaker:** Amine leads, David supports  
**Goal:** Show the wow moment.

## Demo Structure

1. Paste text
2. Generate
3. Show flashcards
4. Show summary
5. Show quiz

## Demo Text

Use this exact text:

```text
Photosynthese ist der Prozess, durch den Pflanzen Sonnenlicht in chemische Energie umwandeln.
Chlorophyll ist das grüne Pigment in den Chloroplasten, das Licht absorbiert und die Reaktion ermöglicht.
Wasser und Kohlendioxid werden dabei in Glukose und Sauerstoff umgewandelt.
Die Lichtreaktion findet in den Thylakoiden statt und erzeugt ATP und NADPH.
Die Dunkelreaktion, auch Calvin-Zyklus genannt, läuft im Stroma der Chloroplasten ab.
Ohne ausreichend Licht und Kohlendioxid kommt die Photosynthese zum Erliegen.
Die Effizienz der Photosynthese hängt von Temperatur, Lichtintensität und CO2-Konzentration ab.
Pflanzen nutzen nur etwa 1–2% der auftreffenden Lichtenergie für die Photosynthese.
Der Prozess ist die Grundlage der meisten Nahrungsketten auf der Erde.
Ohne Photosynthese gäbe es keinen freien Sauerstoff in der Erdatmosphäre.
```

## Amine Script — before opening app

Jetzt zeigen wir euch kurz live, wie StudyBot in der Praxis funktioniert.

Der Demo-Flow ist bewusst einfach: Wir fügen Text ein, klicken auf Generieren, und schauen uns danach Karteikarten, Zusammenfassung und Quiz an.

## Amine Script — while pasting

Wir verwenden hier einen kurzen Beispieltext zum Thema Photosynthese.

Man sieht direkt, dass der Text im Eingabefeld landet und der Nutzer ohne Setup starten kann.

## Amine Script — while clicking generate

Jetzt klicken wir auf **Lernmaterial generieren**.

Wichtig ist: Diese Verarbeitung läuft komplett client-side. Es wird keine externe API aufgerufen und keine Serveranfrage geschickt.

## Amine Script — flashcards

Jetzt sind wir bei den Karteikarten.

Man kann die Karte drehen, die Antwort anzeigen und die Karte bewerten. Dadurch entsteht eine einfache Form von aktiver Wiederholung.

## David Script — flashcards support

Besonders praktisch ist, dass die Karten nicht nur statisch sind.

Man kann sie mischen, per Tastatur navigieren und durch Easy, Medium und Hard priorisieren. Schwierige Karten erscheinen später häufiger.

## Amine Script — summary

Als Nächstes schauen wir uns die Zusammenfassung an.

Sie ist in vier Bereiche gegliedert: Überblick, Kernpunkte, Schlüsselbegriffe und Fazit.

Das ist bewusst so aufgebaut, dass der Nutzer es direkt in Lernnotizen übernehmen kann.

## David Script — quiz support

Und im Quiz bekommt der Nutzer direkt Feedback.

Nach dem Auswerten sieht man mit Farben, welche Antworten richtig oder falsch waren. Dadurch erkennt man sofort, wo noch Wissenslücken sind.

## Amine Demo Closing

Das ist der zentrale Wow-Moment: Aus einem Text entsteht in wenigen Sekunden eine komplette Lernsitzung.

## Transition

Damit das Ganze nicht nur live funktioniert, haben wir die Kernlogik intensiv getestet.

---

# Slide 12 — Testing

**Speaker:** Amine  
**Goal:** Show reliability and quality.

## Keywords

- Vitest
- 76 tests
- Coverage
- No DOM
- Fast tests

## Script

Für uns war wichtig, dass das Projekt nicht nur funktioniert, sondern auch sauber getestet ist.

Deshalb haben wir 76 Unit-Tests mit Vitest geschrieben.

Die Tests laufen ohne DOM und ohne Browser direkt auf der Logik-Ebene.

Das ist ein Vorteil unserer Architektur: Weil die Kernlogik getrennt ist, können wir sie sehr schnell und zuverlässig testen.

Wir erreichen 100 Prozent Statements, 100 Prozent Functions und über 91 Prozent Branch Coverage.

## Transition

Damit diese Qualität auch im Team erhalten bleibt, haben wir CI/CD eingesetzt.

---

# Slide 13 — CI/CD

**Speaker:** David  
**Goal:** Explain professional workflow.

## Keywords

- GitHub Actions
- Pull Requests
- Vitest
- Ruff
- Green pipeline

## Script

Neben den Funktionen war auch der Entwicklungsprozess wichtig.

Wir haben mit GitHub gearbeitet und bei jedem Push beziehungsweise Pull Request automatisch unsere Pipeline laufen lassen.

Dabei laufen zwei Jobs: Vitest für JavaScript und Ruff für Python-Dateien.

So konnten wir sicherstellen, dass keine fehlerhafte Version in den Main Branch gelangt.

Gerade im Team macht das die Zusammenarbeit stabiler und professioneller.

## Transition

Natürlich lief während des Projekts aber nicht alles perfekt.

---

# Slide 14 — The Big Fail

**Speaker:** Amine  
**Goal:** Show maturity and learning.

## Keywords

- Transformers.js
- 350 MB
- Revert
- Spike branch
- Custom pipeline

## Script

Unser größter Fehlversuch war der Einsatz von Transformers.js für abstraktive Zusammenfassungen.

Die Idee war zuerst gut: Wir wollten eine echte KI-Zusammenfassung direkt im Browser verwenden.

Das Problem war aber ein Modell-Download von ungefähr 350 MB beim ersten Start.

Damit war die App für normale Nutzung praktisch unbrauchbar.

Deshalb haben wir diese Lösung verworfen und stattdessen unsere eigene lokale Pipeline gebaut.

Die wichtigste Lektion war: zuerst ein kleiner Proof of Concept, bevor man eine große externe Dependency übernimmt.

## Transition

Aus diesem Fehler und aus dem gesamten Projekt haben wir einige wichtige Learnings mitgenommen.

---

# Slide 15 — Lessons Learned

**Speaker:** Amine  
**Goal:** Summarize what you learned as software engineers.

## Keywords

- Architecture first
- Spike first
- Coverage
- CI
- German NLP
- Personas

## Script

Aus dem Projekt haben wir mehrere Dinge gelernt.

Erstens: Architekturentscheidungen am Anfang haben einen sehr großen Einfluss auf die Qualität des Projekts.

Zweitens: Tests und CI/CD helfen enorm, Fehler früh zu erkennen.

Drittens: Externe Bibliotheken sollte man nicht einfach übernehmen, sondern vorher prüfen, ob sie wirklich zum Projekt passen.

Außerdem haben wir gemerkt, dass deutsche Textverarbeitung schwieriger ist als erwartet, weil Wörter viele verschiedene Formen haben können.

## Transition

Schauen wir uns noch kurz an, mit welchem Stack wir das umgesetzt haben.

---

# Slide 16 — Tech Stack

**Speaker:** David  
**Goal:** Show the stack is intentionally simple.

## Keywords

- React
- Vite
- Vitest
- GitHub Actions
- Vercel
- No backend

## Script

Unser Tech Stack ist bewusst schlank gehalten.

Wir haben React 18 für das Frontend, Vite als Build Tool und Vitest für die Tests verwendet.

Für das Deployment nutzen wir Vercel, und die Pipeline läuft über GitHub Actions.

Es gibt keinen Backend-Server, keine Datenbank und keine externe AI-API.

Die komplette Verarbeitung findet lokal im Browser statt. Das macht die Anwendung schnell, einfach zu deployen und datenschutzfreundlich.

## Transition

Das Projekt ist auch nicht nur lokal vorhanden, sondern live deployed.

---

# Slide 17 — Deployed & Live

**Speaker:** David  
**Goal:** Show that the app is real and usable.

## Keywords

- Vercel
- Live app
- Static SPA
- Ready for use

## Script

StudyBot ist nicht nur ein Prototyp auf unserem Rechner, sondern live deployed.

Die Anwendung läuft auf Vercel und kann direkt im Browser genutzt werden.

Das war uns wichtig, weil wir zeigen wollten, dass das Projekt nicht nur theoretisch funktioniert, sondern tatsächlich einsatzbereit ist.

Damit kann man die App sofort öffnen, Text einfügen und Lernmaterial generieren.

## Transition

Damit kommen wir zum Abschluss.

---

# Slide 18 — Final Slide / Memorial Joke

**Speaker:** Amine  
**Goal:** End memorable, funny and confident.

## Visual joke

The slide shows a funny memorial for:

- Alex
- Jan
- Stani
- Leon

The joke is:

> Wir waren mal 6. Jetzt sind wir nur noch 2 — aber dafür produktiv.

## Script

Damit kommen wir zum Schluss.

StudyBot ist kein klassischer AI-Chatbot.

Es ist ein Werkzeug, das aus vorhandenem Lernmaterial direkt nützliche Lernformate erzeugt.

Unser Ziel war es, Studierenden Zeit zu sparen und aus Chaos eine klare Lernstruktur zu machen.

Und ja — wir waren ursprünglich mal sechs Leute.

Am Ende sind David und ich übrig geblieben.

Man könnte sagen: Wir sind weniger geworden, aber dafür produktiv.

Natürlich ist das nur Spaß — wir grüßen unsere ursprünglichen Teammitglieder.

Vielen Dank für eure Aufmerksamkeit — und wir freuen uns auf eure Fragen.

---

# Emergency Short Version

If you are running out of time, skip slides 7–9 and use this ending:

StudyBot macht aus einem Text direkt Karteikarten, Zusammenfassung und Quiz.  
Alles läuft lokal im Browser, ohne Account, ohne API und ohne Datenübertragung.  
Technisch war für uns besonders wichtig: klare Architektur, testbare Logik und ein schlanker Stack.  
Vielen Dank für eure Aufmerksamkeit.

---

# Timing Suggestion

| Part | Slides | Time |
|---|---|---|
| Intro + Problem | 1–2 | 1:30 |
| Solution + Users | 3–4 | 1:45 |
| NLP + Architecture | 5–6 | 2:15 |
| **Code Walkthrough** | **7–9** | **6:00–8:00** |
| Features | 10 | 1:00 |
| Demo | 11 | 4:00–5:00 |
| Testing + CI/CD | 12–13 | 1:45 |
| Big Fail + Lessons | 14–15 | 2:00 |
| Tech Stack + Deployment | 16–17 | 1:15 |
| Final | 18 | 0:45 |

Total: around 22–25 minutes depending on demo and code walk speed.

---

# Final Reminder

Speak slower than you think.

Pause after:
- "22 Uhr. Klausur morgen früh."
- "Keine Daten verlassen das Gerät."
- "Das läuft komplett client-side."
- "23 Suffixmuster, strikt priorisiert."
- "score = count × idf × lengthBonus."
- "289 Zeilen. 8 Exports. 76 Tests. Null externe Dependencies."
- "350 MB."
- "Wir waren mal 6."
