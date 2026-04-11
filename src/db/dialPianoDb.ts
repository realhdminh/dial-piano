import Dexie, { type EntityTable } from 'dexie'
import type { RecordedEvent } from '@/composables/useRecorder'

/** Persisted recording row (IndexedDB). */
export interface Track {
  id: string
  name: string
  createdAt: number
  events: RecordedEvent[]
}

const LEGACY_LOCALSTORAGE_KEY = 'dial-piano-tracks'

/** IndexedDB structured clone rejects Vue readonly/proxy objects — strip to plain POJOs. */
function cloneEventsForIdb(events: readonly RecordedEvent[]): RecordedEvent[] {
  return events.map((e) => ({
    note: e.note,
    time: e.time,
    type: e.type,
  }))
}

class DialPianoDB extends Dexie {
  tracks!: EntityTable<Track, 'id'>

  constructor() {
    super('dial-piano')
    this.version(1).stores({
      tracks: 'id, createdAt',
    })
  }
}

/** Single app-wide DB instance (Dexie skill: one singleton). */
export const db = new DialPianoDB()

/**
 * One-time import from legacy `localStorage` JSON, then remove the key.
 * Idempotent: skips if IndexedDB already has rows.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  const raw = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY)
  if (!raw) return

  const existingCount = await db.tracks.count()
  if (existingCount > 0) {
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY)
    return
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return

    const rows = parsed.filter(
      (row): row is Track =>
        row !== null &&
        typeof row === 'object' &&
        typeof (row as Track).id === 'string' &&
        typeof (row as Track).name === 'string' &&
        typeof (row as Track).createdAt === 'number' &&
        Array.isArray((row as Track).events),
    )

    if (rows.length > 0) {
      await db.tracks.bulkAdd(rows)
    }
  } catch {
    /* ignore corrupt legacy payload */
  } finally {
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY)
  }
}

let migratePromise: Promise<void> | null = null

/** Await before writes if you need migration finished first; safe to call multiple times. */
export function ensureDialPianoDbReady(): Promise<void> {
  migratePromise ??= migrateFromLocalStorage()
  return migratePromise
}

export async function addTrack(row: Omit<Track, 'id'> & { id?: string }): Promise<string> {
  await ensureDialPianoDbReady()
  const id = row.id ?? crypto.randomUUID()
  await db.tracks.add({
    id,
    name: row.name,
    createdAt: row.createdAt,
    events: cloneEventsForIdb(row.events),
  })
  return id
}

export async function removeTrack(id: string): Promise<void> {
  await ensureDialPianoDbReady()
  await db.tracks.delete(id)
}

export async function listTracksByNewest(): Promise<Track[]> {
  await ensureDialPianoDbReady()
  return db.tracks.orderBy('createdAt').reverse().toArray()
}
