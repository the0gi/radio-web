import { useEffect, useState } from 'react';
import { playableStations } from './stationCatalog';
import { soundCatalog } from './soundCatalog';

export const RECENT_PLAYS_KEY = 'play-recent-plays-v1';
const LIMIT = 9;
export type RecentPlay = { kind: 'radio' | 'sounds'; id: string };

export function parseRecentPlays(value: unknown): RecentPlay[] {
 if (!Array.isArray(value)) return [];
 const seen = new Set<string>();
 return value.filter((item): item is RecentPlay => {
  if (!item || typeof item !== 'object') return false;
  const catalog = item.kind === 'radio' ? playableStations : item.kind === 'sounds' ? soundCatalog : [];
  const key = `${item.kind}:${item.id}`;
  if (!catalog.some(entry => entry.id === item.id) || seen.has(key)) return false;
  seen.add(key);
  return true;
 }).slice(0, LIMIT).map(({ kind, id }) => ({ kind, id }));
}

export default function useRecentPlays() {
 const [recent, setRecent] = useState<RecentPlay[]>(() => {
  try { return parseRecentPlays(JSON.parse(localStorage.getItem(RECENT_PLAYS_KEY) || '[]')); }
  catch { return []; }
 });
 useEffect(() => {
  try { localStorage.setItem(RECENT_PLAYS_KEY, JSON.stringify(recent)); } catch { /* Storage is optional. */ }
 }, [recent]);
 function rememberPlayed(kind: RecentPlay['kind'], id: string) {
  setRecent(previous => parseRecentPlays([{ kind, id }, ...previous]));
 }
 return { recent, rememberPlayed };
}
