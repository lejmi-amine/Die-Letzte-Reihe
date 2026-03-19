# StudyBot — AI-Powered Learning Tool

> DHBW Software Engineering Projekt | 3. Semester

AI-gestütztes Lern-Tool das aus Vorlesungstexten automatisch Karteikarten, Zusammenfassungen und Quizfragen generiert.

## Features

- **AI-Karteikarten** — Automatisch generierte Flip-Cards mit Drag & Drop Sortierung
- **Zusammenfassung** — Strukturierte Zusammenfassung des Lernstoffs
- **Quiz** — Multiple-Choice mit Auswertung und Punktestand
- **Datei-Import** — Text-Dateien per Drag & Drop einfügen
- **Dark/Light Mode** — Theme-Toggle
- **Responsive Design** — Funktioniert auf Desktop und Mobile

## Tech Stack

- **React 18** — UI Framework mit Hooks (useState, useCallback)
- **Vite** — Build Tool & Dev Server
- **Claude API** — AI-Text-Generierung (Anthropic)
- **CSS-in-JS** — Inline Styles mit Theme-System

## Setup & Start

### Voraussetzungen
- [Node.js](https://nodejs.org/) (Version 18+)
- npm (kommt mit Node.js)

### Installation

```bash
# 1. In den Projektordner wechseln
cd studybot

# 2. Dependencies installieren
npm install

# 3. Dev-Server starten
npm run dev
```

Die App öffnet sich automatisch unter `http://localhost:3000`.

## Projektstruktur

```
studybot/
├── index.html          # HTML Entry Point
├── package.json        # Dependencies & Scripts
├── vite.config.js      # Vite Konfiguration
├── README.md
└── src/
    ├── main.jsx        # React Entry Point
    └── StudyBot.jsx    # Hauptkomponente
```

## Architektur

Die App nutzt eine komponentenbasierte Architektur:

- **StudyBot** — Hauptkomponente mit State Management
- **Flashcard** — Flip-Animation mit CSS 3D Transforms + Drag & Drop
- **MiniCard** — Grid-Ansicht der Karteikarten
- **QuizQuestion** — Multiple-Choice mit visueller Auswertung
- **Loader** — Loading-Spinner Komponente

### Design Patterns

- **Lifting State Up** — Zentrales State Management in der Hauptkomponente
- **Composition** — Wiederverwendbare UI-Komponenten
- **Theme System** — Dual-Theme über Objekt-basierte Konfiguration
- **Error Handling** — Try/Catch mit User-Feedback
