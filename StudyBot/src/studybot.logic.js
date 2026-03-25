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

  const words = text
    .toLowerCase()
    .replace(/[^a-zäöüß\s-]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w));

  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  return Object.entries(freq)
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

  const keyPoints = [];
  const used = new Set([0]);
  for (let i = 1; i < sentences.length && keyPoints.length < 5; i++) {
    if (sentences[i].length > 30) {
      keyPoints.push(sentences[i]);
      used.add(i);
    }
  }

  const closing = sentences.length > 3
    ? sentences[sentences.length - 1]
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
