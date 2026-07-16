# Dial Piano

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js 3" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Tone.js-15-181818?style=for-the-badge" alt="Tone.js 15" />
  <img src="https://img.shields.io/badge/Dexie-4-524292?style=for-the-badge&logo=dexie&logoColor=white" alt="Dexie 4" />
  <img src="https://img.shields.io/badge/Lucide-Vue-161616?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide Vue" />
  <img src="https://img.shields.io/badge/Cloudflare_Pages-ready-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white" alt="Cloudflare Pages" />
  <img src="https://img.shields.io/badge/Bun-package_manager-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License MIT" /></a>
</p>

A **Vue 3** web app that turns a phone-style **dial pad** into a **polyphonic sampler keyboard**. Each key maps to a pitch; you can extend the layout, record performances, and save tracks locally with **IndexedDB** (via Dexie). Audio uses **Tone.js** with multi-sample instruments (Salamander piano, kalimba, guitar, flute).

---

## Features

- **Salamander piano + more** — `Tone.Sampler` with interpolated samples from Tone’s CDN for piano, plus kalimba, guitar, and flute instruments (network required on first play per instrument).
- **Dial UI** — Compact pad with optional extended row; note trails and glass-style visuals (**Tailwind CSS v4**). Computer keyboard: digits / `*` `#` (and letter keys in 18-key mode).
- **Record & playback** — Capture note on/off timing; play back on **Tone.Transport** with optional loop.
- **Saved tracks** — Persisted in the browser with **Dexie** / IndexedDB; JSON export/import.
- **Static-first with edge proxy** — No app server; suitable for **Cloudflare Pages**. A Cloudflare Pages Function proxies the kalimba samples same-origin (see [Audio notes](#audio-notes)).

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | Vue 3 (Composition API, `<script setup>`, TypeScript) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` in CSS) |
| Audio | Tone.js (`Tone.start`, `Tone.loaded`, `Sampler`) |
| Storage | Dexie 4 + `liveQuery` for reactive track lists |
| Icons | Lucide Vue |
| Package manager | **Bun** (`bun.lock`; use `bun install` / `bun run …`) |

---

## Requirements

- **[Bun](https://bun.sh/)** (latest stable) for installs and scripts in this repo.
- **Node.js** `^20.19.0` or `>=22.12.0` when a tool needs a Node runtime (see `package.json` → `engines`); Bun satisfies most workflows on its own.

---

## Getting started

```bash
bun install
bun run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). **Tap “Start audio”** (or equivalent) so the browser unlocks the AudioContext before playing.

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server with HMR |
| `bun run build` | `vue-tsc` + production bundle to `dist/` |
| `bun run preview` | Serve `dist/` locally |
| `bun run type-check` | Typecheck only |
| `bun run lint` | ESLint + Oxlint |
| `bun run format` | Format `src/` with Oxfmt |
| `bun run deploy` | `wrangler pages deploy dist` (see [Deploy](#deploy)) |

---

## Project layout

```
src/
  App.vue                 # Shell: overlay, providers, layout
  main.css                # Tailwind + @theme tokens + keyframes
  components/             # DialPad, DialKey, ControlPanel, RecordManager, …
  composables/            # useAudioEngine, useRecorder, useTracks
  db/                     # Dexie singleton + migrations
  instruments.ts          # Instrument registry (piano, kalimba, guitar, flute)
functions/
  audio/kalimba/[[path]].ts  # Cloudflare Pages Function: same-origin kalimba proxy
vite-plugin-kalimba-proxy.ts # Dev-only mirror of the kalimba proxy (Vite middleware)
public/
  _redirects              # SPA-style rewrite for static hosts (e.g. Cloudflare Pages)
```

---

## Deploy

### GitHub Actions

Pushes to **`main`** run [`.github/workflows/deploy-cloudflare-pages.yml`](.github/workflows/deploy-cloudflare-pages.yml). That job uses **Bun** on the runner (`bun install --frozen-lockfile` + `bun.lock`), same stack as local dev.

### Cloudflare Pages (Git)

1. Connect the repository in the Cloudflare dashboard.
2. **Build command:** `bun run build` (install **Bun** in the Pages build image or use a Bun-based preset if available).
3. **Output directory:** `dist`  
4. **Environment:** Bun is the supported path for this repo; Node-only installs may work but are not documented here.
5. `public/_redirects` is copied into `dist` so client routes resolve to `index.html` where needed.

### Wrangler CLI (local)

Copy `.env.example` → `.env` and fill **Cloudflare API token** and **account ID** if you use:

```bash
bun run build
bun run deploy
```

Never commit real `.env` values.

---

## Audio notes

- Piano samples load from `https://tonejs.github.io/audio/salamander/` — allow that origin if you use a strict CSP.
- **Kalimba** tines are fetched from `middleearmedia.com`, but always same-origin via `/audio/kalimba/` so the upstream is never exposed to the browser and no `Referer` leaks. In production this route is served by the Cloudflare Pages Function `functions/audio/kalimba/[[path]].ts`; in `bun run dev` the equivalent logic runs as a Vite middleware (`vite-plugin-kalimba-proxy.ts`). Both enforce the same filename allowlist and 1-year cache.
- **User gesture** is required before audio (`Tone.start()`); the app uses an explicit init overlay for that.

---

## Agent skills (local)

Optional Cursor/agent guidance lives under **`.agents/skills/`** (Vue, Tailwind v4, Tone.js, Dexie). Project-wide agent rules: **`AGENTS.md`** (`CLAUDE.md` redirects there).

---

## License

[MIT](LICENSE) © [realhdminh](https://github.com/realhdminh).
