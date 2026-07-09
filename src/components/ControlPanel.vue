<script setup lang="ts">
defineProps<{
  extended: boolean
  accentColor: string
}>()

defineEmits<{
  'update:extended': [value: boolean]
}>()
</script>

<template>
  <div
    class="relative isolate inline-flex h-7 w-17 shrink-0 rounded-lg bg-white/6 p-px"
    role="group"
    aria-label="Keyboard layout"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-px left-px top-px z-0 w-[calc(50%-2px)] rounded-[0.4rem] shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]"
      :class="extended ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'"
      :style="{ backgroundColor: accentColor }"
    />
    <button
      type="button"
      class="relative z-10 flex-1 rounded-[0.4rem] text-center text-[10px] font-bold tabular-nums transition-colors duration-150"
      :class="!extended ? 'text-zinc-950' : 'text-white/45'"
      :aria-pressed="!extended"
      aria-label="12 keys"
      @click="$emit('update:extended', false)"
    >
      12
    </button>
    <button
      type="button"
      class="relative z-10 flex-1 rounded-[0.4rem] text-center text-[10px] font-bold tabular-nums transition-colors duration-150"
      :class="extended ? 'text-zinc-950' : 'text-white/45'"
      :aria-pressed="extended"
      aria-label="18 keys"
      @click="$emit('update:extended', true)"
    >
      18
    </button>
  </div>
</template>
