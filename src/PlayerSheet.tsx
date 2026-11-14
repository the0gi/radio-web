import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronDown, LoaderCircle, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

type Props={title:string;subtitle:string;art:ReactNode;playing:boolean;loading:boolean;status:string;details?:ReactNode;onClose:()=>void;onToggle:()=>void;onPrevious?:()=>void;onNext?:()=>void;favorite?:ReactNode;website?:string};
export default function PlayerSheet({title,subtitle,art,playing,loading,status,details,onClose,onToggle,onPrevious,onNext,favorite,website}:Props){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();return()=>{document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 return createPortal(<div className="modal-backdrop" onClick={onClose}><section className="full-player" role="dialog" aria-modal="true" aria-labelledby="player-title" onClick={event=>event.stopPropagation()} onKeyDown={event=>{
  if(event.key==='Escape'){onClose();return;}
  if(event.key==='Tab'){const controls=event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]');const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
 }}><header><span>NOW PLAYING</span><button ref={close} aria-label="Close player" onClick={onClose}><ChevronDown size={24}/></button></header>
 {art}<div className="full-title"><div><h2 id="player-title">{title}</h2><p>{subtitle}</p></div>{favorite}</div>
 {details}<p className="playback-status" role="status">{status}</p><div className="full-controls">
 {onPrevious&&<button aria-label="Previous station" onClick={onPrevious}><SkipBack size={28} fill="currentColor"/></button>}
 <button className="main-play" aria-label={playing||loading?'Pause playback':'Play playback'} onClick={onToggle}>{loading?<LoaderCircle className="spin" size={22}/>:playing?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>}</button>
 {onNext&&<button aria-label="Next station" onClick={onNext}><SkipForward size={28} fill="currentColor"/></button>}
 </div><p className="quiet">Use your device’s buttons to adjust the volume</p>
 {website&&<a href={website} target="_blank" rel="noreferrer">Visit station website <ArrowUpRight size={14}/></a>}
 </section></div>,document.body);
}
