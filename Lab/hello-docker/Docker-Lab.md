# Docker Hands-On Lab — hello-docker

## Aufgabenstellung

Dieses Lab behandelt die grundlegenden Docker-Konzepte: Images bauen, Container starten, Layer Caching verstehen und Ressourcen aufräumen.

---

## Projektstruktur

```
Lab/hello-docker/
├── app.py          # Python HTTP Server
├── Dockerfile      # Build-Anleitung für das Image
└── Docker-Lab.md   # Diese Dokumentation
```

---

## Schritte

### Schritt 1 — app.py erstellen

Ein minimaler Python HTTP Server wird auf Port 8080 gestartet.
Jeder GET-Request wird mit einer Textnachricht beantwortet.

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Hello from Docker! Version 1.0")

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8080), Handler)
    print("Server running on port 8080")
    server.serve_forever()
```

### Schritt 2 — Dockerfile erstellen

Das Dockerfile beschreibt, wie das Image gebaut wird:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY app.py .

EXPOSE 8080

CMD ["python", "app.py"]
```

**Erklärung der Direktiven:**
- `FROM` — legt das Basis-Image fest. `python:3.12-slim` ist klein und enthält nur Python ohne unnötige Tools.
- `WORKDIR` — setzt das Arbeitsverzeichnis. Alle nachfolgenden Befehle laufen relativ dazu.
- `COPY` — kopiert Dateien vom Host in das Image (Layer wird gecacht).
- `EXPOSE` — reine Dokumentation; öffnet den Port nicht tatsächlich (das macht `-p` beim `docker run`).
- `CMD` — der Standardbefehl beim Starten des Containers.

### Schritt 3 — Image bauen (v1.0)

```bash
docker build -t hello-docker:1.0 .
```

- `-t hello-docker:1.0` — gibt dem Image den Namen `hello-docker` und den Tag `1.0`.
- `.` — Buildkontext ist das aktuelle Verzeichnis (wo das Dockerfile liegt).

Docker lädt das Basis-Image herunter und baut jeden Schritt als eigenen **Layer**.

**Ausgabe (gekürzt):**
```
#5 [1/3] FROM docker.io/library/python:3.12-slim   ← heruntergeladen
#6 [2/3] WORKDIR /app                               ← erstellt
#7 [3/3] COPY app.py .                              ← kopiert
Successfully built hello-docker:1.0
```

### Schritt 4 — Container starten (v1.0)

```bash
docker run -d -p 8080:8080 --name hello-v1 hello-docker:1.0
```

- `-d` — detached mode: Container läuft im Hintergrund.
- `-p 8080:8080` — Port-Mapping: `Host-Port:Container-Port`.
- `--name hello-v1` — gibt dem Container einen lesbaren Namen.

### Schritt 5 — Container testen (v1.0)

```bash
curl http://localhost:8080
```

**Ausgabe:**
```
Hello from Docker! Version 1.0
```

### Schritt 6 — app.py ändern und v1.1 bauen

Die Antwort in `app.py` wird geändert:

```python
self.wfile.write(b"Hello from Docker! Version 1.1 - Updated response!")
```

Dann wird neu gebaut:

```bash
docker build -t hello-docker:1.1 .
```

**Ausgabe — Layer Caching sichtbar:**
```
#5 [1/3] FROM docker.io/library/python:3.12-slim   ← CACHED (nicht neu geladen!)
#6 [2/3] WORKDIR /app                              ← CACHED
#7 [3/3] COPY app.py .                             ← neu gebaut (Datei geändert)
```

Da `app.py` geändert wurde, wird nur der `COPY`-Layer neu gebaut. Die Basis-Layer kommen aus dem Cache — der Build dauert nur **0.3 Sekunden** statt 7+ Sekunden.

v1.1 starten und testen:

```bash
docker run -d -p 8081:8080 --name hello-v11 hello-docker:1.1
curl http://localhost:8081
```

**Ausgabe:**
```
Hello from Docker! Version 1.1 - Updated response!
```

### Schritt 7 — Aufräumen

Alle Container stoppen und entfernen:

```bash
docker stop hello-v1 hello-v11
docker rm hello-v1 hello-v11
```

Alle Images entfernen:

```bash
docker rmi hello-docker:1.0 hello-docker:1.1
```

**Ausgabe:**
```
Untagged: hello-docker:1.0
Deleted: sha256:d60f43ed...
Untagged: hello-docker:1.1
Deleted: sha256:533f09c3...
```

---

## Schlüsselkonzepte

### Image vs. Container

| Image | Container |
|-------|-----------|
| Unveränderliche Vorlage (wie eine Klasse) | Laufende Instanz des Images (wie ein Objekt) |
| Wird mit `docker build` erstellt | Wird mit `docker run` gestartet |
| Liegt auf der Festplatte | Läuft im Arbeitsspeicher |
| Kann mehrfach genutzt werden | Kann gestoppt, gestartet, gelöscht werden |

### Layer Caching

Jede Zeile im Dockerfile erzeugt einen **Layer** (eine Schicht). Docker speichert diese Layer im Cache. Wenn sich eine Zeile ändert, werden nur diese Zeile und alle nachfolgenden neu gebaut — alles davor kommt aus dem Cache.

**Best Practice:** Selten ändernde Schritte (z.B. `apt install`, `pip install`) so weit oben wie möglich im Dockerfile platzieren, damit der Cache optimal genutzt wird.

### Port Mapping

Container sind isoliert. Mit `-p HOST:CONTAINER` wird ein Port des Containers nach außen freigegeben:

```
Host         Container
:8080   →    :8080   (v1.0)
:8081   →    :8080   (v1.1)
```

Beide Container nutzen intern denselben Port 8080, sind aber über verschiedene Host-Ports erreichbar.

---

## Nützliche Befehle

```bash
docker images                  # alle lokalen Images anzeigen
docker ps                      # laufende Container anzeigen
docker ps -a                   # alle Container (auch gestoppte)
docker logs <container>        # Logs eines Containers
docker exec -it <container> sh # Shell in laufendem Container öffnen
docker system prune -a         # alles aufräumen (Images, Container, Cache)
```
