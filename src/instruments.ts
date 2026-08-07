/** Instrument registry — sample configs, UI accents, labels. */

export type InstrumentId = 'piano' | 'kalimba' | 'guitar' | 'flute'

export interface SamplerAudioConfig {
  kind: 'sampler'
  urls: Record<string, string>
  baseUrl: string
  /** Seconds — passed to Tone.Sampler release envelope. */
  release: number
  reverbWet: number
}

export interface InstrumentDef {
  id: InstrumentId
  label: string
  shortLabel: string
  /** One-line description under the app title. */
  tagline: string
  accent: string
  audio: SamplerAudioConfig
}

/** Salamander grand piano — Tone.js CDN (sparse map, repitched). */
const PIANO_AUDIO: SamplerAudioConfig = {
  kind: 'sampler',
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
  baseUrl: 'https://tonejs.github.io/audio/salamander/',
  release: 3.2,
  reverbWet: 0.24,
}

/** Kalimba samples (B3–C6) — self-hosted in `public/audio/kalimba/`. */
const KALIMBA_AUDIO: SamplerAudioConfig = {
  kind: 'sampler',
  urls: {
    B3: 'a_kalimba_b3.wav',
    C4: 'b_kalimba_c4.wav',
    D4: 'c_kalimba_d4.wav',
    E4: 'd_kalimba_e4.wav',
    'F#4': 'e_kalimba_fsharp4.wav',
    G4: 'f_kalimba_g4.wav',
    A4: 'g_kalimba_a4.wav',
    B4: 'h_kalimba_b4.wav',
    C5: 'i_kalimba_c5.wav',
    D5: 'j_kalimba_d5.wav',
    E5: 'k_kalimba_e5.wav',
    'F#5': 'l_kalimba_fsharp5.wav',
    G5: 'm_kalimba_g5.wav',
    A5: 'n_kalimba_a5.wav',
    B5: 'o_kalimba_b5.wav',
    C6: 'p_kalimba_c6.wav',
  },
  baseUrl: '/audio/kalimba/',
  release: 2.4,
  reverbWet: 0.14,
}

/** Acoustic guitar — jsDelivr OGG (full G3–D5; mp3@1.0.0 stops at ~C4). */
const GUITAR_AUDIO: SamplerAudioConfig = {
  kind: 'sampler',
  urls: {
    G3: 'G3.ogg',
    'G#3': 'Gs3.ogg',
    A3: 'A3.ogg',
    'A#3': 'As3.ogg',
    B3: 'B3.ogg',
    C4: 'C4.ogg',
    'C#4': 'Cs4.ogg',
    D4: 'D4.ogg',
    'D#4': 'Ds4.ogg',
    E4: 'E4.ogg',
    F4: 'F4.ogg',
    'F#4': 'Fs4.ogg',
    G4: 'G4.ogg',
    'G#4': 'Gs4.ogg',
    A4: 'A4.ogg',
    'A#4': 'As4.ogg',
    B4: 'B4.ogg',
    C5: 'C5.ogg',
    'C#5': 'Cs5.ogg',
    D5: 'D5.ogg',
  },
  baseUrl: 'https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic-ogg@1.1.0/',
  release: 1.6,
  reverbWet: 0.16,
}

/** Concert flute — jsDelivr OGG (sparse C/E/A; repitched for chromatic dial pad). */
const FLUTE_AUDIO: SamplerAudioConfig = {
  kind: 'sampler',
  urls: {
    C4: 'C4.ogg',
    E4: 'E4.ogg',
    A4: 'A4.ogg',
    C5: 'C5.ogg',
    E5: 'E5.ogg',
    A5: 'A5.ogg',
    C6: 'C6.ogg',
    C7: 'C7.ogg',
    E6: 'E6.ogg',
    A6: 'A6.ogg',
  },
  baseUrl: 'https://cdn.jsdelivr.net/npm/tonejs-instrument-flute-ogg@1.1.0/',
  release: 1.2,
  reverbWet: 0.1,
}

export const INSTRUMENTS: Record<InstrumentId, InstrumentDef> = {
  piano: {
    id: 'piano',
    label: 'Piano',
    shortLabel: 'Piano',
    tagline: 'Grand piano · sampled keys',
    accent: 'oklch(78% 0.24 205)',
    audio: PIANO_AUDIO,
  },
  kalimba: {
    id: 'kalimba',
    label: 'Kalimba',
    shortLabel: 'Kalimba',
    tagline: 'Thumb piano · sampled tines',
    accent: 'oklch(76% 0.16 145)',
    audio: KALIMBA_AUDIO,
  },
  guitar: {
    id: 'guitar',
    label: 'Guitar',
    shortLabel: 'Guitar',
    tagline: 'Acoustic guitar · sampled strings',
    accent: 'oklch(72% 0.18 55)',
    audio: GUITAR_AUDIO,
  },
  flute: {
    id: 'flute',
    label: 'Flute',
    shortLabel: 'Flute',
    tagline: 'Concert flute · sampled',
    accent: 'oklch(80% 0.1 230)',
    audio: FLUTE_AUDIO,
  },
}

export const INSTRUMENT_LIST: InstrumentDef[] = [
  INSTRUMENTS.piano,
  INSTRUMENTS.kalimba,
  INSTRUMENTS.guitar,
  INSTRUMENTS.flute,
]

export const DEFAULT_INSTRUMENT: InstrumentId = 'piano'
