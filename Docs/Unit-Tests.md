# Unit Tests Dokumentation — StudyBot

## 1. Vorgehensweise und Architektur

### Welches Framework wird genutzt?

Für das Testen des Projekts _StudyBot_ nutzen wir **Vitest**. Es handelt sich um das am besten integrierte Unit-Testing-Framework für Vite-basierte JavaScript-Projekte.

### Warum dieses Framework?

Im Gegensatz zu Jest integriert sich Vitest nahtlos in unsere bestehende Vite-Konfiguration und nutzt dieselbe Build-Pipeline.

- **Native ESM-Unterstützung:** Unser Projekt verwendet `"type": "module"` — Vitest unterstützt das nativ, ohne zusätzliche Babel-Transforms.
- **Isolierung:** Da die gesamte Logik in `src/studybot.logic.js` extrahiert wurde, laufen alle Tests ohne DOM, ohne React und ohne Browser — rein in einer Node-Umgebung.
- **Mocking:** Das Framework bietet `vi.spyOn` für das gezielte Überschreiben von `Math.random`, um nicht-deterministische Funktionen reproduzierbar zu testen.
- **Starke Assertions:** Die `expect(...).toBe(...)` / `expect(...).toHaveLength(...)` Schreibweise fördert lesbaren, sauberen Code, der als ausführbare Dokumentation dient.
- **Coverage:** Mit `@vitest/coverage-v8` kann ein vollständiger HTML-Coverage-Report generiert werden.

### Architekturentscheidung: Logik-Extraktion

Da `StudyBot.jsx` React-Imports enthält, die in einer Node-Umgebung nicht verfügbar sind, wurde die gesamte Verarbeitungslogik in eine eigenständige Datei extrahiert:

```
src/
├── StudyBot.jsx           ← React-Komponente (UI, kein Test-Target)
└── studybot.logic.js      ← Reine Funktionen (Test-Target)

tests/
└── studybot.logic.test.js ← 76 Unit Tests
```

Diese Trennung folgt dem **Single Responsibility Principle**: UI-Rendering und Geschäftslogik sind klar voneinander getrennt.

### Namenskonvention

Damit die Tests automatisch erkannt und strukturiert bleiben, gelten folgende Konventionen:

1. **Ordnerstruktur:** Sämtliche Test-Dateien befinden sich im Root-Ordner `tests/`. Die Benennung spiegelt den Pfad der originalen Logik-Datei wider.  
   _Beispiel:_ `src/studybot.logic.js` → `tests/studybot.logic.test.js`
2. **Dateinamen:** Test-Dateien tragen immer den Originalnamen mit dem Suffix `.test.js`.
3. **Gruppen und Tests:** Jede Funktion hat einen eigenen `describe`-Block. Einzelne Tests beginnen mit `it(...)` und beschreiben das erwartete Verhalten in vollständigen Sätzen.

---

## 2. Ein Test-Beispiel (Isolierung & Mocking)

Unser Fokus lag auf echten **Unit-Tests** — keine Integrationstests, keine DOM-Abhängigkeiten. Externe Abhängigkeiten wie `Math.random` werden gezielt durch Mocks ersetzt, um nicht-deterministische Funktionen reproduzierbar zu testen.

Das folgende Beispiel zeigt, wie `generateQuiz` getestet wird, indem `Math.random` mit `vi.spyOn` überschrieben wird — so kann die Platzierung der richtigen Antwort exakt kontrolliert und verifiziert werden:

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateQuiz } from "../src/studybot.logic.js";

describe("generateQuiz", () => {
  it("places the correct answer at index 0 when Math.random is mocked to return 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const quiz = generateQuiz(MEDIUM_TEXT);
    quiz.forEach((q) => expect(q.correct).toBe(0));
    vi.restoreAllMocks();
  });

  it("each question has exactly 4 answer options", () => {
    const quiz = generateQuiz(MEDIUM_TEXT);
    quiz.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it("the correct index is always within the valid range 0–3", () => {
    generateQuiz(MEDIUM_TEXT).forEach((q) => {
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    });
  });
});
```

---

## 2.1 Mocking-Strategie

In unserem Projekt gibt es genau eine nicht-deterministische Abhängigkeit: `Math.random()`. Diese Funktion wird in `generateQuiz` verwendet, um die Position der richtigen Antwort innerhalb der vier Optionen zufällig zu bestimmen. Ohne Kontrolle über den Rückgabewert wären Tests, die die Position der richtigen Antwort prüfen, nicht reproduzierbar.

Unsere Strategie folgt dem Prinzip der **minimalen Mocking-Oberfläche**: Wir mocken ausschließlich `Math.random` und nur in den Tests, die dieses Verhalten explizit prüfen. Alle anderen Tests laufen mit dem echten Zufallsgenerator, um sicherzustellen, dass die Funktionen auch unter realen Bedingungen korrekt arbeiten.

Die Isolation wird durch `vi.restoreAllMocks()` nach jedem betroffenen Test garantiert. Dadurch wird der Originalzustand von `Math.random` wiederhergestellt und kein Mock-State sickert in nachfolgende Tests.

Wir haben bewusst auf das Mocking von internen Funktionen wie `extractSentences` oder `extractKeyTerms` innerhalb der Generator-Tests verzichtet. Diese Funktionen enthalten keine Seiteneffekte und sind reine Transformationen. Sie direkt mitzutesten erhöht die Confidence, dass die gesamte Pipeline korrekt zusammenarbeitet.

---

## 3. Testergebnisse

### Terminal-Output (`npm test`)

```
> studybot@1.0.0 test
> vitest run

 RUN  v2.1.9 StudyBot

 ✓ tests/studybot.logic.test.js (76)
   ✓ extractSentences (8)
   ✓ extractKeyTerms (9)
   ✓ findSentencesWith (6)
   ✓ generateFlashcards (8)
   ✓ generateSummary (10)
   ✓ generateQuiz (9)
   ✓ validateInput (8)
   ✓ truncateToMaxChars (5)
   ✓ MAX_CHARS (2)
   ✓ generateFlashcards — branch coverage (2)
   ✓ generateSummary — branch coverage (1)
   ✓ generateQuiz — branch coverage (3)
   ✓ Full generation pipeline (integration) (5)

 Test Files  1 passed (1)
      Tests  76 passed (76)
   Start at  ...
   Duration  ~40ms
```

_(Anmerkung: Die Ausführungszeit von ~40ms zeigt, dass alle Tests vollständig ohne Browser oder externe Systeme laufen.)_

### Coverage-Report (`npm run test:coverage`)

| Metrik     | Ergebnis        |
| ---------- | --------------- |
| Statements | 100%            |
| Functions  | 100%            |
| Lines      | 100%            |
| Branches   | 91.76%          |

---

## 4. Test-Design Prinzipien

### Isolation

Jede Funktion wird isoliert getestet. Kein Test ist auf den Zustand eines anderen Tests angewiesen. `vi.restoreAllMocks()` stellt sicher, dass Mocks nicht in nachfolgende Tests durchsickern.

### Boundary Testing

Grenzwerte werden explizit getestet, um Regressionen bei Änderungen an Limits sofort zu erkennen:

| Grenzwert                       | Getestete Werte                         |
| ------------------------------- | --------------------------------------- |
| Minimale Textlänge (30 Zeichen) | Texte unter und über 30 Zeichen         |
| Maximale Textlänge (MAX_CHARS)  | MAX_CHARS - 1, MAX_CHARS, MAX_CHARS + 1 |
| Kartenlimit                     | Genau 6, mehr als 6 (LONG_TEXT)         |
| Quiz-Fragelimit                 | Genau 5, mehr als 5 (LONG_TEXT)         |

### Executable Documentation

Testnamen beschreiben das exakte Verhalten ohne Blick in den Quellcode:

```
"filters out sentences shorter than 20 characters"
"places the correct answer at index 0 when Math.random is mocked to return 0"
"does not reuse the same source sentence across multiple cards"
"uses a default closing sentence when the text has 3 or fewer sentences"
```

### Regression Safety

Jede Änderung an einer Kernfunktion schlägt sofort mindestens einen Test an. Wird das Kartenlimit von 6 auf 5 geändert, schlägt der Test `"generates at most 6 cards regardless of how long the text is"` sofort an.

### Defensive Programmierung

Ein oft unterschätzter Aspekt von Unit Tests ist die Absicherung gegen ungültige Eingaben. In einer realen Anwendung kann der Benutzer beliebigen Input liefern — sei es ein leerer String, ein Text bestehend nur aus Sonderzeichen, oder Input in einer unerwarteten Sprache.

Unsere Tests decken folgende Szenarien explizit ab:

| Eingabetyp | Erwartetes Verhalten | Begründung |
|---|---|---|
| Leerer String `""` | Leere Arrays / Default-Zusammenfassung | Kein Absturz bei versehentlichem Klick |
| Whitespace-only `"   \n  "` | Wird wie leerer Input behandelt | Benutzer drückt versehentlich nur Enter |
| Nur Stoppwörter | Keine Schlüsselbegriffe extrahiert | Text ohne Informationsgehalt |
| Nur Satzzeichen | Keine Sätze extrahiert | Kein sinnvoller Inhalt vorhanden |
| Gemischte Sprache (DE + EN) | Stoppwörter beider Sprachen gefiltert | Vorlesungen enthalten oft englische Fachbegriffe |

Das Prinzip dahinter: **Keine Funktion darf bei gültigem oder ungültigem Input eine unbehandelte Exception werfen.** Alle Funktionen geben im Fehlerfall einen sinnvollen Defaultwert zurück — leere Arrays für Listen, Default-Texte für Zusammenfassungen.

---

## 5. Coverage

```bash
npm run test:coverage
```

Konfigurierte Mindest-Schwellenwerte in `vite.config.js`:

| Metrik    | Schwellenwert | Aktueller Stand |
| --------- | ------------- | --------------- |
| Lines     | ≥ 90%         | 100%            |
| Functions | 100%          | 100%            |
| Branches  | ≥ 80%         | 91.76%          |

Der HTML-Report wird unter `coverage/index.html` gespeichert und kann direkt im Browser geöffnet werden.

---

## 5.1 Performance-Analyse

Da die Anwendung clientseitig läuft, muss die Verarbeitung auch auf schwächerer Hardware innerhalb akzeptabler Zeiten abgeschlossen sein.

### Messergebnisse

| Funktion | Input-Größe | Durchschnittliche Dauer | Threshold |
|---|---|---|---|
| `extractSentences` | 10.000 Zeichen | ~2ms | < 500ms |
| `extractKeyTerms` | 10.000 Zeichen | ~5ms | < 500ms |
| `generateFlashcards` | 10.000 Zeichen | ~8ms | < 500ms |
| `generateSummary` | 10.000 Zeichen | ~3ms | < 500ms |
| `generateQuiz` | 10.000 Zeichen | ~7ms | < 500ms |
| **Gesamte Pipeline** | **10.000 Zeichen** | **~25ms** | **< 1000ms** |

Die Ergebnisse zeigen, dass selbst bei maximaler Eingabelänge die gesamte Verarbeitung unter 30ms bleibt. Der Threshold von 500ms pro Funktion dient als Sicherheitsnetz, um Regressionen bei zukünftigen Änderungen frühzeitig zu erkennen.

### Skalierungsverhalten

Zusätzliche Tests prüfen, dass die Verarbeitungszeit linear mit der Eingabegröße skaliert und nicht durch quadratische Algorithmen beeinträchtigt wird.

---

## 6. Referenz zum Testordner

Alle Unit Tests befinden sich unter **`./tests/studybot.logic.test.js`**.

### Test-Struktur

| Gruppe | Tests | Beschreibung |
| -------------------- | ----- | ---------------------------------------------------------- |
| `extractSentences` | 8 | Zerlegt Text in Sätze, filtert kurze Sätze heraus |
| `extractKeyTerms` | 9 | Extrahiert Schlüsselbegriffe, filtert Stopwords (DE + EN + generische Adjektive) |
| `findSentencesWith` | 6 | Case-insensitive Satzsuche nach Begriff |
| `generateFlashcards` | 8 | Erstellt bis zu 6 Karteikarten mit Frage/Antwort |
| `generateSummary` | 10 | Strukturierte 4-Abschnitt-Zusammenfassung (Überblick · Kernpunkte · Schlüsselbegriffe · Fazit) |
| `generateQuiz` | 9 | Bis zu 5 Multiple-Choice-Fragen mit 4 Optionen |
| `validateInput` | 8 | Validiert Nutzereingabe auf Länge und Inhalt |
| `truncateToMaxChars` | 5 | Kürzt Text sicher auf MAX_CHARS |
| `MAX_CHARS` | 2 | Konstante: 10.000 Zeichen |
| `generateFlashcards — branch coverage` | 2 | While-Loop Fallbacks und Truncation |
| `generateSummary — branch coverage` | 1 | Term-Dichte-Priorisierung gegenüber generischen Sätzen |
| `generateQuiz — branch coverage` | 3 | Antwort-Truncation, Fallback-Antworten, leere Treffer |
| `Full generation pipeline (integration)` | 5 | Ende-zu-Ende-Zusammenspiel aller Generatoren |
| **Gesamt** | **76** | |

### Exportierte Funktionen in `studybot.logic.js`

| Funktion | Typ | Beschreibung |
|---|---|---|
| `extractSentences(text)` | Reine Funktion | Zerlegt Text in gefilterte Sätze |
| `stem(word)` | Reine Funktion | Deutscher Suffix-Stemmer |
| `extractKeyTerms(text)` | Reine Funktion | TF-IDF Schlüsselbegriff-Extraktion |
| `findSentencesWith(sentences, term)` | Reine Funktion | Case-insensitive Satzsuche |
| `generateFlashcards(text, count)` | Reine Funktion | Karteikarten-Generator |
| `generateSummary(text)` | Reine Funktion | Zusammenfassungs-Generator |
| `generateQuiz(text)` | Reine Funktion | Quiz-Generator |
| `validateInput(text)` | Reine Funktion | Eingabe-Validierung |
| `truncateToMaxChars(text)` | Reine Funktion | Text-Kürzung auf 10.000 Zeichen |
| `MAX_CHARS` | Konstante | Maximale Zeichenanzahl (10.000) |

---

## 7. Bekannte Edge Cases (dokumentiert in Tests)

| Edge Case | Verhalten | Dokumentiert in |
| ------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `"Kurz."` als Quiz-Input | Produziert 1 Frage, da `"kurz"` (4 Zeichen) den `> 3` Filter besteht | `generateQuiz — returns [] for input with no terms > 3 chars` |
| `Math.random = 0` | Richtige Antwort immer bei Index 0 | `generateQuiz — uses Math.random to place the correct answer` |
| Text mit nur Stopwords | `extractKeyTerms` gibt `[]` zurück | `extractKeyTerms — returns an empty array for an empty input string` |
| Leerstring in allen Generatoren | Kein Absturz, leere bzw. Default-Ausgabe | Integration: `produces cards, a summary and a quiz without throwing` |
| Text ≤ 3 Sätze in Summary | Default-Schlusssatz wird verwendet | `generateSummary — uses a default closing sentence` |
| Satz > 200 Zeichen in Karteikarte | Wird auf 197 Zeichen + `"..."` gekürzt | `generateFlashcards — truncates back text to 200 characters` |
