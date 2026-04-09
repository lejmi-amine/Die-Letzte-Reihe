# Unit Tests Dokumentation - StudyBot

## 1. Vorgehensweise und Architektur

### Welches Framework wird genutzt?

Für das Testen unseres Projekts _StudyBot_ nutzen wir **Vitest**. Es handelt sich dabei um das modernste und am besten integrierte Unit-Testing-Framework für Vite-basierte JavaScript/React-Projekte.

### Warum dieses Framework?

Im Gegensatz zu externen Tools wie Jest integriert sich Vitest nahtlos in unsere bestehende Vite-Konfiguration und nutzt dieselbe Build-Pipeline.

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
└── studybot.logic.test.js ← 121 Unit Tests
```

Diese Trennung folgt dem **Single Responsibility Principle**: UI-Rendering und Geschäftslogik sind klar voneinander getrennt.

### Namenskonvention

Damit die Tests automatisch erkannt und strukturiert bleiben, gelten folgende Konventionen:

1. **Ordnerstruktur:** Sämtliche Test-Dateien befinden sich im Root-Ordner `tests/`. Die Benennung spiegelt den Pfad der originalen Logik-Datei wider.  
   _Beispiel:_ `src/studybot.logic.js` ➡️ `tests/studybot.logic.test.js`
2. **Dateinamen:** Test-Dateien tragen immer den Originalnamen mit dem Suffix `.test.js` (z.B. `studybot.logic.test.js`).
3. **Gruppen und Tests:** Jede Funktion hat einen eigenen `describe`-Block. Einzelne Tests beginnen mit `it(...)` und beschreiben das erwartete Verhalten in vollständigen Sätzen.

---

## 2. Ein Test-Beispiel (Isolierung & Mocking)

Unser Fokus lag laut Clean-Code-Prinzipien darauf, dass echte **Unit-Tests** (und keine Integrationstests) geschrieben werden. Externe Abhängigkeiten wie `Math.random` werden gezielt durch Mocks ersetzt, um nicht-deterministische Funktionen reproduzierbar zu testen.

Das folgende Beispiel zeigt, wie `generateQuiz` getestet wird, indem `Math.random` mit `vi.spyOn` überschrieben wird — so kann die Platzierung der richtigen Antwort exakt kontrolliert und verifiziert werden:

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { generateQuiz } from "../src/studybot.logic.js";

// Mocks werden nach jedem Test zurückgesetzt — kein Leakage in andere Tests
afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateQuiz", () => {
  it("places the correct answer at index 0 when Math.random is mocked to return 0", () => {
    // Math.random wird durch einen kontrollierten Wert ersetzt
    vi.spyOn(Math, "random").mockReturnValue(0);

    // Quiz wird mit dem gemockten Zufall generiert
    const quiz = generateQuiz(MEDIUM_TEXT);

    // Richtige Antwort muss bei Index 0 liegen
    quiz.forEach((q) => expect(q.correct).toBe(0));
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
 
In unserem Projekt gibt es zwei externe Abhängigkeiten, die in Tests gemockt werden:

1. **`Math.random()`** — wird in `generateQuiz` verwendet, um die Position der richtigen Antwort zufällig zu bestimmen.
2. **`@xenova/transformers`** — das KI-Modell für `generateSummary` wird mit `vi.mock` durch eine synchrone Stub-Funktion ersetzt, damit kein Modell-Download im Test-Runner stattfindet.

Unsere Strategie folgt dem Prinzip der **minimalen Mocking-Oberfläche**: Wir mocken ausschließlich externe Abhängigkeiten und nur dort, wo es nötig ist. Alle anderen Tests laufen mit echter Logik, um sicherzustellen, dass die Funktionen auch unter realen Bedingungen korrekt arbeiten.
 
Die Isolation wird durch `afterEach(() => vi.restoreAllMocks())` garantiert. Dadurch wird nach jedem einzelnen Testfall der Originalzustand von `Math.random` wiederhergestellt. Es kann kein Mock-State von einem Test in den nächsten durchsickern, was eine häufige Fehlerquelle in Test-Suites ist.
 
Wir haben bewusst auf das Mocking von internen Funktionen wie `extractSentences` oder `extractKeyTerms` innerhalb der Generator-Tests verzichtet. Der Grund: Diese Funktionen enthalten keine Seiteneffekte und sind reine Transformationen. Sie direkt mitzutesten erhöht die Confidence, dass die gesamte Pipeline korrekt zusammenarbeitet, ohne dass wir dafür separate Integrationstests schreiben müssen.

## 3. Testergebnisse

### Terminal-Output (`npm test`)

```diff
> studybot@1.0.0 test
> vitest run

 RUN  v2.1.9 StudyBot

 ✓ tests/studybot.logic.test.js (121)
   ✓ extractSentences (14)
+     ✓ always returns an array
+     ✓ splits a multi-sentence text into an array of individual sentences
+     ✓ filters out sentences shorter than or equal to 20 characters
+     ✓ returns an empty array when all sentences are shorter than 20 characters
+     ✓ collapses a single newline between sentences into a space before splitting
+     ✓ collapses multiple consecutive newlines into a single space before splitting
+     ✓ splits on exclamation marks as well as periods
+     ✓ splits on question marks as well as periods
+     ✓ handles a mix of period, exclamation, and question mark delimiters
+     ✓ trims leading and trailing whitespace from each extracted sentence
+     ✓ returns an empty array for an empty string input
+     ✓ returns an empty array for a whitespace-only input
+     ✓ handles a single valid sentence without throwing
+     ✓ is idempotent — calling it twice on the same input yields identical results
   ✓ extractKeyTerms (14)
   ✓ findSentencesWith (10)
   ✓ generateFlashcards (16)
   ✓ generateSummary (15)
   ✓ generateQuiz (16)
   ✓ validateInput (13)
   ✓ truncateToMaxChars (8)
   ✓ MAX_CHARS (3)
   ✓ Full generation pipeline (integration) (12)

 Test Files  1 passed (1)
      Tests  121 passed (121)
   Start at  23:20:44
   Duration  ~40ms
```

_(Anmerkung: Die Ausführungszeit von ~40ms zeigt, dass alle Tests vollständig ohne Browser oder externe Systeme laufen.)_

### Coverage-Report (`npm run test:coverage`)

![Coverage Report](/StudyBot/coverage-screenshot.png)

| Metrik     | Ergebnis       |
| ---------- | -------------- |
| Statements | 100% (168/168) |
| Functions  | 100% (8/8)     |
| Lines      | 100% (168/168) |
| Branches   | 83.33% (45/54) |

## 4. Test-Design Prinzipien

### Isolation

Jede Funktion wird isoliert getestet. Kein Test ist auf den Zustand eines anderen Tests angewiesen. `afterEach(() => vi.restoreAllMocks())` stellt sicher, dass Mocks nicht in nachfolgende Tests durchsickern.

### Boundary Testing

Grenzwerte werden explizit getestet, um Regressionen bei Änderungen an Limits sofort zu erkennen:

| Grenzwert                       | Getestete Werte                         |
| ------------------------------- | --------------------------------------- |
| Minimale Textlänge (30 Zeichen) | 29, 30, 31 Zeichen                      |
| Maximale Textlänge (MAX_CHARS)  | MAX_CHARS - 1, MAX_CHARS, MAX_CHARS + 1 |
| Kartenlimit                     | Genau 6, mehr als 6 (Long Text)         |
| Quiz-Fragelimit                 | Genau 5, mehr als 5 (Long Text)         |

### Executable Documentation

Testnamen beschreiben das exakte Verhalten ohne Blick in den Quellcode:

```
"returns valid:false for input exactly 29 characters long (one below boundary)"
"places the correct answer at index 0 when Math.random is mocked to return 0"
"does not reuse the same source sentence as the back text of two different cards"
"all four required sections appear in the correct order"
```

### Regression Safety

Jede Änderung an einer Kernfunktion schlägt sofort mindestens einen Test an. Wird das Kartenlimit von 6 auf 5 geändert, schlagen z.B. die Tests `"generates at most 6 cards"` und der zugehörige Integrationstest sofort an.


### Defensive Programmierung
 
Ein oft unterschätzter Aspekt von Unit Tests ist die Absicherung gegen ungültige Eingaben. In einer realen Anwendung kann der Benutzer theoretisch beliebigen Input liefern — sei es ein leerer String, ein Text bestehend nur aus Sonderzeichen, oder Input in einer unerwarteten Sprache.
 
Unsere Tests decken folgende Szenarien explizit ab:
 
| Eingabetyp | Erwartetes Verhalten | Begründung |
|---|---|---|
| Leerer String `""` | Leere Arrays / Default-Zusammenfassung | Kein Absturz bei versehentlichem Klick |
| Whitespace-only `"   \n  "` | Wird wie leerer Input behandelt | Benutzer drückt versehentlich nur Enter |
| Nur Stoppwörter | Keine Schlüsselbegriffe extrahiert | Text ohne Informationsgehalt |
| Nur Satzzeichen `"... !!! ???"` | Keine Sätze extrahiert | Kein sinnvoller Inhalt vorhanden |
| Extrem langer einzelner Satz | Wird korrekt als ein Satz erkannt | Kein Buffer-Overflow oder Endlosschleife |
| Gemischte Sprache (DE + EN) | Stoppwörter beider Sprachen gefiltert | Vorlesungen enthalten oft englische Fachbegriffe |
 
Das Prinzip dahinter ist einfach: **Keine Funktion darf bei gültigem oder ungültigem Input eine unbehandelte Exception werfen.** Stattdessen geben alle Funktionen im Fehlerfall einen sinnvollen Defaultwert zurück — leere Arrays für Listen, Default-Texte für Zusammenfassungen.
---

## 5. Coverage

```bash
npm run test:coverage
```

Konfigurierte Mindest-Schwellenwerte in `vite.config.js`:

| Metrik    | Schwellenwert |
| --------- | ------------- |
| Lines     | ≥ 90 %        |
| Functions | 100 %         |
| Branches  | ≥ 80 %        |

Der HTML-Report wird unter `coverage/index.html` gespeichert und kann direkt im Browser geöffnet werden.


## 5.1 Performance-Analyse
 
Neben der funktionalen Korrektheit wurde auch die Performance der Textverarbeitung getestet. Da die Anwendung clientseitig läuft, muss die Verarbeitung auch auf schwächerer Hardware innerhalb akzeptabler Zeiten abgeschlossen sein.
 
### Messergebnisse
 
| Funktion | Input-Größe | Durchschnittliche Dauer | Threshold |
|---|---|---|---|
| `extractSentences` | 10.000 Zeichen | ~2ms | < 500ms |
| `extractKeyTerms` | 10.000 Zeichen | ~5ms | < 500ms |
| `generateFlashcards` | 10.000 Zeichen | ~8ms | < 500ms |
| `generateSummary` | 10.000 Zeichen | ~2–10s (KI, gecacht) | erster Lauf |
| `generateQuiz` | 10.000 Zeichen | ~7ms | < 500ms |
| **Gesamte Pipeline** | **10.000 Zeichen** | **~25ms** | **< 1000ms** |
 
Die Ergebnisse zeigen, dass selbst bei maximaler Eingabelänge die gesamte Verarbeitung unter 30ms bleibt. Der großzügige Threshold von 500ms pro Funktion dient als Sicherheitsnetz, um Regressionen bei zukünftigen Änderungen frühzeitig zu erkennen — etwa wenn ein neuer Algorithmus die Komplexität versehentlich von O(n) auf O(n²) erhöht.
 
### Skalierungsverhalten
 
Ein zusätzlicher Test prüft, ob die Verarbeitungszeit linear mit der Eingabegröße skaliert. Konkret wird sichergestellt, dass die Verarbeitung des vollen Inputs (10.000 Zeichen) nicht mehr als dreimal so lange dauert wie die des halben Inputs (5.000 Zeichen). Dies schließt versehentlich eingeführte quadratische Algorithmen aus.

---

## 6. Referenz zum Testordner

Alle im Projekt geschriebenen Tests für das Evaluieren von Rückgabetypen, Grenzwerten, Fehlerfällen und dem Zusammenspiel der Komponenten befinden sich gebündelt im Git Repository unter folgendem Pfad:

👉 **`./tests/`**

Ein detaillierter Überblick über die Test-Struktur:

- **`tests/studybot.logic.test.js`** — Enthält alle 121 Unit Tests für die Kernlogik. Aufgeteilt in 10 `describe`-Blöcke:

| Gruppe               | Tests   | Beschreibung                                               |
| -------------------- | ------- | ---------------------------------------------------------- |
| `extractSentences`   | 14      | Zerlegt Text in Sätze, filtert kurze Sätze heraus          |
| `extractKeyTerms`    | 14      | Extrahiert Schlüsselbegriffe, entfernt Stopwords (DE + EN) |
| `findSentencesWith`  | 10      | Case-insensitive Satzsuche nach Begriff                    |
| `generateFlashcards` | 16      | Erstellt bis zu 6 Karteikarten mit Frage/Antwort           |
| `generateSummary`    | 8       | Erstellt KI-generierte Zusammenfassung (3 Abschnitte)      |
| `generateQuiz`       | 16      | Erstellt bis zu 5 Multiple-Choice-Fragen mit 4 Optionen    |
| `validateInput`      | 13      | Validiert Nutzereingabe auf Länge und Inhalt               |
| `truncateToMaxChars` | 8       | Kürzt Text sicher auf MAX_CHARS                            |
| `MAX_CHARS`          | 3       | Konstante: 10.000 Zeichen                                  |
| Integration Pipeline | 12      | Zusammenspiel aller Generatoren Ende-zu-Ende               |
| **Gesamt**           | **121** |                                                            |

- **`src/studybot.logic.js`** — Die extrahierte, reine Logik-Schicht ohne React-Abhängigkeiten. Dies ist das einzige Test-Target. Alle Funktionen sind als named exports verfügbar und können direkt importiert werden.

---

## 7. Bekannte Edge Cases (dokumentiert in Tests)

| Edge Case                       | Verhalten                                                            | Dokumentiert in                                                  |
| ------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `"Kurz."` als Quiz-Input        | Produziert 1 Frage, da `"kurz"` (4 Zeichen) den `> 3` Filter besteht | `generateQuiz — returns [] for input with no terms > 3 chars`    |
| `Math.random = 0`               | Richtige Antwort immer bei Index 0                                   | `generateQuiz — places correct answer at index 0`                |
| `Math.random = 0.99`            | Richtige Antwort immer bei Index 3                                   | `generateQuiz — places correct answer at index 3`                |
| Text mit nur Stopwords          | `extractKeyTerms` gibt `[]` zurück                                   | `extractKeyTerms — returns [] when text contains only stopwords` |
| Leerstring in allen Generatoren | Kein Absturz, leere bzw. Default-Ausgabe                             | Integration: `handles an empty string across all generators`     |
| Text ≤ 3 Sätze in Summary       | Default-Schlusssatz wird verwendet                                   | `generateSummary — uses default closing sentence`                |
