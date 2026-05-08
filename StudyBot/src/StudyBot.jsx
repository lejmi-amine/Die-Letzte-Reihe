import { useState, useCallback, useEffect, useRef } from "react";
import {
  extractSentences,
  extractKeyTerms,
  findSentencesWith,
  generateFlashcards,
  generateSummary,
  generateQuiz,
} from "./studybot.logic.js";

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
  { id: "history", label: "Lernhistorie", icon: "📅" },
];

// ─── Learning History Helpers ────────────────────────────────────────

const HISTORY_KEY = "studybot_lernhistorie";

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSession(dateStr) {
  const history = loadHistory();
  if (!history.includes(dateStr)) {
    history.push(dateStr);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Flashcard Component ─────────────────────────────────────────────
function FlashcardComp({ card, index, total, theme, onDragStart, onDragOver, onDrop, isDragOver, flipped, onFlip }) {
  const t = THEMES[theme];
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onClick={onFlip}
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
function MiniCard({ card, index, theme, onDragStart, onDragOver, onDrop, isDragOver, onClick, rating }) {
  const t = THEMES[theme];
  const ratingDot = { easy: t.success, medium: t.warning, hard: t.error }[rating];
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onClick={() => onClick(index)}
      style={{
        background: isDragOver ? t.accentDim : `linear-gradient(135deg, ${t.bgCard}, ${t.bgCardHover})`,
        border: `1.5px solid ${isDragOver ? t.accent : ratingDot || t.border}`, borderRadius: 14,
        padding: "16px 18px", cursor: "grab", transition: "all 0.2s",
        transform: isDragOver ? "scale(1.04)" : "scale(1)", minHeight: 90,
        display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>Karte {index + 1}</div>
        {ratingDot && (
          <div style={{ fontSize: 10, fontWeight: 700, color: ratingDot, letterSpacing: 1 }}>
            {{ easy: "✓ Einfach", medium: "~ Mittel", hard: "✗ Schwer" }[rating]}
          </div>
        )}
      </div>
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

// ─── Pomodoro Timer ──────────────────────────────────────────────────
const TIMER_MODES = [
  { id: "work",       label: "Fokus",     minutes: 25, color: "#ef4444" },
  { id: "short",      label: "Kurze Pause", minutes: 5,  color: "#22c55e" },
  { id: "long",       label: "Lange Pause", minutes: 15, color: "#3b82f6" },
];

function PomodoroTimer({ theme }) {
  const t = THEMES[theme];
  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const mode = TIMER_MODES[modeIdx];

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const switchMode = (idx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeIdx(idx);
    setSecondsLeft(TIMER_MODES[idx].minutes * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(mode.minutes * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progress = 1 - secondsLeft / (mode.minutes * 60);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const finished = secondsLeft === 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {/* Mode switcher */}
      <div style={{ display: "flex", gap: 4 }}>
        {TIMER_MODES.map((m, i) => (
          <button key={m.id} onClick={() => switchMode(i)} style={{
            padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            background: modeIdx === i ? m.color : t.bgCard,
            color: modeIdx === i ? "#fff" : t.textSecondary,
            opacity: modeIdx === i ? 1 : 0.7,
          }}>{m.label}</button>
        ))}
      </div>

      {/* Ring + Time */}
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="26" cy="26" r={radius} fill="none" stroke={t.border} strokeWidth="3" />
          <circle
            cx="26" cy="26" r={radius} fill="none"
            stroke={finished ? t.success : mode.color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: finished ? t.success : t.text, letterSpacing: 0.5,
        }}>
          {finished ? "✓" : `${mm}:${ss}`}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setRunning((r) => !r)} style={{
          width: 32, height: 32, borderRadius: 8, border: "none",
          background: running ? t.bgCard : mode.color,
          color: running ? t.text : "#fff",
          cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
          outline: running ? `1px solid ${t.border}` : "none",
        }}>{running ? "⏸" : "▶"}</button>
        <button onClick={reset} style={{
          width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`,
          background: t.bgCard, color: t.textSecondary,
          cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
        }}>↺</button>
      </div>
    </div>
  );
}

// ─── Learning Calendar ───────────────────────────────────────────────
function LernkalenderComp({ theme }) {
  const t = THEMES[theme];
  const [viewDate, setViewDate] = useState(() => new Date());
  const [history, setHistory] = useState(() => loadHistory());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const dayNames = ["Mo","Di","Mi","Do","Fr","Sa","So"];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday-based: 0=Mo,6=So
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = getTodayStr();
  const sessionCount = history.length;
  const thisMonthSessions = history.filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const refresh = () => setHistory(loadHistory());

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>📅 Lernhistorie</h2>
        <button onClick={refresh} style={{
          padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.border}`,
          background: t.bgCard, color: t.textSecondary, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>↺ Aktualisieren</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Gesamt Lerntage</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: t.accent }}>{sessionCount}</div>
        </div>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Dieser Monat</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: t.accentLight }}>{thisMonthSessions}</div>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={prevMonth} style={{
            width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`,
            background: t.bgSecondary, color: t.text, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} style={{
            width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`,
            background: t.bgSecondary, color: t.text, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
        </div>

        {/* Day Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {dayNames.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const hasSession = history.includes(dateStr);
            return (
              <div key={dateStr} style={{
                aspectRatio: "1", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: hasSession || isToday ? 700 : 400,
                background: hasSession ? t.accent : isToday ? t.accentDim : "transparent",
                color: hasSession ? "#fff" : isToday ? t.accent : t.text,
                border: isToday && !hasSession ? `1.5px solid ${t.accent}` : "1.5px solid transparent",
                position: "relative",
              }}>
                {day}
                {hasSession && (
                  <div style={{
                    position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)",
                    width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.7)",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 20, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.textSecondary }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: t.accent }} />
            Gelernt
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.textSecondary }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${t.accent}` }} />
            Heute
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Letzte Lernsessions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...history].reverse().slice(0, 5).map((d) => {
              const date = new Date(d + "T00:00:00");
              const label = date.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
              const isToday = d === todayStr;
              return (
                <div key={d} style={{
                  background: t.bgCard, border: `1px solid ${isToday ? t.accent : t.border}`,
                  borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isToday ? t.accent : t.accentLight, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: t.text }}>{label}</span>
                  {isToday && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: 1 }}>HEUTE</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div style={{ marginTop: 32, textAlign: "center", color: t.textMuted, fontSize: 14 }}>
          Noch keine Lernsessions. Generiere dein erstes Lernmaterial!
        </div>
      )}
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
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [cardCount, setCardCount] = useState(6);
  const [flippedCard, setFlippedCard] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [cardRatings, setCardRatings] = useState({});
  const [deck, setDeck] = useState([]);

  const t = THEMES[theme];
  const fontStack = "'Outfit', 'DM Sans', system-ui, sans-serif";

  useEffect(() => {
    if (activeTab !== "cards" || cardView !== "single" || cards.length === 0) return;
    const handleKey = (e) => {
      if (e.code === "ArrowRight") { setCardIndex((i) => Math.min(cards.length - 1, i + 1)); setFlippedCard(false); }
      else if (e.code === "ArrowLeft") { setCardIndex((i) => Math.max(0, i - 1)); setFlippedCard(false); }
      else if (e.code === "Space") { e.preventDefault(); setFlippedCard((f) => !f); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeTab, cardView, cards.length]);

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

  const buildWeightedDeck = useCallback((totalCards, ratings) => {
    const result = [];
    for (let i = 0; i < totalCards; i++) {
      const r = ratings[i];
      const count = r === "easy" ? 1 : r === "hard" ? 3 : 2;
      for (let j = 0; j < count; j++) result.push(i);
    }
    // Fisher-Yates shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }, []);

  const handleRating = useCallback((rating) => {
    setCardRatings((prev) => {
      const currentCardIdx = deck[cardIndex];
      const newRatings = { ...prev, [currentCardIdx]: rating };
      if (cardIndex < deck.length - 1) {
        setCardIndex((ci) => ci + 1);
      } else {
        // End of round → rebuild weighted deck
        const newDeck = buildWeightedDeck(cards.length, newRatings);
        setDeck(newDeck);
        setCardIndex(0);
      }
      return newRatings;
    });
  }, [deck, cardIndex, cards.length, buildWeightedDeck]);


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
      const newCards = generateFlashcards(inputText, cardCount);
      setCards(newCards);
      setDeck(newCards.map((_, i) => i));
      setCardRatings({});

      setLoadingMsg("Zusammenfassung wird erstellt...");
      await new Promise((r) => setTimeout(r, 400));
      setSummary(generateSummary(inputText));

      setLoadingMsg("Quiz wird generiert...");
      await new Promise((r) => setTimeout(r, 400));
      setQuiz(generateQuiz(inputText));

      saveSession(getTodayStr());
      setGenerated(true); setQuizAnswers({}); setQuizRevealed(false); setCardIndex(0); setActiveTab("cards");
    } catch (e) {
      setError("Fehler bei der Verarbeitung: " + e.message);
    } finally { setLoading(false); setLoadingMsg(""); }
  }, [inputText, cardCount]);

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

        <PomodoroTimer theme={theme} />

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
          const isDisabled = tab.id !== "input" && tab.id !== "history" && !generated;
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

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
              <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>Karteikarten:</span>
              {[6, 9, 12, 15].map((n) => (
                <button key={n} onClick={() => setCardCount(n)} style={{
                  padding: "4px 12px", borderRadius: 8, border: `1px solid ${cardCount === n ? t.accent : t.border}`,
                  background: cardCount === n ? t.accentDim : t.bgCard,
                  color: cardCount === n ? t.accent : t.textSecondary,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: fontStack, transition: "all 0.2s",
                }}>{n}</button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={shuffleCards} style={{
                  padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.border}`,
                  background: t.bgCard, color: t.textSecondary,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: fontStack,
                }}>🔀 Mischen</button>
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
            </div>

            {cardView === "single" && cards.length > 0 && deck.length > 0 && (() => {
              const currentCardIdx = deck[cardIndex];
              const currentRating = cardRatings[currentCardIdx];
              const ratingConfig = [
                { key: "easy",   label: "Einfach", color: t.success,  bg: "rgba(74,222,128,0.12)",  symbol: "✓" },
                { key: "medium", label: "Mittel",  color: t.warning,  bg: "rgba(251,191,36,0.12)",  symbol: "~" },
                { key: "hard",   label: "Schwer",  color: t.error,    bg: "rgba(248,113,113,0.12)", symbol: "✗" },
              ];
              const ratedCount = Object.keys(cardRatings).length;
              const hardCount = Object.values(cardRatings).filter((r) => r === "hard").length;
              return (
                <>
                  <FlashcardComp card={cards[currentCardIdx]} index={cardIndex} total={deck.length} theme={theme}
                    onDragStart={setDragIdx} onDragOver={setDragOverIdx} onDrop={handleCardDrop}
                    isDragOver={dragOverIdx === cardIndex} />

                  {/* Rating buttons */}
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.textMuted, marginBottom: 10 }}>
                      Wie schwer war diese Karte?
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                      {ratingConfig.map(({ key, label, color, bg, symbol }) => {
                        const isActive = currentRating === key;
                        return (
                          <button key={key} onClick={() => handleRating(key)} style={{
                            padding: "10px 22px", borderRadius: 10, fontFamily: fontStack,
                            border: `1.5px solid ${isActive ? color : t.border}`,
                            background: isActive ? bg : t.bgCard,
                            color: isActive ? color : t.textSecondary,
                            fontSize: 13, fontWeight: isActive ? 700 : 500,
                            cursor: "pointer", transition: "all 0.2s",
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            <span style={{ fontSize: 15 }}>{symbol}</span>{label}
                          </button>
                        );
                      })}
                    </div>
                    {ratedCount > 0 && (
                      <div style={{ marginTop: 10, fontSize: 12, color: t.textMuted }}>
                        {ratedCount}/{cards.length} bewertet
                        {hardCount > 0 && <span style={{ color: t.error, marginLeft: 8 }}>• {hardCount} schwere Karte{hardCount > 1 ? "n" : ""} kommen öfter</span>}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                    <button onClick={() => setCardIndex(Math.max(0, cardIndex - 1))} disabled={cardIndex === 0} style={{
                      padding: "10px 24px", borderRadius: 10, border: `1px solid ${t.border}`,
                      background: t.bgCard, color: cardIndex === 0 ? t.textMuted : t.text,
                      cursor: cardIndex === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500, fontFamily: fontStack,
                    }}>← Zurück</button>
                    <button onClick={() => setCardIndex(Math.min(deck.length - 1, cardIndex + 1))} disabled={cardIndex === deck.length - 1} style={{
                      padding: "10px 24px", borderRadius: 10, border: "none",
                      background: cardIndex === deck.length - 1 ? t.textMuted : t.accent,
                      color: "#fff", cursor: cardIndex === deck.length - 1 ? "not-allowed" : "pointer",
                      fontSize: 14, fontWeight: 500, fontFamily: fontStack,
                    }}>Weiter →</button>
                  </div>

                  {/* Deck progress dots */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 14, flexWrap: "wrap" }}>
                    {deck.map((origIdx, i) => {
                      const r = cardRatings[origIdx];
                      const dotColor = i === cardIndex ? t.accent : r === "easy" ? t.success : r === "hard" ? t.error : r === "medium" ? t.warning : t.border;
                      return (
                        <div key={i} onClick={() => setCardIndex(i)} style={{
                          width: i === cardIndex ? 20 : 7, height: 7, borderRadius: 4,
                          background: dotColor, cursor: "pointer", transition: "all 0.3s",
                        }} />
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {cardView === "grid" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {cards.map((card, i) => (
                  <MiniCard key={i} card={card} index={i} theme={theme}
                    onDragStart={setDragIdx} onDragOver={setDragOverIdx} onDrop={handleCardDrop}
                    isDragOver={dragOverIdx === i} rating={cardRatings[i]}
                    onClick={(idx) => { setCardIndex(deck.indexOf(idx)); setCardView("single"); }} />
                ))}
              </div>
            )}

            {cards.length > 1 && (
              <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: t.textMuted }}>
                💡 Karten per Drag & Drop umsortieren{cardView === "grid" ? " • Klicken zum Öffnen" : " • ← → navigieren • Leertaste umdrehen"}
              </p>
            )}
          </div>
        )}

        {/* ═══ SUMMARY ═══ */}
        {activeTab === "summary" && generated && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>📋 Zusammenfassung</h2>
              <button onClick={() => { navigator.clipboard.writeText(summary); setSummaryCopied(true); setTimeout(() => setSummaryCopied(false), 2000); }} style={{
                padding: "6px 14px", borderRadius: 8, border: `1px solid ${summaryCopied ? t.success : t.border}`,
                background: t.bgCard, color: summaryCopied ? t.success : t.textSecondary,
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: fontStack, transition: "all 0.2s",
              }}>{summaryCopied ? "✅ Kopiert!" : "📋 Kopieren"}</button>
            </div>
            <div style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16,
              padding: 28, lineHeight: 1.8, fontSize: 15, color: t.text, whiteSpace: "pre-wrap",
            }}>{summary}</div>
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {activeTab === "history" && (
          <LernkalenderComp theme={theme} />
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
