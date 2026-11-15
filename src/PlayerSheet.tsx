import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronDown, LoaderCircle, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import './playerMotion.css';

export type PlayerOriginRect = { left: number; top: number; width: number; height: number };
type Props={tintStyle?:CSSProperties;originRect?:PlayerOriginRect;itemKind?:'station'|'sound';title:string;subtitle:string;art:ReactNode;playing:boolean;loading:boolean;status:string;details?:ReactNode;onClose:()=>void;onToggle:()=>void;onPrevious?:()=>void;onNext?:()=>void;favorite?:ReactNode;website?:string};
const duration=250;
const easing='cubic-bezier(0.16, 1, 0.3, 1)';

export default function PlayerSheet({tintStyle,originRect,itemKind='station',title,subtitle,art,playing,loading,status,details,onClose,onToggle,onPrevious,onNext,favorite,website}:Props){
 const close=useRef<HTMLButtonElement>(null);
 const backdrop=useRef<HTMLDivElement>(null);
 const dialog=useRef<HTMLElement>(null);
 const artwork=useRef<HTMLDivElement>(null);
 const flight=useRef<HTMLDivElement>(null);
 const animations=useRef<Animation[]>([]);
 const closing=useRef(false);
 const mounted=useRef(false);
 const origin=useRef(originRect);
 const restoreFocus=useRef<HTMLElement|null>(null);
 const restoreFocusFrame=useRef<number|undefined>(undefined);
 const closeCallback=useRef(onClose);
 closeCallback.current=onClose;

 function reducedMotion(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 function animate(element:HTMLElement|null,keyframes:Keyframe[]){
  if(!element)return undefined;
  const animation=element.animate(keyframes,{duration,easing,fill:'both'});
  animations.current.push(animation);
  return animation;
 }
 function resetAnimations(){animations.current.forEach(animation=>animation.cancel());animations.current=[];}
 function artworkFlight(reverse=false){
  const target=artwork.current,copy=flight.current,start=origin.current;
  if(!target||!copy||!start||start.width<=0||start.height<=0)return undefined;
  const end=target.getBoundingClientRect();
  if(end.width<=0||end.height<=0)return undefined;
  Object.assign(copy.style,{display:'block',left:`${end.left}px`,top:`${end.top}px`,width:`${end.width}px`,height:`${end.height}px`});
  target.style.visibility='hidden';
  // Both covers are square. One uniform scale keeps the artwork and type undistorted.
  const scale=start.width/end.width;
  const transform=`translate(${start.left-end.left}px, ${start.top-end.top}px) scale(${scale})`;
  const keyframes=[{transform,borderRadius:`${11/scale}px`},{transform:'translate(0, 0) scale(1)',borderRadius:'22px'}];
  return animate(copy,reverse?[...keyframes].reverse():keyframes);
 }
 async function requestClose(){
  if(closing.current)return;
  closing.current=true;
  resetAnimations();
  if(artwork.current)artwork.current.style.visibility='visible';
  if(flight.current)flight.current.style.display='none';
  if(reducedMotion()){closeCallback.current();return;}
  const moving=artworkFlight(true);
  const fading=animate(backdrop.current,[{opacity:1},{opacity:0}]);
  animate(dialog.current,[{transform:'translateY(0) scale(1)'},{transform:'translateY(12px) scale(.98)'}]);
  await Promise.all([moving?.finished.catch(()=>{}),fading?.finished.catch(()=>{})]);
  if(mounted.current)closeCallback.current();
 }

 useLayoutEffect(()=>{
  // StrictMode replays this setup after cleanup; keep the original trigger and
  // cancel its pending restoration so it cannot steal focus from the open dialog.
  if(restoreFocusFrame.current!==undefined){
   window.cancelAnimationFrame(restoreFocusFrame.current);
   restoreFocusFrame.current=undefined;
  }
  mounted.current=true;
  closing.current=false;
  if(!restoreFocus.current){
   const active=document.activeElement;
   restoreFocus.current=active instanceof HTMLElement&&active!==document.body&&!dialog.current?.contains(active)
    ?active:document.querySelector<HTMLElement>('.mini-player .now-playing');
  }
  const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  close.current?.focus({preventScroll:true});
  if(!reducedMotion()){
   const moving=artworkFlight();
   animate(backdrop.current,[{opacity:0},{opacity:1}]);
   animate(dialog.current,[{transform:'translateY(12px) scale(.98)'},{transform:'translateY(0) scale(1)'}]);
   if(moving)void moving.finished.then(()=>{
    if(!mounted.current||closing.current)return;
    if(artwork.current)artwork.current.style.visibility='visible';
    if(flight.current)flight.current.style.display='none';
   }).catch(()=>{});
  }
  return()=>{
   mounted.current=false;
   resetAnimations();
   if(artwork.current)artwork.current.style.visibility='visible';
   if(flight.current)flight.current.style.display='none';
   document.body.style.overflow=overflow;
   // Parent removes `inert` from the dock in the same commit. Restore focus
   // on the next frame, after that update has made the trigger focusable again.
   restoreFocusFrame.current=window.requestAnimationFrame(()=>{
    restoreFocusFrame.current=undefined;
    if(!mounted.current&&restoreFocus.current?.isConnected)restoreFocus.current.focus({preventScroll:true});
   });
  };
 },[]);

 return createPortal(<><div ref={backdrop} className="modal-backdrop player-modal-backdrop" onClick={()=>void requestClose()}><section ref={dialog} className="full-player" style={tintStyle} role="dialog" aria-modal="true" aria-labelledby="player-title" onClick={event=>event.stopPropagation()} onKeyDown={event=>{
  if(event.key==='Escape'){event.preventDefault();void requestClose();return;}
  if(event.key==='Tab'){const controls=event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]');const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
 }}><header><span>NOW PLAYING</span><button ref={close} aria-label="Close player" onClick={()=>void requestClose()}><ChevronDown size={24}/></button></header>
 <div ref={artwork} className="player-artwork">{art}</div><div className="full-title"><div><h2 id="player-title">{title}</h2><p>{subtitle}</p></div>{favorite}</div>
 {details}<p className="playback-status" role="status">{status}</p><div className="full-controls">
 {onPrevious&&<button aria-label={`Previous ${itemKind}`} onClick={onPrevious}><SkipBack size={28} fill="currentColor"/></button>}
 <button className="main-play" aria-label={playing||loading?'Pause playback':'Play playback'} onClick={onToggle}>{loading?<LoaderCircle className="spin" size={22}/>:playing?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>}</button>
 {onNext&&<button aria-label={`Next ${itemKind}`} onClick={onNext}><SkipForward size={28} fill="currentColor"/></button>}
 </div><p className="quiet">Use your device’s buttons to adjust the volume</p>
 {website&&<a href={website} target="_blank" rel="noreferrer">Visit station website <ArrowUpRight size={14}/></a>}
 </section></div><div ref={flight} className="player-artwork-flight" aria-hidden="true" inert>{art}</div></>,document.body);
}
