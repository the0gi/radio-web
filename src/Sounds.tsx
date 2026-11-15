import { Bird, CloudRain, Coffee, Flame, Heart, LoaderCircle, Plane, Play, Pause, TreePine, Waves } from 'lucide-react';
import { soundCatalog, type Sound, type SoundId } from './soundCatalog';
import { getSoundArtworkStyle } from './artwork';
import './soundArtwork.css';
const icons={rain:CloudRain,fire:Flame,airplane:Plane,birds:Bird,noise:Waves,cafe:Coffee,waves:Waves,nature:TreePine};
export function SoundIcon({id}:{id:SoundId}){const Icon=icons[id];return <Icon size={30} strokeWidth={1.4}/>;}
type SoundGridProps={currentSound:Sound;isPlaying:boolean;loading:boolean;onPlay:(sound:Sound)=>void;onPause:()=>void;favorites:string[];onFavorite:(id:string)=>void;sounds?:readonly Sound[]};
export function SoundGrid({currentSound,isPlaying,loading,onPlay,onPause,favorites,onFavorite,sounds=soundCatalog}:SoundGridProps){
 return <div className="sound-grid">{sounds.map(sound=>{const active=currentSound.id===sound.id&&(isPlaying||loading);const saved=favorites.includes(sound.id);return <article className={`sound-card sound-${sound.id} ${active?'enabled':''}`} key={sound.id} style={getSoundArtworkStyle(sound.id)}>
  <button className="sound-toggle" aria-label={`${active?'Pause':'Play'} ${sound.name}`} aria-pressed={active} onClick={()=>active?onPause():onPlay(sound)}><span className="sound-symbol"><SoundIcon id={sound.id}/></span><span className="sound-check">{active&&loading?<LoaderCircle size={13} className="spin"/>:active?<Pause size={12} fill="currentColor"/>:<Play size={12} fill="currentColor"/>}</span><strong>{sound.name}</strong><small>{sound.description}</small></button>
  <button className={`sound-favorite ${saved?'saved':''}`} aria-label={`${saved?'Remove':'Save'} ${sound.name} ${saved?'from':'to'} favorites`} aria-pressed={saved} onClick={()=>onFavorite(sound.id)}><Heart size={18} fill={saved?'currentColor':'none'}/></button>
 </article>;})}</div>;
}
export default function Sounds(props:SoundGridProps){
 return <section className="sounds-page">
 <SoundGrid {...props}/>
 <details className="sound-credits"><summary>Sound credits</summary><p>Field recordings released under CC0, edited for continuous loops</p>{soundCatalog.map(sound=><p key={sound.id}>{sound.name} — {sound.source?<a href={sound.source} target="_blank" rel="noreferrer">{sound.author}</a>:sound.author}</p>)}</details>
 </section>;
}
