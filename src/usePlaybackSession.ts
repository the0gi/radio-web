import { useEffect, useRef, useState } from 'react';
import { playableStations } from './stationCatalog';
import { soundCatalog } from './soundCatalog';

export const PLAYBACK_SESSION_KEY = 'radio-playback-session-v1';
export const PLAYBACK_RETENTION_MS = 12 * 60 * 60 * 1000;
type PlaybackKind = 'radio' | 'sounds';
type PlaybackSession = { kind: PlaybackKind; id: string; lastActiveAt: number };

export function parsePlaybackSession(value: unknown, now = Date.now()): PlaybackSession | null {
 if (!value || typeof value !== 'object') return null;
 const session = value as Partial<PlaybackSession>;
 if (typeof session.lastActiveAt !== 'number' || !Number.isFinite(session.lastActiveAt) ||
     session.lastActiveAt > now || now - session.lastActiveAt >= PLAYBACK_RETENTION_MS) return null;
 const catalog = session.kind === 'radio' ? playableStations : session.kind === 'sounds' ? soundCatalog : [];
 if (!catalog.some(item => item.id === session.id)) return null;
 return session as PlaybackSession;
}

function readSession(): PlaybackSession | null {
 try { return parsePlaybackSession(JSON.parse(localStorage.getItem(PLAYBACK_SESSION_KEY) || 'null')); }
 catch { return null; }
}

// Keep the last explicit playback choice, never an automatically selected default.
export default function usePlaybackSession(active: boolean) {
 const [session, setSession] = useState(readSession);
 const latest = useRef(session);
 const wasActive = useRef(false);

 function save(next: PlaybackSession | null) {
  latest.current = next;
  try {
   if (next) localStorage.setItem(PLAYBACK_SESSION_KEY, JSON.stringify(next));
   else localStorage.removeItem(PLAYBACK_SESSION_KEY);
  } catch { /* Playback still works when device storage is unavailable. */ }
 }

 function remember(kind: PlaybackKind, id: string) {
  const next = { kind, id, lastActiveAt: Date.now() };
  save(next);
  setSession(next);
 }

 useEffect(() => {
  function touch() {
   if (latest.current) save({ ...latest.current, lastActiveAt: Date.now() });
  }
  // Start the inactivity window when playback stops, including native interruptions.
  if (active || wasActive.current) touch();
  wasActive.current = active;
  function checkExpiry() {
   if (active) { touch(); return; }
   if (latest.current && Date.now() - latest.current.lastActiveAt >= PLAYBACK_RETENTION_MS) {
    save(null);
    setSession(null);
   }
  }
  checkExpiry();
  const heartbeat = active ? window.setInterval(touch, 30000) : undefined;
  const expiry = !active && latest.current ? window.setTimeout(checkExpiry,
   Math.max(0, latest.current.lastActiveAt + PLAYBACK_RETENTION_MS - Date.now())) : undefined;
  function onPageHide() { if (active) touch(); }
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', checkExpiry);
  document.addEventListener('visibilitychange', checkExpiry);
  return () => {
   window.clearInterval(heartbeat);
   window.clearTimeout(expiry);
   window.removeEventListener('pagehide', onPageHide);
   window.removeEventListener('pageshow', checkExpiry);
   document.removeEventListener('visibilitychange', checkExpiry);
  };
 }, [active, session]);

 return { session, remember };
}
