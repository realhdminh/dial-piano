<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import NoteTrail from './NoteTrail.vue'

const props = defineProps<{
  label: string
  note: string
  accentColor: string
  /** External press (e.g. computer keyboard). */
  active?: boolean
}>()

const emit = defineEmits<{
  attack: [note: string]
  release: [note: string]
}>()

const pointerPressed = shallowRef(false)
const activeTrails = shallowRef<number[]>([])
let trailCounter = 0

const activePointers = new Set<number>()

const isPressed = computed(() => props.active === true || pointerPressed.value)

const keyStyle = computed(() => ({
  '--key-accent': props.accentColor,
  '--glow-color': props.accentColor,
}))

function spawnTrail() {
  const id = ++trailCounter
  activeTrails.value = [...activeTrails.value, id]
}

function handleAttack(pointerId: number) {
  if (activePointers.has(pointerId)) return
  activePointers.add(pointerId)
  pointerPressed.value = true
  emit('attack', props.note)
  spawnTrail()
}

function handleRelease(pointerId: number) {
  if (!activePointers.has(pointerId)) return
  activePointers.delete(pointerId)
  if (activePointers.size === 0) {
    pointerPressed.value = false
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
    type="button"
    class="dial-key relative flex min-h-0 min-w-0 cursor-pointer select-none items-center justify-center overflow-hidden bg-zinc-950 text-center transition-[background-color,box-shadow] duration-100"
    :class="isPressed && 'dial-key--pressed animate-glow-pulse'"
    :style="keyStyle"
    :aria-label="note"
    :aria-pressed="isPressed"
    @pointerdown.prevent="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @contextmenu.prevent
  >
    <span
      class="absolute right-1.5 top-1 font-mono text-[8px] font-medium tabular-nums tracking-wide text-white/25"
    >
      {{ note }}
    </span>

    <span
      class="dial-key-label font-black tabular-nums leading-none tracking-tighter transition-colors duration-100"
      :class="isPressed ? 'text-(--key-accent)' : 'text-white/92'"
    >
      {{ label }}
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
  -webkit-tap-highlight-color: transparent;
}

.dial-key-label {
  font-size: clamp(1.75rem, 9vw, 2.75rem);
}

.dial-key--pressed {
  background: color-mix(in oklch, var(--key-accent), oklch(12% 0.02 270) 82%);
}
</style>
