# Regional children’s radio research

Researched 14 November 2026. Scope: stations originating in Serbia, Croatia, Bosnia and Herzegovina, and Montenegro. No framework or app stack chosen.

## Follow-up result

The app now includes seven directly playable stations. Juhuhu, Radio M Kids and Elmag Kids were verified through HTTP audio responses and actual playing events in the in-app browser. The initial Montenegro gap is resolved by Elmag Kids. See `catalog-review.md` for final inclusion decisions; the table below records the initial research state.

## Initial dedicated station shortlist

| Station | Country | Content | Integration status |
| --- | --- | --- | --- |
| [Naxi Kids](https://www.naxi.rs/kids) | Serbia | Children’s songs, including regional performers | Official HTTPS MP3 endpoint returned audio; 128 kbps |
| [Radio S Kids](https://radios.rs/digitalni-radio/7/radio-s-kids) | Serbia | Children’s music | HTTPS AAC+ endpoint returned audio and matching station name; 36 kbps. Endpoint discovered through third-party listing; official player page returned 403 |
| [bravo! KIDS](https://bravo.hr/) | Croatia | Children’s music and content | Official player’s HTTPS MP3 endpoint returned audio; 128 kbps |
| [CMC Kids](https://radio.cmc.com.hr/#kids) | Croatia | Children’s hits | Official player’s HTTPS MP3 endpoint returned audio; 192 kbps |
| [Juhuhu Radio](https://juhuhu.hrt.hr/) | Croatia | Preschool songs, stories, learning and bedtime programming | Official player confirmed; uses Triton Digital SDK station HRT_JUHUHU. Direct audio endpoint unresolved |
| [Radio M Kids](https://radiom.ba/bs/radio-m-kids) | Bosnia and Herzegovina | Dedicated children’s radio | Official page and broadcaster history confirmed; direct endpoint unresolved (403 in command-line request) |

[HRT’s announcement](https://magazin.hrt.hr/zabava/juhuhu-radio-novi-hrt-ov-radijski-program-za-djecu-12007034) confirms Juhuhu’s 24-hour format and preschool audience. [Radio M’s history](https://radiom.ba/bs/o-nama) dates its Kids launch to 2025.

## Montenegro

No dedicated all-day children’s music station was confirmed in this search. This is a research gap, not proof none exists. Keep the following outside the default dedicated kids station catalog:

- [Radio Crne Gore — Radoznalica](https://rtcg.me/radio/programska-sema.html): official schedule lists Sunday 12:05–14:00. [A November 2026 episode](https://mneplay.me/video/556826/listing/258/radoznalica-kako-bezbjedno-koristiti-vjestacku-inteligenciju) confirms recent activity. Schedule must be rechecked before use.
- [Elmag Radio — Elmagova vrteška](https://www.elmag.me/): website lists a children’s show at 08:00–08:30; day/recurrence requires confirmation.

These are general stations with scheduled children’s programming, including speech, rather than continuous children’s music.

## Additional leads held out of shortlist

- DIR / Dečiji Internet Radio, Ruma: directory listings exist, but current official operation and stream were not verified. Some descriptions refer to humanitarian programming. [Directory lead](https://www.radiostanica.com/rs/ruma/radio-dir/3516).
- Radio Balkan Dečija: children’s channel exists, but country attribution needs clarification: directories list Kragujevac while the network also has Chicago branding. [Directory lead](https://myradiostanice.rs/radio-balkan), [publisher’s app](https://apps.apple.com/pk/app/radiobalkan-live/id1609961988?platform=vision). Do not assume local origin from directory country alone.

## Data and validation

- `stations.json`: structured catalog, source links, confidence, unresolved integration details, and separate scheduled programs.
- `stream-checks.json`: observed HTTP response, MIME type, station identity, bitrate and CORS headers. Each audio check read only 1,024 bytes and closed the connection.
- Four endpoints returned audio: Naxi Kids, Radio S Kids, bravo! KIDS and CMC Kids. This is transport verification, not listening/content review or browser playback verification. Long-term availability and geographic availability are untested.
- bravo’s base relay URL returns HTML. Use the full `radio.mp3` endpoint in the catalog.
- Missing CORS headers on Naxi/CMC do not establish failure of ordinary HTML audio playback, but metadata fetching or Web Audio processing will need separate testing.
- Station origin does not guarantee every song is in the local language. Advertising, language mix and repertoire have not been audited; do not label these ad-free or editorially reviewed.
- No permission to redistribute audio, reuse logos or integrate third-party SDKs has been established by this research. Broadcaster terms/integration requirements remain a pre-publication task.
