<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  note: string
  color: string
}>()

const emit = defineEmits<{ done: [] }>()

onMounted(() => {
  const duration = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--animate-note-fly-duration') ||
      '0.6',
  )
  setTimeout(() => emit('done'), duration * 1000)
})
</script>

<template>
  <span
    class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 animate-note-fly text-xs font-bold whitespace-nowrap"
    :style="{ color: props.color }"
  >
    {{ props.note }}
  </span>
</template>
