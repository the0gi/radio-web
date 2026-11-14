# Radio

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

Seven directly playable streams: Naxi Kids, Radio S Kids, bravo! KIDS, CMC Kids, Juhuhu Radio, Radio M Kids and Elmag Kids. Juhuhu uses the streaming provider’s public redirector, based on the identifier from HRT’s official player. All four requested countries are represented. Artwork is provisional typographic artwork, not official broadcaster logos. Full research is in `research/`.

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

Sounds plays one of six self-hosted loops at a time: rain, fireplace, airplane cabin, birds, white noise or café chatter. Tap a sound to play or pause. Playback uses the same persistent HTML audio element as radio, with native looping; starting a sound replaces the station and vice versa. Adjust overall volume with the device buttons. The last sound is remembered without autoplay.

Five CC0 recordings were prepared as PCM WAV loops; white noise was generated during asset preparation. Credits are in public/sounds/CREDITS.md. The initial Web Audio mixer was removed after the user confirmed it stopped when leaving Safari or locking the iPhone. The replacement uses ordinary media playback, which the user has verified for radio; physical iPhone acceptance is still needed for these local WAV loops, including a full loop boundary while locked.
