<script setup lang="ts">
import { computed } from 'vue'
import { Mic, MicOff } from '@lucide/vue'
import { usePitchDetector } from '@/composables/usePitchDetector'
import { INSTRUMENTS, type InstrumentId } from '@/instruments'

const props = defineProps<{
  instrumentId: InstrumentId
  accentColor: string
}>()

const tuner = usePitchDetector()

const instrumentLabel = computed(() => INSTRUMENTS[props.instrumentId].label)

const centsLabel = computed(() => {
  const r = tuner.reading.value
  if (!r) return '—'
  if (r.cents === 0) return 'in tune'
  const dir = r.cents > 0 ? 'sharp' : 'flat'
  return `${Math.abs(r.cents)}¢ ${dir}`
})

const centsColor = computed(() => {
  const r = tuner.reading.value
  if (!r) return 'text-white/35'
  const abs = Math.abs(r.cents)
  if (abs <= 5) return 'text-neon-green'
  if (abs <= 20) return 'text-white/75'
  return 'text-amber-300'
})

async function toggleListen() {
  if (tuner.isListening.value) {
    tuner.stop()
    return
  }
  await tuner.start()
}
</script>

<template>
  <section
    class="w-full rounded-2xl border border-white/10 bg-zinc-950/65 p-4 ring-1 ring-inset ring-white/4 backdrop-blur-2xl sm:rounded-[1.25rem] sm:p-5"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2
          class="font-mono text-[10px] font-medium tracking-[0.22em] text-white/40 uppercase sm:text-xs"
        >
          Live tuner
        </h2>
        <p class="mt-1 text-xs text-white/45 sm:text-sm">
          Mic listens to your real {{ instrumentLabel.toLowerCase() }} — pluck a tine or string.
        </p>
      </div>
      <button
        type="button"
        class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold transition-colors duration-150 sm:text-sm"
        :class="
          tuner.isListening.value
            ? 'border-red-400/30 bg-red-950/40 text-red-300'
            : 'bg-black/55 text-white/75 hover:border-white/18 hover:bg-zinc-900/80'
        "
        :aria-pressed="tuner.isListening.value"
        @click="toggleListen"
      >
        <MicOff v-if="tuner.isListening.value" :size="14" />
        <Mic v-else :size="14" />
        {{ tuner.isListening.value ? 'Stop' : 'Listen' }}
      </button>
    </div>

    <p v-if="tuner.error.value" class="mb-3 text-center text-xs text-red-400/90">
      {{ tuner.error.value }}
    </p>

    <div
      class="flex min-h-28 flex-col items-center justify-center rounded-xl border border-white/8 bg-black/30 px-4 py-6 text-center"
      aria-live="polite"
      aria-atomic="true"
    >
      <template v-if="tuner.reading.value">
        <p
          class="text-4xl font-black tabular-nums tracking-tight sm:text-5xl"
          :style="{ color: accentColor }"
        >
          {{ tuner.reading.value.note }}
        </p>
        <p class="mt-2 font-mono text-sm font-medium tabular-nums" :class="centsColor">
          {{ centsLabel }}
        </p>
        <p class="mt-1 font-mono text-[10px] tabular-nums text-white/35 sm:text-xs">
          {{ tuner.reading.value.frequency.toFixed(1) }} Hz
        </p>
      </template>
      <template v-else-if="tuner.isListening.value">
        <p class="font-mono text-sm text-white/40">Listening… pluck or blow a note.</p>
      </template>
      <template v-else>
        <p class="font-mono text-sm text-white/35">
          Tap Listen and play your instrument near the mic.
        </p>
      </template>
    </div>

    <p class="mt-3 text-center font-mono text-[10px] leading-snug text-white/32 sm:text-xs">
      Pitch detection from the microphone — quiet room works best. Within ±5¢ is effectively in
      tune.
    </p>
  </section>
</template>
