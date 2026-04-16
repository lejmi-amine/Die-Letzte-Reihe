# Ruff Linter in CI/CD

## Ablauf

Bei jedem Pull Request oder Push auf `main` startet GitHub Actions automatisch eine virtuelle Maschine (Ubuntu) und führt folgende Schritte aus:

1. **Checkout** — der aktuelle Code wird heruntergeladen
2. **Python 3.12 wird installiert** — wird von Ruff benötigt
3. **Ruff wird installiert** — Version 0.4.4, fest gepinnt für Reproduzierbarkeit
4. **`ruff check .`** — alle `.py` Dateien im Repo werden auf Code-Qualitätsprobleme geprüft

---

## Was ist Linting?

Ruff prüft ob der Python-Code sauber geschrieben ist, z.B.:

- Unused imports — `import os` ohne Verwendung von `os`
- Falsche Einrückung
- Variablen die definiert aber nie verwendet werden
- Falsche Import-Reihenfolge

---

## Was passiert bei einem Fehler?

Sobald Ruff eine Violation meldet, schlägt der GitHub Actions Check fehl und wird im Pull Request als rotes `✗` angezeigt. Der fehlerhafte Code ist damit sofort sichtbar, bevor er auf `main` landet.

---

## Projektstruktur

| Datei | Beschreibung |
|---|---|
| `main.py` | Startup-Skript — startet den Dev-Server oder die Tests (`python main.py dev / test / coverage`) |
| `scripts/check.py` | Health-Check — prüft ob Node, npm und git verfügbar sind und die StudyBot-Dependencies installierbar sind |
| `.github/workflows/lint.yml` | GitHub Actions Workflow — läuft automatisch auf PRs und bei Push auf `main` |
| `ruff.toml` | Ruff-Konfiguration — Regeln `E`, `W`, `F`, `I` aktiviert; `node_modules`, `dist`, `coverage` werden ignoriert |

---

## Ergebnis

Automatische Code-Qualitätskontrolle bei jedem Pull Request — kein fehlerhafter Python-Code landet auf `main`.
