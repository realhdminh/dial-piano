/** Dial-pad note layout and computer-keyboard bindings. */

export interface DialKeyDef {
  label: string
  note: string
}

export const STANDARD_KEYS: DialKeyDef[] = [
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

export const EXTENDED_TOP: DialKeyDef[] = [
  { label: 'G', note: 'G3' },
  { label: 'A', note: 'A3' },
  { label: 'B', note: 'B3' },
]

export const EXTENDED_BOTTOM: DialKeyDef[] = [
  { label: 'D', note: 'A5' },
  { label: 'E', note: 'B5' },
  { label: 'F', note: 'C6' },
]

export function dialKeysForLayout(extended: boolean): DialKeyDef[] {
  if (extended) {
    return [...EXTENDED_TOP, ...STANDARD_KEYS, ...EXTENDED_BOTTOM]
  }
  return STANDARD_KEYS
}

/** Map KeyboardEvent → note for the active layout. */
export function noteFromKeyboardEvent(e: KeyboardEvent, extended: boolean): string | null {
  const code = e.code

  // * / # via Shift+8 / Shift+3 (US) before plain digit map
  if (code === 'Digit8' && e.shiftKey) return 'E5'
  if (code === 'Digit3' && e.shiftKey) return 'G5'
  if (e.key === '*' || e.key === '×') return 'E5'
  if (e.key === '#' || e.key === '♯') return 'G5'

  const digitMap: Record<string, string> = {
    Digit1: 'C4',
    Digit2: 'D4',
    Digit3: 'E4',
    Digit4: 'F4',
    Digit5: 'G4',
    Digit6: 'A4',
    Digit7: 'B4',
    Digit8: 'C5',
    Digit9: 'D5',
    Digit0: 'F5',
    Numpad1: 'C4',
    Numpad2: 'D4',
    Numpad3: 'E4',
    Numpad4: 'F4',
    Numpad5: 'G4',
    Numpad6: 'A4',
    Numpad7: 'B4',
    Numpad8: 'C5',
    Numpad9: 'D5',
    Numpad0: 'F5',
    NumpadMultiply: 'E5',
  }

  if (code in digitMap) {
    return digitMap[code] ?? null
  }

  if (!extended) return null

  const extendedMap: Record<string, string> = {
    KeyG: 'G3',
    KeyA: 'A3',
    KeyB: 'B3',
    KeyD: 'A5',
    KeyE: 'B5',
    KeyF: 'C6',
  }

  return extendedMap[code] ?? null
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}
