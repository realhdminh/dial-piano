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
    class="relative isolate inline-flex h-9 w-30 shrink-0 rounded-lg border border-white/10 bg-black/55 p-px ring-1 ring-inset ring-white/5"
    role="group"
    aria-label="Keyboard layout"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-px left-px top-px z-0 w-[calc(50%-2px)] rounded-md opacity-95 shadow-[0_1px_8px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]"
      :class="extended ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'"
      :style="{ backgroundColor: accentColor }"
    />
    <button
      type="button"
      class="relative z-10 flex-1 rounded-md py-1.5 text-center text-[11px] font-bold tabular-nums tracking-tight transition-colors duration-150"
      :class="!extended ? 'text-zinc-950' : 'text-white/45 hover:text-white/70'"
      :aria-pressed="!extended"
      aria-label="12 keys"
      @click="$emit('update:extended', false)"
    >
      12
    </button>
    <button
      type="button"
      class="relative z-10 flex-1 rounded-md py-1.5 text-center text-[11px] font-bold tabular-nums tracking-tight transition-colors duration-150"
      :class="extended ? 'text-zinc-950' : 'text-white/45 hover:text-white/70'"
      :aria-pressed="extended"
      aria-label="18 keys"
      @click="$emit('update:extended', true)"
    >
      18
    </button>
  </div>
</template>
