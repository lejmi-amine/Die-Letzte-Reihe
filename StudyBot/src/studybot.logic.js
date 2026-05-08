// ─── studybot.logic.js ───────────────────────────────────────────────
// Pure business logic extracted from StudyBot.jsx.
// No React imports — fully testable in a Node environment.

export const MAX_CHARS = 10000;

// ─── Text Analysis ───────────────────────────────────────────────────

export function extractSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

// Strips common German suffixes to group inflected/derived word forms.
// Example: "Photosynthesen" → "Photosynthes", "lernend" → "lern"
export function stem(word) {
  const suffixes = [
    "ungen", "schaft", "heit", "keit", "lich", "isch",
    "ung", "ern", "eln", "ster", "sten", "ende", "enden",
    "ender", "ens", "ers", "est", "em", "er", "es", "en", "e", "s",
  ];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

export function extractKeyTerms(text) {
  const stopwords = new Set([
    "der","die","das","ein","eine","und","oder","aber","ist","sind","war","hat","haben",
    "wird","werden","kann","können","mit","von","für","auf","den","dem","des","im","in",
    "zu","zur","zum","als","auch","nicht","sich","bei","nach","über","aus","wie","so",
    "an","es","er","sie","wir","ich","man","dass","wenn","noch","nur","mehr","sehr",
    "the","a","an","is","are","was","has","have","will","can","with","from","for","on",
    "to","of","in","at","by","as","be","this","that","it","or","and","but","not","do",
    "been","being","which","who","what","how","than","its","these","those","between",
    "through","about","into","each","other","then","there","their","them","would","could",
    "should","some","all","any","most","were","had","did","does","one","two","may","must",
    "also","such","where","when","here","very","just","more","only","well","both","much",
    "many","often","noch","schon","doch","also","dann","dabei","daher","deshalb","jedoch",
    "sowie","weil","obwohl","bereits","eines","einem","einen","einer","diese","dieser",
    "dieses","diesen","diesem","jeder","jede","jedes","jeden","jedem","seine","seiner",
    "seinen","seinem","ihre","ihrer","ihren","ihrem","andere","anderen","anderem","anderer",
    "welche","welcher","welches","welchen","welchem","wurde","wurden","werden","könnte",
    "können","sollte","müssen","keine","kein","keinen","keinem","keiner","sondern","oder",
  ]);

  const sentences = extractSentences(text);
  const totalSentences = sentences.length || 1;

  const words = text
    .toLowerCase()
    .replace(/[^a-zäöüß\s-]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w));

  // Group words by their stem to merge inflected forms (e.g. Photosynthese/Photosynthesen)
  const stemGroups = {};
  words.forEach((w) => {
    const s = stem(w);
    if (!stemGroups[s]) stemGroups[s] = { count: 0, forms: {} };
    stemGroups[s].count++;
    stemGroups[s].forms[w] = (stemGroups[s].forms[w] || 0) + 1;
  });

  // Document frequency: how many sentences contain each stem group
  const docFreq = {};
  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    Object.entries(stemGroups).forEach(([s, { forms }]) => {
      if (Object.keys(forms).some((f) => lower.includes(f))) {
        docFreq[s] = (docFreq[s] || 0) + 1;
      }
    });
  });

  return Object.entries(stemGroups)
    .map(([s, { count, forms }]) => {
      const df = docFreq[s] || 1;
      // TF-IDF: reward frequency, penalize terms that appear in too many sentences
      const idf = Math.log((totalSentences + 1) / df);
      // Length bonus: longer words are more domain-specific in German compound words
      const bestForm = Object.entries(forms).sort((a, b) => b[1] - a[1])[0][0];
      const lengthBonus = 1 + Math.log(Math.max(bestForm.length, 4) / 4);
      return [bestForm, count * idf * lengthBonus];
    })
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

export function findSentencesWith(sentences, term) {
  return sentences.filter((s) => s.toLowerCase().includes(term.toLowerCase()));
}

// ─── Generators ──────────────────────────────────────────────────────

export function generateFlashcards(text) {
  const sentences = extractSentences(text);
  const terms = extractKeyTerms(text);
  const cards = [];
  const usedSentences = new Set();

  for (const term of terms) {
    if (cards.length >= 6) break;
    const matches = findSentencesWith(sentences, term);
    for (const match of matches) {
      if (usedSentences.has(match)) continue;
      usedSentences.add(match);
      const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);

      const questionVariants = [
        `Was versteht man unter "${displayTerm}"?`,
        `Welche Rolle spielt "${displayTerm}"?`,
        `Erkläre den Begriff "${displayTerm}".`,
        `Was ist "${displayTerm}" und warum ist es wichtig?`,
        `Beschreibe "${displayTerm}" in eigenen Worten.`,
        `Wie lässt sich "${displayTerm}" definieren?`,
      ];

      cards.push({
        front: questionVariants[cards.length % questionVariants.length],
        back: match.length > 200 ? match.slice(0, 197) + "..." : match,
      });
      break;
    }
  }

  while (cards.length < 6 && cards.length < sentences.length) {
    const s = sentences[cards.length * 2] || sentences[cards.length];
    if (s && !usedSentences.has(s)) {
      usedSentences.add(s);
      cards.push({
        front: `Erkläre folgenden Sachverhalt: ${s.slice(0, 60)}...?`,
        back: s.length > 200 ? s.slice(0, 197) + "..." : s,
      });
    } else break;
  }

  return cards;
}

export function generateSummary(text) {
  const sentences = extractSentences(text);
  const terms = extractKeyTerms(text);
  const topTerms = terms.slice(0, 5).map((t) => t.charAt(0).toUpperCase() + t.slice(1));

  const intro = sentences.length > 0
    ? sentences[0]
    : "Der Text behandelt verschiedene Aspekte eines komplexen Themas.";

  // Score each sentence by how many key terms it contains, normalized by length.
  // Sentences with high term density are more informative than positional selection.
  const termSet = new Set(terms.slice(0, 10).map((t) => t.toLowerCase()));
  const lastIdx = sentences.length - 1;
  const candidates = sentences.slice(1, sentences.length > 3 ? lastIdx : undefined);

  const keyPoints = candidates
    .map((sentence, i) => {
      const lower = sentence.toLowerCase();
      const words = lower.replace(/[^a-zäöüß\s]/gi, " ").split(/\s+/).filter(Boolean);
      const hits = [...termSet].filter((t) => lower.includes(t)).length;
      return { sentence, score: hits / Math.sqrt(words.length || 1), idx: i };
    })
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, 5)
    .map((s) => s.sentence);

  const closing = sentences.length > 3
    ? sentences[lastIdx]
    : "Die genannten Aspekte bilden zusammen ein umfassendes Bild des Themas.";

  let summary = `Überblick\n\n${intro}\n\n`;
  summary += `Kernpunkte\n\n`;
  keyPoints.forEach((p) => { summary += `${p}\n\n`; });
  summary += `Schlüsselbegriffe\n\n`;
  summary += `Die wichtigsten Begriffe sind: ${topTerms.join(", ")}.\n\n`;
  summary += `Fazit\n\n${closing}`;

  return summary;
}

export function generateQuiz(text) {
  const sentences = extractSentences(text);
  const terms = extractKeyTerms(text);
  const quiz = [];

  for (let i = 0; i < Math.min(5, terms.length); i++) {
    const term = terms[i];
    const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
    const match = findSentencesWith(sentences, term)[0] || "";
    const answer = match.length > 100 ? match.slice(0, 100) + "..." : match || `Ein zentraler Aspekt im behandelten Thema.`;

    const wrongTerms = terms.filter((t) => t !== term).slice(0, 6);
    const wrongAnswers = [
      wrongTerms[i % wrongTerms.length]
        ? `${wrongTerms[i % wrongTerms.length].charAt(0).toUpperCase() + wrongTerms[i % wrongTerms.length].slice(1)} ist ein unabhängiges Konzept ohne direkten Zusammenhang.`
        : "Dies ist ein unverwandter Fachbegriff.",
      wrongTerms[(i + 1) % wrongTerms.length]
        ? `Es handelt sich um einen Aspekt von ${wrongTerms[(i + 1) % wrongTerms.length]}, nicht von ${displayTerm}.`
        : "Eine alternative Theorie, die hier nicht zutrifft.",
      wrongTerms[(i + 2) % wrongTerms.length]
        ? `${displayTerm} bezieht sich ausschließlich auf ${wrongTerms[(i + 2) % wrongTerms.length]}.`
        : "Diese Aussage ist im gegebenen Kontext nicht korrekt.",
    ];

    const correctIdx = Math.floor(Math.random() * 4);
    const options = [...wrongAnswers];
    options.splice(correctIdx, 0, answer);
    if (options.length > 4) options.length = 4;

    const questionVariants = [
      `Welche Aussage über "${displayTerm}" ist korrekt?`,
      `Was trifft auf "${displayTerm}" zu?`,
      `Welche Beschreibung passt zu "${displayTerm}"?`,
      `Was ist richtig bezüglich "${displayTerm}"?`,
      `Welche der folgenden Aussagen beschreibt "${displayTerm}" am besten?`,
    ];

    quiz.push({
      question: questionVariants[i % questionVariants.length],
      options,
      correct: correctIdx,
    });
  }

  return quiz;
}

// ─── Input Validation ─────────────────────────────────────────────────

export function validateInput(text) {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: "Bitte gib einen Text ein." };
  }
  if (text.trim().length < 30) {
    return { valid: false, error: "Bitte gib mindestens einen kurzen Absatz ein (mind. 30 Zeichen)." };
  }
  if (text.length > MAX_CHARS) {
    return { valid: false, error: `Der Text darf maximal ${MAX_CHARS} Zeichen lang sein.` };
  }
  return { valid: true, error: null };
}

export function truncateToMaxChars(text) {
  return text.slice(0, MAX_CHARS);
}
