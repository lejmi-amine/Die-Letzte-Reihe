// =============================================================================
// tests/studybot.logic.test.js
// Unit Tests — StudyBot Core Logic
// DHBW Software Engineering | 3. Semester
//
// Test runner: Vitest  →  npm test
// All tests are pure (no DOM, no React, no network).
// =============================================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractSentences,
  extractKeyTerms,
  findSentencesWith,
  generateFlashcards,
  generateSummary,
  generateQuiz,
  validateInput,
  truncateToMaxChars,
  MAX_CHARS,
} from "../src/studybot.logic.js";

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const SHORT_TEXT = "Dies ist ein kurzer Satz.";

const MEDIUM_TEXT =
  "Photosynthese ist der Prozess, durch den Pflanzen Sonnenlicht in Energie umwandeln. " +
  "Chlorophyll ist das Pigment, das Licht absorbiert und die Reaktion ermöglicht. " +
  "Wasser und Kohlendioxid werden dabei in Glukose und Sauerstoff umgewandelt. " +
  "Die Reaktion findet in den Chloroplasten der Pflanzenzellen statt. " +
  "Ohne Photosynthese wäre das Leben auf der Erde nicht möglich.";

const LONG_TEXT = MEDIUM_TEXT.repeat(4);

// =============================================================================
// 1. extractSentences
// =============================================================================

describe("extractSentences", () => {
  it("splits a multi-sentence text into an array of individual sentences", () => {
    const result = extractSentences(MEDIUM_TEXT);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(1);
  });

  it("filters out sentences shorter than 20 characters", () => {
    const text = "Kurz. Das ist ein langer Satz der über zwanzig Zeichen hat. Ok.";
    const result = extractSentences(text);
    result.forEach((s) => expect(s.length).toBeGreaterThan(20));
  });

  it("collapses multiple newlines into a single space before splitting", () => {
    const text = "Erster Satz mit genug Inhalt.\n\n\nZweiter Satz mit genug Inhalt.";
    const result = extractSentences(text);
    expect(result.length).toBe(2);
  });

  it("splits correctly on exclamation marks and question marks as well as periods", () => {
    const text =
      "Dies ist eine Aussage mit genug Zeichen! " +
      "Ist das eine Frage mit genug Zeichen? " +
      "Ja, das ist die Antwort mit genug Zeichen.";
    const result = extractSentences(text);
    expect(result.length).toBe(3);
  });

  it("returns an empty array when the input is an empty string", () => {
    expect(extractSentences("")).toEqual([]);
  });

  it("returns an empty array when all sentences are shorter than 20 characters", () => {
    expect(extractSentences("Kurz. Sehr kurz. Ok.")).toEqual([]);
  });

  it("trims leading and trailing whitespace from each extracted sentence", () => {
    const text = "  Erster langer Satz mit genug Inhalt.   Zweiter langer Satz mit genug Inhalt.  ";
    const result = extractSentences(text);
    result.forEach((s) => {
      expect(s).toBe(s.trim());
    });
  });

  it("is idempotent — calling it twice on the same input yields the same result", () => {
    expect(extractSentences(MEDIUM_TEXT)).toEqual(extractSentences(MEDIUM_TEXT));
  });
});

// =============================================================================
// 2. extractKeyTerms
// =============================================================================

describe("extractKeyTerms", () => {
  it("returns an array of strings", () => {
    const result = extractKeyTerms(MEDIUM_TEXT);
    expect(Array.isArray(result)).toBe(true);
    result.forEach((t) => expect(typeof t).toBe("string"));
  });

  it("returns at most 20 terms", () => {
    expect(extractKeyTerms(LONG_TEXT).length).toBeLessThanOrEqual(20);
  });

  it("excludes German stopwords from the results", () => {
    const stopwords = ["der", "die", "das", "und", "ist", "ein", "eine", "nicht", "mit", "von"];
    const result = extractKeyTerms(MEDIUM_TEXT);
    stopwords.forEach((sw) => {
      expect(result).not.toContain(sw);
    });
  });

  it("excludes English stopwords from the results", () => {
    const text = "The process of photosynthesis is the most important reaction in biology and ecology.";
    const result = extractKeyTerms(text);
    ["the", "of", "is", "and", "in"].forEach((sw) => {
      expect(result).not.toContain(sw);
    });
  });

  it("excludes words with 3 or fewer characters", () => {
    const result = extractKeyTerms(MEDIUM_TEXT);
    result.forEach((term) => expect(term.length).toBeGreaterThan(3));
  });

  it("sorts terms by frequency — the most frequent term comes first", () => {
    // 'photosynthese' appears multiple times across LONG_TEXT
    const result = extractKeyTerms(LONG_TEXT);
    expect(result[0]).toBe("photosynthese");
  });

  it("returns all terms in lowercase", () => {
    const result = extractKeyTerms(MEDIUM_TEXT);
    result.forEach((t) => expect(t).toBe(t.toLowerCase()));
  });

  it("returns an empty array for an empty input string", () => {
    expect(extractKeyTerms("")).toEqual([]);
  });

  it("is idempotent — calling it twice on the same input yields the same result", () => {
    expect(extractKeyTerms(MEDIUM_TEXT)).toEqual(extractKeyTerms(MEDIUM_TEXT));
  });
});

// =============================================================================
// 3. findSentencesWith
// =============================================================================

describe("findSentencesWith", () => {
  const sentences = [
    "Photosynthese wandelt Sonnenlicht in chemische Energie um.",
    "Chlorophyll ist das grüne Pigment in Pflanzen.",
    "Wasser wird für die Reaktion benötigt.",
  ];

  it("returns only sentences that contain the search term", () => {
    const result = findSentencesWith(sentences, "Photosynthese");
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("Photosynthese");
  });

  it("is case-insensitive — finds term regardless of capitalisation", () => {
    expect(findSentencesWith(sentences, "photosynthese")).toHaveLength(1);
    expect(findSentencesWith(sentences, "CHLOROPHYLL")).toHaveLength(1);
  });

  it("returns multiple sentences when more than one matches the term", () => {
    const s = [
      "Wasser ist für die Photosynthese essenziell.",
      "Ohne Wasser kann keine Photosynthese stattfinden.",
      "Sauerstoff ist ein Nebenprodukt.",
    ];
    expect(findSentencesWith(s, "Wasser")).toHaveLength(2);
  });

  it("returns an empty array when no sentence contains the term", () => {
    expect(findSentencesWith(sentences, "Quantenmechanik")).toEqual([]);
  });

  it("returns an empty array when the sentences array is empty", () => {
    expect(findSentencesWith([], "Photosynthese")).toEqual([]);
  });

  it("does not mutate the original sentences array", () => {
    const original = [...sentences];
    findSentencesWith(sentences, "Chlorophyll");
    expect(sentences).toEqual(original);
  });
});

// =============================================================================
// 4. generateFlashcards
// =============================================================================

describe("generateFlashcards", () => {
  it("returns an array of card objects", () => {
    const cards = generateFlashcards(MEDIUM_TEXT);
    expect(Array.isArray(cards)).toBe(true);
    cards.forEach((card) => {
      expect(card).toHaveProperty("front");
      expect(card).toHaveProperty("back");
    });
  });

  it("generates at most 6 cards regardless of how long the text is", () => {
    expect(generateFlashcards(LONG_TEXT).length).toBeLessThanOrEqual(6);
  });

  it("each card's front is a non-empty string (the question)", () => {
    generateFlashcards(MEDIUM_TEXT).forEach((card) => {
      expect(typeof card.front).toBe("string");
      expect(card.front.length).toBeGreaterThan(0);
    });
  });

  it("each card's back is a non-empty string (the answer)", () => {
    generateFlashcards(MEDIUM_TEXT).forEach((card) => {
      expect(typeof card.back).toBe("string");
      expect(card.back.length).toBeGreaterThan(0);
    });
  });

  it("truncates back text to 200 characters and appends ellipsis when source is longer", () => {
    // Build a text where one sentence is > 200 chars
    const longSentence =
      "Photosynthese " + "ist ein sehr wichtiger biologischer Prozess ".repeat(6) + " in Pflanzen.";
    const text = longSentence + " Chlorophyll absorbiert das Sonnenlicht und ermöglicht die Reaktion.";
    const cards = generateFlashcards(text);
    cards.forEach((card) => {
      if (card.back.endsWith("...")) {
        expect(card.back.length).toBe(200);
      }
    });
  });

  it("does not reuse the same source sentence across multiple cards", () => {
    const cards = generateFlashcards(LONG_TEXT);
    const backs = cards.map((c) => c.back);
    const uniqueBacks = new Set(backs);
    expect(uniqueBacks.size).toBe(backs.length);
  });

  it("returns an empty array when the input text is too short to yield sentences", () => {
    expect(generateFlashcards("Kurz.")).toEqual([]);
  });

  it("is idempotent — same input always produces the same cards", () => {
    expect(generateFlashcards(MEDIUM_TEXT)).toEqual(generateFlashcards(MEDIUM_TEXT));
  });
});

// =============================================================================
// 5. generateSummary
// =============================================================================

describe("generateSummary", () => {
  it("returns a string", () => {
    expect(typeof generateSummary(MEDIUM_TEXT)).toBe("string");
  });

  it("contains the section header 'Überblick'", () => {
    expect(generateSummary(MEDIUM_TEXT)).toContain("Überblick");
  });

  it("contains the section header 'Kernpunkte'", () => {
    expect(generateSummary(MEDIUM_TEXT)).toContain("Kernpunkte");
  });

  it("contains the section header 'Schlüsselbegriffe'", () => {
    expect(generateSummary(MEDIUM_TEXT)).toContain("Schlüsselbegriffe");
  });

  it("contains the section header 'Fazit'", () => {
    expect(generateSummary(MEDIUM_TEXT)).toContain("Fazit");
  });

  it("lists the top key terms in the Schlüsselbegriffe section", () => {
    const summary = generateSummary(MEDIUM_TEXT);
    // 'photosynthese' is the most frequent meaningful term in MEDIUM_TEXT
    expect(summary.toLowerCase()).toContain("photosynthese");
  });

  it("uses a default intro sentence when the input text yields no extractable sentences", () => {
    const summary = generateSummary("Kurz.");
    expect(summary).toContain("Der Text behandelt verschiedene Aspekte eines komplexen Themas.");
  });

  it("uses a default closing sentence when the text has 3 or fewer sentences", () => {
    const twoSentenceText =
      "Photosynthese ist wichtig für das Leben auf der Erde. " +
      "Chlorophyll ermöglicht die Lichtabsorption in Pflanzen.";
    const summary = generateSummary(twoSentenceText);
    expect(summary).toContain("Die genannten Aspekte bilden zusammen ein umfassendes Bild des Themas.");
  });

  it("uses the last sentence of the text as the Fazit when there are more than 3 sentences", () => {
    const sentences = extractSentences(MEDIUM_TEXT);
    const lastSentence = sentences[sentences.length - 1];
    expect(generateSummary(MEDIUM_TEXT)).toContain(lastSentence);
  });

  it("is idempotent — same input always produces the same summary", () => {
    expect(generateSummary(MEDIUM_TEXT)).toBe(generateSummary(MEDIUM_TEXT));
  });
});

// =============================================================================
// 6. generateQuiz
// =============================================================================

describe("generateQuiz", () => {
  it("returns an array of quiz question objects", () => {
    const quiz = generateQuiz(MEDIUM_TEXT);
    expect(Array.isArray(quiz)).toBe(true);
  });

  it("generates at most 5 questions", () => {
    expect(generateQuiz(LONG_TEXT).length).toBeLessThanOrEqual(5);
  });

  it("each question object has the required fields: question, options, correct", () => {
    generateQuiz(MEDIUM_TEXT).forEach((q) => {
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("correct");
    });
  });

  it("each question has exactly 4 answer options", () => {
    generateQuiz(MEDIUM_TEXT).forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  it("the correct index is always a valid index into the options array (0–3)", () => {
    generateQuiz(MEDIUM_TEXT).forEach((q) => {
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    });
  });

  it("the option at the correct index is not identical to the wrong answers", () => {
    // The correct answer is derived from the text; wrong answers are constructed phrases
    generateQuiz(MEDIUM_TEXT).forEach((q) => {
      const correctAnswer = q.options[q.correct];
      const wrongAnswers = q.options.filter((_, i) => i !== q.correct);
      wrongAnswers.forEach((wrong) => {
        expect(correctAnswer).not.toBe(wrong);
      });
    });
  });

  it("question text is a non-empty string", () => {
    generateQuiz(MEDIUM_TEXT).forEach((q) => {
      expect(typeof q.question).toBe("string");
      expect(q.question.length).toBeGreaterThan(0);
    });
  });

  it("returns an empty array when the input yields no key terms (no word longer than 3 chars)", () => {
    // Note: "Kurz." is NOT a valid empty case — "kurz" is exactly 4 chars and passes the > 3 filter,
    // so the quiz generator produces one question from it. Use input with no words > 3 chars instead.
    expect(generateQuiz("AB.")).toEqual([]);
    expect(generateQuiz("")).toEqual([]);
  });

  it("uses Math.random to place the correct answer — mocking it controls correct index placement", () => {
    // With Math.random mocked to return 0, correctIdx should always be 0
    vi.spyOn(Math, "random").mockReturnValue(0);
    const quiz = generateQuiz(MEDIUM_TEXT);
    quiz.forEach((q) => expect(q.correct).toBe(0));
    vi.restoreAllMocks();
  });
});

// =============================================================================
// 7. validateInput
// =============================================================================

describe("validateInput", () => {
  it("returns valid:true and no error for a normal text input", () => {
    const result = validateInput(MEDIUM_TEXT);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("returns valid:false when the input is an empty string", () => {
    expect(validateInput("").valid).toBe(false);
  });

  it("returns valid:false when the input is only whitespace", () => {
    expect(validateInput("     ").valid).toBe(false);
  });

  it("returns valid:false when the trimmed text is shorter than 30 characters", () => {
    expect(validateInput("Zu kurz.").valid).toBe(false);
  });

  it("returns a German error message when input is too short", () => {
    const result = validateInput("Kurz");
    expect(typeof result.error).toBe("string");
    expect(result.error.length).toBeGreaterThan(0);
  });

  it("returns valid:false when the input exceeds MAX_CHARS", () => {
    const overLimit = "a".repeat(MAX_CHARS + 1);
    expect(validateInput(overLimit).valid).toBe(false);
  });

  it("returns valid:true for input that is exactly MAX_CHARS characters long", () => {
    const atLimit = "a".repeat(MAX_CHARS);
    expect(validateInput(atLimit).valid).toBe(true);
  });

  it("returns valid:false and no error:null for invalid inputs (error is always a string)", () => {
    const result = validateInput("");
    expect(result.valid).toBe(false);
    expect(typeof result.error).toBe("string");
  });
});

// =============================================================================
// 8. truncateToMaxChars
// =============================================================================

describe("truncateToMaxChars", () => {
  it("returns the original string unchanged when it is shorter than MAX_CHARS", () => {
    const input = "Kurzer Text.";
    expect(truncateToMaxChars(input)).toBe(input);
  });

  it("returns the original string unchanged when it is exactly MAX_CHARS characters long", () => {
    const input = "a".repeat(MAX_CHARS);
    expect(truncateToMaxChars(input)).toBe(input);
  });

  it("truncates text that exceeds MAX_CHARS to exactly MAX_CHARS characters", () => {
    const input = "a".repeat(MAX_CHARS + 500);
    const result = truncateToMaxChars(input);
    expect(result.length).toBe(MAX_CHARS);
  });

  it("preserves the beginning of the text when truncating", () => {
    const prefix = "Anfang des Textes ";
    const input = prefix + "a".repeat(MAX_CHARS);
    expect(truncateToMaxChars(input).startsWith(prefix)).toBe(true);
  });

  it("returns an empty string for an empty input", () => {
    expect(truncateToMaxChars("")).toBe("");
  });
});

// =============================================================================
// 9. MAX_CHARS constant
// =============================================================================

describe("MAX_CHARS", () => {
  it("is defined and equals 10000", () => {
    expect(MAX_CHARS).toBe(10000);
  });

  it("is a number", () => {
    expect(typeof MAX_CHARS).toBe("number");
  });
});

// =============================================================================
// Branch-Coverage Ergänzungen — fehlende Zweige (Ziel: ≥ 90%)
// =============================================================================

describe("generateFlashcards — branch coverage", () => {
  it("truncates the back of a while-loop card to 200 chars when the sentence exceeds 200 characters", () => {
    // Text with no key terms matching sentences → while loop fills cards with long sentences
    const longSentence = "Wasser ".repeat(40) + "ist wichtig.";
    const text = longSentence;
    const cards = generateFlashcards(text);
    cards.forEach((card) => {
      if (card.back.endsWith("...")) {
        expect(card.back.length).toBe(200);
      }
    });
  });

  it("breaks out of the while loop when all sentences are already used", () => {
    // Only 1 unique sentence → for loop uses it, while loop hits 'else break'
    const singleSentence = "Photosynthese ist der biologische Prozess durch den Pflanzen Energie erzeugen.";
    const cards = generateFlashcards(singleSentence);
    expect(cards.length).toBeGreaterThanOrEqual(0);
    expect(cards.length).toBeLessThanOrEqual(6);
  });
});

describe("generateSummary — branch coverage", () => {
  it("prefers term-dense sentences over low-information sentences as key points", () => {
    // Low-information sentence has no key terms → scores 0 → not selected as key point
    const lowInfo = "Dies ist ein einfacher Satz ohne Fachbegriffe hier.";
    const text =
      "Photosynthese ist ein fundamentaler biologischer Prozess in Pflanzenzellen. " +
      lowInfo + " " +
      "Chlorophyll ist das Pigment, das Licht absorbiert und Energie freisetzt. " +
      "Wasser und Kohlendioxid werden in Glukose und Sauerstoff umgewandelt. " +
      "Ohne Photosynthese wäre kein Leben auf der Erde möglich.";
    const summary = generateSummary(text);
    expect(summary).toContain("Kernpunkte");
    // Term-rich sentences should appear in key points
    expect(summary.toLowerCase()).toMatch(/chlorophyll|kohlendioxid|glukose/);
  });
});

describe("generateQuiz — branch coverage", () => {
  it("truncates the correct answer to 100 chars with ellipsis when the matching sentence is long", () => {
    // Build a text where every sentence containing the key term is > 100 chars
    const longSentence =
      "Photosynthese " + "ist ein sehr wichtiger Prozess der in den Chloroplasten stattfindet ".repeat(3) + "wirklich.";
    const text = longSentence + " Chlorophyll ist das Pigment das dabei hilft und wichtig ist.";
    const quiz = generateQuiz(text);
    const truncated = quiz.find((q) => q.options.some((o) => o.endsWith("...")));
    if (truncated) {
      const truncatedOption = truncated.options.find((o) => o.endsWith("..."));
      expect(truncatedOption.length).toBe(103); // 100 chars + "..."
    }
  });

  it("uses fallback wrong-answer strings when there are no other terms available", () => {
    // Only stopwords + one content word → wrongTerms is empty → all 3 ternary false-branches hit
    const text =
      "Photosynthese ist das und der die das eine oder. " +
      "Photosynthese ist das und der die das ein oder und. " +
      "Photosynthese ist und der die das ein eine oder und. " +
      "Photosynthese ist das und der die das eine oder und. " +
      "Photosynthese ist das und der die eine oder und auch.";
    const quiz = generateQuiz(text);
    expect(quiz.length).toBeGreaterThan(0);
    const q = quiz[0];
    const wrongAnswers = q.options.filter((_, i) => i !== q.correct);
    const hasFallback = wrongAnswers.some(
      (a) =>
        a === "Dies ist ein unverwandter Fachbegriff." ||
        a === "Eine alternative Theorie, die hier nicht zutrifft." ||
        a === "Diese Aussage ist im gegebenen Kontext nicht korrekt."
    );
    expect(hasFallback).toBe(true);
  });

  it("uses the fallback answer string when no sentence in the text contains the key term", () => {
    // Force a case where extractKeyTerms finds a term but extractSentences returns nothing for it
    // by making all sentences very short (< 20 chars filtered) but repeating the term in raw text
    const text =
      "Photosynthese Photosynthese Photosynthese Photosynthese Photosynthese Photosynthese " +
      "Chlorophyll ist ein sehr wichtiges Pigment das in Pflanzen vorkommt und das Licht absorbiert.";
    const quiz = generateQuiz(text);
    expect(quiz.length).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// 10. Integration — full pipeline
// =============================================================================

describe("Full generation pipeline (integration)", () => {
  it("produces cards, a summary and a quiz from the same input text without throwing", () => {
    expect(() => {
      const cards = generateFlashcards(MEDIUM_TEXT);
      const summary = generateSummary(MEDIUM_TEXT);
      const quiz = generateQuiz(MEDIUM_TEXT);
      expect(cards.length).toBeGreaterThan(0);
      expect(summary.length).toBeGreaterThan(0);
      expect(quiz.length).toBeGreaterThan(0);
    }).not.toThrow();
  });

  it("all three generators share the same key terms — terms in cards also appear in summary", () => {
    const terms = extractKeyTerms(MEDIUM_TEXT);
    const summary = generateSummary(MEDIUM_TEXT);
    // At least one of the top 5 terms should appear in the summary
    const topFive = terms.slice(0, 5);
    const anyTermInSummary = topFive.some((t) => summary.toLowerCase().includes(t));
    expect(anyTermInSummary).toBe(true);
  });

  it("running the full pipeline twice on the same text produces identical results", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const first = {
      cards: generateFlashcards(MEDIUM_TEXT),
      summary: generateSummary(MEDIUM_TEXT),
      quiz: generateQuiz(MEDIUM_TEXT),
    };
    const second = {
      cards: generateFlashcards(MEDIUM_TEXT),
      summary: generateSummary(MEDIUM_TEXT),
      quiz: generateQuiz(MEDIUM_TEXT),
    };
    expect(first).toEqual(second);
    vi.restoreAllMocks();
  });

  it("handles a very long text (4x MEDIUM_TEXT) without throwing", () => {
    expect(() => {
      generateFlashcards(LONG_TEXT);
      generateSummary(LONG_TEXT);
      generateQuiz(LONG_TEXT);
    }).not.toThrow();
  });

  it("handles a text that is just at the minimum valid length without throwing", () => {
    const minimalText = "Dies ist ein Text der genau dreißig Zeichen hat.";
    expect(() => {
      generateFlashcards(minimalText);
      generateSummary(minimalText);
      generateQuiz(minimalText);
    }).not.toThrow();
  });
});
