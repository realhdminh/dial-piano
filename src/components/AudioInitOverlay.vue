<script setup lang="ts">
import { shallowRef } from 'vue'

defineProps<{
  accentColor: string
}>()

const emit = defineEmits<{ ready: [] }>()
const fading = shallowRef(false)

async function handleStart() {
  fading.value = true
  emit('ready')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md transition-opacity duration-300"
    :class="fading ? 'pointer-events-none opacity-0' : 'opacity-100'"
  >
    <button
      type="button"
      class="group flex max-w-[min(100%,20rem)] cursor-pointer flex-col items-center gap-5 rounded-2xl border border-white/10 bg-zinc-950/80 px-10 py-9 ring-1 ring-inset ring-white/5 transition-colors duration-200 hover:border-white/20 hover:bg-zinc-900/90 sm:px-12 sm:py-10"
      @click="handleStart"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-black/40 transition-transform duration-200 group-hover:scale-[1.03] sm:size-18"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-9 w-9 sm:h-10 sm:w-10"
          :style="{ color: accentColor }"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <div class="text-center">
        <span
          class="block font-mono text-[10px] font-medium tracking-[0.28em] text-white/35 uppercase"
        >
          Enable audio
        </span>
        <span class="mt-2 block text-lg font-bold tracking-tight text-white">Tap to start</span>
        <span class="mt-1 block font-mono text-xs text-white/40">Browser requires a gesture</span>
      </div>
    </button>
  </div>
</template>
