# play.

A mobile-first regional radio prototype built with React, TypeScript and Vite. English interface, automatic light/dark appearance, favorites stored on the device, country filters, search, and a persistent audio player.

## Development

Use Node.js 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

## Production preview

```sh
pnpm build
pnpm preview --port 5173
```

The build targets Safari 15. Compatibility must still be tested on the actual iPhone and its installed iOS version. One persistent HTML audio element plays the direct broadcaster streams. Media Session controls are used when available, with no dependency on them for playback. Playback requires an initial user tap. Pausing stops audio; resuming reconnects to live radio. No audio recording, proxying, or autoplay.

## Current catalog

The curated runtime catalog in `src/data/stations.json` contains 25 directly playable stations from Serbia, Croatia, Bosnia and Herzegovina, and Montenegro: the original seven Kids & family stations plus 18 general and themed channels. Search appears first, followed by compact All / Local stations / Select country controls. Local stations currently means Serbia and does not request geolocation. The country dropdown supports multiple countries. Category cards open separate category pages with a back arrow, title and search, showing all stations in that category independently of the browse location and query. Back restores the previous browse state. Category visuals adapt to light and dark appearance. The earlier V1/V2 comparison switch has been removed. New stations receive typographic artwork; these are not official broadcaster logos.

The additions include Naxi Radio/Rock/Jazz/80s, Elmag Radio/Mag/Jazz/Pop Rock Ex-Yu, bravo!/Lounge/Gym/Icons, Radio M/Plus/Ex-Yu/Narodna, Otvoreni Radio and Antena Zagreb. Source evidence and check results are in `research/expansion-sources.md` and `research/catalog-expansion-acceptance.md`. Historical research files are evidence, not the app's runtime data source. Categories are broad navigation labels, not a content audit.

## Maintaining the catalog

Keep station IDs stable so saved favorites and the last station survive updates. Add entries to `src/data/stations.json` using the fields in `src/stationCatalog.ts`, with official source links and nullable bitrate when unknown. Published HTTPS stream addresses must be confirmed from broadcaster players rather than guessed. Confirm playback in the app before including a new station.

```sh
# Offline structure, required fields, duplicate IDs and stream URL checks
python3 scripts/check-stations.py

# Bounded live checks; no audio saved
python3 scripts/check-stations.py --transport --output research/current-stream-checks.json
```

The live check reads at most 4,096 bytes per station with three connections at a time. A failure marks a stream for review; it does not remove it. Exit codes are 0 for success, 1 for catalog errors and 2 for streams needing review. HTTP audio success and browser playback are separate checks. Physical iPhone and screen-lock testing remain required.

## iPhone listening check

1. Keep the computer running the production preview and connect the phone to the same Wi-Fi. Open the printed Network URL in Safari.
2. Tap Naxi Kids and confirm audio starts. Switch screens between Listen, Favorites and Settings; audio should continue.
3. Lock the screen for at least five minutes. Confirm audio continues and note whether lock-screen play/pause controls appear.
4. Unlock, pause and resume. Change stations, then test a second station with the screen locked.
5. Repeat after adding the site to the home screen; standalone behavior can differ from Safari.
6. Note the exact iOS version, station, connection type and any interruption. Test a network disconnect/reconnect and check the retry UI.

Background audio, interruptions, AirPlay and real iPhone performance are not verified by desktop browser testing. HTTP preview on a local network may not expose all secure-context media controls; deployment over HTTPS is needed for a representative final check. Adding a home-screen shortcut does not guarantee background audio.

No public deployment or GitHub push has been made. No accounts, backend or database are required for this prototype. The computer must stay awake and the preview server must stay running for the local phone link to work.

## Ambient sounds

Sounds plays one of six self-hosted loops at a time: rain, fireplace, airplane cabin, birds, white noise or café chatter. Tap a sound to play or pause. Playback uses the same persistent HTML audio element as radio, with native looping; starting a sound replaces the station and vice versa. Adjust overall volume with the device buttons. The last explicitly selected station or sound is remembered for 12 hours of inactivity, without autoplay. The floating mini player stays hidden until a playback choice is made and follows that choice across tabs. Active playback keeps the session fresh; pausing or an interruption starts the 12-hour window. Old last-station settings without a timestamp are not restored.

Five CC0 recordings were prepared as PCM WAV loops; white noise was generated during asset preparation. Credits are in public/sounds/CREDITS.md. The initial Web Audio mixer was removed after the user confirmed it stopped when leaving Safari or locking the iPhone. The replacement uses ordinary media playback, which the user has verified for radio; physical iPhone acceptance is still needed for these local WAV loops, including a full loop boundary while locked.

## Favorites and player controls

Favorites has separate Radio stations and Sounds sections, independent of browse filters. Sound favorites are saved on the device and can be toggled on sound cards, the mini player, or the expanded player. Radio and sounds share the same mini player layout: artwork and title on the left, previous/play-pause/next centered on desktop, and a favorite button on the right. Mobile keeps play/pause and favorites visible; previous/next are available in the expanded player. The redundant LIVE badge and inactive volume icon were removed.

## Category artwork and player motion

Station covers share their category color palette, with deterministic two-to-four soft circles for variation across stations. Small covers reuse the composition, and the mini player overlays its current cover color at 14% opacity (including ambient sounds). Artwork supports light and dark appearance. Covers include a thin circular outline in varied positions, straight station names, and short editorial taglines in place of the category label. These captions are design copy, not verified broadcaster slogans. The expanded player uses the same 14% cover tint as the mini player.

Opening the player moves the cover from the mini player to a larger cover (up to 400 px) in a 250 ms ease-out transition, reversed on close. Reduced-motion preferences skip the transition. The song row shows only `Title · Artist`; overflowing text pans left at 30 px/s with reading pauses, and pauses on hover or keyboard focus. Metadata availability remains dependent on broadcaster support.

Sound artwork uses a shared pastel palette in `src/artwork.ts`: blue rain, amber fire, turquoise waves, sage nature, lavender airplane, mint birds, periwinkle white noise and rose café. Cards, favorites, recent items, mini icons and expanded sound covers use the same theme-aware palette; player backgrounds keep the 14% tint.
