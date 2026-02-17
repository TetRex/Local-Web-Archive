# Emergency Archive

Offline-first, multilingual web archive of emergency survival guides and an AI chat assistant. Designed to work without internet access during crises.

## Features

- **14 emergency scenarios** — step-by-step instructions for earthquakes, flooding, wildfires, bombardment, cyberattacks, extreme weather, and more
- **7 languages** — English, Russian, Ukrainian, Finnish, German, Spanish, Italian
- **AI chat** — local Ollama-powered assistant with voice input (Web Speech API)
- **Offline resources** — placeholder directories for bundled Wikipedia and WikiHow snapshots
- **No dependencies** — pure HTML, CSS, and vanilla JavaScript; no build step required

## Structure

```
index.html          ← language selector
styles.css          ← shared stylesheet
script.js           ← AI chat + voice recognition logic
{lang}/
  index.html        ← scenario overview for that language
  ai-chat.html      ← AI chat page
  scenarios/*.html   ← individual emergency guides
wiki/               ← offline Wikipedia snapshot (populate manually)
wikihow/            ← offline WikiHow snapshot (populate manually)
```

## Usage

1. Serve the project directory with any static HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` in a browser and select a language.
3. For AI chat, run [Ollama](https://ollama.com) locally with the `ministral-3:3b` model:
   ```bash
   ollama run ministral-3:3b
   ```

## License

See repository for license details.
