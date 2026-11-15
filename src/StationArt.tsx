import type { CSSProperties } from 'react';
import type { Station } from './stationCatalog';
import { artworkStyleForStation, stationArtworkSeed, stationArtworkTagline } from './artwork';
import './artwork.css';

export default function StationArt({ station, small = false }: { station: Station; small?: boolean }) {
 const seed = stationArtworkSeed(station.id);
 const count = 2 + seed % 3;
 const initials = station.name.split(/\s+/).filter(Boolean).slice(0, 3).map(word => word[0]).join('');
 return <div className={`station-art category-station-art ${small ? 'small' : ''}`} style={artworkStyleForStation(station)} aria-hidden="true">
  <span className="artwork-clouds">{Array.from({ length: count }, (_, index) => {
   const variant = (seed >>> (index * 5)) + index * 37;
   const style = {
    left: `${(variant % 85) - 26}%`, top: `${((variant >>> 2) % 85) - 24}%`,
    width: `${65 + (variant % 46)}%`, height: `${65 + (variant % 46)}%`,
    opacity: .5 + (variant % 4) * .1,
   } satisfies CSSProperties;
   return <i key={index} className={`artwork-cloud artwork-cloud-${index}`} style={style}/>;
  })}</span>
  <span className="artwork-orbit"/>
  <strong className="artwork-name">{small ? initials : station.name}</strong>
  {!small && <span className="artwork-tagline">{stationArtworkTagline(station)}</span>}
 </div>;
}
