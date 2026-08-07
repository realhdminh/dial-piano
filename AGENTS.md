# AGENTS.md — dial-piano

Browser-only Vue SPA: dial-pad → multi-sample keyboard (`Tone.Sampler`), record/playback, Dexie/IndexedDB tracks. **This file is the project contract** for agents. Domain skills: **`.agents/skills/`** (vue, tailwind, tonejs, dexiejs) — load the matching `SKILL.md` before non-trivial work in that area.

## Package manager & commands

Use **Bun** only (`bun.lock`). Do not introduce npm/yarn lockfiles.

| Command | Notes |
|---------|--------|
| `bun install` | Local; CI uses `--frozen-lockfile` |
| `bun run dev` | Vite; samples served straight from `public/` |
| `bun run type-check` | `vue-tsc --build` (app + node + functions) |
| `bun run build` | type-check **then** Vite → `dist/` |
| `bun run lint` | Oxlint + ESLint (both `--fix`) |
| `bun run format` | Oxfmt on **`src/` only** |
| `bun run deploy` | Needs prior `build`; Wrangler → Cloudflare Pages |

No test runner/scripts in this repo today. Prefer `type-check` + `lint` after substantive edits.

## Architecture (easy to get wrong)

- **Entry:** `src/main.ts` mounts `App.vue` only. `src/router/index.ts` is an unused stub — **do not assume Vue Router is active**.
- **Globals:** `audioEngineKey` + `recorderKey` provided from `App.vue`; children `inject` them (typed `InjectionKey`s in the composables).
- **Instruments:** `src/instruments.ts` is the registry (`INSTRUMENTS`, `InstrumentId`, sample URLs + accents). Do not reintroduce a single-instrument accent type.
- **Audio:** `useAudioEngine` — `await Tone.start()` only from a user gesture (`AudioInitOverlay`); after creating/swapping a `Sampler`, `await Tone.loaded()`; dispose old sampler before replace.
- **Recording playback:** `useRecorder` schedules on **`Tone.Transport`** (event times are ms → seconds). Loop via `isLooping` / `setLooping`. Pass `audio.attack` / `release` / `releaseAll` into `play` so scheduled notes use Transport `time`.
- **DB:** singleton `src/db/dialPianoDb.ts`. `liveQuery` in `useTracks` — always **unsubscribe on `onUnmounted`**. Clone events to plain objects before IDB write (`cloneEventsForIdb`); never put Vue proxies in IndexedDB. Track JSON export/import: `format: "dial-piano-tracks"` helpers in the same module.
- **Desktop keys:** `src/utils/dialKeys.ts` + listeners in `DialPad` — digits / `*` `#` / extended letter keys; ignore when focus is in inputs.
- **Kalimba samples:** self-hosted static files in **`public/audio/kalimba/`** (16 WAV, B3–C6); browser fetches `/audio/kalimba/…` directly — no proxy. Don't reintroduce an upstream proxy; the original `middleearmedia.com` host has a broken TLS cert.
- **Functions types:** import `PagesFunction` from `@cloudflare/workers-types`; covered by `tsconfig.functions.json` via project references (kept for future Pages Functions — `functions/` is currently empty).
- **Style:** Tailwind **v4** — tokens/keyframes in `src/main.css` `@theme { }`. No `tailwind.config.js` theme source of truth.
- **Path alias:** `@/*` → `src/*`.

## Conventions

- Vue 3 **Composition API** + `<script setup lang="ts">` only (unless user requires Options API).
- Smallest diff that matches existing patterns; no drive-by refactors.
- `tsconfig.app.json` has **`noUncheckedIndexedAccess`** — handle possibly-undefined index access.
- Preserve `public/_redirects` (SPA rewrite for Pages). Never commit `.env` secrets (template: `.env.example`).
- User-facing setup/scripts/deploy changes → update `README.md`. New global patterns → update **this file**.

## Deploy gotchas

- CI: `.github/workflows/deploy-cloudflare-pages.yml` on push to **`main`** (Bun + `bun run build-only` + `bun run deploy`). Build uses `build-only` because the `vue-tsc` type-check gate is currently broken (TS2307 on `.vue` resolution); keep it that way until type-check is green again.
- Local deploy needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in `.env`.
