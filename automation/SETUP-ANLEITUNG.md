# Automatisierungs-Setup: World Architecture Pipeline

Täglich 3 Videos → automatisch produziert und auf YouTube hochgeladen.
Kein manueller Eingriff nötig.

---

## Überblick: Der vollständige Flow

```
06:00 Uhr täglich
    ↓
n8n liest Google Sheet (nächste Woche mit Status "pending")
    ↓
3x parallel: /api/pipeline aufrufen
    - Claude generiert Skript
    - Wikimedia lädt Bilder
    - ElevenLabs erstellt Voiceover
    - Creatomate rendert Video (16:9 + 9:16)
    ↓
3 Minuten warten (Render)
    ↓
YouTube Upload (16:9 Version)
    ↓
Google Sheet: Status → "done", YouTube-URL speichern
    ↓
Telegram-Nachricht: "3 neue Videos fertig!"
```

---

## TEIL 1: n8n einrichten (kostenlos, selbst gehostet)

### Option A: n8n auf Render.com (einfachste Methode, kostenlos)

1. Gehe zu **render.com** → kostenlos anmelden
2. "New Web Service" → "Deploy from Docker image"
3. Image: `n8nio/n8n`
4. Plan: Free
5. Environment Variables:
   ```
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=dein-passwort
   ```
6. Deploy → n8n läuft unter `https://dein-name.onrender.com`

### Option B: n8n auf eigenem Server (empfohlen für Produktion)

```bash
# Docker installieren, dann:
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=sicherespasswort \
  n8nio/n8n
```

Dann: `http://localhost:5678` im Browser öffnen.

---

## TEIL 2: Workflow importieren

1. n8n öffnen → oben rechts: **Import from File**
2. Datei `n8n-workflow.json` hochladen
3. Workflow wird geladen

---

## TEIL 3: Credentials einrichten

### Google Sheets (für Content-Kalender)
1. n8n → Credentials → Add → "Google Sheets OAuth2"
2. Google Cloud Console → Projekt erstellen → OAuth2 credentials
3. Redirect URI: `https://dein-n8n.com/rest/oauth2-credential/callback`
4. Client ID + Secret in n8n eintragen → Authorize

**Google Sheet erstellen:**
- Neue Google Tabelle: "World Architecture Content Kalender"
- Spalten: `week, country, architect_1, architect_2, architect_3, language, status, youtube_url, completed_at, notes`
- Inhalt: Die `content-calendar-52weeks.csv` reinkopieren
- Sheet-ID aus URL kopieren (der lange String in der URL)

### Telegram Bot (für Benachrichtigungen)
1. Telegram → @BotFather → `/newbot` → Name wählen
2. Bot-Token kopieren
3. Eigene Chat-ID: Nachricht an @userinfobot schicken
4. n8n → Credentials → Add → "Telegram API"
5. Token eintragen

---

## TEIL 4: Environment Variables in n8n

n8n → Settings → Variables → hinzufügen:

```
APP_BASE_URL          = https://deine-vercel-app.vercel.app
GOOGLE_SHEET_ID       = (aus Google Sheets URL)
TELEGRAM_CHAT_ID      = (deine Telegram Chat-ID)
CREATOMATE_API_KEY    = (aus creatomate.com)
```

---

## TEIL 5: Workflow aktivieren

1. Workflow öffnen
2. Oben rechts: **Active** auf ON stellen
3. Fertig – läuft ab morgen täglich um 06:00 Uhr

**Manuell testen:** "Execute Workflow" klicken

---

## ALTERNATIV: Make.com (ohne eigenen Server)

Falls du keinen Server willst, funktioniert Make.com (make.com) genauso – nur visuell und ohne Installation.

### Make.com Szenario nachbauen:

**Module in dieser Reihenfolge:**

```
1. Schedule → Täglich 06:00 Uhr

2. Google Sheets → Search Rows
   Filter: status = "pending"
   Limit: 1

3. HTTP → POST an /api/pipeline
   Körper: { architect: architect_1, country, language }
   → 3x (für architect_1, architect_2, architect_3)

4. Sleep → 180 Sekunden

5. HTTP → POST an /api/upload-youtube
   videoUrl: (aus Schritt 3)
   title, description, tags

6. Google Sheets → Update Row
   status → "done"
   youtube_url → (aus Schritt 5)

7. Telegram → Send Message
   "✅ 3 neue Videos fertig!"
```

Make.com kostet ab 9€/Monat für automatische Ausführung.

---

## Kosten-Übersicht (bei 3 Videos/Tag)

| Tool | Kosten/Monat |
|------|-------------|
| Vercel (App) | Kostenlos |
| n8n (selbst gehostet) | Kostenlos |
| Claude API (90 Videos) | ~2,70 € |
| ElevenLabs (90 Videos) | ~10,80 € |
| Creatomate (90 Videos) | ~13,50 € |
| **Total** | **~27 €/Monat** |

Bei 90 Videos/Monat = **0,30 € pro Video**

---

## Nach einem Jahr (52 Wochen × 3 = 156 Videos)

- 156 Videos auf YouTube
- 156 Videos als TikTok/Reels (9:16)
- Vollständig automatisiert
- Dein einziger Aufwand: ab und zu neue Architekten ins Sheet eintragen

---

## Nächste Ausbaustufen

- [ ] TikTok Upload API (nach Genehmigung)
- [ ] Instagram Reels Upload (Meta Graph API)
- [ ] Thumbnail automatisch generieren (Canva API)
- [ ] Mehrsprachige Videos (Deutsch + Englisch parallel)
- [ ] SEO-optimierte Titel/Tags via Claude
- [ ] Shorts aus langen Videos automatisch schneiden
