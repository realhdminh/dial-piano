<script setup lang="ts">
import { shallowRef, provide, computed, watch } from 'vue'
import AudioInitOverlay from '@/components/AudioInitOverlay.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import InstrumentPanel from '@/components/InstrumentPanel.vue'
import DialPad from '@/components/DialPad.vue'
import RecordManager from '@/components/RecordManager.vue'
import TunerPanel from '@/components/TunerPanel.vue'
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

const titleGradientStyle = computed(() => ({
  backgroundImage: `linear-gradient(105deg, oklch(88% 0.12 200), ${accentColor.value}, oklch(72% 0.2 270))`,
}))

const subtitle = computed(() => INSTRUMENTS[instrument.value].tagline)

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

  <div class="flex min-h-dvh flex-col items-center px-4 py-8 sm:py-12">
    <header class="mb-8 text-center sm:mb-10">
      <p
        class="mb-2 font-mono text-[10px] font-medium tracking-[0.4em] text-white/38 uppercase sm:text-[11px]"
      >
        Touch grid
      </p>
      <h1
        class="text-[2.35rem] font-black leading-none tracking-[-0.045em] text-white sm:text-5xl sm:tracking-[-0.05em]"
      >
        Dial<span class="bg-clip-text text-transparent" :style="titleGradientStyle">Piano</span>
      </h1>
      <p class="mt-2 font-mono text-xs text-white/45 sm:text-sm">{{ subtitle }}</p>
    </header>

    <div class="flex w-full max-w-xl flex-col items-center gap-5 sm:gap-6 md:max-w-2xl">
      <div
        class="w-full rounded-2xl border border-white/10 bg-zinc-950/65 p-4 ring-1 ring-inset ring-white/4 backdrop-blur-2xl sm:rounded-[1.25rem] sm:p-5 md:p-6"
      >
        <div class="mb-4 flex flex-col gap-4 border-b border-white/10 pb-4 sm:mb-5 sm:pb-5">
          <div class="flex flex-col gap-2">
            <span
              class="font-mono text-[10px] font-medium tracking-[0.22em] text-white/40 uppercase sm:text-xs"
            >
              Instrument
            </span>
            <InstrumentPanel v-model:instrument="instrument" :accent-color="accentColor" />
          </div>
          <div class="flex items-center justify-between gap-4">
            <span
              class="font-mono text-[10px] font-medium tracking-[0.22em] text-white/40 uppercase sm:text-xs"
            >
              Keys
            </span>
            <ControlPanel v-model:extended="extended" :accent-color="accentColor" />
          </div>
        </div>
        <div class="relative">
          <DialPad
            :extended="extended"
            :accent-color="accentColor"
            :instrument-ready="instrumentReady"
            :class="!instrumentReady && 'pointer-events-none opacity-35'"
          />
          <div
            v-if="!instrumentReady"
            class="absolute inset-0 flex items-center justify-center rounded-xl"
            aria-live="polite"
          >
            <span
              class="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[11px] tracking-wide text-white/60 backdrop-blur-sm"
            >
              Loading samples…
            </span>
          </div>
        </div>
      </div>

      <RecordManager :accent-color="accentColor" />
      <TunerPanel :instrument-id="instrument" :accent-color="accentColor" />
    </div>
  </div>
</template>
