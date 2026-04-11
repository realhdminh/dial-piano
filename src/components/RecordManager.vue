<script setup lang="ts">
import { shallowRef, inject, computed, watch } from 'vue'
import { Circle, Square, Play, Save, Trash2, X, ChevronDown, ChevronRight } from '@lucide/vue'
import { audioEngineKey, type AudioEngine } from '@/composables/useAudioEngine'
import { recorderKey, type Recorder } from '@/composables/useRecorder'
import { useTracks } from '@/composables/useTracks'

defineProps<{ accentColor: string }>()

const audio = inject(audioEngineKey) as AudioEngine
const recorder = inject(recorderKey) as Recorder

const { tracks, saveTrack, deleteTrack, getTrack } = useTracks()

const showSaveDialog = shallowRef(false)
const trackName = shallowRef('')
/** Saved list hidden by default to save vertical space; toggle to expand. */
const savedListOpen = shallowRef(false)

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
    recorder.startRecording()
  }
}

function handlePlay() {
  if (recorder.isPlaying.value) {
    recorder.stop()
    return
  }
  if (hasEvents.value) {
    recorder.play(recorder.events.value, audio.attack, audio.release)
  }
}

function handlePlayTrack(trackId: string) {
  if (recorder.isRecording.value) return
  const track = getTrack(trackId)
  if (!track) return
  recorder.stop()
  recorder.play(track.events, audio.attack, audio.release)
}

function openSaveDialog() {
  trackName.value = ''
  showSaveDialog.value = true
}

async function handleSave() {
  await saveTrack(trackName.value.trim(), recorder.events.value)
  showSaveDialog.value = false
  savedListOpen.value = true
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex w-full min-h-0 flex-col gap-2 sm:gap-3">
    <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-glass-border bg-glass px-2.5 py-2 text-xs font-medium backdrop-blur-xl transition-all duration-150 hover:border-glass-border-bright hover:bg-glass-light sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        :class="recorder.isRecording.value ? 'text-red-400' : 'text-white/70'"
        @click="handleRecord"
      >
        <Circle v-if="!recorder.isRecording.value" :size="14" class="sm:h-4 sm:w-4" />
        <Square v-else :size="14" class="sm:h-4 sm:w-4" fill="currentColor" />
        {{ recorder.isRecording.value ? 'Stop' : 'Record' }}
      </button>

      <button
        type="button"
        class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-glass-border bg-glass px-2.5 py-2 text-xs font-medium backdrop-blur-xl transition-all duration-150 hover:border-glass-border-bright hover:bg-glass-light disabled:cursor-not-allowed disabled:opacity-30 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        :class="recorder.isPlaying.value ? 'text-neon-green' : 'text-white/70'"
        :disabled="recorder.isRecording.value || (!hasEvents && !recorder.isPlaying.value)"
        @click="handlePlay"
      >
        <Square v-if="recorder.isPlaying.value" :size="14" class="sm:h-4 sm:w-4" fill="currentColor" />
        <Play v-else :size="14" class="sm:h-4 sm:w-4" />
        {{ recorder.isPlaying.value ? 'Stop' : 'Play' }}
      </button>

      <button
        v-if="hasEvents && !recorder.isRecording.value"
        type="button"
        class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-glass-border bg-glass px-2.5 py-2 text-xs font-medium text-white/70 backdrop-blur-xl transition-all duration-150 hover:border-glass-border-bright hover:bg-glass-light sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        @click="openSaveDialog"
      >
        <Save :size="14" class="sm:h-4 sm:w-4" />
        Save
      </button>
    </div>

    <p
      v-if="hasEvents && !recorder.isRecording.value"
      class="px-1 text-center text-[10px] leading-snug text-white/35 sm:text-xs"
    >
      Play previews this take. Save adds it to the list; tap a row to replay a saved track.
    </p>

    <div
      v-if="showSaveDialog"
      class="mx-auto flex w-full max-w-xs items-center gap-1.5 rounded-xl border border-glass-border bg-glass p-1.5 backdrop-blur-xl sm:gap-2 sm:p-2"
    >
      <input
        v-model="trackName"
        type="text"
        placeholder="Track name…"
        class="min-w-0 flex-1 rounded-lg border border-glass-border bg-transparent px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-glass-border-bright sm:px-3 sm:text-sm"
        @keydown.enter="handleSave"
      />
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-lg bg-glass-light px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-glass-border sm:px-3 sm:text-sm"
        @click="handleSave"
      >
        OK
      </button>
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-lg p-1 text-white/40 transition-colors hover:text-white/80"
        aria-label="Close"
        @click="showSaveDialog = false"
      >
        <X :size="14" />
      </button>
    </div>

    <section v-if="tracks.length > 0" class="flex min-h-0 w-full flex-col gap-1">
      <button
        type="button"
        class="mx-auto flex w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-xl border border-glass-border bg-glass/90 px-3 py-2 text-left backdrop-blur-xl transition-colors hover:border-glass-border-bright hover:bg-glass-light sm:py-2.5"
        :aria-expanded="savedListOpen"
        aria-controls="saved-tracks-list"
        @click="savedListOpen = !savedListOpen"
      >
        <ChevronRight v-if="!savedListOpen" :size="16" class="shrink-0 text-white/45" aria-hidden="true" />
        <ChevronDown v-else :size="16" class="shrink-0 text-white/45" aria-hidden="true" />
        <span class="min-w-0 flex-1 text-center text-xs font-medium tracking-wide text-white/75 uppercase sm:text-sm">
          Saved tracks
          <span class="text-white/40">({{ tracks.length }})</span>
        </span>
      </button>

      <ul
        v-show="savedListOpen"
        id="saved-tracks-list"
        class="track-list-scroll mx-auto flex max-h-[min(42svh,13rem)] w-full max-w-sm list-none flex-col gap-1 overflow-y-auto overscroll-y-contain rounded-xl border border-glass-border/90 bg-glass/50 p-1 touch-pan-y sm:max-h-60 sm:p-1.5"
        role="list"
      >
        <li v-for="track in tracks" :key="track.id" class="shrink-0">
          <div
            class="flex items-center gap-1 rounded-lg border border-transparent bg-glass/80 px-2 py-1.5 backdrop-blur-xl sm:gap-2 sm:px-2.5 sm:py-2"
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-white sm:gap-2"
              @click="handlePlayTrack(track.id)"
            >
              <Play :size="12" class="shrink-0 text-white/45 sm:h-3.5 sm:w-3.5" />
              <span class="truncate text-xs text-white/85 sm:text-sm">{{ track.name }}</span>
              <span class="ml-auto shrink-0 text-[9px] tabular-nums text-white/30 sm:text-[10px]">{{
                formatDate(track.createdAt)
              }}</span>
            </button>
            <button
              type="button"
              class="shrink-0 cursor-pointer rounded-md p-1 text-white/35 transition-colors hover:text-red-400"
              aria-label="Delete track"
              @click="deleteTrack(track.id)"
            >
              <Trash2 :size="13" />
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.track-list-scroll {
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}
</style>

