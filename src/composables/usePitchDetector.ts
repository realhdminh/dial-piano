import { shallowRef, readonly, onUnmounted, type Ref } from 'vue'
import * as Tone from 'tone'
import { PitchDetector } from 'pitchy'
import { frequencyToPitch, medianMidi, midiToNoteName, type ParsedPitch } from '@/utils/pitch'

export interface PitchReading extends ParsedPitch {
  clarity: number
}

export interface PitchDetectorApi {
  isListening: Readonly<Ref<boolean>>
  reading: Readonly<Ref<PitchReading | null>>
  error: Readonly<Ref<string | null>>
  start: () => Promise<void>
  stop: () => void
}

const CLARITY_MIN = 0.86
const MIDI_HISTORY = 9

export function usePitchDetector(): PitchDetectorApi {
  const isListening = shallowRef(false)
  const reading = shallowRef<PitchReading | null>(null)
  const error = shallowRef<string | null>(null)

  let stream: MediaStream | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let analyser: AnalyserNode | null = null
  let buffer: Float32Array<ArrayBuffer> | null = null
  let detector: PitchDetector<Float32Array<ArrayBuffer>> | null = null
  let rafId = 0
  const midiHistory: number[] = []

  function stopTracks() {
    for (const track of stream?.getTracks() ?? []) {
      track.stop()
    }
  }

  function disconnectNodes() {
    source?.disconnect()
    source = null
    analyser = null
    buffer = null
    detector = null
  }

  function tick() {
    if (!isListening.value || !analyser || !buffer || !detector) return

    analyser.getFloatTimeDomainData(buffer)
    const sampleRate = Tone.getContext().sampleRate
    const [frequency, clarity] = detector.findPitch(buffer, sampleRate)

    if (clarity >= CLARITY_MIN && frequency > 0) {
      const parsed = frequencyToPitch(frequency)
      if (parsed) {
        midiHistory.push(parsed.midi)
        if (midiHistory.length > MIDI_HISTORY) midiHistory.shift()

        const stableMidi = medianMidi(midiHistory) ?? parsed.midi
        const stableFreq = 440 * 2 ** ((stableMidi - 69) / 12)
        const cents = Math.round(1200 * Math.log2(frequency / stableFreq))

        reading.value = {
          note: midiToNoteName(stableMidi),
          midi: stableMidi,
          frequency,
          cents,
          clarity,
        }
      }
    } else if (clarity < 0.5) {
      reading.value = null
    }

    rafId = requestAnimationFrame(tick)
  }

  async function start() {
    stop()
    error.value = null
    reading.value = null
    midiHistory.length = 0

    try {
      await Tone.start()

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported in this browser.')
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      const ctx = Tone.getContext().rawContext as AudioContext
      source = ctx.createMediaStreamSource(stream)
      analyser = ctx.createAnalyser()
      analyser.fftSize = 4096
      source.connect(analyser)

      buffer = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>
      detector = PitchDetector.forFloat32Array(buffer.length)
      isListening.value = true
      rafId = requestAnimationFrame(tick)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Could not access microphone.'
      stop()
    }
  }

  function stop() {
    isListening.value = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    disconnectNodes()
    stopTracks()
    stream = null
    midiHistory.length = 0
    reading.value = null
  }

  onUnmounted(stop)

  return {
    isListening: readonly(isListening),
    reading: readonly(reading),
    error: readonly(error),
    start,
    stop,
  }
}
