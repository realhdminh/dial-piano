<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, shallowRef } from 'vue'
import DialKey from './DialKey.vue'
import { audioEngineKey, type AudioEngine } from '@/composables/useAudioEngine'
import { recorderKey, type Recorder } from '@/composables/useRecorder'
import { dialKeysForLayout, isTypingTarget, noteFromKeyboardEvent } from '@/utils/dialKeys'

const props = defineProps<{
  extended: boolean
  accentColor: string
  instrumentReady?: boolean
}>()

const audio = inject(audioEngineKey) as AudioEngine
const recorder = inject(recorderKey) as Recorder

const keys = computed(() => dialKeysForLayout(props.extended))

/** Notes held via computer keyboard (visual + release tracking). */
const keyboardHeld = shallowRef(new Set<string>())
/** KeyboardEvent.code → note while that physical key is down. */
const codeToNote = new Map<string, string>()

function handleAttack(note: string) {
  if (props.instrumentReady === false) return
  audio.attack(note)
  recorder.recordAttack(note)
}

function handleRelease(note: string) {
  if (props.instrumentReady === false) return
  audio.release(note)
  recorder.recordRelease(note)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat || isTypingTarget(e.target)) return

  if (e.code === 'Escape') {
    if (recorder.isPlaying.value) {
      e.preventDefault()
      recorder.stop()
    }
    return
  }

  const note = noteFromKeyboardEvent(e, props.extended)
  if (!note || codeToNote.has(e.code)) return

  e.preventDefault()
  codeToNote.set(e.code, note)

  if (!keyboardHeld.value.has(note)) {
    const next = new Set(keyboardHeld.value)
    next.add(note)
    keyboardHeld.value = next
    handleAttack(note)
  }
}

function onKeyUp(e: KeyboardEvent) {
  const note = codeToNote.get(e.code)
  if (!note) return
  codeToNote.delete(e.code)

  const stillHeld = [...codeToNote.values()].includes(note)
  if (stillHeld) return

  if (keyboardHeld.value.has(note)) {
    const next = new Set(keyboardHeld.value)
    next.delete(note)
    keyboardHeld.value = next
    handleRelease(note)
  }
}

function onWindowBlur() {
  const notes = [...keyboardHeld.value]
  codeToNote.clear()
  keyboardHeld.value = new Set()
  for (const note of notes) {
    handleRelease(note)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', onWindowBlur)
  onWindowBlur()
})
</script>

<template>
  <div
    class="dial-grid grid h-full w-full auto-rows-fr gap-px bg-white/8"
    :class="extended ? 'grid-cols-3 grid-rows-6' : 'grid-cols-3 grid-rows-4'"
  >
    <DialKey
      v-for="key in keys"
      :key="key.note"
      :label="key.label"
      :note="key.note"
      :accent-color="accentColor"
      :active="keyboardHeld.has(key.note)"
      @attack="handleAttack"
      @release="handleRelease"
    />
  </div>
</template>
