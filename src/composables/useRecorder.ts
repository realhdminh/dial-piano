import { shallowRef, readonly, type InjectionKey, type DeepReadonly, type Ref } from 'vue'

export interface RecordedEvent {
  note: string
  time: number
  type: 'attack' | 'release'
}

export interface Recorder {
  isRecording: DeepReadonly<Ref<boolean>>
  isPlaying: DeepReadonly<Ref<boolean>>
  events: DeepReadonly<Ref<RecordedEvent[]>>
  startRecording: () => void
  stopRecording: () => void
  recordAttack: (note: string) => void
  recordRelease: (note: string) => void
  play: (
    events: readonly RecordedEvent[],
    attackFn: (note: string) => void,
    releaseFn: (note: string) => void,
  ) => void
  stop: () => void
}

export const recorderKey: InjectionKey<Recorder> = Symbol('recorder')

export function useRecorder(): Recorder {
  const isRecording = shallowRef(false)
  const isPlaying = shallowRef(false)
  const events = shallowRef<RecordedEvent[]>([])

  let startTime = 0
  let timeoutIds: ReturnType<typeof setTimeout>[] = []

  function startRecording() {
    events.value = []
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

  function play(
    eventList: readonly RecordedEvent[],
    attackFn: (note: string) => void,
    releaseFn: (note: string) => void,
  ) {
    stop()
    isPlaying.value = true

    for (const event of eventList) {
      const id = setTimeout(() => {
        if (event.type === 'attack') {
          attackFn(event.note)
        } else {
          releaseFn(event.note)
        }
      }, event.time)
      timeoutIds.push(id)
    }

    const lastTime = eventList.length > 0 ? eventList[eventList.length - 1]!.time : 0
    const endId = setTimeout(() => {
      isPlaying.value = false
    }, lastTime + 100)
    timeoutIds.push(endId)
  }

  function stop() {
    for (const id of timeoutIds) {
      clearTimeout(id)
    }
    timeoutIds = []
    isPlaying.value = false
  }

  return {
    isRecording: readonly(isRecording),
    isPlaying: readonly(isPlaying),
    events: readonly(events),
    startRecording,
    stopRecording,
    recordAttack,
    recordRelease,
    play,
    stop,
  }
}
