# User Stories — StudyBot

> DHBW Software Engineering Projekt | 4. Semester  
> Dokument: Product Backlog – User Stories

---

## Personas

### Persona 1 — Lena, die Vollzeit-Studentin

Lena (22) studiert BWL im 3. Semester an der DHBW. Sie besucht täglich Vorlesungen und
akkumuliert große Mengen an Vorlesungsskripten. Kurz vor der Klausurphase fehlt ihr die
Zeit, alle Texte manuell aufzubereiten. Sie möchte Lernmaterial schnell und ohne großen
Aufwand aus ihren Vorlesungstexten erstellen.

### Persona 2 — Tobias, der Autodidakt

Tobias (26) bildet sich nach dem Feierabend eigenständig weiter, oft über Fachartikeln und
Online-Ressourcen. Er bevorzugt interaktive Lernmethoden gegenüber passivem Lesen und
schätzt schnelles Feedback zu seinem Wissensstand.

### Persona 3 — Sarah, die Accessibility-bewusste Nutzerin

Sarah (24) arbeitet hauptsächlich nachts und bevorzugt dunkle Oberflächen. Sie nutzt die
App auf Laptop und Smartphone abwechselnd und legt Wert auf ein konsistentes,
angenehmes UI-Erlebnis auf allen Geräten.

---

## Definition of Done (DoD)

Alle User Stories gelten als **Done**, wenn folgende Kriterien erfüllt sind:

- All planned features (Texteingabe, Karteikarten, Zusammenfassung, Quiz) are fully implemented and tested
- Frontend components are successfully integrated and render without errors
- All critical bugs are resolved and non-critical issues are documented
- Performance goals are met (e.g., Lernmaterial-Generierung abgeschlossen in < 3 Sekunden)
- No API keys or sensitive data are exposed in the frontend (client-side only)
- UI/UX has been reviewed and validated in both Dark Mode and Light Mode
- Documentation (README) for setup, usage, and architecture is complete
- The product has been deployed to a public or demo environment (e.g., Vercel)
- Final acceptance testing with stakeholders (Dozent / Kommilitonen) is completed

---

## Definition of Ready (DoR)

Eine User Story ist **Ready** zur Implementierung, wenn folgende Kriterien erfüllt sind:

- Personas and scenarios for the story have been validated by the team
- The story's acceptance criteria are clearly defined and testable
- Effort estimation (story points) has been completed
- Dependencies on other stories or components have been clarified
- UI/UX expectations (layout, theme, responsive behavior) are agreed upon

---

## Aufwandsschätzung — Skala (Story Points, Fibonacci)

| Punkte | Bedeutung                                         |
| ------ | ------------------------------------------------- |
| 1      | Trivial – wenige Zeilen, kein Risiko              |
| 2      | Klein – einfache Logik, kein neuer State          |
| 3      | Mittel – neue Komponente oder State-Änderung      |
| 5      | Groß – mehrere Komponenten, neue Logik            |
| 8      | Sehr groß – komplexe Architektur oder neue Engine |
| 13     | Zu groß – muss gesplittet werden                  |

---

## User Stories

---

### US-01 — Freitext eingeben

**Als** Studentin (Lena)  
**möchte ich** einen Vorlesungstext direkt in ein Textfeld eintippen oder einfügen,  
**damit** ich ohne Vorkenntnisse oder externe Tools sofort Lernmaterial generieren kann.

**Akzeptanzkriterien:**

- [ ] Eine `<textarea>` mit mindestens 12 sichtbaren Zeilen ist auf der Eingabe-Seite vorhanden.
- [ ] Der Placeholder-Text erklärt die Funktion ("Text hier einfügen...").
- [ ] Der Nutzer kann beliebigen Text eingeben oder per Copy/Paste einfügen.
- [ ] Die Eingabe wird in Echtzeit im State gespeichert.
- [ ] Das Textfeld ist auf mobilen Geräten vollständig bedienbar (kein horizontales Scrollen).

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 2 Story Points

---

### US-02 — Zeichenlimit-Anzeige

**Als** Studentin (Lena)  
**möchte ich** sehen, wie viele Zeichen ich bereits eingegeben habe und wie viele noch verbleiben,  
**damit** ich meinen Text anpassen kann, bevor das Limit erreicht wird.

**Akzeptanzkriterien:**

- [ ] Unter der Textarea wird ein Fortschrittsbalken angezeigt, der den Füllstand bis MAX_CHARS (10.000) visualisiert.
- [ ] Neben dem Balken steht die aktuelle Zeichenzahl im Format `X.XXX / 10.000`.
- [ ] Der Balken ist bei < 70 % in der Akzent-Farbe, bei 70–90 % gelb/warning, bei > 90 % rot/error.
- [ ] Eingaben über dem Limit (10.000 Zeichen) werden abgeschnitten und nicht angenommen.
- [ ] Die Wortzahl wird separat angezeigt (z. B. „342 Wörter").

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 2 Story Points

---

### US-03 — Textdatei per Drag & Drop importieren

**Als** Autodidakt (Tobias)  
**möchte ich** eine `.txt`- oder `.md`-Datei direkt in den Eingabebereich ziehen,  
**damit** ich gespeicherte Texte ohne manuelle Copy/Paste-Aktionen importieren kann.

**Akzeptanzkriterien:**

- [ ] Beim Hover einer Datei über dem Textarea-Bereich erscheint ein visuelles Overlay ("Datei hier loslassen") mit dashed border und gedimmtem Hintergrund.
- [ ] Beim Drop wird der Dateiinhalt in das Textfeld geladen (max. MAX_CHARS Zeichen).
- [ ] Nicht unterstützte Dateitypen (z. B. `.pdf`, `.docx`) zeigen eine Fehlermeldung: "Nur Textdateien (.txt, .md) werden unterstützt."
- [ ] Nach erfolgreichem Import ist der Dateiinhalt im Textfeld sichtbar und bearbeitbar.
- [ ] Der Drag-Over-Zustand endet korrekt, auch wenn die Datei außerhalb des Targets fallen gelassen wird (onDragLeave).

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 3 Story Points

---

### US-04 — Lernmaterial generieren

**Als** Studentin (Lena)  
**möchte ich** per Knopfdruck aus meinem eingegebenen Text alle Lernmaterialien erzeugen,  
**damit** ich mit einer einzigen Aktion Karteikarten, Zusammenfassung und Quiz erhalte.

**Akzeptanzkriterien:**

- [ ] Ein "Generieren"-Button ist auf der Eingabe-Seite vorhanden.
- [ ] Bei Klick wird eine Ladeanimation angezeigt mit einem beschreibenden Statustext (z. B. "Karteikarten werden erstellt...").
- [ ] Nach abgeschlossener Generierung wird automatisch zur Karteikarten-Ansicht navigiert.
- [ ] Der Button ist deaktiviert (`disabled`), solange ein Generiervorgang läuft.
- [ ] Ist der Eingabetext kürzer als 30 Zeichen, erscheint eine Fehlermeldung; die Generierung startet nicht.
- [ ] Generierung funktioniert rein lokal (kein API-Call erforderlich gemäß aktuellem Stand).

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 5 Story Points

---

### US-05 — Fehlermeldung bei ungültiger Eingabe

**Als** Studentin (Lena)  
**möchte ich** eine klare Fehlermeldung sehen, wenn mein Text zu kurz oder meine Datei ungültig ist,  
**damit** ich weiß, was zu korrigieren ist, ohne raten zu müssen.

**Akzeptanzkriterien:**

- [ ] Fehlermeldungen werden in einer visuell abgegrenzten Box unterhalb des Textfelds angezeigt (roter Rahmen, roter Text).
- [ ] Die Meldung ist in deutscher Sprache.
- [ ] Die Meldung verschwindet, sobald der Nutzer erneut mit der Eingabe beginnt oder eine neue Generierung startet.
- [ ] Technische Fehler aus der Verarbeitungslogik werden abgefangen (try/catch) und als lesbare Meldung dargestellt.

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 2 Story Points

---

### US-06 — Karteikarten als Flip-Cards anzeigen (Einzelansicht)

**Als** Autodidakt (Tobias)  
**möchte ich** Karteikarten einzeln sehen, die sich per Klick umdrehen,  
**damit** ich mich aktiv abfragen und mein Wissen testen kann, bevor ich die Antwort sehe.

**Akzeptanzkriterien:**

- [ ] Jede Karte zeigt eine Frage auf der Vorderseite und eine Antwort auf der Rückseite.
- [ ] Beim Klick auf die Karte dreht sie sich mit einer CSS-3D-Flip-Animation (rotateY, 0.6 s).
- [ ] Die Vorderseite zeigt „Frage X / Y" sowie den Hinweis „Klicken → Umdrehen".
- [ ] Die Rückseite hebt sich farblich von der Vorderseite ab (Akzentfarbe-Gradient).
- [ ] Immer genau eine Karte ist im Fokus, navigierbar mit „← Zurück" und „Weiter →".
- [ ] Navigation-Buttons sind deaktiviert, wenn die erste bzw. letzte Karte erreicht ist.
- [ ] Unter den Buttons sind Punkt-Indikatoren (Dots), die die aktuelle Position zeigen; aktiver Dot ist breiter.

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 5 Story Points

---

### US-07 — Karteikarten in Grid-Ansicht anzeigen

**Als** Studentin (Lena)  
**möchte ich** alle Karteikarten gleichzeitig in einer Übersicht sehen,  
**damit** ich einen schnellen Überblick über alle generierten Fragen bekomme und gezielt eine auswählen kann.

**Akzeptanzkriterien:**

- [ ] Ein Toggle zwischen "Einzeln" und "Grid" ist über den Karten sichtbar.
- [ ] In der Grid-Ansicht werden alle Karten in einem responsiven Grid (`auto-fill, minmax(220px, 1fr)`) dargestellt.
- [ ] Jede Mini-Card zeigt die Kartennummer und die ersten 80 Zeichen der Frage.
- [ ] Ein Klick auf eine Mini-Card wechselt zur Einzelansicht und öffnet die geklickte Karte.
- [ ] Grid-Ansicht und Einzelansicht teilen denselben State (Reihenfolge der Karten).

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 3 Story Points

---

### US-08 — Karteikarten per Drag & Drop sortieren

**Als** Studentin (Lena)  
**möchte ich** Karteikarten per Drag & Drop umsortieren,  
**damit** ich die Lernreihenfolge nach meinen Prioritäten anpassen kann.

**Akzeptanzkriterien:**

- [ ] Jede Karte (sowohl Einzelansicht als auch Grid) ist draggable.
- [ ] Beim Draggen über eine Zielkarte wird diese visuell hervorgehoben (scale + Border-Akzent + Opacity-Änderung).
- [ ] Nach dem Drop ist die neue Reihenfolge im State korrekt übernommen.
- [ ] Drag auf dieselbe Position (Karte auf sich selbst) ändert nichts.
- [ ] Ein Hinweistext ("💡 Karten per Drag & Drop umsortieren") ist sichtbar.

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 3 Story Points

---

### US-09 — Strukturierte Zusammenfassung anzeigen

**Als** Studentin (Lena)  
**möchte ich** eine strukturierte Zusammenfassung meines Textes sehen,  
**damit** ich den Kerninhalt schnell erfassen und als Nachschlagewerk nutzen kann.

**Akzeptanzkriterien:**

- [ ] Die Zusammenfassung ist über den Tab "Zusammenfassung" erreichbar (nur wenn bereits generiert).
- [ ] Die Anzeige enthält mindestens: Überblick (Einleitungssatz), Kernpunkte (bis zu 5 Punkte), Schlüsselbegriffe, Fazit.
- [ ] Der Text wird in einer scrollbaren, lesbar formatierten Box (`white-space: pre-wrap`, `line-height: 1.8`) dargestellt.
- [ ] Die Formatierung passt sich dem aktiven Theme (Dark/Light) an.
- [ ] Die generierende Logik nutzt Satzextraktion und Schlüsselbegriff-Analyse des eingegebenen Texts.

**Definition of Done & Ready:** Siehe gemeinsame DoD und DoR oben.

**Aufwand:** 3 Story Points

---

### US-10 — Multiple-Choice-Quiz durchführen

**Als** Autodidakt (Tobias)  
**möchte ich** ein Multiple-Choice-Quiz zu meinem Lerntext absolvieren,  
**damit** ich meinen Wissensstand aktiv testen und einschätzen kann.

**Akzeptanzkriterien:**

- [ ] Das Quiz enthält bis zu 5 Fragen, jede mit 4 Antwortoptionen (A–D).
- [ ] Jede Frage fragt nach einem Schlüsselbegriff aus dem eingegebenen Text.
- [ ] Der Nutzer kann pro Frage genau eine Antwort auswählen; die Auswahl wird visuell hervorgehoben.
- [ ] Solange nicht alle Fragen beantwortet sind, ist der "Auswerten"-Button deaktiviert (`cursor: not-allowed`, gedimmt).
- [ ] Alle
