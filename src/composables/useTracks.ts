import { ref, onUnmounted } from 'vue'
import { liveQuery } from 'dexie'
import type { RecordedEvent } from '@/composables/useRecorder'
import { DEFAULT_INSTRUMENT, type InstrumentId } from '@/instruments'
import {
  db,
  addTrack,
  removeTrack,
  listTracksForExport,
  buildTracksExport,
  parseTracksExport,
  importTracksPayload,
  type Track,
  type TracksExportPayload,
} from '@/db/dialPianoDb'

export type { Track, TracksExportPayload } from '@/db/dialPianoDb'

export function useTracks() {
  const tracks = ref<Track[]>([])

  const subscription = liveQuery(() =>
    db.tracks.orderBy('createdAt').reverse().toArray(),
  ).subscribe({
    next(rows) {
      tracks.value = rows
    },
    error(err) {
      console.error('[DialPiano] tracks liveQuery failed', err)
    },
  })

  onUnmounted(() => {
    subscription.unsubscribe()
  })

  async function saveTrack(
    name: string,
    events: readonly RecordedEvent[],
    instrumentId: InstrumentId = DEFAULT_INSTRUMENT,
  ): Promise<void> {
    const trimmed = name.trim()
    const count = await db.tracks.count()
    const resolvedName = trimmed || `Track ${count + 1}`
    await addTrack({
      name: resolvedName,
      createdAt: Date.now(),
      instrumentId,
      events: [...events],
    })
  }

  async function deleteTrack(id: string): Promise<void> {
    await removeTrack(id)
  }

  function getTrack(id: string): Track | undefined {
    return tracks.value.find((t) => t.id === id)
  }

  async function exportTracks(ids?: readonly string[]): Promise<TracksExportPayload> {
    const rows = await listTracksForExport(ids)
    return buildTracksExport(rows)
  }

  async function importFromJson(raw: unknown): Promise<number> {
    const payload = parseTracksExport(raw)
    return importTracksPayload(payload)
  }

  return { tracks, saveTrack, deleteTrack, getTrack, exportTracks, importFromJson }
}
