import type { CSSProperties } from 'react';
import type { Station } from './stationCatalog';
import type { SoundId } from './soundCatalog';

type ArtworkStyle = CSSProperties & { [key: `--${string}`]: string | number };
type Palette = { color: string; light: string; ink: string };

// Match the category cards: every station in a category belongs to one color family.
export const categoryArtworkPalettes: Record<string, Palette> = {
 'Kids & family': { color: '220,151,74', light: '242,207,161', ink: '#704619' },
 Pop: { color: '250,69,136', light: '246,190,213', ink: '#8d2853' },
 Rock: { color: '255,101,61', light: '247,195,174', ink: '#8c3820' },
 Jazz: { color: '200,142,60', light: '238,214,167', ink: '#79541d' },
 Oldies: { color: '179,136,242', light: '220,208,245', ink: '#644191' },
 Variety: { color: '72,189,162', light: '188,230,216', ink: '#216c59' },
 Chill: { color: '87,157,221', light: '196,223,244', ink: '#315e88' },
 Dance: { color: '185,97,245', light: '227,198,245', ink: '#783b9a' },
 Folk: { color: '218,99,113', light: '240,195,204', ink: '#8b3c4c' },
};

export function stationArtworkSeed(id: string) {
 return [...id].reduce((value, letter) => (Math.imul(value, 31) + letter.charCodeAt(0)) >>> 0, 7);
}

// Editorial cover captions, not official broadcaster slogans.
const categoryTaglines: Record<string, readonly string[]> = {
 'Kids & family': ['Little songs. Big smiles.', 'A world of little melodies', 'Small voices. Big joy.'],
 Pop: ['Your everyday soundtrack', 'Good songs. Good company.', 'Turn up the good mood'],
 Rock: ['A little louder', 'Let the guitars speak', 'Made to be turned up'],
 Jazz: ['Find your own rhythm', 'Take the scenic route', 'Room for a little soul'],
 Oldies: ['Good times on repeat', 'Some songs stay with you', 'The years sound good'],
 Variety: ['A little of everything', 'Good company all day', 'More music to discover'],
 Chill: ['Slow down. Tune in.', 'A softer kind of day', 'Leave a little room to unwind'],
 Dance: ['Keep the good energy', 'Find your next beat', 'Let the rhythm take over'],
 Folk: ['Songs that feel like home', 'Familiar voices. Warm company.', 'Close to the heart'],
};
export function stationArtworkTagline(station: Station) {
 if (station.id === 'bravo-kids') return 'Turn up the happy';
 if (station.id === 'naxi-kids') return 'A world of little melodies';
 const options = categoryTaglines[station.category] || categoryTaglines.Variety;
 return options[stationArtworkSeed(station.id) % options.length];
}

export function artworkStyleForStation(station: Station): ArtworkStyle {
 const palette = categoryArtworkPalettes[station.category] || categoryArtworkPalettes.Variety;
 const seed = stationArtworkSeed(station.id);
 const orbits = [[22, 26, 145], [-66, 18, 148], [18, -67, 152], [-48, -72, 155]];
 const [left, top, size] = orbits[seed % orbits.length];
 return {
  '--art-tilt': `${[-7, -5, -3, 3, 5, 7][seed % 6]}deg`,
  '--art-orbit-left': `${left}%`,
  '--art-orbit-top': `${top}%`,
  '--art-orbit-size': `${size}%`,
  '--art-color-rgb': palette.color,
  '--art-light-rgb': palette.light,
  '--art-ink': palette.ink,
  '--player-tint-rgb': palette.color,
 };
}

// Pastel families share the warmth and saturation of the station artwork.
export const soundArtworkPalettes: Record<SoundId, Palette> = {
 rain: { color:'87,157,221', light:'196,223,244', ink:'#315e88' },
 fire: { color:'225,148,94', light:'247,216,187', ink:'#854c29' },
 waves: { color:'75,177,183', light:'190,230,230', ink:'#28646b' },
 nature: { color:'143,174,108', light:'217,232,193', ink:'#4a6434' },
 airplane: { color:'179,136,242', light:'220,208,245', ink:'#644191' },
 birds: { color:'101,178,141', light:'199,232,215', ink:'#31684f' },
 noise: { color:'147,158,191', light:'220,225,242', ink:'#505e82' },
 cafe: { color:'207,139,135', light:'244,211,205', ink:'#854e4a' },
};

export function artworkStyleForSound(id: SoundId): ArtworkStyle {
 const palette=soundArtworkPalettes[id];
 return {
  '--sound-color-rgb':palette.color,
  '--sound-light-rgb':palette.light,
  '--sound-ink':palette.ink,
  '--player-tint-rgb':palette.color,
 };
}

export const getStationArtworkStyle = artworkStyleForStation;
export const getSoundArtworkStyle = artworkStyleForSound;
