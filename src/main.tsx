import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AudioLines, ArrowUpRight, ChevronDown, ChevronRight, Heart, Headphones, Home, LoaderCircle, Pause, Play, Search, Settings, SkipBack, SkipForward, Volume2, Waves, X } from 'lucide-react';
import catalog from '../research/stations.json';
import './style.css';
import Sounds, { SoundIcon } from './Sounds';
import PlayerSheet from './PlayerSheet';
import SettingsSheet from './SettingsSheet';
import useNowPlaying from './useNowPlaying';
import { soundCatalog, type Sound } from './soundCatalog';

type Station = typeof catalog.stations[number];
type Theme = 'system' | 'light' | 'dark';
const playable = catalog.stations.filter(s => s.streamUrl);
const colors: Record<string, string> = { 'naxi-kids':'naxi', 'radio-s-kids':'radios', 'bravo-kids':'bravo', 'cmc-kids':'cmc', juhuhu:'juhuhu', 'radio-m-kids':'radiom', 'elmag-kids':'elmag' };
function read<T,>(key:string, fallback:T):T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function Mark({station, small=false}:{station:Station, small?:boolean}) { return <div className={`station-art ${colors[station.id]} ${small?'small':''}`} aria-hidden="true"><span className="art-orbit"/>{station.id==='naxi-kids'?<><strong className="naxi-word">naxi<span>kids</span></strong><span className="art-caption">A WORLD OF LITTLE MELODIES</span></>:station.id==='radio-s-kids'?<><strong className="s-word">S<span>KIDS</span></strong><span className="art-caption">SMALL VOICES. BIG JOY.</span></>:station.id==='bravo-kids'?<><strong className="bravo-word">bravo!<span>KIDS</span></strong><span className="art-caption">TURN UP THE HAPPY</span></>:station.id==='cmc-kids'?<><strong className="cmc-word">CMC<span>kids.</span></strong><span className="art-caption">A LITTLE MUSIC, EVERY DAY</span></>:<strong className="other-word">{station.id==='juhuhu'?'juhuhu':station.id==='elmag-kids'?'elmag':'M'}<span>{station.id==='juhuhu'?'RADIO':'KIDS'}</span></strong>}</div> }
function App() {
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [tab,setTab]=useState('home'); const [query,setQuery]=useState(''); const [country,setCountry]=useState('All stations');
 const [favorites,setFavorites]=useState<string[]>(()=>read('radio-favorites',[]));
 const [theme,setTheme]=useState<Theme>(()=>{const t=read<Theme>('radio-theme','system');return ['system','light','dark'].includes(t)?t:'system';});
 const [current,setCurrent]=useState<Station>(playable.find(s=>s.id===read('radio-last','')) || playable[0]);
 const [state,setState]=useState<'idle'|'loading'|'playing'|'paused'|'error'>('idle');
 const [error,setError]=useState(''); const [expanded,setExpanded]=useState(false); const [previewKind,setPreviewKind]=useState<'radio'|'sounds'>('radio');
 const [audioMode,setAudioMode]=useState<'radio'|'sounds'>('radio');
 const [currentSound,setCurrentSound]=useState<Sound>(()=>soundCatalog.find(s=>s.id===read('radio-last-sound','rain'))||soundCatalog[0]);
 const soundSelected=useRef(currentSound); const modeRef=useRef<'radio'|'sounds'>('radio');
 const audio=useRef<HTMLAudioElement>(null); const selected=useRef(current); const playAttempt=useRef(0);
 const isPlaying=state==='playing', loading=state==='loading';
 const nowPlaying=useNowPlaying(current.id,(audioMode==='radio'&&isPlaying)||(expanded&&previewKind==='radio'));
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('radio-theme',JSON.stringify(theme));}catch{}},[theme]);
 useEffect(()=>{try{localStorage.setItem('radio-favorites',JSON.stringify(favorites));}catch{}},[favorites]);
 useEffect(()=>{if(state!=='loading')return;const timer=window.setTimeout(()=>{playAttempt.current++;audio.current?.pause();setState('error');setError('Playback is taking too long. Tap play to retry, or choose another.');},20000);return()=>window.clearTimeout(timer);},[state,current,currentSound]);
 function openPlayer(kind:'radio'|'sounds'){setPreviewKind(kind);setExpanded(true);}
 function navigate(next:string){setTab(next);window.scrollTo({top:0,behavior:'auto'});}
 function favorite(id:string){setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
 function stop(){playAttempt.current++;audio.current?.pause();setState('paused');}
 function play(station:Station){
  const el=audio.current;if(!el||!station.streamUrl)return;
  modeRef.current='radio';el.loop=false;setAudioMode('radio');
  const attempt=++playAttempt.current;
  selected.current=station;setCurrent(station);setError('');setState('loading');
  el.src=station.streamUrl;el.load();
  try{localStorage.setItem('radio-last',JSON.stringify(station.id));}catch{}
  el.play().catch(()=>{if(attempt===playAttempt.current){setState('error');setError('This station couldn’t connect. Tap play to retry or try another station.');}});
 }
 function playSound(sound:Sound){
  const el=audio.current;if(!el)return;const attempt=++playAttempt.current;
  openPlayer('sounds');modeRef.current='sounds';soundSelected.current=sound;setCurrentSound(sound);setAudioMode('sounds');setError('');setState('loading');
  el.loop=true;const source=`/sounds/${sound.id}.wav?v=2`;
  if(el.getAttribute('src')!==source){el.src=source;el.load();}
  try{localStorage.setItem('radio-last-sound',JSON.stringify(sound.id));}catch{}
  el.play().catch(()=>{if(attempt===playAttempt.current){setState('error');setError('Couldn’t play this sound. Tap play to retry.');}});
 }
 function toggle(){if(isPlaying||loading)stop();else if(modeRef.current==='sounds')playSound(soundSelected.current);else play(selected.current);}
 function step(direction:number){const idx=playable.findIndex(s=>s.id===selected.current.id);play(playable[(idx+direction+playable.length)%playable.length]);}
 useEffect(()=>{
  if(!('mediaSession' in navigator))return;
  const session=navigator.mediaSession;
  if(audioMode==='sounds'){
   session.metadata=new MediaMetadata({title:currentSound.name,artist:'Ambient sounds',album:'Radio · Sounds'});session.playbackState=isPlaying?'playing':'paused';
   const actions:[MediaSessionAction,MediaSessionActionHandler|null][]=[['play',()=>playSound(soundSelected.current)],['pause',stop],['stop',stop],['previoustrack',null],['nexttrack',null]];
   actions.forEach(([action,handler])=>{try{session.setActionHandler(action,handler);}catch{}});
   return ()=>actions.forEach(([action])=>{try{session.setActionHandler(action,null);}catch{}});
  }
  session.metadata=new MediaMetadata({title:nowPlaying.track?.title||current.name,artist:nowPlaying.track?.artist||current.country,album:current.name});
  session.playbackState=isPlaying?'playing':'paused';
  const actions:[MediaSessionAction,()=>void][]=[['play',()=>play(selected.current)],['pause',stop],['stop',stop],['previoustrack',()=>step(-1)],['nexttrack',()=>step(1)]];
  actions.forEach(([action,handler])=>{try{session.setActionHandler(action,handler);}catch{}});
  return ()=>{actions.forEach(([action])=>{try{session.setActionHandler(action,null);}catch{}});};
 },[current,currentSound,isPlaying,audioMode,nowPlaying.track]);
 const filtered=playable.filter(s=>(tab!=='favorites'||favorites.includes(s.id))&&(country==='All stations'||s.country===country)&&s.name.toLowerCase().includes(query.toLowerCase()));
 const buttonIcon=loading?<LoaderCircle className="spin" size={22}/>:isPlaying?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>;
 return <div className="app-shell">
  <audio ref={audio} preload="none" playsInline onPlaying={()=>{setState('playing');setError('');}} onPause={()=>setState(s=>s==='error'?'error':'paused')} onWaiting={()=>setState(s=>s==='paused'||s==='idle'?s:'loading')} onError={()=>{if(audio.current?.getAttribute('src')){setState('error');setError('This audio is unavailable right now. Try again or choose another.');}}}/>
  <aside className="sidebar" inert={expanded||settingsOpen}><a className="brand" href="#" onClick={e=>{e.preventDefault();setTab('home');}}><span className="brand-icon"><AudioLines size={24}/></span>radio<span className="brand-dot">.</span></a><nav aria-label="Main navigation">{[['home','Listen',Home],['favorites','Favorites',Heart],['sounds','Sounds',Waves]].map(([id,label,Icon])=><button key={String(id)} className={tab===id?'active':''} onClick={()=>navigate(String(id))}><Icon size={20}/><span>{String(label)}</span>{id==='favorites'&&favorites.length>0&&<small>{favorites.length}</small>}</button>)}</nav></aside>
  <main inert={expanded||settingsOpen}>
   <header className="topbar"><span className="mobile-brand"><AudioLines size={20}/> radio.</span><button className="settings-trigger" aria-label="Settings" aria-haspopup="dialog" aria-expanded={settingsOpen} onClick={()=>setSettingsOpen(true)}><Settings size={21}/></button></header>
   {tab==='sounds'?<Sounds currentSound={currentSound} isPlaying={audioMode==='sounds'&&isPlaying} loading={audioMode==='sounds'&&loading} onPlay={playSound} onPause={stop}/>:<>
   <section className="page-heading"><div><h1>{tab==='favorites'?'Your favorites':'Radio stations'}</h1><p className="intro">{tab==='favorites'?'The stations you love, all together':'Browse and listen'}</p></div></section>
   <section className="station-section">
    <div className="browse-controls"><div className="filters" aria-label="Filter by country">{['All stations', ...new Set(playable.map(station=>station.country))].map(c=><button aria-pressed={country===c} key={c} className={country===c?'selected':''} onClick={()=>setCountry(c)}>{c}</button>)}</div><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a station" aria-label="Find a station"/>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><X size={14}/></button>}</label></div>
    <div className="station-grid">{filtered.map(s=><article className={`station-card ${audioMode==='radio'&&current.id===s.id&&(isPlaying||loading)?'tuned':''}`} key={s.id}><div className="art-wrap"><button className="art-button" aria-label={`${audioMode==='radio'&&current.id===s.id&&(isPlaying||loading)?'Pause':'Play'} ${s.name}`} onClick={()=>audioMode==='radio'&&current.id===s.id&&(isPlaying||loading)?stop():play(s)}><Mark station={s}/><span className="card-play">{audioMode==='radio'&&current.id===s.id&&loading?<LoaderCircle size={20} className="spin"/>:audioMode==='radio'&&current.id===s.id&&isPlaying?<Pause size={20} fill="currentColor"/>:<Play size={20} fill="currentColor"/>}</span>{audioMode==='radio'&&current.id===s.id&&isPlaying&&<span className="on-air"><AudioLines size={14}/> ON AIR</span>}</button><button className={`favorite ${favorites.includes(s.id)?'saved':''}`} aria-label={`${favorites.includes(s.id)?'Remove':'Save'} ${s.name} ${favorites.includes(s.id)?'from':'to'} favorites`} aria-pressed={favorites.includes(s.id)} onClick={()=>favorite(s.id)}><Heart size={17} fill={favorites.includes(s.id)?'currentColor':'none'}/></button></div><div className="card-meta"><div><h3>{s.name}</h3><p>{s.country}<span>·</span>Kids & family</p></div><span className="card-live">LIVE</span></div></article>)}</div>
    {filtered.length===0&&<div className="empty-state"><Heart size={28}/><h3>{tab==='favorites'&&!favorites.length?'No favorites yet':'No stations found'}</h3><p>{tab==='favorites'&&!favorites.length?'Tap a heart to save a station':'Try another search or country'}</p><button onClick={()=>{setTab('home');setCountry('All stations');setQuery('');}}>Explore stations <ChevronRight size={15}/></button></div>}
   </section>

   </>}
  </main>
  <div className="bottom-dock" inert={expanded||settingsOpen}>{(audioMode==='sounds'||(tab==='sounds'&&!isPlaying&&!loading))?<section className="mini-player sound-mini" aria-label="Ambient sound player"><button className="now-playing" onClick={()=>openPlayer('sounds')} aria-label="Open sound player"><span className="mix-mini-icon"><Waves size={24}/></span><span><strong>{currentSound.name}</strong><small>{audioMode==='sounds'&&loading?'Loading sound…':audioMode==='sounds'&&isPlaying?'Playing on repeat':audioMode==='sounds'&&state==='error'?'Couldn’t play sound':'Paused'}</small></span></button><button className="main-play" aria-label={audioMode==='sounds'&&(isPlaying||loading)?'Pause sound':'Play sound'} onClick={()=>audioMode==='sounds'&&(isPlaying||loading)?stop():playSound(currentSound)}>{audioMode==='sounds'&&loading?<LoaderCircle className="spin" size={22}/>:audioMode==='sounds'&&isPlaying?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>}</button></section>:<section className="mini-player" aria-label="Radio player"><button className="now-playing" onClick={()=>openPlayer('radio')} aria-label={`Open player for ${current.name}`}><Mark station={current} small/><span><strong>{current.name}</strong><small><span className={`live-dot ${isPlaying?'':'inactive'}`}/>{loading?'Connecting…':isPlaying?'Live from '+current.country:state==='error'?'Connection interrupted':state==='paused'?'Paused':'Not playing'}</small></span></button><div className="player-center"><button className="skip" aria-label="Previous station" onClick={()=>step(-1)}><SkipBack size={20} fill="currentColor"/></button><button className="main-play" aria-label={isPlaying||loading?'Pause radio':'Play radio'} onClick={toggle}>{buttonIcon}</button><button className="skip" aria-label="Next station" onClick={()=>step(1)}><SkipForward size={20} fill="currentColor"/></button></div><div className="player-end"><span className="player-live"><span className="live-dot"/> LIVE</span><button aria-label="Favorite current station" aria-pressed={favorites.includes(current.id)} onClick={()=>favorite(current.id)}><Heart size={20} fill={favorites.includes(current.id)?'currentColor':'none'}/></button><Volume2 size={19}/></div></section>}{error&&<div className="error-banner" role="alert">{error}</div>}<nav className="mobile-nav" aria-label="Mobile navigation">{[['home','Listen',Home],['favorites','Favorites',Heart],['sounds','Sounds',Waves]].map(([id,label,Icon])=><button key={String(id)} className={tab===id?'active':''} onClick={()=>navigate(String(id))}><Icon size={21}/><span>{String(label)}</span></button>)}</nav></div>
  {settingsOpen&&<SettingsSheet theme={theme} onThemeChange={setTheme} onClose={()=>setSettingsOpen(false)}/>}
  {expanded&&<PlayerSheet title={previewKind==='sounds'?currentSound.name:current.name} subtitle={previewKind==='sounds'?currentSound.description:`${current.country} · Kids & family`}
   art={previewKind==='sounds'?<div className={`sound-player-art sound-${currentSound.id}`}><span className="sound-symbol"><SoundIcon id={currentSound.id}/></span></div>:<Mark station={current}/>}
   playing={previewKind===audioMode&&isPlaying} loading={previewKind===audioMode&&loading}
   status={previewKind!==audioMode?'Ready to play':loading?'Connecting…':state==='error'?error:isPlaying?(previewKind==='sounds'?'Playing on repeat':'Listening live'):'Paused'}
   details={previewKind==='radio'?<div className="track-details">{nowPlaying.track?<><span className="track-label">ON AIR</span><h3>{nowPlaying.track.title}</h3><p>{nowPlaying.track.artist}</p>{nowPlaying.track.program&&<p>{nowPlaying.track.program}</p>}</>:<p className="track-unavailable">{nowPlaying.loading?'Checking song information…':'Song information is unavailable for this station right now'}</p>}<small>{current.bitrateKbps} kbps · {current.contentType==='audio/aacp'?'AAC':'MP3'} · Live radio</small></div>:undefined}
   onClose={()=>setExpanded(false)} onToggle={()=>previewKind===audioMode&&(isPlaying||loading)?stop():previewKind==='sounds'?playSound(currentSound):play(current)}
   onPrevious={previewKind==='radio'?()=>step(-1):undefined} onNext={previewKind==='radio'?()=>step(1):undefined}
   favorite={previewKind==='radio'?<button aria-label="Favorite station" aria-pressed={favorites.includes(current.id)} onClick={()=>favorite(current.id)}><Heart size={24} fill={favorites.includes(current.id)?'currentColor':'none'}/></button>:undefined}
   website={previewKind==='radio'?current.website:undefined}/>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
