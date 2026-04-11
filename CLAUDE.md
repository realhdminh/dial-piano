# CLAUDE.md — Dial Piano project rules

This file is the **single project contract** for AI assistants (Claude, Cursor, etc.) working on **dial-piano**. It merges **repo-specific facts** with **condensed best practices** from skills under `.agents/skills/`. For deep dives, open the linked `SKILL.md` / `references/` files in those folders.

---

## 1. Product & architecture (read first)

- **What it is:** Browser-only SPA: dial-pad UI → **one acoustic piano** (`Tone.Sampler`, Salamander URLs). Record/playback + **Dexie/IndexedDB** for saved tracks.
- **Entry:** `src/main.ts` mounts `App.vue` only (no Vue Router wired in `main.ts` today; a `src/router/` stub may exist — do not assume routes are active).
- **Global providers:** `audioEngineKey` + `recorderKey` from `App.vue` (`provide` / `inject` in children).
- **Persistence:** `src/db/dialPianoDb.ts` — singleton Dexie DB; `src/composables/useTracks.ts` — `liveQuery` + unsubscribe on `onUnmounted`.
- **Styling:** Tailwind **v4** via `@import "tailwindcss"` and **`@theme { }`** in `src/main.css` (no `tailwind.config.js` as source of truth for theme tokens).

**When changing behavior:** Prefer the smallest diff that matches existing patterns; do not refactor unrelated modules.

---

## 2. Vue (from `.agents/skills/vue-best-practices`)

- **Default:** Vue 3 + **Composition API** + **`<script setup lang="ts">`**. Do not use Options API unless the user explicitly requires it.
- **SFC order:** `<script>` → `<template>` → `<style>` (per project skill).
- **State:** Minimal `ref` / `shallowRef`; derive with `computed`; side effects in `watch` when needed — avoid heavy work in templates.
- **Components:** One clear responsibility; split when orchestration + multiple UI sections collide. **Props down, events up**; `defineProps` / `defineEmits` typed; **`InjectionKey`** for provide/inject (already used for audio + recorder).
- **Composables:** Feature/audio/storage logic in `use*.ts`; keep return APIs small and typed.
- **Performance:** Optimize lists / `v-once` / virtualization **only after** behavior is correct (skill order).
- **Further reading:** `.agents/skills/vue-best-practices/references/` — especially `reactivity.md`, `sfc.md`, `component-data-flow.md`, `composables.md`.

---

## 3. Tailwind v4 (from `.agents/skills/tailwind-best-practices`)

- **Detect v4:** This project uses `tailwindcss` ^4, `@tailwindcss/vite`, and `@theme` in CSS — apply **v4 rules**, not legacy `tailwind.config.js` theme extension patterns.
- **Theme:** Prefer **`@theme { }`** in `main.css` for colors, fonts, keyframes tied to utilities; use `@source` if adding new content globs is ever required.
- **Layout & UX:** Mobile-first breakpoints; consistent spacing scale; respect **`prefers-reduced-motion`** when adding motion (see skill `anim-reduced-motion` / keyframes usage).
- **Components:** Prefer utility composition; use conditional class patterns (`clsx` / `cn`) only if the codebase already introduces that helper — **match existing style**.
- **Further reading:** `.agents/skills/tailwind-best-practices/rules/v4-*.md`, `dark-*.md`, `resp-*.md`, `comp-*.md` as tasks demand.

---

## 4. Tone.js (from `.agents/skills/tonejs`)

- **AudioContext:** Always **`await Tone.start()`** from a **user gesture** (this app: init overlay). Never assume audio works before that.
- **Samples:** After creating/changing a `Sampler` (or other buffer-based nodes), **`await Tone.loaded()`** before treating the instrument as playable.
- **Scheduling:** For **Transport / Loop / Sequence** callbacks, pass the **`time`** argument into `triggerAttack`, `triggerAttackRelease`, etc. — do not rely on bare `setTimeout` for musical timing in those contexts. (Playback of **recorded events** in this app may use `setTimeout` relative to start — keep that consistent with existing `useRecorder` behavior when editing.)
- **Graph:** Dispose or disconnect nodes you replace; avoid duplicate connections to `Destination` when swapping instruments.
- **Further reading:** `.agents/skills/tonejs/SKILL.md` — sampling, polyphony, effects chains.

---

## 5. Dexie (from `.agents/skills/dexiejs`)

- **Runtime:** Dexie runs **only in the browser** — safe for this Vite SPA; never import DB modules into assumed-universal SSR entry without guards (not applicable to current `main.ts`).
- **Single DB module:** One `Dexie` subclass + exported `db` singleton; schema **`version(n).stores(...)`**; migrations **`upgrade`** idempotent.
- **Indexes:** Design indexes from **query shapes** (filters, sort keys) — see skill “schema from queries”.
- **Reactivity:** Use **`liveQuery`**; in Vue, **subscribe** and **`unsubscribe` on `onUnmounted`** (see `useTracks.ts`).
- **Writes / transactions:** Use `db.transaction()` when multiple tables must stay consistent; avoid stray `await` inside transactions unless you know Dexie’s `waitFor` story.
- **IndexedDB structured clone:** Do **not** persist Vue **reactive proxies** raw. Clone to **plain objects** before `add`/`put` (this project: `cloneEventsForIdb` in `dialPianoDb.ts` for recorded events).
- **Further reading:** `.agents/skills/dexiejs/references/core-patterns.md`, `framework-integration.md`, `troubleshooting.md`.

---

## 6. TypeScript, quality, and commands

- Typecheck with **`vue-tsc`** (`npm run type-check` / part of `npm run build`).
- Follow existing **ESLint / Oxlint** conventions; run `npm run lint` before large merges when possible.
- **`src/instruments.ts`** currently exports **`PIANO_ACCENT`** only — UI accent for the piano-only build; do not resurrect multi-instrument types there unless the user asks.

---

## 7. Security & config hygiene

- Do **not** commit secrets. **`.env`** is gitignored; use **`.env.example`** as the template for Wrangler/Cloudflare IDs.
- **`public/_redirects`** supports SPA hosting on Cloudflare Pages — preserve unless hosting strategy changes.

---

## 8. Documentation edits

- Update **`README.md`** when user-facing setup, scripts, or deploy steps change materially.
- Keep **`CLAUDE.md`** in sync when you introduce new global patterns (new composable contracts, new persistence layer, or stack changes).

---

## 9. Skill index (local)

| Area | Path |
|------|------|
| Vue | `.agents/skills/vue-best-practices/SKILL.md` |
| Tailwind | `.agents/skills/tailwind-best-practices/SKILL.md` |
| Tone.js | `.agents/skills/tonejs/SKILL.md` |
| Dexie | `.agents/skills/dexiejs/SKILL.md` |

When a task clearly touches one of these areas, **read the corresponding `SKILL.md` first**, then apply this `CLAUDE.md` contract on top.
