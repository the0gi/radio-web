import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { stationCategories, stationCountries } from './stationCatalog';

export type LocationMode = 'all' | 'local' | 'countries';
const flags: Record<string, string> = { Serbia: '🇷🇸', Croatia: '🇭🇷', 'Bosnia and Herzegovina': '🇧🇦', Montenegro: '🇲🇪' };
const categoryStyles: Record<string, string> = {
 'Kids & family': 'kids', Pop: 'pop', Rock: 'rock', Jazz: 'jazz', Oldies: 'oldies',
 Variety: 'variety', Chill: 'chill', Dance: 'dance', Folk: 'folk',
};

export function StationSearch({ query, onQuery }: { query: string; onQuery: (query: string) => void }) {
 return <label className="search station-search"><Search size={19}/><input value={query} onChange={event => onQuery(event.target.value)} placeholder="Find a station" aria-label="Find a station"/>{query && <button aria-label="Clear search" onClick={() => onQuery('')}><X size={17}/></button>}</label>;
}

type Props = {
 query: string;
 countries: string[];
 locationMode: LocationMode;
 onQuery: (query: string) => void;
 onCountry: (country: string) => void;
 onLocal: () => void;
 onClearCountries: () => void;
 onReset: () => void;
 onCategory: (category: string) => void;
 count: number;
 children?: ReactNode;
};

export default function StationFilters({ query, countries, locationMode, onQuery, onCountry, onLocal, onClearCountries, onReset, onCategory, count, children }: Props) {
 const dropdown = useRef<HTMLDetailsElement>(null);
 useEffect(() => {
  function outside(event: PointerEvent) {
   if (dropdown.current && !dropdown.current.contains(event.target as Node)) dropdown.current.open = false;
  }
  document.addEventListener('pointerdown', outside);
  return () => document.removeEventListener('pointerdown', outside);
 }, []);

 return <div className="station-browser">
  <StationSearch query={query} onQuery={onQuery}/>
  <div className="location-controls" role="group" aria-label="Station location">
   <button className={`filter-chip ${locationMode === 'all' ? 'selected' : ''}`} aria-pressed={locationMode === 'all'} onClick={onReset}>All</button>
   <button className={`filter-chip local-chip ${locationMode === 'local' ? 'selected' : ''}`} aria-pressed={locationMode === 'local'} onClick={onLocal}><span className="country-flag" aria-hidden="true">🇷🇸</span>Local stations</button>
   <details className={`country-dropdown ${locationMode === 'countries' ? 'has-selection' : ''}`} ref={dropdown} onKeyDown={event => {
    if (event.key === 'Escape' && dropdown.current) { dropdown.current.open = false; dropdown.current.querySelector('summary')?.focus(); }
   }}>
    <summary aria-label="Select country">{locationMode === 'countries' && countries.length === 1 && <span className="country-flag" aria-hidden="true">{flags[countries[0]]}</span>}<span>{locationMode === 'countries' ? countries.length === 1 ? countries[0] : `${countries.length} countries` : 'Select country'}</span><ChevronDown size={13}/></summary>
    <div className="country-menu" role="group" aria-label="Select countries">
     <div className="country-menu-heading"><span>Countries</span><button onClick={onClearCountries}>Clear</button></div>
     {stationCountries.map(country => <label key={country}><span className="country-flag" aria-hidden="true">{flags[country]}</span><span>{country}</span><input type="checkbox" checked={locationMode === 'countries' && countries.includes(country)} onChange={() => onCountry(country)}/></label>)}
    </div>
   </details>
  </div>
  <section className="category-discovery" aria-labelledby="category-heading">
   <div className="category-heading"><h2 className="section-title" id="category-heading">Find your category</h2></div>
   <div className="category-card-row" role="group" aria-label="Browse categories">
    {stationCategories.map(category => <a key={category} href={`#category/${encodeURIComponent(category)}`} className={`category-card category-${categoryStyles[category] || 'variety'}`} onClick={event => { event.preventDefault(); onCategory(category); }}>
     <span className="category-visual" aria-hidden="true"><span className="category-orbit"/><span className="category-equalizer"><i/><i/><i/><i/><i/></span><strong>{category === 'Kids & family' ? <>Kids &<br/>family</> : category}</strong></span>
     <span className="category-card-label">{category}</span>
    </a>)}
   </div>
  </section>
  {children}
  <div className="browse-results"><div role="status"><h2 className="section-title">{count} {count === 1 ? 'station' : 'stations'}</h2></div>{(locationMode !== 'all' || query.trim()) && <button onClick={onReset}>Reset filters <X size={12}/></button>}</div>
 </div>;
}
