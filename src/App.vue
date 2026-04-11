<script setup lang="ts">
import { shallowRef, provide } from 'vue'
import AudioInitOverlay from '@/components/AudioInitOverlay.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import DialPad from '@/components/DialPad.vue'
import RecordManager from '@/components/RecordManager.vue'
import { useAudioEngine, audioEngineKey } from '@/composables/useAudioEngine'
import { PIANO_ACCENT } from '@/instruments'
import { useRecorder, recorderKey } from '@/composables/useRecorder'

const audio = useAudioEngine()
const recorder = useRecorder()

provide(audioEngineKey, audio)
provide(recorderKey, recorder)

const showOverlay = shallowRef(true)
const extended = shallowRef(false)

const accentColor = PIANO_ACCENT

async function handleReady() {
  await audio.init()
  setTimeout(() => {
    showOverlay.value = false
  }, 300)
}
</script>

<template>
  <AudioInitOverlay v-if="showOverlay" @ready="handleReady" />

  <div class="flex min-h-dvh flex-col items-center px-4 py-6 sm:py-10">
    <header class="mb-6 text-center sm:mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Dial<span :style="{ color: accentColor }">Piano</span>
      </h1>
      <p class="mt-1 text-sm text-white/40">Acoustic piano · dial pad</p>
    </header>

    <div class="flex w-full max-w-md flex-col items-center gap-5 sm:gap-6">
      <ControlPanel v-model:extended="extended" />

      <div
        class="w-full rounded-3xl border border-glass-border bg-glass p-3 backdrop-blur-xl sm:p-4"
      >
        <DialPad :extended="extended" :accent-color="accentColor" />
      </div>

      <RecordManager :accent-color="accentColor" />
    </div>
  </div>
</template>
