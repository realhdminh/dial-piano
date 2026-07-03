import Dexie, { type EntityTable } from 'dexie'
import type { RecordedEvent } from '@/composables/useRecorder'
import { DEFAULT_INSTRUMENT, type InstrumentId } from '@/instruments'

/** Persisted recording row (IndexedDB). */
export interface Track {
  id: string
  name: string
  createdAt: number
  instrumentId: InstrumentId
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
    this.version(2)
      .stores({
        tracks: 'id, createdAt, instrumentId',
      })
      .upgrade(async (tx) => {
        await tx
          .table('tracks')
          .toCollection()
          .modify((track: Track & { instrumentId?: InstrumentId }) => {
            if (!track.instrumentId) {
              track.instrumentId = DEFAULT_INSTRUMENT
            }
          })
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
    instrumentId: row.instrumentId,
    events: cloneEventsForIdb(row.events),
  })
  return id
}

export async function removeTrack(id: string): Promise<void> {
  await db.tracks.delete(id)
}
