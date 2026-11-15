import catalog from './data/stations.json';

export type Station = {
 id: string;
 name: string;
 countryCode: string;
 country: string;
 category: string;
 website: string;
 streamUrl: string;
 contentType: string;
 bitrateKbps: number | null;
 sources: string[];
};

export const stations: Station[] = catalog.stations;
export const playableStations = stations.filter(station => station.streamUrl);
export const stationCategories = [...new Set(playableStations.map(station => station.category))];
export const stationCountries = [...new Set(playableStations.map(station => station.country))];
