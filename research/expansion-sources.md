# Regional catalog expansion — 15 November 2026

Eighteen additional stations were discovered through public, official broadcaster players and their public configuration. This is a curated initial expansion of the general-purpose regional catalog, not an exhaustive station directory. The seven existing kids stations are retained separately.

## Source and identity evidence

| Candidates | Official source and endpoint derivation |
| --- | --- |
| Naxi Radio, Naxi Rock, Naxi Jazz, Naxi 80s | [Naxi live](https://www.naxi.rs/live), [Rock](https://www.naxi.rs/rock), [Jazz](https://www.naxi.rs/jazz), [80e](https://www.naxi.rs/80e). Page HTML contains the HTTPS streaming.rs audio source. Station identity comes from the corresponding official player page. |
| Elmag Radio, Mag Radio, Elmag Jazz, Elmag Pop Rock Ex-Yu | [Elmag live](https://www.elmag.me/elmag-radio/elmag-live/), [Mag live](https://www.elmag.me/elmag-radio/mag-live/), [Jazz](https://www.elmag.me/elmag-radio/elmag-jazz/), [Pop Rock Ex-Yu](https://www.elmag.me/elmag-radio/elmag-pop-rock-ex-yu/). Official HTML's `xradiostream` playlist supplies HTTPS radio.elmag.me MP3 URLs. |
| bravo!, bravo! Lounge, bravo! Gym, bravo! Icons | [Official player JavaScript](https://streaming.bravo.hr/player/src/player.js) maps indexes 0/2/3/4 to LIVE/LOUNGE/GYM/ICONS and relay ports 8310/8340/8320/8330. Its playback function appends `radio.mp3?&_ic2=1`; candidate addresses preserve that construction without the random cache parameter. [Broadcaster](https://bravo.hr/). |
| Radio M, Radio M Plus, Radio M Ex-Yu, Radio M Narodna | [Radio M](https://radiom.ba/en/radio-m), [Plus](https://radiom.ba/en/radio-m-plus), [Ex-Yu](https://radiom.ba/en/radio-m-ex-yu), [Narodna](https://radiom.ba/en/radio-m-narodna). Official HTML supplies team-data.ba ports 9030/10000/9034/9036 and `play?sid=1`. |
| Otvoreni Radio | [Official player](https://www.otvoreni.hr/player/) declares `/api/channels` as its data URL. The [public channels API](https://www.otvoreni.hr/api/channels) maps LIVE to stream key `otvoreni` and provides an HTTPS source on port 443. |
| Antena Zagreb | [Official player](https://streaming.antenazagreb.hr/stream/player/player.html?stream=0) and [player JavaScript](https://streaming.antenazagreb.hr/stream/player/src/player.js) map channel 0 to Antena Zagreb Live, use `https://audio.social3.hr/listen/antena_aac/` and append `stream`. |

## Scope and editorial metadata

Country attribution follows the broadcaster identity and official regional service, not the streaming server location. Categories are broad editorial navigation labels inferred from channel names and general station positioning; they are not audited genre guarantees or a complete program description. `Pop`, `Variety`, `Rock`, `Jazz`, `Oldies`, `Chill`, `Dance` and `Folk` should be treated accordingly. Advertising, repertoire, language mix and suitability for children have not been reviewed. The new stations should not inherit a Kids & family label.

Candidate MIME and bitrate fields have been reconciled with the observed values in `expansion-stream-checks.json`. Otvoreni serves `audio/aac` at 48 kbps; Antena Zagreb serves `audio/aacp` at 96 kbps. A MIME header or `.mp3` suffix alone does not prove the encoded codec: notably bravo!'s stream identifies itself as “bravo AAC” while serving `audio/mpeg`; the validator separately inspected a bounded sample and found an MPEG audio frame header consistent with MP3.

## Validation and limitations

The validation agent writes bounded HTTP checks to `expansion-stream-checks.json`: at most 4,096 bytes per stream before disconnecting. All 18 endpoints returned HTTP 200, audio MIME and the bounded 4,096-byte sample. These checks establish transport availability at one time, not continuous uptime, decoded browser playback, geography-wide availability, iPhone locked-screen playback or content review. No audio samples are retained. No access-controlled or authenticated endpoints were sought.

Official-source discovery does not establish permission to redistribute audio or reuse broadcaster logos. The application continues to connect ordinary HTML audio playback directly to the published streams.

## Leads deliberately left out of this batch

- RSG: both `rsg.ba` and `radio.rsg.ba` failed DNS in the research environment; no stream was guessed.
- Radio D Plus: the public page's certificate did not match its hostname, so it was not bypassed for discovery.
- Antena M: official site was readable, but the current application JavaScript returned 403; no unconfirmed endpoint was included.
- Radio Jadran: official host connection refused; no inferred endpoint included.

Machine-readable candidates: `expansion-candidates.json`. HTTP evidence: `expansion-stream-checks.json`. Browser and real-device acceptance are separate integration tasks.

## Integration playback follow-up

The parent integration check reached the browser `playing` event for all 18 additions, including Otvoreni and Antena Zagreb AAC streams. Otvoreni had one initial failed playback attempt (metadata available, no media error) and succeeded on retry; treat that as an observed transient connection/startup failure, not a codec incompatibility. No endpoint replacements were made. This browser result does not replace real iPhone or locked-screen acceptance.

A brief follow-up discovery checked Otvoreni's official popup-player module and Antena Zagreb's official player script for MP3 alternatives; neither inspected configuration advertised a separate MP3 live source. Additional broadcaster leads were not integrated because both original candidates passed playback.
