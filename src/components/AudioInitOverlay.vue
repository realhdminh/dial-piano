<script setup lang="ts">
import { shallowRef } from 'vue'

const emit = defineEmits<{ ready: [] }>()
const fading = shallowRef(false)

async function handleStart() {
  fading.value = true
  emit('ready')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300"
    :class="fading ? 'opacity-0 pointer-events-none' : 'opacity-100'"
  >
    <button
      class="group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-glass-border bg-glass px-12 py-10 backdrop-blur-xl transition-all duration-200 hover:border-glass-border-bright hover:bg-glass-light"
      @click="handleStart"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full border border-glass-border bg-glass-light transition-transform duration-200 group-hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-10 w-10 text-neon-blue"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <span class="text-lg font-medium tracking-wide text-white/90">Tap to Start</span>
      <span class="text-sm text-white/40">Audio requires user interaction</span>
    </button>
  </div>
</template>
