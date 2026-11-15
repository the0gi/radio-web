# Catalog expansion acceptance — 15 November 2026

Story: browse a curated regional station catalog, combine country/category/search/favorites, and play published broadcaster streams through the existing persistent audio element.

## Results

- Runtime catalog contains 25 stations (7 original and 18 new), covering RS, HR, BA and ME. Stable original IDs retained. New fields and explicit Station typing separate app data from historical research.
- All 25 passed offline validation without errors or duplicate warnings. All 25 returned HTTP 200 and 4,096 audio bytes in bounded transport checks; see current-stream-checks.json.
- All 25 reached playing state in the production build in the in-app browser. Audio element checks showed paused=false, readyState at least 3, currentTime advancing and no media error.
- Otvoreni initially rejected playback; retry succeeded. CMC Kids was still starting at the first observation; a second check confirmed Live from Croatia, readyState 4 and 8.49 seconds elapsed. These are startup observations, not uptime guarantees.
- Country Croatia + category Pop returned 3 stations. Adding search otvoreni returned exactly one. Audio continued during filtering (24 seconds elapsed) and Favorites navigation (CMC advanced to 16.66 seconds while paused=false).
- Saved Otvoreni to favorites, confirmed it appeared on Favorites under active filters and remained saved after reload, then removed this test favorite. Existing favorites retained. Reload did not autoplay.
- Original last station Naxi Kids restored and playback paused after verification.
- Mobile layout inspected at 375 × 667; category chips scroll horizontally so categories do not consume multiple rows. New artwork is generic typography rather than official logos.
- TypeScript check and Vite production build passed.

## Limits

Browser layout testing is not Safari/iOS emulation. Physical iPhone 7 playback, a full five minutes with the screen locked, network recovery and AirPlay remain manual device checks. Short successful starts do not prove uninterrupted playback, all-day availability, content suitability or geographic availability. No live audio samples retained. Existing local preview remains the delivery target; no public deployment was requested.

## Maintenance

Run python3 scripts/check-stations.py for an offline catalog check; add --transport --output research/current-stream-checks.json for bounded network checks. A failure marks a stream for review and never removes stations automatically. Official-source discovery and browser playback should accompany each future batch.
