import { useState, useCallback } from "react";

// ─── Theme & Constants ───────────────────────────────────────────────
const MAX_CHARS = 10000;

const THEMES = {
  dark: {
    bg: "#0a0a0f", bgSecondary: "#12121a", bgCard: "#1a1a26", bgCardHover: "#22222f",
    bgInput: "#14141e", text: "#e8e6f0", textSecondary: "#8b89a0", textMuted: "#5a587a",
    accent: "#7c6aef", accentLight: "#9b8cf7", accentDim: "rgba(124,106,239,0.12)",
    accentGlow: "rgba(124,106,239,0.25)", border: "#2a2a3a", borderLight: "#1e1e2e",
    success: "#4ade80", error: "#f87171", warning: "#fbbf24",
  },
  light: {
    bg: "#f5f3ff", bgSecondary: "#ede9fe", bgCard: "#ffffff", bgCardHover: "#f8f6ff",
    bgInput: "#ffffff", text: "#1a1035", textSecondary: "#6b6490", textMuted: "#9994b8",
    accent: "#6d55e0", accentLight: "#8672f0", accentDim: "rgba(109,85,224,0.08)",
    accentGlow: "rgba(109,85,224,0.15)", border: "#e2ddf5", borderLight: "#ede9fe",
    success: "#22c55e", error: "#ef4444", warning: "#f59e0b",
  },
};

const TABS = [
  { id: "input", label: "Text eingeben", icon: "📝" },
  { id: "cards", label: "Karteikarten", icon: "🃏" },
  { id: "summary", label: "Zusammenfassung", icon: "📋" },
  { id: "quiz", label: "Quiz", icon: "🧠" },
];

// ─── Smart Text Analysis Engine (No API needed) ─────────────────────

function extractSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function extractKeyTerms(text) {
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

  const words = text.toLowerCase().replace(/[^a-zäöüß\s-]/gi, " ").split(/\s+/).filter((w) => w.length > 3 && !stopwords.has(w));
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function findSentencesWith(sentences, term) {
  return sentences.filter((s) => s.toLowerCase().includes(term.toLowerCase()));
}

function generateFlashcards(text) {
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

  // Fill up if we have less than 6
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

function generateSummary(text) {
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

function generateQuiz(text) {
  const sentences = extractSentences(text);
  const terms = extractKeyTerms(text);
  const quiz = [];

  for (let i = 0; i < Math.min(5, terms.length); i++) {
    const term = terms[i];
    const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
    const match = findSentencesWith(sentences, term)[0] || "";
    const answer = match.length > 100 ? match.slice(0, 100) + "..." : match || `Ein zentraler Aspekt im behandelten Thema.`;

    // Generate wrong answers from other terms
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

// ─── Flashcard Component ─────────────────────────────────────────────
function FlashcardComp({ card, index, total, theme, onDragStart, onDragOver, onDrop, isDragOver }) {
  const [flipped, setFlipped] = useState(false);
  const t = THEMES[theme];
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: "1000px", cursor: "grab", width: "100%", maxWidth: 520, height: 260,
        margin: "0 auto", transition: "transform 0.2s, opacity 0.2s",
        transform: isDragOver ? "scale(1.03)" : "scale(1)", opacity: isDragOver ? 0.7 : 1,
      }}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
        transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
      }}>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: `linear-gradient(135deg, ${t.bgCard}, ${t.bgCardHover})`,
          border: `1px solid ${isDragOver ? t.accent : t.border}`, borderRadius: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 32, boxShadow: `0 8px 32px ${t.accentDim}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>
            Frage {index + 1} / {total}
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: t.text, textAlign: "center", lineHeight: 1.6 }}>{card.front}</div>
          <div style={{ marginTop: 20, fontSize: 12, color: t.textMuted, display: "flex", gap: 16 }}>
            <span>Klicken → Umdrehen</span><span>Ziehen → Sortieren</span>
          </div>
        </div>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
          background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`, borderRadius: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 32, boxShadow: `0 8px 32px ${t.accentGlow}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Antwort</div>
          <div style={{ fontSize: 17, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.6 }}>{card.back}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Card ───────────────────────────────────────────────────────
function MiniCard({ card, index, theme, onDragStart, onDragOver, onDrop, isDragOver, onClick }) {
  const t = THEMES[theme];
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onClick={() => onClick(index)}
      style={{
        background: isDragOver ? t.accentDim : `linear-gradient(135deg, ${t.bgCard}, ${t.bgCardHover})`,
        border: `1.5px solid ${isDragOver ? t.accent : t.border}`, borderRadius: 14,
        padding: "16px 18px", cursor: "grab", transition: "all 0.2s",
        transform: isDragOver ? "scale(1.04)" : "scale(1)", minHeight: 90,
        display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: t.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>Karte {index + 1}</div>
      <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, fontWeight: 500 }}>
        {card.front.length > 80 ? card.front.slice(0, 80) + "…" : card.front}
      </div>
    </div>
  );
}

// ─── Quiz Question ───────────────────────────────────────────────────
function QuizQuestion({ q, index, selected, onSelect, revealed, theme }) {
  const t = THEMES[theme];
  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 16, lineHeight: 1.5 }}>
        <span style={{ color: t.accent, marginRight: 8 }}>{index + 1}.</span>{q.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          const letter = ["A", "B", "C", "D"][i];
          const isSelected = selected === i;
          const isCorrect = revealed && i === q.correct;
          const isWrong = revealed && isSelected && i !== q.correct;
          let bg = t.bgSecondary, borderColor = t.borderLight, textColor = t.text;
          if (isCorrect) { bg = "rgba(74,222,128,0.12)"; borderColor = t.success; textColor = t.success; }
          else if (isWrong) { bg = "rgba(248,113,113,0.12)"; borderColor = t.error; textColor = t.error; }
          else if (isSelected && !revealed) { bg = t.accentDim; borderColor = t.accent; textColor = t.accent; }
          return (
            <button key={i} onClick={() => !revealed && onSelect(i)} style={{
              background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 10,
              padding: "12px 16px", cursor: revealed ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", textAlign: "left",
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: textColor, width: 28, height: 28, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isSelected || isCorrect || isWrong ? "rgba(255,255,255,0.1)" : "transparent", flexShrink: 0,
              }}>{letter}</span>
              <span style={{ fontSize: 14, color: textColor, lineHeight: 1.4 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Loader ──────────────────────────────────────────────────────────
function Loader({ theme, text }) {
  const t = THEMES[theme];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 60 }}>
      <div style={{ width: 44, height: 44, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: t.textSecondary, fontSize: 14 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────
export default function StudyBot() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("input");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [cards, setCards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardView, setCardView] = useState("single");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [fileDragOver, setFileDragOver] = useState(false);

  const t = THEMES[theme];
  const fontStack = "'Outfit', 'DM Sans', system-ui, sans-serif";

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setFileDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(txt|md|csv|text)$/i) && file.type && !file.type.startsWith("text/")) {
      setError("Nur Textdateien (.txt, .md) werden unterstützt.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { setInputText((ev.target.result || "").slice(0, MAX_CHARS)); setError(""); };
    reader.readAsText(file);
  }, []);

  const handleCardDrop = useCallback((dropIdx) => {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setDragOverIdx(null); return; }
    setCards((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(dropIdx, 0, moved);
      return arr;
    });
    setCardIndex(dropIdx);
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx]);

  const generate = useCallback(async () => {
    if (!inputText.trim() || inputText.trim().length < 30) {
      setError("Bitte gib mindestens einen kurzen Absatz ein (mind. 30 Zeichen).");
      return;
    }
    setError(""); setLoading(true); setGenerated(false);

    try {
      // Simulate processing delay for realism
      setLoadingMsg("Text wird analysiert...");
      await new Promise((r) => setTimeout(r, 600));

      setLoadingMsg("Karteikarten werden erstellt...");
      await new Promise((r) => setTimeout(r, 500));
      setCards(generateFlashcards(inputText));

      setLoadingMsg("Zusammenfassung wird erstellt...");
      await new Promise((r) => setTimeout(r, 400));
      setSummary(generateSummary(inputText));

      setLoadingMsg("Quiz wird generiert...");
      await new Promise((r) => setTimeout(r, 400));
      setQuiz(generateQuiz(inputText));

      setGenerated(true); setQuizAnswers({}); setQuizRevealed(false); setCardIndex(0); setActiveTab("cards");
    } catch (e) {
      setError("Fehler bei der Verarbeitung: " + e.message);
    } finally { setLoading(false); setLoadingMsg(""); }
  }, [inputText]);

  const quizScore = quizRevealed && quiz.length > 0
    ? quiz.filter((q, i) => quizAnswers[i] === q.correct).length : null;
  const charPercent = Math.min(100, (inputText.length / MAX_CHARS) * 100);
  const charColor = charPercent > 90 ? t.error : charPercent > 70 ? t.warning : t.accent;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: fontStack, color: t.text, transition: "background 0.4s, color 0.4s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${t.border}`, background: t.bgSecondary,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 4px 16px ${t.accentGlow}`,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>StudyBot</div>
            <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>AI-Powered Learning</div>
          </div>
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
          width: 40, height: 40, borderRadius: 10, border: `1px solid ${t.border}`,
          background: t.bgCard, cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{theme === "dark" ? "☀️" : "🌙"}</button>
      </header>

      {/* Tabs */}
      <nav style={{
        display: "flex", gap: 4, padding: "12px 24px",
        borderBottom: `1px solid ${t.border}`, background: t.bgSecondary, overflowX: "auto",
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.id !== "input" && !generated;
          return (
            <button key={tab.id} onClick={() => !isDisabled && setActiveTab(tab.id)} style={{
              padding: "10px 18px", borderRadius: 10, border: "none",
              background: isActive ? t.accentDim : "transparent",
              color: isDisabled ? t.textMuted : isActive ? t.accent : t.textSecondary,
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              cursor: isDisabled ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
              whiteSpace: "nowrap", opacity: isDisabled ? 0.5 : 1, fontFamily: fontStack,
            }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          );
        })}
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>

        {/* ═══ INPUT ═══ */}
        {activeTab === "input" && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5 }}>Vorlesungstext einfügen</h2>
            <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Füge deinen Text ein, tippe ihn ab, oder ziehe eine Textdatei hierher.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setFileDragOver(true); }}
              onDragLeave={() => setFileDragOver(false)}
              onDrop={handleFileDrop}
              style={{
                position: "relative", borderRadius: 16, transition: "all 0.3s",
                border: fileDragOver ? `2px dashed ${t.accent}` : "2px solid transparent",
                background: fileDragOver ? t.accentDim : "transparent",
              }}
            >
              {fileDragOver && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 14, zIndex: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: t.accentDim, backdropFilter: "blur(4px)", pointerEvents: "none",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: t.accent, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 32 }}>📄</span>Datei hier loslassen
                  </div>
                </div>
              )}
              <textarea
                value={inputText}
                onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setInputText(e.target.value); }}
                placeholder="Text hier einfügen, eintippen, oder .txt Datei reinziehen..."
                rows={12}
                style={{
                  width: "100%", background: t.bgInput, color: t.text,
                  border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 20,
                  fontSize: 14, fontFamily: fontStack, lineHeight: 1.7,
                  resize: "vertical", outline: "none", transition: "border 0.2s", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e) => (e.target.style.borderColor = t.border)}
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${charPercent}%`, background: charColor, borderRadius: 2, transition: "width 0.3s, background 0.3s" }} />
              </div>
              <span style={{ fontSize: 12, color: charColor, fontWeight: 600, whiteSpace: "nowrap" }}>
                {inputText.length.toLocaleString("de-DE")} / {MAX_CHARS.toLocaleString("de-DE")}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: t.textMuted }}>{inputText.trim().split(/\s+/).filter(Boolean).length} Wörter</span>
              <button onClick={generate} disabled={loading} style={{
                padding: "14px 32px", borderRadius: 12, border: "none",
                background: loading ? t.textMuted : `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: loading ? "wait" : "pointer", fontFamily: fontStack,
                boxShadow: loading ? "none" : `0 4px 20px ${t.accentGlow}`, transition: "all 0.3s",
              }}>{loading ? "⏳ Generiere..." : "⚡ Lernmaterial generieren"}</button>
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(248,113,113,0.1)", border: `1px solid ${t.error}`, borderRadius: 10, color: t.error, fontSize: 13 }}>{error}</div>
            )}
            {loading && <Loader theme={theme} text={loadingMsg} />}
          </div>
        )}

        {/* ═══ FLASHCARDS ═══ */}
        {activeTab === "cards" && generated && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>🃏 Karteikarten</h2>
              <div style={{ display: "flex", gap: 4, background: t.bgSecondary, borderRadius: 10, padding: 3 }}>
                {[{ id: "single", label: "Einzeln" }, { id: "grid", label: "Grid" }].map((v) => (
                  <button key={v.id} onClick={() => setCardView(v.id)} style={{
                    padding: "6px 14px", borderRadius: 8, border: "none",
                    background: cardView === v.id ? t.accent : "transparent",
                    color: cardView === v.id ? "#fff" : t.textSecondary,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: fontStack,
                  }}>{v.label}</button>
                ))}
              </div>
            </div>

            {cardView === "single" && cards.length > 0 && (
              <>
                <FlashcardComp card={cards[cardIndex]} index={cardIndex} total={cards.length} theme={theme}
                  onDragStart={setDragIdx} onDragOver={setDragOverIdx} onDrop={handleCardDrop}
                  isDragOver={dragOverIdx === cardIndex} />
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
                  <button onClick={() => setCardIndex(Math.max(0, cardIndex - 1))} disabled={cardIndex === 0} style={{
                    padding: "10px 24px", borderRadius: 10, border: `1px solid ${t.border}`,
                    background: t.bgCard, color: cardIndex === 0 ? t.textMuted : t.text,
                    cursor: cardIndex === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500, fontFamily: fontStack,
                  }}>← Zurück</button>
                  <button onClick={() => setCardIndex(Math.min(cards.length - 1, cardIndex + 1))} disabled={cardIndex === cards.length - 1} style={{
                    padding: "10px 24px", borderRadius: 10, border: "none",
                    background: cardIndex === cards.length - 1 ? t.textMuted : t.accent,
                    color: "#fff", cursor: cardIndex === cards.length - 1 ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 500, fontFamily: fontStack,
                  }}>Weiter →</button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
                  {cards.map((_, i) => (
                    <div key={i} onClick={() => setCardIndex(i)} style={{
                      width: i === cardIndex ? 24 : 8, height: 8, borderRadius: 4,
                      background: i === cardIndex ? t.accent : t.border, cursor: "pointer", transition: "all 0.3s",
                    }} />
                  ))}
                </div>
              </>
            )}

            {cardView === "grid" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {cards.map((card, i) => (
                  <MiniCard key={i} card={card} index={i} theme={theme}
                    onDragStart={setDragIdx} onDragOver={setDragOverIdx} onDrop={handleCardDrop}
                    isDragOver={dragOverIdx === i}
                    onClick={(idx) => { setCardIndex(idx); setCardView("single"); }} />
                ))}
              </div>
            )}

            {cards.length > 1 && (
              <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: t.textMuted }}>
                💡 Karten per Drag & Drop umsortieren{cardView === "grid" ? " • Klicken zum Öffnen" : ""}
              </p>
            )}
          </div>
        )}

        {/* ═══ SUMMARY ═══ */}
        {activeTab === "summary" && generated && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24, letterSpacing: -0.5 }}>📋 Zusammenfassung</h2>
            <div style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16,
              padding: 28, lineHeight: 1.8, fontSize: 15, color: t.text, whiteSpace: "pre-wrap",
            }}>{summary}</div>
          </div>
        )}

        {/* ═══ QUIZ ═══ */}
        {activeTab === "quiz" && generated && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>🧠 Quiz</h2>
              {quizRevealed && quizScore !== null && (
                <div style={{
                  padding: "8px 20px", borderRadius: 10,
                  background: quizScore >= quiz.length * 0.8 ? "rgba(74,222,128,0.15)" : quizScore >= quiz.length * 0.5 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)",
                  color: quizScore >= quiz.length * 0.8 ? t.success : quizScore >= quiz.length * 0.5 ? t.warning : t.error,
                  fontSize: 15, fontWeight: 700,
                }}>{quizScore} / {quiz.length} richtig</div>
              )}
            </div>
            {quiz.map((q, i) => (
              <QuizQuestion key={i} q={q} index={i} selected={quizAnswers[i]}
                onSelect={(optIdx) => setQuizAnswers((prev) => ({ ...prev, [i]: optIdx }))}
                revealed={quizRevealed} theme={theme} />
            ))}
            {quiz.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
                {!quizRevealed ? (
                  <button onClick={() => setQuizRevealed(true)}
                    disabled={Object.keys(quizAnswers).length < quiz.length} style={{
                    padding: "14px 32px", borderRadius: 12, border: "none",
                    background: Object.keys(quizAnswers).length < quiz.length ? t.textMuted : `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
                    color: "#fff", fontSize: 15, fontWeight: 600,
                    cursor: Object.keys(quizAnswers).length < quiz.length ? "not-allowed" : "pointer",
                    fontFamily: fontStack,
                    boxShadow: Object.keys(quizAnswers).length < quiz.length ? "none" : `0 4px 20px ${t.accentGlow}`,
                  }}>✅ Auswerten</button>
                ) : (
                  <button onClick={() => { setQuizAnswers({}); setQuizRevealed(false); }} style={{
                    padding: "14px 32px", borderRadius: 12, border: `1px solid ${t.border}`,
                    background: t.bgCard, color: t.text, fontSize: 15, fontWeight: 600,
                    cursor: "pointer", fontFamily: fontStack,
                  }}>🔄 Nochmal versuchen</button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{
        textAlign: "center", padding: "24px 20px", color: t.textMuted, fontSize: 12,
        borderTop: `1px solid ${t.borderLight}`,
      }}>StudyBot — AI-Powered Learning • DHBW Software Engineering Projekt</footer>
    </div>
  );
}
