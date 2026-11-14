# Now playing metadata

Checked 2026-11-14 against station-owned players and public stream servers.

Naxi Kids: the official https://www.naxi.rs/kids player reads Firestore `now_playing/kids` in project `naxiproject`. The public REST document permits browser CORS requests, with no SDK or credential needed. The app reads title, artist and optional program name every 20 seconds while playing or the radio sheet is open and visible. Requests stop in the background without affecting native audio. Failed, empty, malformed or older-than-15-minute responses clear the song display. Late responses cannot cross station changes. Media Session uses the current title and artist while available. Metadata describes the broadcaster feed and can lead or lag buffered audio.

Other stations currently show station identity, country, codec and bitrate, plus an explicit unavailable-song-info message. No song identification or inferred titles are used.

- bravo! KIDS: official player https://streaming.bravo.hr/player/src/player.js points to https://streaming.bravo.hr/player/info/bravo_kids_.txt (title – artist). Public file has no Access-Control-Allow-Origin; cannot read directly from this static app.
- CMC Kids: https://radio-stream.cmc.com.hr:9019/status-json.xsl reports the active autodj source title; no CORS header.
- Radio M Kids: https://team-data.ba:9050/stats?sid=1&json=1 includes songtitle; no CORS header.
- Radio S Kids: https://stream.radios.rs:9022/stats?sid=1&json=1 responds but songtitle is empty, and no CORS header.
- Elmag Kids: standard Icecast JSON status path returns 404.
- Juhuhu: no metadata endpoint integrated yet.

A future small same-origin metadata service could support the non-CORS feeds. Adding a local-only Vite proxy would hide this limitation and fail when deploying the static build, so none is used. Audio transport is unchanged.
