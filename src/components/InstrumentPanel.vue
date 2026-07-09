<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Piano, Guitar, Music2, Wind } from '@lucide/vue'
import { INSTRUMENT_LIST, type InstrumentId } from '@/instruments'

const props = defineProps<{
  instrument: InstrumentId
  accentColor: string
}>()

defineEmits<{
  'update:instrument': [value: InstrumentId]
}>()

const MOBILE_LABEL: Record<InstrumentId, string> = {
  piano: 'Pia',
  kalimba: 'Kal',
  guitar: 'Gui',
  flute: 'Flu',
}

const INSTRUMENT_ICONS: Record<InstrumentId, Component> = {
  piano: Piano,
  kalimba: Music2,
  guitar: Guitar,
  flute: Wind,
}

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
    class="relative isolate flex h-10 w-full rounded-xl bg-white/6 p-px"
    role="group"
    aria-label="Instrument"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-px left-px top-px z-0 rounded-[0.65rem] shadow-[0_2px_12px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]"
      :style="thumbStyle"
    />
    <button
      v-for="item in INSTRUMENT_LIST"
      :key="item.id"
      type="button"
      class="relative z-10 flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[0.65rem] py-2 text-[11px] font-bold tracking-tight transition-colors duration-150"
      :class="instrument === item.id ? 'text-zinc-950' : 'text-white/50 active:text-white/80'"
      :aria-pressed="instrument === item.id"
      :aria-label="item.label"
      @click="$emit('update:instrument', item.id)"
    >
      <component :is="INSTRUMENT_ICONS[item.id]" :size="13" class="shrink-0" aria-hidden="true" />
      <span>{{ MOBILE_LABEL[item.id] }}</span>
    </button>
  </div>
</template>
