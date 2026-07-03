<script setup lang="ts">
import { computed } from 'vue'
import { INSTRUMENT_LIST, type InstrumentId } from '@/instruments'

const props = defineProps<{
  instrument: InstrumentId
  accentColor: string
}>()

defineEmits<{
  'update:instrument': [value: InstrumentId]
}>()

const count = INSTRUMENT_LIST.length

const activeIndex = computed(() => {
  const i = INSTRUMENT_LIST.findIndex((item) => item.id === props.instrument)
  return i >= 0 ? i : 0
})

const thumbStyle = computed(() => ({
  width: `calc(${100 / count}% - 2px)`,
  transform: `translateX(calc(${activeIndex.value * 100}% + ${activeIndex.value * 2}px))`,
  backgroundColor: props.accentColor,
}))
</script>

<template>
  <div
    class="relative isolate flex h-9 w-full rounded-lg border border-white/10 bg-black/55 p-px ring-1 ring-inset ring-white/5"
    role="group"
    aria-label="Instrument"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-px left-px top-px z-0 rounded-md opacity-95 shadow-[0_1px_8px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]"
      :style="thumbStyle"
    />
    <button
      v-for="item in INSTRUMENT_LIST"
      :key="item.id"
      type="button"
      class="relative z-10 min-w-0 flex-1 rounded-md px-1 py-1.5 text-center text-[10px] font-bold tracking-tight transition-colors duration-150 sm:px-2 sm:text-[11px]"
      :class="instrument === item.id ? 'text-zinc-950' : 'text-white/45 hover:text-white/70'"
      :aria-pressed="instrument === item.id"
      :aria-label="item.label"
      @click="$emit('update:instrument', item.id)"
    >
      {{ item.shortLabel }}
    </button>
  </div>
</template>
