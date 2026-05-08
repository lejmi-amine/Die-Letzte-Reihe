# User Stories — StudyBot

> DHBW Software Engineering Projekt | 4. Semester  
> Dokument: Product Backlog – User Stories

---

## Personas

**Lena – die Vollzeit-Studentin**  
Lena (22) studiert BWL im 3. Semester an der DHBW. Sie akkumuliert täglich große Mengen an Vorlesungsskripten und möchte in der Klausurphase schnell und ohne Aufwand Lernmaterial aus ihren Texten erstellen.

**Tobias – der Autodidakt**  
Tobias (26) bildet sich nach Feierabend über Fachartikel weiter. Er bevorzugt interaktive Lernmethoden und schätzt schnelles Feedback zu seinem Wissensstand.

**Sarah – die Accessibility-bewusste Nutzerin**  
Sarah (24) arbeitet hauptsächlich nachts und wechselt zwischen Laptop und Smartphone. Sie legt Wert auf ein konsistentes, angenehmes UI-Erlebnis auf allen Geräten und bevorzugt dunkle Oberflächen.

---

## Definition of Done (DoD)

- All planned features (Texteingabe, Karteikarten, Zusammenfassung, Quiz) are fully implemented and tested
- Frontend components are successfully integrated and render without errors
- All critical bugs are resolved and non-critical issues are documented
- Performance goals are met (Lernmaterial-Generierung abgeschlossen in < 3 Sekunden)
- No API keys or sensitive data are exposed in the frontend
- UI/UX has been reviewed and validated in both Dark Mode and Light Mode
- Documentation (README) for setup, usage, and architecture is complete
- The product has been deployed to a public environment: [studybot-8we9za292-lejmi-amines-projects.vercel.app](https://studybot-8we9za292-lejmi-amines-projects.vercel.app/)
- Final acceptance testing with stakeholders (Dozent / Kommilitonen) is completed

---

## Definition of Ready (DoR)

- Personas and scenarios for the story have been validated by the team
- The story's acceptance criteria are clearly defined and testable
- Effort estimation (story points) has been completed
- Dependencies on other stories or components have been clarified
- UI/UX expectations (layout, theme, responsive behavior) are agreed upon

---

## Aufwandsschätzung — Story Points (Fibonacci)

| Punkte | Bedeutung                                         |
| ------ | ------------------------------------------------- |
| 1      | Trivial – wenige Zeilen, kein Risiko              |
| 2      | Klein – einfache Logik, kein neuer State          |
| 3      | Mittel – neue Komponente oder State-Änderung      |
| 5      | Groß – mehrere Komponenten, neue Logik            |
| 8      | Sehr groß – komplexe Architektur oder neue Engine |

---

## User Stories

---

### Story 1: Vorlesungstext eingeben

Als Vollzeit-Studentin (Lena) möchte ich einen Vorlesungstext direkt in ein Textfeld eintippen oder einfügen, sodass ich ohne externe Tools sofort Lernmaterial aus meinen Vorlesungsunterlagen erstellen kann.

Akzeptanzkriterien:

- Eine Texteingabefläche mit mindestens 12 sichtbaren Zeilen ist auf der Eingabe-Seite vorhanden
- Der Hinweistext im Feld erklärt die Funktion („Text hier einfügen, eintippen, oder .txt Datei reinziehen...")
- Der Nutzer kann beliebigen Text eintippen oder per Copy/Paste einfügen
- Die Eingabe wird in Echtzeit im Anwendungs-State gespeichert
- Das Textfeld ist auf mobilen Geräten vollständig bedienbar ohne horizontales Scrollen

Definition of Done:

- Eingabefeld auf Desktop (Chrome) und mobilem Viewport (≤ 480 px) getestet und funktionsfähig
- Dark Mode und Light Mode zeigen das Feld korrekt ohne hartcodierte Farben
- QA bestätigt: kein Konsolenfehler bei Eingabe und Copy/Paste

**Aufwand:** 2 Story Points

---

### Story 2: Zeichenlimit in Echtzeit verfolgen

Als Vollzeit-Studentin (Lena) möchte ich sehen, wie viele Zeichen ich bereits eingegeben habe und wie viele noch verbleiben, sodass ich meinen Text rechtzeitig anpassen kann, bevor das Limit erreicht wird.

Akzeptanzkriterien:

- Unterhalb der Texteingabe wird ein Fortschrittsbalken angezeigt, der den Füllstand bis 10.000 Zeichen visualisiert
- Neben dem Balken steht die aktuelle Zeichenzahl im Format „X.XXX / 10.000"
- Der Balken ist in der Akzentfarbe bei unter 70 %, gelb bei 70–90 %, rot bei über 90 % Füllstand
- Eingaben über dem Limit von 10.000 Zeichen werden abgeschnitten und nicht angenommen
- Die aktuelle Wortzahl wird separat unter dem Textfeld angezeigt (z. B. „342 Wörter")

Definition of Done:

- Farbwechsel des Balkens bei 70 % und 90 % manuell verifiziert
- Zeichenabschneidung bei Eingabe von über 10.000 Zeichen getestet und bestätigt
- Wortzählung korrekt bei leerem Text (0 Wörter) und normalem Fließtext

**Aufwand:** 2 Story Points

---

### Story 3: Textdatei per Drag & Drop importieren

Als Autodidakt (Tobias) möchte ich eine .txt- oder .md-Datei direkt in den Eingabebereich ziehen, sodass ich gespeicherte Texte ohne manuelle Copy/Paste-Aktionen schnell importieren kann.

Akzeptanzkriterien:

- Beim Darüberziehen einer Datei über den Eingabebereich erscheint ein visuelles Overlay mit dem Text „Datei hier loslassen", einem gestrichelten Rahmen und gedimmtem Hintergrund
- Nach dem Loslassen wird der Dateiinhalt vollständig in das Textfeld geladen (max. 10.000 Zeichen)
- Bei nicht unterstützten Dateitypen (z. B. .pdf, .docx) erscheint die Fehlermeldung „Nur Textdateien (.txt, .md) werden unterstützt."
- Nach erfolgreichem Import ist der Dateiinhalt im Textfeld sichtbar und weiter bearbeitbar
- Das Drag-Over-Overlay verschwindet korrekt, wenn die Datei außerhalb des Zielbereichs losgelassen wird

Definition of Done:

- Import mit .txt und .md getestet und funktionsfähig
- Fehlerfall mit .pdf und .docx getestet, Fehlermeldung erscheint korrekt
- Overlay-Verhalten (erscheinen und verschwinden) auf Desktop-Browser bestätigt

**Aufwand:** 3 Story Points

---

### Story 4: Lernmaterial per Knopfdruck generieren

Als Vollzeit-Studentin (Lena) möchte ich per Knopfdruck aus meinem eingegebenen Text alle Lernmaterialien erzeugen, sodass ich mit einer einzigen Aktion Karteikarten, Zusammenfassung und Quiz erhalte.

Akzeptanzkriterien:

- Ein „Lernmaterial generieren"-Button ist auf der Eingabe-Seite vorhanden
- Nach Klick wird eine Ladeanimation mit phasenweise wechselndem Statustext angezeigt (z. B. „Text wird analysiert..." → „Karteikarten werden erstellt..." → „Quiz wird generiert...")
- Nach abgeschlossener Generierung navigiert die App automatisch zur Karteikarten-Ansicht
- Der Button ist während eines laufenden Vorgangs deaktiviert und zeigt „⏳ Generiere..."
- Bei einem Eingabetext kürzer als 30 Zeichen erscheint eine Fehlermeldung und die Generierung startet nicht
- Die gesamte Verarbeitungslogik läuft lokal im Browser ohne externen API-Call

Definition of Done:

- Generierung abgeschlossen in unter 3 Sekunden auf Standardhardware, gemessen und dokumentiert
- Fehlerfall bei zu kurzem Text (unter 30 Zeichen) getestet und Fehlermeldung bestätigt
- Automatische Navigation zu Karteikarten nach Generierung verifiziert

**Aufwand:** 5 Story Points

---

### Story 5: Fehlermeldungen verständlich anzeigen

Als Vollzeit-Studentin (Lena) möchte ich eine klare Fehlermeldung sehen, wenn mein Text zu kurz ist oder eine Datei nicht importiert werden kann, sodass ich ohne Raten weiß, was zu korrigieren ist.

Akzeptanzkriterien:

- Fehlermeldungen erscheinen in einer visuell abgegrenzten Box unterhalb des Textfelds mit rotem Rahmen und rotem Text
- Alle Fehlermeldungen sind auf Deutsch verfasst
- Die Meldung verschwindet automatisch, sobald der Nutzer erneut tippt oder eine neue Generierung startet
- Technische Fehler aus der Verarbeitungslogik werden per Fehlerbehandlung abgefangen und als lesbare Meldung angezeigt

Definition of Done:

- Alle definierten Fehlerfälle (zu kurzer Text, falscher Dateityp, Verarbeitungsfehler) manuell getestet
- Fehlermeldungen verschwinden korrekt bei neuer Eingabe
- Kein technischer Fehlercode oder Stack-Trace sichtbar für den Nutzer

**Aufwand:** 2 Story Points

---

### Story 6: Karteikarten einzeln mit Flip-Animation lernen

Als Autodidakt (Tobias) möchte ich Karteikarten einzeln sehen, die sich per Klick umdrehen, sodass ich mich aktiv abfragen kann, bevor ich die Antwort aufdecke.

Akzeptanzkriterien:

- Jede Karte zeigt eine Frage auf der Vorderseite und eine Antwort auf der Rückseite
- Ein Klick auf die Karte löst eine 3D-Flip-Animation aus (Drehung um die Y-Achse, Dauer 0,6 Sekunden)
- Die Vorderseite zeigt „Frage X / Y" sowie den Hinweis „Klicken → Umdrehen / Ziehen → Sortieren"
- Die Rückseite ist farblich klar von der Vorderseite abgegrenzt (Akzentfarbe-Gradient)
- Navigation erfolgt über „← Zurück"- und „Weiter →"-Buttons; diese sind an der ersten bzw. letzten Karte deaktiviert
- Punkt-Indikatoren unter den Buttons zeigen die aktuelle Kartenposition; der aktive Punkt ist optisch breiter

Definition of Done:

- Flip-Animation auf Chrome Desktop und Mobile getestet, läuft flüssig ohne Ruckeln
- Navigation zwischen allen Karten funktioniert korrekt, Buttons deaktivieren sich an den Enden
- Vorder- und Rückseite korrekt dargestellt in Dark Mode und Light Mode

**Aufwand:** 5 Story Points

---

### Story 7: Alle Karteikarten in der Grid-Übersicht sehen

Als Vollzeit-Studentin (Lena) möchte ich alle Karteikarten gleichzeitig in einer Übersicht sehen, sodass ich einen schnellen Überblick über alle generierten Fragen erhalte und gezielt eine auswählen kann.

Akzeptanzkriterien:

- Ein Toggle zwischen „Einzeln" und „Grid" ist über den Karten jederzeit sichtbar
- In der Grid-Ansicht werden alle Karten in einem responsiven Gitter dargestellt, das sich der Bildschirmbreite anpasst
- Jede Mini-Card zeigt die Kartennummer und die ersten 80 Zeichen der Frage
- Ein Klick auf eine Mini-Card wechselt in die Einzelansicht und öffnet genau die geklickte Karte
- Grid-Ansicht und Einzelansicht teilen denselben Karten-State, sodass die Reihenfolge erhalten bleibt

Definition of Done:

- Grid bricht korrekt auf schmalen Viewports um, kein Überlauf
- Klick auf Mini-Card öffnet korrekte Karte in Einzelansicht, verifiziert für erste, mittlere und letzte Karte
- Toggle zwischen Grid und Einzeln funktioniert ohne State-Verlust

**Aufwand:** 3 Story Points

---

### Story 8: Karteikarten per Drag & Drop neu sortieren

Als Vollzeit-Studentin (Lena) möchte ich Karteikarten per Drag & Drop umsortieren, sodass ich die Lernreihenfolge nach meinen eigenen Prioritäten anpassen kann.

Akzeptanzkriterien:

- Jede Karte ist sowohl in der Einzelansicht als auch in der Grid-Ansicht per Drag & Drop verschiebbar
- Beim Ziehen über eine Zielkarte wird diese visuell hervorgehoben (leichtes Vergrößern, farbiger Rahmen, reduzierte Transparenz)
- Nach dem Loslassen ist die neue Reihenfolge korrekt im State übernommen und sofort sichtbar
- Das Ziehen einer Karte auf dieselbe Position verändert die Reihenfolge nicht
- Ein Hinweistext „Karten per Drag & Drop umsortieren" ist unterhalb der Karten sichtbar

Definition of Done:

- Drag & Drop in Einzel- und Grid-Ansicht getestet, Reihenfolge korrekt nach Drop
- Kein State-Verlust beim Umsortieren (Karteninhalt bleibt erhalten)
- Visuelles Feedback beim Drag-Over auf Chrome Desktop bestätigt

**Aufwand:** 3 Story Points

---

### Story 9: Strukturierte Zusammenfassung lesen

Als Vollzeit-Studentin (Lena) möchte ich eine strukturierte Zusammenfassung meines Lernstoffs lesen, sodass ich die Kernaussagen schnell erfassen und als Nachschlagewerk nutzen kann.

Akzeptanzkriterien:

- Die Zusammenfassung ist über den Tab „Zusammenfassung" erreichbar, jedoch nur nachdem eine Generierung abgeschlossen wurde
- Die Anzeige enthält mindestens vier Abschnitte: Überblick, Kernpunkte (bis zu 5 Sätze), Schlüsselbegriffe und Fazit
- Der Text ist gut lesbar formatiert mit ausreichendem Zeilenabstand und Umbrüchen zwischen den Abschnitten
- Die Darstellung passt sich vollständig dem aktiven Theme (Dark/Light) an
- Die Inhalte werden aus dem eingegebenen Text per Satzextraktion und Schlüsselbegriff-Analyse generiert

Definition of Done:

- Zusammenfassung korrekt generiert und alle vier Abschnitte vorhanden, verifiziert mit zwei verschiedenen Eingabetexten
- Tab ist vor Generierung deaktiviert und nach Generierung aktiv und anklickbar
- Formatierung korrekt in Dark Mode und Light Mode

**Aufwand:** 3 Story Points

---

### Story 10: Multiple-Choice-Quiz durchführen

Als Autodidakt (Tobias) möchte ich ein Multiple-Choice-Quiz zu meinem Lerntext absolvieren, sodass ich meinen Wissensstand aktiv testen kann.

Akzeptanzkriterien:

- Das Quiz enthält bis zu 5 Fragen, jede mit 4 Antwortoptionen (A bis D)
- Alle Fragen und Antwortoptionen beziehen sich auf Schlüsselbegriffe aus dem eingegebenen Text
- Pro Frage kann genau eine Antwort ausgewählt werden; die Auswahl wird visuell hervorgehoben
- Der „Auswerten"-Button ist deaktiviert und optisch ausgegraut, solange nicht alle Fragen beantwortet wurden
- Alle Fragen, Optionen und Beschriftungen sind auf Deutsch

Definition of Done:

- Quiz korrekt generiert mit bis zu 5 Fragen und je 4 Optionen, verifiziert mit verschiedenen Eingabetexten
- Auswahl-Highlighting und Deaktivierung des Auswerten-Buttons funktionieren korrekt
- Kein Konsolenfehler bei Auswahl und Auswertung

**Aufwand:** 5 Story Points

---

### Story 11: Quizergebnis sofort auswerten lassen

Als Autodidakt (Tobias) möchte ich nach Abschluss des Quiz sofort sehen, welche Antworten richtig und falsch waren, sodass ich gezielt meine Wissenslücken identifizieren kann.

Akzeptanzkriterien:

- Nach Klick auf „Auswerten" werden alle Antworten farblich bewertet: grün für korrekt, rot für falsch gewählt; die richtige Antwort wird immer grün markiert, auch wenn sie nicht ausgewählt wurde
- Ein Score-Badge (z. B. „3 / 5 richtig") erscheint im Quiz-Header direkt nach der Auswertung
- Der Badge-Hintergrund ist grün bei 80 % oder mehr, gelb bei 50–79 %, rot bei unter 50 % Punkten
- Nach der Auswertung sind keine Antwortänderungen mehr möglich
- Ein „Nochmal versuchen"-Button setzt alle Antworten und den Auswertungs-State vollständig zurück

Definition of Done:

- Farbliche Auswertung für alle Szenarien getestet: alle richtig, alle falsch, gemischte Ergebnisse
- Score-Badge zeigt korrekte Punktzahl und Farbe für alle drei Schwellenwerte (≥ 80 %, 50–79 %, < 50 %)
- Nochmal-Funktion setzt State vollständig zurück, kein Rückstand aus dem vorherigen Versuch

**Aufwand:** 3 Story Points

---

### Story 12: Über Tab-Navigation zwischen Bereichen wechseln

Als Nutzerin möchte ich über eine Tab-Navigation zwischen Texteingabe, Karteikarten, Zusammenfassung und Quiz wechseln, sodass ich schnell zwischen den verschiedenen Lernbereichen der App navigieren kann.

Akzeptanzkriterien:

- Es gibt vier Tabs: „Text eingeben", „Karteikarten", „Zusammenfassung" und „Quiz" – jeweils mit Icon und Label
- Der aktive Tab ist visuell hervorgehoben durch Akzent-Hintergrund und fettere Schrift
- Die Tabs für Karteikarten, Zusammenfassung und Quiz sind deaktiviert und ausgegraut, bis eine Generierung abgeschlossen ist
- Die Tab-Leiste scrollt auf kleinen Viewports horizontal, ohne Tabs abzuschneiden oder zu verbergen
- Nach erfolgreicher Generierung navigiert die App automatisch zum Tab „Karteikarten"

Definition of Done:

- Tab-Deaktivierung vor Generierung und Aktivierung nach Generierung getestet
- Automatische Navigation zu Karteikarten nach Generierung verifiziert
- Horizontales Scrollen der Tab-Leiste auf mobilem Viewport (≤ 480 px) bestätigt

**Aufwand:** 3 Story Points

---

### Story 13: Zwischen Dark Mode und Light Mode wechseln

Als Nutzerin (Sarah) möchte ich per Knopfdruck zwischen Dark Mode und Light Mode umschalten, sodass ich die App bequem zu jeder Tageszeit und unter verschiedenen Lichtverhältnissen nutzen kann.

Akzeptanzkriterien:

- Ein Toggle-Button mit Sonne- bzw. Mond-Icon ist jederzeit im Header sichtbar und erreichbar
- Ein Klick wechselt sofort zwischen dem dunklen und dem hellen Theme
- Alle Farben (Hintergrund, Text, Border, Akzent, Fehler, Erfolg, Warnung) sind über ein zentrales Theme-Objekt gesteuert; keine hartcodierten Farbwerte außerhalb davon
- Der Themewechsel ist weich animiert mit einer Übergangszeit von 0,4 Sekunden
- Kein UI-Element verbleibt nach dem Wechsel im falschen Theme-Zustand

Definition of Done:

- Dark Mode und Light Mode manuell für alle Komponenten (Input, Karten, Zusammenfassung, Quiz, Header, Tabs) verifiziert
- Kein hartcodierter Farbwert außerhalb des Theme-Objekts im Code vorhanden
- Übergangsanimation läuft flüssig ohne sichtbares Flackern

**Aufwand:** 2 Story Points

---

### Story 14: App auf mobilen Geräten nutzen

Als Nutzerin (Sarah) möchte ich StudyBot auf meinem Smartphone genauso gut nutzen wie auf dem Desktop, sodass ich auch unterwegs Lernmaterial erstellen und durcharbeiten kann.

Akzeptanzkriterien:

- Bei einem Viewport von 480 Pixeln Breite oder weniger ist kein ungewolltes horizontales Scrollen vorhanden
- Das Texteingabefeld ist auf Touch-Geräten vollständig bedienbar und passt sich der Bildschirmbreite an
- Karteikarten in Einzel- und Grid-Ansicht passen sich korrekt an schmale Viewports an ohne Überlauf
- Alle interaktiven Elemente (Buttons, Tabs, Antwortoptionen) haben eine Mindestgröße von 44 × 44 Pixeln für Touch-Bedienung
- Die Tab-Leiste scrollt auf kleinen Viewports horizontal und zeigt alle Tabs vollständig an

Definition of Done:

- App auf mobilem Viewport (≤ 480 px) im Browser-DevTool und auf realem Gerät getestet
- Kein horizontaler Scrollbalken auf keiner der vier Tabs
- Touch-Bedienbarkeit aller interaktiven Elemente manuell verifiziert

**Aufwand:** 3 Story Points

---

### Story 15: Ladefortschritt während der Generierung verfolgen

Als Nutzerin möchte ich während der Generierung visuelles Feedback erhalten, sodass ich weiß, dass die App arbeitet, und nicht versehentlich erneut auf den Button klicke.

Akzeptanzkriterien:

- Während der Generierung wird ein Lade-Spinner als rotierende Animation angezeigt
- Ein Statustext ändert sich phasenweise und beschreibt den aktuellen Schritt: „Text wird analysiert..." → „Karteikarten werden erstellt..." → „Zusammenfassung wird erstellt..." → „Quiz wird generiert..."
- Der Generieren-Button zeigt im Ladezustand „⏳ Generiere..." und ist nicht klickbar
- Der Ladebereich ist vertikal zentriert und auf Desktop und Mobile gut sichtbar
- Nach Abschluss der Generierung verschwindet der Loader vollständig und ohne Rückstände

Definition of Done:

- Alle vier Statustexte erscheinen in korrekter Reihenfolge, manuell überprüft
- Button-Deaktivierung während Ladevorgang getestet (mehrfaches Klicken löst keine zweite Generierung aus)
- Loader verschwindet vollständig nach Generierung auf Desktop und Mobile

**Aufwand:** 2 Story Points

---

## Product Backlog — Übersicht

| ID       | Titel                                             | Story Points | Priorität   |
| -------- | ------------------------------------------------- | ------------ | ----------- |
| Story 1  | Vorlesungstext eingeben                           | 2            | Must-have   |
| Story 2  | Zeichenlimit in Echtzeit verfolgen                | 2            | Must-have   |
| Story 3  | Textdatei per Drag & Drop importieren             | 3            | Should-have |
| Story 4  | Lernmaterial per Knopfdruck generieren            | 5            | Must-have   |
| Story 5  | Fehlermeldungen verständlich anzeigen             | 2            | Must-have   |
| Story 6  | Karteikarten einzeln mit Flip-Animation lernen    | 5            | Must-have   |
| Story 7  | Alle Karteikarten in der Grid-Übersicht sehen     | 3            | Should-have |
| Story 8  | Karteikarten per Drag & Drop neu sortieren        | 3            | Could-have  |
| Story 9  | Strukturierte Zusammenfassung lesen               | 3            | Must-have   |
| Story 10 | Multiple-Choice-Quiz durchführen                  | 5            | Must-have   |
| Story 11 | Quizergebnis sofort auswerten lassen              | 3            | Must-have   |
| Story 12 | Über Tab-Navigation zwischen Bereichen wechseln   | 3            | Must-have   |
| Story 13 | Zwischen Dark Mode und Light Mode wechseln        | 2            | Should-have |
| Story 14 | App auf mobilen Geräten nutzen                    | 3            | Should-have |
| Story 15 | Ladefortschritt während der Generierung verfolgen | 2            | Must-have   |
| **∑**    |                                                   | **46 SP**    |             |
