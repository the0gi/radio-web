import { useEffect, useRef, useState } from 'react';
import './trackLine.css';

type Props = { track: { title: string; artist: string } | null; loading?: boolean };

export default function TrackLine({ track, loading = false }: Props) {
 const viewport = useRef<HTMLParagraphElement>(null);
 const content = useRef<HTMLSpanElement>(null);
 const motion = useRef<Animation | null>(null);
 const paused = useRef(false);
 const [overflowing, setOverflowing] = useState(false);
 const text = track ? `${track.title} · ${track.artist}` : loading ? 'Checking song information…' : 'Song information unavailable';

 useEffect(() => {
  const container = viewport.current;
  const line = content.current;
  if (!container || !line) return;
  let disposed = false;
  let frame = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function measure() {
   if (disposed || !container || !line) return;
   motion.current?.cancel();
   motion.current = null;
   const distance = Math.max(0, line.scrollWidth - container.clientWidth);
   setOverflowing(distance > 1);
   if (!track || distance <= 1 || reducedMotion.matches) return;
   // Read at the beginning and end, then restart from the title on the next cycle.
   const duration = distance / 30 + 4;
   const pauseOffset = 2 / duration;
   motion.current = line.animate([
    { transform: 'translateX(0)', offset: 0 },
    { transform: 'translateX(0)', offset: pauseOffset },
    { transform: `translateX(-${distance}px)`, offset: 1 - pauseOffset },
    { transform: `translateX(-${distance}px)`, offset: 1 },
   ], { duration: duration * 1000, iterations: Infinity, easing: 'linear' });
   if (paused.current) motion.current.pause();
  }
  function scheduleMeasure() {
   window.cancelAnimationFrame(frame);
   frame = window.requestAnimationFrame(measure);
  }
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(container);
  observer.observe(line);
  reducedMotion.addEventListener('change', scheduleMeasure);
  document.fonts?.addEventListener('loadingdone', scheduleMeasure);
  scheduleMeasure();
  return () => {
   disposed = true;
   window.cancelAnimationFrame(frame);
   observer.disconnect();
   reducedMotion.removeEventListener('change', scheduleMeasure);
   document.fonts?.removeEventListener('loadingdone', scheduleMeasure);
   motion.current?.cancel();
   motion.current = null;
  };
 }, [text, track !== null]);

 function pause() { paused.current = true; motion.current?.pause(); }
 function resume() {
  if (viewport.current?.matches(':hover, :focus-within')) return;
  paused.current = false;
  motion.current?.play();
 }

 return <p ref={viewport} className={`track-line ${track ? '' : 'track-line-unavailable'} ${overflowing ? 'track-line-overflowing' : ''}`}
  title={text} tabIndex={track && overflowing ? 0 : undefined}
  onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume}>
  <span ref={content} className="track-line-content">{text}</span>
 </p>;
}
