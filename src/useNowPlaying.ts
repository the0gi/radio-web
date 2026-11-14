import { useEffect, useState } from 'react';

export type Track = { title: string; artist: string; program?: string };
const naxiEndpoint = 'https://firestore.googleapis.com/v1/projects/naxiproject/databases/(default)/documents/now_playing/kids';

export function parseNaxiTrack(data: unknown): Track | null {
 try {
  const doc = data as { updateTime?: string; fields?: { now_playing_json?: { stringValue?: string } } };
  const updated = Date.parse(doc.updateTime || '');
  if (!Number.isFinite(updated) || Date.now() - updated > 15 * 60_000) return null;
  const song = JSON.parse(doc.fields?.now_playing_json?.stringValue || '{}').now_playing;
  if (typeof song?.title !== 'string' || !song.title.trim() || typeof song.artist !== 'string' || !song.artist.trim()) return null;
  return { title: song.title.trim(), artist: song.artist.trim(), program: typeof song.showTitle === 'string' ? song.showTitle.trim() : undefined };
 } catch { return null; }
}

export default function useNowPlaying(stationId: string, enabled: boolean) {
 const [result, setResult] = useState<{ stationId: string; track: Track | null; loading: boolean }>({ stationId, track: null, loading: false });
 useEffect(() => {
  if (!enabled || stationId !== 'naxi-kids') { setResult({ stationId, track: null, loading: false }); return; }
  let disposed = false;
  let controller: AbortController | undefined;
  let inFlight = false;
  setResult({ stationId, track: null, loading: true });
  async function refresh() {
   if (document.hidden || inFlight) return;
   inFlight = true;
   controller = new AbortController();
   const timeout = window.setTimeout(() => controller?.abort(), 8_000);
   try {
    const response = await fetch(naxiEndpoint, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error('Metadata unavailable');
    const track = parseNaxiTrack(await response.json());
    if (!disposed) setResult({ stationId, track, loading: false });
   } catch {
    if (!disposed) setResult({ stationId, track: null, loading: false });
   } finally { window.clearTimeout(timeout); inFlight = false; }
  }
  void refresh();
  const timer = window.setInterval(() => void refresh(), 20_000);
  const visibility = () => { if (document.hidden) controller?.abort(); else void refresh(); };
  document.addEventListener('visibilitychange', visibility);
  return () => { disposed = true; controller?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility); };
 }, [stationId, enabled]);
 return result.stationId === stationId ? result : { stationId, track: null, loading: enabled && stationId === 'naxi-kids' };
}
