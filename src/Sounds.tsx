import { Bird, CloudRain, Coffee, Flame, LoaderCircle, Plane, Play, Pause, Waves } from 'lucide-react';
import { soundCatalog, type Sound, type SoundId } from './soundCatalog';
const icons={rain:CloudRain,fire:Flame,airplane:Plane,birds:Bird,noise:Waves,cafe:Coffee};
export function SoundIcon({id}:{id:SoundId}){const Icon=icons[id];return <Icon size={30} strokeWidth={1.4}/>;}
export default function Sounds({currentSound,isPlaying,loading,onPlay,onPause}:{currentSound:Sound;isPlaying:boolean;loading:boolean;onPlay:(sound:Sound)=>void;onPause:()=>void}){
 return <section className="sounds-page"><div className="page-heading"><div><h1>Sounds</h1><p className="intro">Choose a sound to play on repeat</p></div></div>
 <div className="sound-grid">{soundCatalog.map(sound=>{const active=currentSound.id===sound.id&&(isPlaying||loading);return <article className={`sound-card sound-${sound.id} ${active?'enabled':''}`} key={sound.id}><button className="sound-toggle" aria-label={`${active?'Pause':'Play'} ${sound.name}`} aria-pressed={active} onClick={()=>active?onPause():onPlay(sound)}><span className="sound-symbol"><SoundIcon id={sound.id}/></span><span className="sound-check">{active&&loading?<LoaderCircle size={13} className="spin"/>:active?<Pause size={12} fill="currentColor"/>:<Play size={12} fill="currentColor"/>}</span><strong>{sound.name}</strong><small>{sound.description}</small></button></article>;})}</div>
 <details className="sound-credits"><summary>Sound credits</summary><p>Field recordings released under CC0, edited for continuous loops</p>{soundCatalog.map(sound=><p key={sound.id}>{sound.name} — {sound.source?<a href={sound.source} target="_blank" rel="noreferrer">{sound.author}</a>:sound.author}</p>)}</details>
 </section>;
}
