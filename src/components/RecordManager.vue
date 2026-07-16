<script setup lang="ts">
import { shallowRef, inject, computed, watch, useTemplateRef } from 'vue'
import {
  Circle,
  Square,
  Play,
  Save,
  Trash2,
  Mic,
  ListMusic,
  Repeat,
  Download,
  Upload,
} from '@lucide/vue'
import { audioEngineKey, type AudioEngine } from '@/composables/useAudioEngine'
import { recorderKey, type Recorder } from '@/composables/useRecorder'
import { INSTRUMENTS } from '@/instruments'
import { useTracks } from '@/composables/useTracks'
import BottomSheet from './BottomSheet.vue'
import TunerPanel from './TunerPanel.vue'

defineProps<{ accentColor: string }>()

const audio = inject(audioEngineKey) as AudioEngine
const recorder = inject(recorderKey) as Recorder

const { tracks, saveTrack, deleteTrack, getTrack, exportTracks, importFromJson } = useTracks()

const showSaveDialog = shallowRef(false)
const trackName = shallowRef('')
const savedListOpen = shallowRef(false)
const tunerOpen = shallowRef(false)
const importError = shallowRef<string | null>(null)
const importInput = useTemplateRef<HTMLInputElement>('importInput')

const hasEvents = computed(() => recorder.events.value.length > 0)

watch(
  () => tracks.value.length,
  (n) => {
    if (n === 0) savedListOpen.value = false
  },
)

function handleRecord() {
  if (recorder.isRecording.value) {
    recorder.stopRecording()
  } else {
    recorder.stop()
    recorder.startRecording(audio.instrument.value)
  }
}

function handlePlay() {
  if (recorder.isPlaying.value) {
    recorder.stop()
    return
  }
  if (hasEvents.value) {
    recorder.play(recorder.events.value, audio.attack, audio.release, audio.releaseAll)
  }
}

function toggleLoop() {
  recorder.setLooping(!recorder.isLooping.value)
}

async function handlePlayTrack(trackId: string) {
  if (recorder.isRecording.value) return
  const track = getTrack(trackId)
  if (!track) return
  recorder.stop()
  savedListOpen.value = false
  await audio.setInstrument(track.instrumentId)
  recorder.play(track.events, audio.attack, audio.release, audio.releaseAll)
}

function openSaveDialog() {
  trackName.value = ''
  showSaveDialog.value = true
}

async function handleSave() {
  const instrumentId = recorder.recordingInstrument.value ?? audio.instrument.value
  await saveTrack(trackName.value.trim(), recorder.events.value, instrumentId)
  showSaveDialog.value = false
  savedListOpen.value = true
}

function instrumentLabel(id: string): string {
  return INSTRUMENTS[id as keyof typeof INSTRUMENTS]?.shortLabel ?? id
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function downloadJson(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function handleExportAll() {
  const payload = await exportTracks()
  if (payload.tracks.length === 0) return
  const stamp = new Date().toISOString().slice(0, 10)
  downloadJson(payload, `dial-piano-tracks-${stamp}.json`)
}

async function handleExportOne(trackId: string) {
  const payload = await exportTracks([trackId])
  if (payload.tracks.length === 0) return
  const name = payload.tracks[0]?.name.replace(/[^\w.-]+/g, '-') || 'track'
  downloadJson(payload, `dial-piano-${name}.json`)
}

function openImportPicker() {
  importError.value = null
  importInput.value?.click()
}

async function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  importError.value = null
  try {
    const text = await file.text()
    const raw: unknown = JSON.parse(text)
    const count = await importFromJson(raw)
    if (count === 0) {
      importError.value = 'No tracks in file'
    }
  } catch (err) {
    importError.value = err instanceof Error ? err.message : 'Import failed'
  }
}
</script>

<template>
  <nav class="flex h-13 items-stretch" aria-label="Playback controls">
    <button
      type="button"
      class="nav-btn"
      :class="recorder.isRecording.value && 'nav-btn--recording'"
      :aria-pressed="recorder.isRecording.value"
      @click="handleRecord"
    >
      <span class="relative">
        <span
          v-if="recorder.isRecording.value"
          class="absolute -inset-1 animate-ping rounded-full bg-red-400/50"
        />
        <Circle v-if="!recorder.isRecording.value" :size="20" />
        <Square v-else :size="18" fill="currentColor" />
      </span>
      <span class="nav-label">{{ recorder.isRecording.value ? 'Stop' : 'Rec' }}</span>
    </button>

    <button
      type="button"
      class="nav-btn"
      :class="recorder.isPlaying.value && 'nav-btn--playing'"
      :disabled="recorder.isRecording.value || (!hasEvents && !recorder.isPlaying.value)"
      @click="handlePlay"
    >
      <Square v-if="recorder.isPlaying.value" :size="18" fill="currentColor" />
      <Play v-else :size="20" fill="currentColor" />
      <span class="nav-label">{{ recorder.isPlaying.value ? 'Stop' : 'Play' }}</span>
    </button>

    <button
      type="button"
      class="nav-btn"
      :class="recorder.isLooping.value && 'nav-btn--loop'"
      :aria-pressed="recorder.isLooping.value"
      aria-label="Loop playback"
      @click="toggleLoop"
    >
      <Repeat :size="20" />
      <span class="nav-label">Loop</span>
    </button>

    <button
      type="button"
      class="nav-btn"
      :disabled="!hasEvents || recorder.isRecording.value"
      @click="openSaveDialog"
    >
      <Save :size="20" />
      <span class="nav-label">Save</span>
    </button>

    <button type="button" class="nav-btn" @click="tunerOpen = true">
      <Mic :size="20" />
      <span class="nav-label">Tuner</span>
    </button>

    <button type="button" class="nav-btn" @click="savedListOpen = true">
      <span class="relative">
        <ListMusic :size="20" />
        <span
          v-if="tracks.length"
          class="absolute -right-1.5 -top-1 grid min-w-[14px] place-items-center rounded-full bg-white/20 px-0.5 text-[8px] font-bold tabular-nums text-white"
        >
          {{ tracks.length }}
        </span>
      </span>
      <span class="nav-label">Tracks</span>
    </button>
  </nav>

  <BottomSheet :open="showSaveDialog" title="Save track" @close="showSaveDialog = false">
    <div class="flex items-center gap-1.5">
      <input
        v-model="trackName"
        type="text"
        placeholder="Track name…"
        class="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white placeholder-white/35 outline-none focus:border-white/25"
        @keydown.enter="handleSave"
      />
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
        @click="handleSave"
      >
        OK
      </button>
    </div>
  </BottomSheet>

  <BottomSheet :open="savedListOpen" title="Saved tracks" @close="savedListOpen = false">
    <div class="mb-3 flex items-center gap-1.5">
      <button
        type="button"
        class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/6 px-2 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="!tracks.length"
        @click="handleExportAll"
      >
        <Download :size="14" />
        Export all
      </button>
      <button
        type="button"
        class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/6 px-2 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10"
        @click="openImportPicker"
      >
        <Upload :size="14" />
        Import
      </button>
      <input
        ref="importInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="handleImportFile"
      />
    </div>
    <p v-if="importError" class="mb-2 text-center text-xs text-red-400/90">{{ importError }}</p>

    <ul v-if="tracks.length" class="flex list-none flex-col gap-1.5" role="list">
      <li v-for="track in tracks" :key="track.id" class="shrink-0">
        <div
          class="flex items-center gap-0.5 rounded-xl border border-white/8 bg-zinc-950/60 px-2 py-2"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left transition-colors hover:text-white"
            @click="handlePlayTrack(track.id)"
          >
            <Play :size="14" class="shrink-0 text-white/45" />
            <span class="truncate text-sm text-white/85">{{ track.name }}</span>
            <span
              class="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-white/35 uppercase"
            >
              {{ instrumentLabel(track.instrumentId) }}
            </span>
            <span class="ml-auto shrink-0 text-[9px] tabular-nums text-white/30">{{
              formatDate(track.createdAt)
            }}</span>
          </button>
          <button
            type="button"
            class="shrink-0 cursor-pointer rounded-md p-1.5 text-white/35 transition-colors hover:text-white/70"
            aria-label="Export track"
            @click="handleExportOne(track.id)"
          >
            <Download :size="15" />
          </button>
          <button
            type="button"
            class="shrink-0 cursor-pointer rounded-md p-1.5 text-white/35 transition-colors hover:text-red-400"
            aria-label="Delete track"
            @click="deleteTrack(track.id)"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="py-6 text-center font-mono text-xs text-white/35">No saved tracks yet.</p>
  </BottomSheet>

  <BottomSheet :open="tunerOpen" title="Live tuner" @close="tunerOpen = false">
    <TunerPanel :instrument-id="audio.instrument.value" :accent-color="accentColor" />
  </BottomSheet>
</template>

<style scoped>
.nav-btn {
  display: flex;
  min-width: 0;
  flex: 1;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  color: oklch(96% 0.01 270 / 0.55);
  transition:
    color 0.15s,
    background-color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.nav-btn:active:not(:disabled) {
  background-color: oklch(100% 0 0 / 0.06);
  color: oklch(96% 0.01 270 / 0.9);
}

.nav-btn:disabled {
  cursor: not-allowed;
  opacity: 0.28;
}

.nav-btn--recording {
  color: oklch(70% 0.2 25);
}

.nav-btn--playing {
  color: var(--color-neon-green);
}

.nav-btn--loop {
  color: var(--color-neon-blue);
}

.nav-label {
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
