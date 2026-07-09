<script setup lang="ts">
import { shallowRef, provide, computed, watch } from 'vue'
import AudioInitOverlay from '@/components/AudioInitOverlay.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import InstrumentPanel from '@/components/InstrumentPanel.vue'
import DialPad from '@/components/DialPad.vue'
import RecordManager from '@/components/RecordManager.vue'
import { useAudioEngine, audioEngineKey } from '@/composables/useAudioEngine'
import { INSTRUMENTS, DEFAULT_INSTRUMENT, type InstrumentId } from '@/instruments'
import { useRecorder, recorderKey } from '@/composables/useRecorder'

const audio = useAudioEngine()
const recorder = useRecorder()

provide(audioEngineKey, audio)
provide(recorderKey, recorder)

const showOverlay = shallowRef(true)
const extended = shallowRef(false)
const instrument = shallowRef<InstrumentId>(DEFAULT_INSTRUMENT)

const accentColor = computed(() => INSTRUMENTS[instrument.value].accent)

const instrumentReady = computed(() => audio.isReady.value)

watch(instrument, async (id) => {
  if (!audio.isReady.value) return
  recorder.stop()
  await audio.setInstrument(id)
})

async function handleReady() {
  await audio.init()
  instrument.value = audio.instrument.value
  setTimeout(() => {
    showOverlay.value = false
  }, 300)
}
</script>

<template>
  <AudioInitOverlay v-if="showOverlay" :accent-color="accentColor" @ready="handleReady" />

  <div class="app-shell flex h-[100dvh] flex-col overflow-hidden">
    <header class="shrink-0 border-b border-white/6 bg-black/30">
      <div class="px-1.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <InstrumentPanel v-model:instrument="instrument" :accent-color="accentColor" />
      </div>
      <div class="flex items-center justify-between px-3 py-1.5">
        <p class="truncate font-mono text-[10px] tracking-wide text-white/40">
          {{ INSTRUMENTS[instrument].tagline }}
        </p>
        <ControlPanel v-model:extended="extended" :accent-color="accentColor" />
      </div>
    </header>

    <main class="relative min-h-0 flex-1">
      <div
        class="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${accentColor}, transparent 70%)`,
        }"
      />
      <DialPad
        :extended="extended"
        :accent-color="accentColor"
        :instrument-ready="instrumentReady"
        :class="!instrumentReady && 'pointer-events-none opacity-40'"
      />
      <div
        v-if="!instrumentReady"
        class="absolute inset-0 z-10 flex items-center justify-center"
        aria-live="polite"
      >
        <span
          class="rounded-full bg-black/70 px-4 py-2 font-mono text-[11px] tracking-wide text-white/70 backdrop-blur-sm"
        >
          Loading…
        </span>
      </div>
    </main>

    <footer
      class="shrink-0 border-t border-white/8 bg-zinc-950/90 backdrop-blur-xl pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      <RecordManager :accent-color="accentColor" />
    </footer>
  </div>
</template>
