export const soundCatalog = [
 {id:'rain',name:'Rain',description:'Steady rainfall',author:'joedeshon',source:'https://freesound.org/people/joedeshon/sounds/430765/'},
 {id:'fire',name:'Fireplace',description:'Wood fire crackling',author:'HenKonen',source:'https://freesound.org/people/HenKonen/sounds/797669/'},
 {id:'airplane',name:'Airplane',description:'Cabin ambience',author:'RyanKingArt',source:'https://freesound.org/people/RyanKingArt/sounds/702132/'},
 {id:'birds',name:'Birds',description:'Morning birdsong',author:'resaural',source:'https://freesound.org/people/resaural/sounds/634511/'},
 {id:'noise',name:'White noise',description:'An even, steady sound',author:'Generated for Radio',source:''},
 {id:'cafe',name:'Café',description:'Conversation & clinking cups',author:'evsecrets',source:'https://freesound.org/people/evsecrets/sounds/332271/'},
] as const;
export type SoundId = typeof soundCatalog[number]['id'];

export type Sound = typeof soundCatalog[number];
