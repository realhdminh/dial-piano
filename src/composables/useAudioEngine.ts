import { shallowRef, readonly, type InjectionKey, type DeepReadonly, type Ref } from 'vue'
import * as Tone from 'tone'
import {
  INSTRUMENTS,
  DEFAULT_INSTRUMENT,
  type InstrumentId,
  type SamplerAudioConfig,
} from '@/instruments'

export interface AudioEngine {
  isReady: DeepReadonly<Ref<boolean>>
  instrument: DeepReadonly<Ref<InstrumentId>>
  attack: (note: string, time?: number) => void
  release: (note: string, time?: number) => void
  releaseAll: (time?: number) => void
  init: () => Promise<void>
  setInstrument: (id: InstrumentId) => Promise<void>
}

export const audioEngineKey: InjectionKey<AudioEngine> = Symbol('audio-engine')

export function useAudioEngine(): AudioEngine {
  const isReady = shallowRef(false)
  const instrument = shallowRef<InstrumentId>(DEFAULT_INSTRUMENT)

  let sampler: Tone.Sampler | null = null
  let reverb: Tone.Reverb | null = null

  function getSharedReverb(): Tone.Reverb {
    if (!reverb) {
      reverb = new Tone.Reverb({ decay: 3.8, wet: 0.24, preDelay: 0.02 }).toDestination()
    }
    return reverb
  }

  function applyReverbMix(wet: number) {
    getSharedReverb().wet.value = wet
  }

  function createSampler(config: SamplerAudioConfig): Tone.Sampler {
    return new Tone.Sampler({
      urls: config.urls,
      release: config.release,
      baseUrl: config.baseUrl,
    }).connect(getSharedReverb())
  }

  function disposeSampler() {
    if (sampler) {
      sampler.releaseAll()
      sampler.disconnect()
      sampler.dispose()
      sampler = null
    }
  }

  async function loadInstrument(id: InstrumentId) {
    const def = INSTRUMENTS[id]
    isReady.value = false
    disposeSampler()
    applyReverbMix(def.audio.reverbWet)
    sampler = createSampler(def.audio)
    await Tone.loaded()
    instrument.value = id
    isReady.value = true
  }

  async function init() {
    await Tone.start()
    await loadInstrument(DEFAULT_INSTRUMENT)
  }

  async function setInstrument(id: InstrumentId) {
    if (id === instrument.value && sampler && isReady.value) return
    await loadInstrument(id)
  }

  function attack(note: string, time?: number) {
    sampler?.triggerAttack(note, time ?? Tone.now())
  }

  function release(note: string, time?: number) {
    sampler?.triggerRelease(note, time ?? Tone.now())
  }

  function releaseAll(time?: number) {
    if (time !== undefined) {
      sampler?.releaseAll(time)
    } else {
      sampler?.releaseAll()
    }
  }

  return {
    isReady: readonly(isReady),
    instrument: readonly(instrument),
    attack,
    release,
    releaseAll,
    init,
    setInstrument,
  }
}
