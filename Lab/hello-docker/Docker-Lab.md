# Docker Hands-On Lab — hello-docker

## Aufgabenstellung

Dieses Lab behandelt die grundlegenden Docker-Konzepte: Images bauen, Container starten, laufende Container beobachten, Layer Caching verstehen und Ressourcen aufräumen.

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

### Schritt 1 — Projektdateien erstellen

Ein minimaler Python HTTP Server aus der Standardbibliothek — keine externen Pakete nötig.

**`app.py`**

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Hello from Docker!\n")

    def log_message(self, format, *args):
        pass  # suppress request logs

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), Handler)
    print("Listening on port 8000 ...")
    server.serve_forever()
```

---

### Schritt 2 — Dockerfile schreiben

**`Dockerfile`**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY app.py .

EXPOSE 8000

CMD ["python", "app.py"]
```

**Erklärung der Direktiven:**
- `FROM python:3.12-slim` — Basis-Image. `slim` enthält nur das Nötigste (~50 MB statt ~900 MB für `python:3.12`).
- `WORKDIR /app` — setzt das Arbeitsverzeichnis im Container. Besser als `/`, da kein Risiko besteht, System-Dateien zu überschreiben.
- `COPY app.py .` — kopiert `app.py` vom Host in das Image. Erzeugt einen gecachten Layer.
- `EXPOSE 8000` — reine Dokumentation; öffnet den Port nicht tatsächlich. Das Port-Mapping passiert erst bei `docker run -p`.
- `CMD ["python", "app.py"]` — Standardbefehl beim Starten. Ohne `CMD` würde der Container sofort beenden.

---

### Schritt 3 — Image bauen

```bash
docker build -t hello-docker:1.0 .
```

- `-t hello-docker:1.0` — Name und Tag des Images.
- `.` — Buildkontext: das aktuelle Verzeichnis, wo das Dockerfile liegt.

Docker lädt das Basis-Image herunter und baut jeden Schritt als eigenen **Layer**. Beim ersten Build werden alle Layer heruntergeladen; bei Folge-Builds werden unveränderte Layer aus dem Cache genommen.

Image bestätigen:

```bash
docker images hello-docker
```

**Ausgabe:**
```
IMAGE              ID             DISK USAGE   CONTENT SIZE
hello-docker:1.0   b91f1f0d780e        177MB         43.2MB
```

---

### Schritt 4 — Container starten

```bash
docker run -d -p 8080:8000 --name hello hello-docker:1.0
```

- `-d` — detached: Container läuft im Hintergrund.
- `-p 8080:8000` — Port-Mapping: Host-Port 8080 → Container-Port 8000.
- `--name hello` — lesbarer Name für den Container.

Im Browser `http://localhost:8080` öffnen oder im Terminal:

```bash
curl http://localhost:8080
# Hello from Docker!
```

---

### Schritt 5 — Laufenden Container beobachten

```bash
# Laufende Container anzeigen
docker ps
```

**Ausgabe:**
```
CONTAINER ID   IMAGE              COMMAND           CREATED        STATUS        PORTS                    NAMES
88a62ffb6cd3   hello-docker:1.0   "python app.py"   9 sec ago      Up 9 sec      0.0.0.0:8080->8000/tcp   hello
```

```bash
# Logs des Containers anzeigen
docker logs hello
```

(Logs sind leer, da `log_message` in `app.py` unterdrückt wird.)

```bash
# Metadaten inspizieren
docker inspect hello
```

In der `docker inspect`-Ausgabe findet man:
- **Port-Mappings**: `"8000/tcp": [{"HostIp": "0.0.0.0", "HostPort": "8080"}]`
- **IP-Adresse**: im Feld `NetworkSettings.IPAddress`
- **Image SHA**: im Feld `Image` (z.B. `sha256:b91f1f0d780e...`)

---

### Schritt 6 — Ändern, neu bauen und Caching beobachten

`app.py` editieren — Antwort-Text ändern:

```python
self.wfile.write(b"Hello from Docker! Version 1.1 - Updated!\n")
```

Neu bauen:

```bash
docker build -t hello-docker:1.1 .
```

**Ausgabe — Layer Caching sichtbar:**
```
#5 [1/3] FROM docker.io/library/python:3.12-slim   ← CACHED
#6 [2/3] WORKDIR /app                              ← CACHED
#7 [3/3] COPY app.py .                             ← neu (Datei geändert)
```

Da `app.py` nach dem `WORKDIR`-Layer liegt, werden alle Layer davor (`FROM`, `WORKDIR`) aus dem Cache genommen. Nur `COPY app.py` und alles Folgende wird neu gebaut — der Build dauert nur **~0.3 Sekunden**.

Alten Container stoppen, neuen starten:

```bash
docker stop hello && docker rm hello
docker run -d -p 8080:8000 --name hello hello-docker:1.1
curl http://localhost:8080
# Hello from Docker! Version 1.1 - Updated!
```

---

### Schritt 7 — Aufräumen

```bash
docker stop hello
docker rm hello
docker rmi hello-docker:1.0 hello-docker:1.1
```

**Ausgabe:**
```
Untagged: hello-docker:1.0
Deleted: sha256:b91f1f0d780e...
Untagged: hello-docker:1.1
Deleted: sha256:566c240e7d20...
```

---

## Reflection Questions

**Was müsste man ändern, damit das Image auf dem Rechner eines Kollegen läuft?**

Nichts im Image selbst — das ist der Kern von Docker. Man pusht das Image in eine Registry (z.B. Docker Hub: `docker push meinname/hello-docker:1.0`), und der Kollege führt `docker pull` + `docker run` aus. Das Image enthält alles: Python, `app.py`, Konfiguration. Es braucht keine lokale Python-Installation.

**Was passiert mit einer Datei, die innerhalb des Containers geschrieben wird, wenn der Container gestoppt und gelöscht wird?**

Die Datei geht verloren. Container sind **ephemeral** — ihr Dateisystem ist temporär. Alles, was nicht im Image ist, verschwindet beim `docker rm`. Für persistente Daten (z.B. Logs, Datenbanken) muss ein **Volume** (`-v`) verwendet werden, das außerhalb des Containers liegt.

**Bei welchem Schritt hat Docker den Cache beim Rebuild in Schritt 6 genutzt? Warum?**

Docker hat `FROM` und `WORKDIR` aus dem Cache genommen, weil sich diese Layer nicht verändert haben. Erst `COPY app.py .` wurde neu ausgeführt, da sich `app.py` geändert hatte. Docker invalidiert den Cache ab dem ersten geänderten Layer — alle nachfolgenden Layer werden ebenfalls neu gebaut, auch wenn sie selbst unverändert sind.

**Wie müsste das Dockerfile geändert werden, wenn die App externe Dependencies in einer `requirements.txt` hat?**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# requirements.txt zuerst kopieren und installieren → Layer wird gecacht
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App-Code danach → bei Code-Änderungen wird pip nicht neu ausgeführt
COPY app.py .

EXPOSE 8000
CMD ["python", "app.py"]
```

`requirements.txt` wird vor `app.py` kopiert, damit der `pip install`-Layer gecacht bleibt — auch wenn sich `app.py` ändert.

---

## Schlüsselkonzepte

### Image vs. Container

| Image | Container |
|-------|-----------|
| Unveränderliche Vorlage (wie eine Klasse) | Laufende Instanz (wie ein Objekt) |
| Wird mit `docker build` erstellt | Wird mit `docker run` gestartet |
| Liegt auf der Festplatte | Läuft im Arbeitsspeicher |
| Mehrfach nutzbar | Stoppbar, startbar, löschbar |

### Layer Caching

Jede Dockerfile-Zeile erzeugt einen **Layer**. Ändert sich eine Zeile, werden diese und alle nachfolgenden Layer neu gebaut — alles davor kommt aus dem Cache.

**Best Practice:** Selten ändernde Schritte (`pip install`, `apt install`) weit oben platzieren, häufig ändernde (`COPY app.py`) weit unten — so wird der Cache maximal ausgenutzt.

### Port Mapping

```
Host :8080  →  Container :8000
```

`-p HOST:CONTAINER` macht einen Container-Port nach außen erreichbar. Ohne `-p` ist der Container von außen nicht erreichbar, auch wenn `EXPOSE` im Dockerfile steht.
