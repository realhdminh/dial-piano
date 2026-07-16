import { shallowRef, readonly, type InjectionKey, type DeepReadonly, type Ref } from 'vue'
import * as Tone from 'tone'
import type { InstrumentId } from '@/instruments'

export interface RecordedEvent {
  note: string
  /** Milliseconds from recording start. */
  time: number
  type: 'attack' | 'release'
}

export type NoteTrigger = (note: string, time?: number) => void

export interface Recorder {
  isRecording: DeepReadonly<Ref<boolean>>
  isPlaying: DeepReadonly<Ref<boolean>>
  isLooping: DeepReadonly<Ref<boolean>>
  events: DeepReadonly<Ref<RecordedEvent[]>>
  recordingInstrument: DeepReadonly<Ref<InstrumentId | null>>
  startRecording: (instrumentId: InstrumentId) => void
  stopRecording: () => void
  recordAttack: (note: string) => void
  recordRelease: (note: string) => void
  setLooping: (value: boolean) => void
  play: (
    events: readonly RecordedEvent[],
    attackFn: NoteTrigger,
    releaseFn: NoteTrigger,
    releaseAllFn?: (time?: number) => void,
  ) => void
  stop: () => void
}

export const recorderKey: InjectionKey<Recorder> = Symbol('recorder')

const END_PAD_SEC = 0.12

export function useRecorder(): Recorder {
  const isRecording = shallowRef(false)
  const isPlaying = shallowRef(false)
  const isLooping = shallowRef(false)
  const events = shallowRef<RecordedEvent[]>([])
  const recordingInstrument = shallowRef<InstrumentId | null>(null)

  let startTime = 0
  let releaseAll: ((time?: number) => void) | null = null

  function clearTransport() {
    Tone.Transport.cancel(0)
    Tone.Transport.loop = false
    Tone.Transport.loopStart = 0
    Tone.Transport.loopEnd = 0
    Tone.Transport.stop()
    Tone.Transport.seconds = 0
  }

  function startRecording(instrumentId: InstrumentId) {
    stop()
    events.value = []
    recordingInstrument.value = instrumentId
    startTime = performance.now()
    isRecording.value = true
  }

  function stopRecording() {
    isRecording.value = false
  }

  function recordAttack(note: string) {
    if (!isRecording.value) return
    events.value = [...events.value, { note, time: performance.now() - startTime, type: 'attack' }]
  }

  function recordRelease(note: string) {
    if (!isRecording.value) return
    events.value = [...events.value, { note, time: performance.now() - startTime, type: 'release' }]
  }

  function setLooping(value: boolean) {
    // Applies on the next `play()` start (Transport loop bounds set there).
    isLooping.value = value
  }

  function play(
    eventList: readonly RecordedEvent[],
    attackFn: NoteTrigger,
    releaseFn: NoteTrigger,
    releaseAllFn?: (time?: number) => void,
  ) {
    stop()
    if (eventList.length === 0) return

    isPlaying.value = true
    releaseAll = releaseAllFn ?? null

    const lastMs = eventList.reduce((max, e) => (e.time > max ? e.time : max), 0)
    const durationSec = lastMs / 1000 + END_PAD_SEC

    for (const event of eventList) {
      const when = event.time / 1000
      Tone.Transport.schedule((time) => {
        if (event.type === 'attack') {
          attackFn(event.note, time)
        } else {
          releaseFn(event.note, time)
        }
      }, when)
    }

    if (isLooping.value) {
      Tone.Transport.loop = true
      Tone.Transport.loopStart = 0
      Tone.Transport.loopEnd = durationSec
    } else {
      Tone.Transport.loop = false
      // Teardown must not run inside the Transport callback (Tone warns if
      // Transport.seconds / ticks are set while isInsideScheduledCallback).
      Tone.Transport.schedule((time) => {
        releaseAll?.(time)
        queueMicrotask(() => {
          if (!isPlaying.value) return
          isPlaying.value = false
          clearTransport()
          releaseAll = null
        })
      }, durationSec)
    }

    Tone.Transport.start()
  }

  function stop() {
    const shouldRelease = isPlaying.value
    clearTransport()
    if (shouldRelease) {
      releaseAll?.()
    }
    isPlaying.value = false
    releaseAll = null
  }

  return {
    isRecording: readonly(isRecording),
    isPlaying: readonly(isPlaying),
    isLooping: readonly(isLooping),
    events: readonly(events),
    recordingInstrument: readonly(recordingInstrument),
    startRecording,
    stopRecording,
    recordAttack,
    recordRelease,
    setLooping,
    play,
    stop,
  }
}
