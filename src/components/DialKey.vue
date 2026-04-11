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
    class="dial-key group relative flex w-full min-h-[44px] min-w-0 cursor-pointer select-none items-stretch overflow-hidden rounded-xl border border-white/9 bg-zinc-950/85 text-left transition-[border-color,background-color,box-shadow] duration-150 sm:min-h-0"
    :class="[
      isPressed
        ? 'border-white/20 bg-zinc-900/95 animate-glow-pulse'
        : 'hover:border-white/16 hover:bg-zinc-900/70',
    ]"
    :style="glowStyle"
    @pointerdown.prevent="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @contextmenu.prevent
  >
    <div
      class="relative z-1 flex w-full flex-1 items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5"
    >
      <span
        class="text-xl font-black tracking-tighter tabular-nums transition-colors duration-150 sm:text-2xl md:text-[1.7rem]"
        :style="{ color: isPressed ? accentColor : 'oklch(96% 0.01 270)' }"
      >
        {{ label }}
      </span>
      <span
        class="shrink-0 font-mono text-[9px] font-medium tabular-nums tracking-wide text-white/32 sm:text-[10px]"
      >
        {{ note }}
      </span>
    </div>

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
  aspect-ratio: 8 / 5;
}
</style>
