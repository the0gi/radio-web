import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AudioLines, ArrowLeft, ArrowUpRight, ChevronDown, ChevronRight, Heart, Headphones, LoaderCircle, Pause, Play, Search, Settings, SkipBack, SkipForward, Waves, X } from 'lucide-react';
import { playableStations as playable, stationCategories, type Station } from './stationCatalog';
import './style.css';
import Sounds, { SoundGrid, SoundIcon } from './Sounds';
import PlayerSheet from './PlayerSheet';
import SettingsSheet from './SettingsSheet';
import StationFilters, { StationSearch, type LocationMode } from './StationFilters';
import useNowPlaying from './useNowPlaying';
import Mark from './StationArt';
import { getStationArtworkStyle, getSoundArtworkStyle } from './artwork';
import TrackLine from './TrackLine';
import usePlaybackSession from './usePlaybackSession';
import useRecentPlays from './useRecentPlays';
import { soundCatalog, type Sound } from './soundCatalog';

type Theme = 'system' | 'light' | 'dark';
function read<T,>(key:string, fallback:T):T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function categoryFromHash(){try{const value=decodeURIComponent(window.location.hash.replace(/^#category\//,''));return stationCategories.includes(value)?value:null;}catch{return null;}}
function App() {
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [tab,setTab]=useState('home'); const [query,setQuery]=useState(''); const [countries,setCountries]=useState<string[]>([]);
 const [locationMode,setLocationMode]=useState<LocationMode>('all');
 const [categoryPage,setCategoryPage]=useState<string|null>(categoryFromHash); const [categoryQuery,setCategoryQuery]=useState('');
 const browseScroll=useRef(0); const internalCategory=useRef(false); const lastCategory=useRef<string|null>(null); const categoryTitle=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{function sync(){setCategoryPage(categoryFromHash());setCategoryQuery('');}window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
 useEffect(()=>{if(categoryPage){window.scrollTo(0,0);categoryTitle.current?.focus();}else{window.scrollTo(0,browseScroll.current);if(lastCategory.current){const href=`#category/${encodeURIComponent(lastCategory.current)}`;const link=Array.from(document.querySelectorAll<HTMLAnchorElement>('.category-card')).find(item=>item.getAttribute('href')===href);link?.focus({preventScroll:true});}}},[categoryPage]);
 const [favorites,setFavorites]=useState<string[]>(()=>read('radio-favorites',[]));
 const [soundFavorites,setSoundFavorites]=useState<string[]>(()=>read('radio-sound-favorites',[]));
 const [theme,setTheme]=useState<Theme>(()=>{const t=read<Theme>('radio-theme','system');return ['system','light','dark'].includes(t)?t:'system';});
 const [state,setState]=useState<'idle'|'loading'|'playing'|'paused'|'error'>('idle');
 const {session,remember}=usePlaybackSession(state==='playing'||state==='loading');
 const {recent,rememberPlayed}=useRecentPlays();
 const [current,setCurrent]=useState<Station>(()=>playable.find(s=>session?.kind==='radio'&&s.id===session.id)||playable[0]);
 const [error,setError]=useState(''); const [expanded,setExpanded]=useState(false); const [previewKind,setPreviewKind]=useState<'radio'|'sounds'>('radio');
 const miniArtworkButton=useRef<HTMLButtonElement>(null);
 const [playerOrigin,setPlayerOrigin]=useState<{left:number;top:number;width:number;height:number}>();
 const [audioMode,setAudioMode]=useState<'radio'|'sounds'>(()=>session?.kind||'radio');
 const [currentSound,setCurrentSound]=useState<Sound>(()=>soundCatalog.find(s=>session?.kind==='sounds'&&s.id===session.id)||soundCatalog[0]);
 const soundSelected=useRef(currentSound); const modeRef=useRef<'radio'|'sounds'>(audioMode);
 const audio=useRef<HTMLAudioElement>(null); const selected=useRef(current); const playAttempt=useRef(0);
 const isPlaying=state==='playing', loading=state==='loading';
 const nowPlaying=useNowPlaying(current.id,(audioMode==='radio'&&isPlaying)||(expanded&&previewKind==='radio'));
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('radio-theme',JSON.stringify(theme));}catch{}},[theme]);
 useEffect(()=>{try{localStorage.setItem('radio-favorites',JSON.stringify(favorites));}catch{}},[favorites]);
 useEffect(()=>{try{localStorage.setItem('radio-sound-favorites',JSON.stringify(soundFavorites));}catch{}},[soundFavorites]);
 useEffect(()=>{if(state!=='loading')return;const timer=window.setTimeout(()=>{playAttempt.current++;audio.current?.pause();setState('error');setError('Playback is taking too long. Tap play to retry, or choose another.');},20000);return()=>window.clearTimeout(timer);},[state,current,currentSound]);
 function openPlayer(kind:'radio'|'sounds'){
  miniArtworkButton.current?.focus({preventScroll:true});
  const rect=miniArtworkButton.current?.firstElementChild?.getBoundingClientRect();
  setPlayerOrigin(rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:undefined);
  setPreviewKind(kind);setExpanded(true);
 }
 function navigate(next:string){if(categoryPage){window.history.replaceState(null,'',window.location.pathname+window.location.search);setCategoryPage(null);setCategoryQuery('');}internalCategory.current=false;browseScroll.current=0;setTab(next);window.scrollTo({top:0,behavior:'auto'});}
 function resetFilters(){setCountries([]);setLocationMode('all');setQuery('');}
 function clearCountries(){setCountries([]);setLocationMode('all');}
 function toggleCountry(country:string){const previous=locationMode==='countries'?countries:[];const next=previous.includes(country)?previous.filter(value=>value!==country):[...previous,country];setCountries(next);setLocationMode(next.length?'countries':'all');}
 function openCategory(category:string){lastCategory.current=category;browseScroll.current=window.scrollY;internalCategory.current=true;setCategoryQuery('');window.location.hash=`category/${encodeURIComponent(category)}`;}
 function backFromCategory(){if(internalCategory.current){window.history.back();}else{window.history.replaceState(null,'',window.location.pathname+window.location.search);setCategoryPage(null);setCategoryQuery('');}}
 function favorite(id:string){setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
 function favoriteSound(id:string){setSoundFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
 function stepSound(direction:number){const idx=soundCatalog.findIndex(s=>s.id===soundSelected.current.id);playSound(soundCatalog[(idx+direction+soundCatalog.length)%soundCatalog.length]);}
 function stop(){playAttempt.current++;audio.current?.pause();setState('paused');}
 function play(station:Station){
  const el=audio.current;if(!el||!station.streamUrl)return;
  modeRef.current='radio';el.loop=false;setAudioMode('radio');
  const attempt=++playAttempt.current;
  selected.current=station;setCurrent(station);setError('');setState('loading');
  el.src=station.streamUrl;el.load();
  remember('radio',station.id);
  el.play().catch(()=>{if(attempt===playAttempt.current){setState('error');setError('This station couldn’t connect. Tap play to retry or try another station.');}});
 }
 function playSound(sound:Sound){
  const el=audio.current;if(!el)return;const attempt=++playAttempt.current;
  modeRef.current='sounds';soundSelected.current=sound;setCurrentSound(sound);setAudioMode('sounds');setError('');setState('loading');
  el.loop=true;const source=`/sounds/${sound.id}.wav?v=2`;
  if(el.getAttribute('src')!==source){el.src=source;el.load();}
  remember('sounds',sound.id);
  el.play().catch(()=>{if(attempt===playAttempt.current){setState('error');setError('Couldn’t play this sound. Tap play to retry.');}});
 }
 function toggle(){if(isPlaying||loading)stop();else if(modeRef.current==='sounds')playSound(soundSelected.current);else play(selected.current);}
 function step(direction:number){const idx=playable.findIndex(s=>s.id===selected.current.id);play(playable[(idx+direction+playable.length)%playable.length]);}
 useEffect(()=>{
  if(!('mediaSession' in navigator))return;
  const mediaSession=navigator.mediaSession;
  if(!session){mediaSession.metadata=null;mediaSession.playbackState='none';return;}
  if(audioMode==='sounds'){
   mediaSession.metadata=new MediaMetadata({title:currentSound.name,artist:'Ambient sounds',album:'play. · Sounds'});mediaSession.playbackState=isPlaying?'playing':'paused';
   const actions:[MediaSessionAction,MediaSessionActionHandler|null][]=[['play',()=>playSound(soundSelected.current)],['pause',stop],['stop',stop],['previoustrack',()=>stepSound(-1)],['nexttrack',()=>stepSound(1)]];
   actions.forEach(([action,handler])=>{try{mediaSession.setActionHandler(action,handler);}catch{}});
   return ()=>actions.forEach(([action])=>{try{mediaSession.setActionHandler(action,null);}catch{}});
  }
  mediaSession.metadata=new MediaMetadata({title:nowPlaying.track?.title||current.name,artist:nowPlaying.track?.artist||current.country,album:current.name});
  mediaSession.playbackState=isPlaying?'playing':'paused';
  const actions:[MediaSessionAction,()=>void][]=[['play',()=>play(selected.current)],['pause',stop],['stop',stop],['previoustrack',()=>step(-1)],['nexttrack',()=>step(1)]];
  actions.forEach(([action,handler])=>{try{mediaSession.setActionHandler(action,handler);}catch{}});
  return ()=>{actions.forEach(([action])=>{try{mediaSession.setActionHandler(action,null);}catch{}});};
 },[current,currentSound,isPlaying,audioMode,nowPlaying.track,session]);
 const filtered=playable.filter(s=>categoryPage ? s.category===categoryPage&&s.name.toLocaleLowerCase().includes(categoryQuery.trim().toLocaleLowerCase()) : (locationMode==='all'||(locationMode==='local'?s.countryCode==='RS':countries.includes(s.country)))&&s.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 const buttonIcon=loading?<LoaderCircle className="spin" size={22}/>:isPlaying?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>;
 function renderStationGrid(stations:Station[]){return <div className="station-grid">{stations.map(s=><article className={`station-card ${audioMode==='radio'&&current.id===s.id&&(isPlaying||loading)?'tuned':''}`} key={s.id}><div className="art-wrap"><button className="art-button" aria-label={`${audioMode==='radio'&&current.id===s.id&&(isPlaying||loading)?'Pause':'Play'} ${s.name}`} onClick={()=>audioMode==='radio'&&current.id===s.id&&(isPlaying||loading)?stop():play(s)}><Mark station={s}/><span className="card-play">{audioMode==='radio'&&current.id===s.id&&loading?<LoaderCircle size={20} className="spin"/>:audioMode==='radio'&&current.id===s.id&&isPlaying?<Pause size={20} fill="currentColor"/>:<Play size={20} fill="currentColor"/>}</span>{audioMode==='radio'&&current.id===s.id&&isPlaying&&<span className="on-air"><AudioLines size={14}/> ON AIR</span>}</button><button className={`favorite ${favorites.includes(s.id)?'saved':''}`} aria-label={`${favorites.includes(s.id)?'Remove':'Save'} ${s.name} ${favorites.includes(s.id)?'from':'to'} favorites`} aria-pressed={favorites.includes(s.id)} onClick={()=>favorite(s.id)}><Heart size={17} fill={favorites.includes(s.id)?'currentColor':'none'}/></button></div><div className="card-meta"><div><h3>{s.name}</h3><p>{s.country}<span>·</span>{s.category}</p></div><span className="card-live">LIVE</span></div></article>)}</div>;}
 const soundProps={currentSound,isPlaying:audioMode==='sounds'&&isPlaying,loading:audioMode==='sounds'&&loading,onPlay:playSound,onPause:stop,favorites:soundFavorites,onFavorite:favoriteSound};
 const savedStations=playable.filter(s=>favorites.includes(s.id));
 const savedSounds=soundCatalog.filter(s=>soundFavorites.includes(s.id));
 const currentIsSaved=audioMode==='sounds'?soundFavorites.includes(currentSound.id):favorites.includes(current.id);
 function favoriteCurrent(){if(audioMode==='sounds')favoriteSound(currentSound.id);else favorite(current.id);}
 return <div className={`app-shell ${session?'has-player':''}`}>
  <audio ref={audio} preload="none" playsInline onPlaying={()=>{setState('playing');setError('');rememberPlayed(modeRef.current,modeRef.current==='radio'?selected.current.id:soundSelected.current.id);}} onPause={()=>setState(s=>s==='error'?'error':'paused')} onWaiting={()=>setState(s=>s==='paused'||s==='idle'?s:'loading')} onError={()=>{if(audio.current?.getAttribute('src')){setState('error');setError('This audio is unavailable right now. Try again or choose another.');}}}/>
  <aside className="sidebar" inert={expanded||settingsOpen}><a className="brand" href="#" onClick={e=>{e.preventDefault();navigate('home');}}><span className="brand-icon"><AudioLines size={24}/></span>play<span className="brand-dot">.</span></a><nav aria-label="Main navigation">{[['home','Play',AudioLines],['favorites','Favorites',Heart],['sounds','Sounds',Waves]].map(([id,label,Icon])=><button key={String(id)} className={tab===id?'active':''} onClick={()=>navigate(String(id))}><Icon size={20}/><span>{String(label)}</span>{id==='favorites'&&favorites.length+soundFavorites.length>0&&<small>{favorites.length+soundFavorites.length}</small>}</button>)}</nav></aside>
  <main inert={expanded||settingsOpen}>
   <header className={`topbar ${categoryPage?'category-topbar':''}`}>{categoryPage?<div className="category-page-title"><button aria-label="Back to stations" onClick={backFromCategory}><ArrowLeft size={23}/></button><h1 ref={categoryTitle} tabIndex={-1}>{categoryPage}</h1></div>:<h1 className="page-title">{tab==='sounds'?'Sounds':tab==='favorites'?'Your favorites':'Radio stations'}</h1>}<button className="settings-trigger" aria-label="Settings" aria-haspopup="dialog" aria-expanded={settingsOpen} onClick={()=>setSettingsOpen(true)}><Settings size={21}/></button></header>
   {tab==='sounds'?<Sounds {...soundProps}/>:tab==='favorites'?<>
    <section className="favorites-section" aria-labelledby="favorite-stations-title"><h2 className="section-title" id="favorite-stations-title">Radio stations <span>{savedStations.length}</span></h2>
     {savedStations.length?renderStationGrid(savedStations):<div className="favorites-empty"><Heart size={24}/><p>No favorite stations yet</p><button onClick={()=>navigate('home')}>Explore stations <ChevronRight size={15}/></button></div>}
    </section>
    <section className="favorites-section" aria-labelledby="favorite-sounds-title"><h2 className="section-title" id="favorite-sounds-title">Sounds <span>{savedSounds.length}</span></h2>
     {savedSounds.length?<SoundGrid {...soundProps} sounds={savedSounds}/>:<div className="favorites-empty"><Waves size={24}/><p>No favorite sounds yet</p><button onClick={()=>navigate('sounds')}>Explore sounds <ChevronRight size={15}/></button></div>}
    </section>
   </>:<>
   <section className="station-section">
    {categoryPage?<><StationSearch query={categoryQuery} onQuery={setCategoryQuery}/><div className="browse-results"><div role="status"><h2 className="section-title">{filtered.length} {filtered.length===1?'station':'stations'}</h2></div></div></>:<StationFilters query={query} countries={countries} locationMode={locationMode} onQuery={setQuery} onCountry={toggleCountry} onLocal={()=>{setCountries([]);setLocationMode('local');}} onClearCountries={clearCountries} onReset={resetFilters} onCategory={openCategory} count={filtered.length}>
     {recent.length>0&&<section className="recent-section" aria-labelledby="recent-title"><h2 className="section-title" id="recent-title">Recently played</h2>
      <ul className="recent-list" style={{gridTemplateRows:`repeat(${Math.min(3,recent.length)},auto)`}}>{recent.map(entry=>{
       const station=entry.kind==='radio'?playable.find(item=>item.id===entry.id):undefined;
       const sound=entry.kind==='sounds'?soundCatalog.find(item=>item.id===entry.id):undefined;
       if(!station&&!sound)return null;
       const name=station?.name||sound!.name;
       const active=audioMode===entry.kind&&(station?current.id===entry.id:currentSound.id===entry.id);
       const playing=active&&(isPlaying||loading);
       return <li key={`${entry.kind}:${entry.id}`}><button className={`recent-item ${playing?'is-playing':''}`} aria-label={`${playing?'Pause':'Play'} ${name} from recently played`} onClick={()=>playing?stop():station?play(station):playSound(sound!)}>
        {station?<Mark station={station} small/>:<span className={`recent-sound sound-${sound!.id}`} style={getSoundArtworkStyle(sound!.id)}><span className="sound-symbol"><SoundIcon id={sound!.id}/></span></span>}
        <span className="recent-meta"><strong>{name}</strong><small>{station?`${station.country} · ${station.category}`:sound!.description}</small></span>
        <span className="recent-action" aria-hidden="true">{active&&loading?<LoaderCircle size={18} className="spin"/>:playing?<Pause size={18} fill="currentColor"/>:<Play size={18} fill="currentColor"/>}</span>
       </button></li>;
      })}</ul>
     </section>}
    </StationFilters>}

    {renderStationGrid(filtered)}
    {filtered.length===0&&<div className="empty-state"><Heart size={28}/><h3>No stations found</h3><p>{categoryPage?'Try another search':'Try another search or location'}</p><button onClick={()=>{if(categoryPage){setCategoryQuery('');}else{navigate('home');resetFilters();}}}>{categoryPage?'Clear search':'Explore stations'} <ChevronRight size={15}/></button></div>}
   </section>

   </>}
  </main>
  <div className="bottom-dock" inert={expanded||settingsOpen}>{session&&<section className="mini-player" style={audioMode==='sounds'?getSoundArtworkStyle(currentSound.id):getStationArtworkStyle(current)} aria-label={audioMode==='sounds'?'Ambient sound player':'Radio player'}>
   <button ref={miniArtworkButton} className="now-playing" onClick={()=>openPlayer(audioMode)} aria-label={`Open player for ${audioMode==='sounds'?currentSound.name:current.name}`}>
    {audioMode==='sounds'?<span className="mix-mini-icon" style={getSoundArtworkStyle(currentSound.id)}><SoundIcon id={currentSound.id}/></span>:<Mark station={current} small/>}
    <span><strong>{audioMode==='sounds'?currentSound.name:current.name}</strong><small><span className={`live-dot ${isPlaying?'':'inactive'}`}/>{loading?'Connecting…':state==='error'?'Playback interrupted':!isPlaying?'Paused':audioMode==='sounds'?'Playing on repeat':'Live from '+current.country}</small></span>
   </button>
   <div className="player-center">
    <button className="skip" aria-label={`Previous ${audioMode==='sounds'?'sound':'station'}`} onClick={()=>audioMode==='sounds'?stepSound(-1):step(-1)}><SkipBack size={20} fill="currentColor"/></button>
    <button className="main-play" aria-label={`${isPlaying||loading?'Pause':'Play'} ${audioMode==='sounds'?'sound':'radio'}`} onClick={toggle}>{buttonIcon}</button>
    <button className="skip" aria-label={`Next ${audioMode==='sounds'?'sound':'station'}`} onClick={()=>audioMode==='sounds'?stepSound(1):step(1)}><SkipForward size={20} fill="currentColor"/></button>
   </div>
   <div className="player-end"><button aria-label={`${currentIsSaved?'Remove':'Save'} ${audioMode==='sounds'?currentSound.name:current.name} ${currentIsSaved?'from':'to'} favorites`} aria-pressed={currentIsSaved} onClick={favoriteCurrent}><Heart size={20} fill={currentIsSaved?'currentColor':'none'}/></button></div>
  </section>}{session&&error&&<div className="error-banner" role="alert">{error}</div>}<nav className="mobile-nav" aria-label="Mobile navigation">{[['home','Play',AudioLines],['favorites','Favorites',Heart],['sounds','Sounds',Waves]].map(([id,label,Icon])=><button key={String(id)} className={tab===id?'active':''} onClick={()=>navigate(String(id))}><Icon size={21}/><span>{String(label)}</span></button>)}</nav></div>
  {settingsOpen&&<SettingsSheet theme={theme} onThemeChange={setTheme} onClose={()=>setSettingsOpen(false)}/>}
  {expanded&&<PlayerSheet tintStyle={previewKind==='sounds'?getSoundArtworkStyle(currentSound.id):getStationArtworkStyle(current)} originRect={playerOrigin} itemKind={previewKind==='sounds'?'sound':'station'} title={previewKind==='sounds'?currentSound.name:current.name} subtitle={previewKind==='sounds'?currentSound.description:`${current.country} · ${current.category}`}
   art={previewKind==='sounds'?<div className={`sound-player-art sound-${currentSound.id}`} style={getSoundArtworkStyle(currentSound.id)}><span className="sound-symbol"><SoundIcon id={currentSound.id}/></span></div>:<Mark station={current}/>}
   playing={previewKind===audioMode&&isPlaying} loading={previewKind===audioMode&&loading}
   status={previewKind!==audioMode?'Ready to play':loading?'Connecting…':state==='error'?error:isPlaying?(previewKind==='sounds'?'Playing on repeat':'Listening live'):'Paused'}
   details={previewKind==='radio'?<TrackLine track={nowPlaying.track} loading={nowPlaying.loading}/>:undefined}
   onClose={()=>setExpanded(false)} onToggle={()=>previewKind===audioMode&&(isPlaying||loading)?stop():previewKind==='sounds'?playSound(currentSound):play(current)}
   onPrevious={()=>previewKind==='radio'?step(-1):stepSound(-1)} onNext={()=>previewKind==='radio'?step(1):stepSound(1)}
   favorite={previewKind==='sounds'?<button aria-label={`${soundFavorites.includes(currentSound.id)?'Remove':'Save'} ${currentSound.name} ${soundFavorites.includes(currentSound.id)?'from':'to'} favorites`} aria-pressed={soundFavorites.includes(currentSound.id)} onClick={()=>favoriteSound(currentSound.id)}><Heart size={24} fill={soundFavorites.includes(currentSound.id)?'currentColor':'none'}/></button>:<button aria-label="Favorite station" aria-pressed={favorites.includes(current.id)} onClick={()=>favorite(current.id)}><Heart size={24} fill={favorites.includes(current.id)?'currentColor':'none'}/></button>}
   website={previewKind==='radio'?current.website:undefined}/>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
