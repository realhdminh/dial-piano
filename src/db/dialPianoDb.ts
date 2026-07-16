import Dexie, { type EntityTable } from 'dexie'
import type { RecordedEvent } from '@/composables/useRecorder'
import { DEFAULT_INSTRUMENT, INSTRUMENTS, type InstrumentId } from '@/instruments'

/** Persisted recording row (IndexedDB). */
export interface Track {
  id: string
  name: string
  createdAt: number
  instrumentId: InstrumentId
  events: RecordedEvent[]
}

export const TRACKS_EXPORT_FORMAT = 'dial-piano-tracks' as const
export const TRACKS_EXPORT_VERSION = 1 as const

export interface TracksExportPayload {
  format: typeof TRACKS_EXPORT_FORMAT
  version: typeof TRACKS_EXPORT_VERSION
  exportedAt: number
  tracks: Array<{
    name: string
    createdAt: number
    instrumentId: InstrumentId
    events: RecordedEvent[]
  }>
}

/** IndexedDB structured clone rejects Vue readonly/proxy objects — strip to plain POJOs. */
function cloneEventsForIdb(events: readonly RecordedEvent[]): RecordedEvent[] {
  return events.map((e) => ({
    note: e.note,
    time: e.time,
    type: e.type,
  }))
}

function isInstrumentId(value: unknown): value is InstrumentId {
  return typeof value === 'string' && value in INSTRUMENTS
}

function isRecordedEvent(value: unknown): value is RecordedEvent {
  if (!value || typeof value !== 'object') return false
  const e = value as RecordedEvent
  return (
    typeof e.note === 'string' &&
    typeof e.time === 'number' &&
    (e.type === 'attack' || e.type === 'release')
  )
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

export async function listTracksForExport(ids?: readonly string[]): Promise<Track[]> {
  if (ids && ids.length > 0) {
    const rows = await db.tracks.bulkGet([...ids])
    return rows.filter((t): t is Track => t != null)
  }
  return db.tracks.orderBy('createdAt').toArray()
}

export function buildTracksExport(tracks: readonly Track[]): TracksExportPayload {
  return {
    format: TRACKS_EXPORT_FORMAT,
    version: TRACKS_EXPORT_VERSION,
    exportedAt: Date.now(),
    tracks: tracks.map((t) => ({
      name: t.name,
      createdAt: t.createdAt,
      instrumentId: t.instrumentId,
      events: cloneEventsForIdb(t.events),
    })),
  }
}

export function parseTracksExport(raw: unknown): TracksExportPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid export file')
  }
  const data = raw as Partial<TracksExportPayload>
  if (data.format !== TRACKS_EXPORT_FORMAT) {
    throw new Error('Not a dial-piano tracks export')
  }
  if (data.version !== TRACKS_EXPORT_VERSION) {
    throw new Error(`Unsupported export version: ${String(data.version)}`)
  }
  if (!Array.isArray(data.tracks)) {
    throw new Error('Export missing tracks array')
  }

  const tracks = data.tracks.map((t, i) => {
    if (!t || typeof t !== 'object') {
      throw new Error(`Invalid track at index ${i}`)
    }
    const name = typeof t.name === 'string' ? t.name : `Imported ${i + 1}`
    const createdAt = typeof t.createdAt === 'number' ? t.createdAt : Date.now()
    const instrumentId = isInstrumentId(t.instrumentId) ? t.instrumentId : DEFAULT_INSTRUMENT
    if (!Array.isArray(t.events) || !t.events.every(isRecordedEvent)) {
      throw new Error(`Invalid events on track "${name}"`)
    }
    return {
      name,
      createdAt,
      instrumentId,
      events: cloneEventsForIdb(t.events),
    }
  })

  return {
    format: TRACKS_EXPORT_FORMAT,
    version: TRACKS_EXPORT_VERSION,
    exportedAt: typeof data.exportedAt === 'number' ? data.exportedAt : Date.now(),
    tracks,
  }
}

/** Import tracks with fresh IDs (never overwrite existing rows). */
export async function importTracksPayload(payload: TracksExportPayload): Promise<number> {
  if (payload.tracks.length === 0) return 0
  await db.transaction('rw', db.tracks, async () => {
    for (const t of payload.tracks) {
      await addTrack({
        name: t.name,
        createdAt: t.createdAt,
        instrumentId: t.instrumentId,
        events: t.events,
      })
    }
  })
  return payload.tracks.length
}
