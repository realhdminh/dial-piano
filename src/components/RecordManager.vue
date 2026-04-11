<script setup lang="ts">
import { shallowRef, inject, computed } from 'vue'
import { Circle, Square, Play, Save, Trash2, X } from '@lucide/vue'
import { audioEngineKey, type AudioEngine } from '@/composables/useAudioEngine'
import { recorderKey, type Recorder } from '@/composables/useRecorder'
import { useTracks } from '@/composables/useTracks'

const audio = inject(audioEngineKey) as AudioEngine
const recorder = inject(recorderKey) as Recorder

const { tracks, saveTrack, deleteTrack, getTrack } = useTracks()

const showSaveDialog = shallowRef(false)
const trackName = shallowRef('')

const accentColor = defineProps<{ accentColor: string }>()

const hasEvents = computed(() => recorder.events.value.length > 0)

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
  const track = getTrack(trackId)
  if (!track) return
  recorder.play(track.events, audio.attack, audio.release)
}

function openSaveDialog() {
  trackName.value = ''
  showSaveDialog.value = true
}

async function handleSave() {
  await saveTrack(trackName.value.trim(), recorder.events.value)
  showSaveDialog.value = false
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
  <div class="flex w-full flex-col gap-3">
    <div class="flex items-center justify-center gap-2">
      <button
        class="flex cursor-pointer items-center gap-2 rounded-xl border border-glass-border bg-glass px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-150 hover:border-glass-border-bright hover:bg-glass-light"
        :class="recorder.isRecording.value ? 'text-red-400' : 'text-white/70'"
        @click="handleRecord"
      >
        <Circle v-if="!recorder.isRecording.value" :size="16" />
        <Square v-else :size="16" fill="currentColor" />
        {{ recorder.isRecording.value ? 'Stop' : 'Record' }}
      </button>

      <button
        class="flex cursor-pointer items-center gap-2 rounded-xl border border-glass-border bg-glass px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-150 hover:border-glass-border-bright hover:bg-glass-light disabled:cursor-not-allowed disabled:opacity-30"
        :class="recorder.isPlaying.value ? 'text-neon-green' : 'text-white/70'"
        :disabled="!hasEvents && !recorder.isPlaying.value"
        @click="handlePlay"
      >
        <Square v-if="recorder.isPlaying.value" :size="16" fill="currentColor" />
        <Play v-else :size="16" />
        {{ recorder.isPlaying.value ? 'Stop' : 'Play' }}
      </button>

      <button
        v-if="hasEvents && !recorder.isRecording.value"
        class="flex cursor-pointer items-center gap-2 rounded-xl border border-glass-border bg-glass px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-xl transition-all duration-150 hover:border-glass-border-bright hover:bg-glass-light"
        @click="openSaveDialog"
      >
        <Save :size="16" />
        Save
      </button>
    </div>

    <div
      v-if="showSaveDialog"
      class="mx-auto flex w-full max-w-xs items-center gap-2 rounded-xl border border-glass-border bg-glass p-2 backdrop-blur-xl"
    >
      <input
        v-model="trackName"
        type="text"
        placeholder="Track name..."
        class="flex-1 rounded-lg border border-glass-border bg-transparent px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-glass-border-bright"
        @keydown.enter="handleSave"
      />
      <button
        class="cursor-pointer rounded-lg bg-glass-light px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-glass-border"
        @click="handleSave"
      >
        OK
      </button>
      <button
        class="cursor-pointer rounded-lg p-1.5 text-white/40 transition-colors hover:text-white/80"
        @click="showSaveDialog = false"
      >
        <X :size="14" />
      </button>
    </div>

    <div v-if="tracks.length > 0" class="mx-auto flex w-full max-w-sm flex-col gap-1.5">
      <p class="text-center text-xs tracking-wider text-white/30 uppercase">Saved Tracks</p>
      <div
        v-for="track in tracks"
        :key="track.id"
        class="flex items-center gap-2 rounded-xl border border-glass-border bg-glass px-3 py-2 backdrop-blur-xl"
      >
        <button
          class="flex flex-1 cursor-pointer items-center gap-2 text-left transition-colors hover:text-white"
          @click="handlePlayTrack(track.id)"
        >
          <Play :size="14" class="shrink-0 text-white/50" />
          <span class="truncate text-sm text-white/80">{{ track.name }}</span>
          <span class="ml-auto shrink-0 text-[10px] text-white/30">{{ formatDate(track.createdAt) }}</span>
        </button>
        <button
          class="cursor-pointer rounded-md p-1 text-white/30 transition-colors hover:text-red-400"
          @click="deleteTrack(track.id)"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>
