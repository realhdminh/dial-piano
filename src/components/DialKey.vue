<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import NoteTrail from './NoteTrail.vue'

const props = defineProps<{
  label: string
  note: string
  accentColor: string
}>()

const emit = defineEmits<{
  attack: [note: string]
  release: [note: string]
}>()

const isPressed = shallowRef(false)
const activeTrails = shallowRef<number[]>([])
let trailCounter = 0

const activePointers = new Set<number>()

const glowStyle = computed(() => ({
  '--glow-color': props.accentColor,
}))

function handleAttack(pointerId: number) {
  if (activePointers.has(pointerId)) return
  activePointers.add(pointerId)
  isPressed.value = true
  emit('attack', props.note)

  const id = ++trailCounter
  activeTrails.value = [...activeTrails.value, id]
}

function handleRelease(pointerId: number) {
  activePointers.delete(pointerId)
  if (activePointers.size === 0) {
    isPressed.value = false
  }
  emit('release', props.note)
}

function removeTrail(id: number) {
  activeTrails.value = activeTrails.value.filter((t) => t !== id)
}

function onPointerDown(e: PointerEvent) {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  handleAttack(e.pointerId)
}

function onPointerUp(e: PointerEvent) {
  handleRelease(e.pointerId)
}

function onPointerCancel(e: PointerEvent) {
  handleRelease(e.pointerId)
}
</script>

<template>
  <button
    class="dial-key group relative flex cursor-pointer select-none flex-col items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-150"
    :class="[
      isPressed
        ? 'scale-95 border-glass-border-bright bg-glass-light animate-glow-pulse'
        : 'border-glass-border bg-glass hover:bg-glass-light hover:border-glass-border-bright',
    ]"
    :style="glowStyle"
    @pointerdown.prevent="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @contextmenu.prevent
  >
    <span
      class="text-2xl font-bold transition-colors duration-150 sm:text-3xl"
      :style="{ color: isPressed ? accentColor : 'rgba(255,255,255,0.9)' }"
    >
      {{ label }}
    </span>
    <span class="mt-0.5 text-[10px] tracking-wider text-white/30 sm:text-xs">
      {{ note }}
    </span>

    <NoteTrail
      v-for="trailId in activeTrails"
      :key="trailId"
      :note="note"
      :color="accentColor"
      @done="removeTrail(trailId)"
    />
  </button>
</template>

<style scoped>
.dial-key {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  aspect-ratio: 1;
}
</style>
