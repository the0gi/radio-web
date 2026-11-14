# Catalog review — 14 November 2026

## Included in the app

Seven stations from the four requested countries. Three new integrations:

| Station | Country | Discovery and verification |
| --- | --- | --- |
| Elmag Kids | Montenegro | [Official Kids player](https://www.elmag.me/elmag-radio/elmag-kids/) lists https://radio.elmag.me/kids.mp3. HTTPS MP3 audio response, 128 kbps. App reached playing event. |
| Radio M Kids | Bosnia and Herzegovina | [Official English player](https://radiom.ba/en/radio-m-kids) exposes https://team-data.ba:9050/play?sid=1. HTTPS MP3, 128 kbps, icy-name Radio M Kids. App reached playing event. |
| Juhuhu Radio | Croatia | [Official player](https://juhuhu.hrt.hr/radio/1/slusaj/) supplies station HRT_JUHUHU. [Provider provisioning API](https://playerservices.streamtheworld.com/api/livestream?version=1.9&station=HRT_JUHUHU) returns the public mounts with authentication disabled. Provider’s [documented redirector](https://help.tritondigital.com/docs/livestream-redirect) returns HTTPS MP3 audio. App reached playing event with the redirector URL. |

The initial SDK playback attempt on Juhuhu’s own site displayed “Unable to play media”; the documented direct redirector subsequently worked in our player. No access restrictions were bypassed.

Existing stations retained: Naxi Kids and Radio S Kids (Serbia), bravo! KIDS and CMC Kids (Croatia).

## Not included

| Candidate | Finding | Decision |
| --- | --- | --- |
| RB Kids / Ritam Balkana Kids | [Station hosting profile](https://zeno.fm/radio/rb-kids/) exposes a stream, but it returned HTTP 401. | Hold; no authentication or alternate unauthorized endpoint attempted. |
| Glas Nade — Dečji radio | [Official page](https://www.glasnade.com/decji-radio/) labels the program as Christian music for children; embedded player https://www.glasnade.com/player.php?mount=rgn3 returns 404. Official radio.m3u link also returns 404. | Hold for a working broadcaster endpoint; explicitly identify faith content if later included. |
| DIR, Ruma | Old radiodir.co.rs host fails DNS. [Serbian regulator](https://rem.rs/sr-lat/registar-pruzalaca-medijskih-usluga/1545) identifies specialized humanitarian programming. [Recent directory description](https://www.balkanradiostanice.com/radio-stanica-uzivo/1059/de%C4%8Diji-radiodir/srbija/) describes news, talk and cultural shows. | Not a confirmed continuous children’s music service; hold outside the initial music catalog. |
| Košava Kids | [Directory](https://www.exyuradio.net/radio-stanice/srbija/beograd/radio-kosava-kids.html) reports cessation in November 2025; older listings remain. | No verified active broadcaster stream; exclude. |
| Radio Balkan Dečija | Children’s channel has directory/publisher-app evidence, but local-origin attribution is unresolved due to international/Chicago branding. | Hold outside the four-country local-origin catalog pending provenance and stream verification. |

## Verification limits

Transport checks read 4,096 bytes per new working stream, then disconnected. Browser checks verified playback events for all three new integrations. They do not establish a full repertoire audit, all-day uptime, broadcaster permissions, ad-free programming, availability in every region, or screen-locked playback on the physical iPhone. The real-device background listening check remains outstanding.

Evidence: `followup-stream-checks.json`. Live audio samples were not retained. Country filters are now derived from playable stations. No external-site fallback cards remain in the app; all seven station cards use the persistent player.
