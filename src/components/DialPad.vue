<script setup lang="ts">
import { computed, inject } from 'vue'
import DialKey from './DialKey.vue'
import { audioEngineKey, type AudioEngine } from '@/composables/useAudioEngine'
import { recorderKey, type Recorder } from '@/composables/useRecorder'

const props = defineProps<{
  extended: boolean
  accentColor: string
}>()

const audio = inject(audioEngineKey) as AudioEngine
const recorder = inject(recorderKey) as Recorder

interface KeyDef {
  label: string
  note: string
}

const STANDARD_KEYS: KeyDef[] = [
  { label: '1', note: 'C4' },
  { label: '2', note: 'D4' },
  { label: '3', note: 'E4' },
  { label: '4', note: 'F4' },
  { label: '5', note: 'G4' },
  { label: '6', note: 'A4' },
  { label: '7', note: 'B4' },
  { label: '8', note: 'C5' },
  { label: '9', note: 'D5' },
  { label: '*', note: 'E5' },
  { label: '0', note: 'F5' },
  { label: '#', note: 'G5' },
]

const EXTENDED_TOP: KeyDef[] = [
  { label: 'A', note: 'A3' },
  { label: 'B', note: 'B3' },
  { label: 'C', note: 'C3' },
]

const EXTENDED_BOTTOM: KeyDef[] = [
  { label: 'D', note: 'A5' },
  { label: 'E', note: 'B5' },
  { label: 'F', note: 'C6' },
]

const keys = computed<KeyDef[]>(() => {
  if (props.extended) {
    return [...EXTENDED_TOP, ...STANDARD_KEYS, ...EXTENDED_BOTTOM]
  }
  return STANDARD_KEYS
})

function handleAttack(note: string) {
  audio.attack(note)
  recorder.recordAttack(note)
}

function handleRelease(note: string) {
  audio.release(note)
  recorder.recordRelease(note)
}
</script>

<template>
  <div
    class="grid gap-2.5 sm:gap-3"
    :class="extended ? 'grid-cols-3 grid-rows-6' : 'grid-cols-3 grid-rows-4'"
  >
    <DialKey
      v-for="key in keys"
      :key="key.note"
      :label="key.label"
      :note="key.note"
      :accent-color="accentColor"
      @attack="handleAttack"
      @release="handleRelease"
    />
  </div>
</template>
