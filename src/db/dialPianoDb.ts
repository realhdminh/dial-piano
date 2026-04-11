import Dexie, { type EntityTable } from 'dexie'
import type { RecordedEvent } from '@/composables/useRecorder'

/** Persisted recording row (IndexedDB). */
export interface Track {
  id: string
  name: string
  createdAt: number
  events: RecordedEvent[]
}

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

export async function addTrack(row: Omit<Track, 'id'> & { id?: string }): Promise<string> {
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
  await db.tracks.delete(id)
}
