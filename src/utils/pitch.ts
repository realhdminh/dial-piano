const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export interface ParsedPitch {
  note: string
  midi: number
  frequency: number
  cents: number
}

/** Convert Hz to scientific pitch notation (A4 = 440). */
export function frequencyToPitch(frequency: number): ParsedPitch | null {
  if (!Number.isFinite(frequency) || frequency < 50 || frequency > 2400) return null

  const midiFloat = 12 * Math.log2(frequency / 440) + 69
  const midi = Math.round(midiFloat)
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]!
  const octave = Math.floor(midi / 12) - 1
  const targetFreq = 440 * 2 ** ((midi - 69) / 12)
  const cents = Math.round(1200 * Math.log2(frequency / targetFreq))

  return {
    note: `${name}${octave}`,
    midi,
    frequency,
    cents,
  }
}

export function midiToNoteName(midi: number): string {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]!
  const octave = Math.floor(midi / 12) - 1
  return `${name}${octave}`
}

/** Stabilize noisy detections (odd length → middle value). */
export function medianMidi(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]!
}
