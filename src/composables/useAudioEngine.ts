import { shallowRef, readonly, type InjectionKey, type DeepReadonly, type Ref } from 'vue'
import * as Tone from 'tone'

export interface AudioEngine {
  isReady: DeepReadonly<Ref<boolean>>
  attack: (note: string) => void
  release: (note: string) => void
  init: () => Promise<void>
}

export const audioEngineKey: InjectionKey<AudioEngine> = Symbol('audio-engine')

export function useAudioEngine(): AudioEngine {
  const isReady = shallowRef(false)

  let piano: Tone.Sampler | null = null
  let reverb: Tone.Reverb | null = null

  function getSharedReverb(): Tone.Reverb {
    if (!reverb) {
      reverb = new Tone.Reverb({ decay: 2, wet: 0.16 }).toDestination()
    }
    return reverb
  }

  function createPiano(): Tone.Sampler {
    return new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).connect(getSharedReverb())
  }

  function disposePiano() {
    if (piano) {
      piano.releaseAll()
      piano.disconnect()
      piano.dispose()
      piano = null
    }
  }

  async function init() {
    await Tone.start()
    disposePiano()
    piano = createPiano()
    await Tone.loaded()
    isReady.value = true
  }

  function attack(note: string) {
    piano?.triggerAttack(note, Tone.now())
  }

  function release(note: string) {
    piano?.triggerRelease(note, Tone.now())
  }

  return {
    isReady: readonly(isReady),
    attack,
    release,
    init,
  }
}
