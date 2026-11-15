# Catalog expansion verification — 15 November 2026

`scripts/check-stations.py` validates catalog structure and optionally performs
bounded HTTPS stream checks. Run from the project root:

```sh
python3 scripts/check-stations.py
python3 scripts/check-stations.py --transport --output research/current-stream-checks.json
```

The default command is offline. Live checks use at most three connections at a
time, a ten-second socket timeout, and read at most 4,096 audio bytes per station
before closing the connection. No audio is retained. The script accepts the runtime
catalog or a candidate catalog. Exit status 1 means schema errors, 2 means a stream
needs review, and 0 means all requested checks passed. Shared stream URLs are
reported as potential duplicate warnings; duplicate station IDs are errors.

## Observations

- All 18 additional candidates returned HTTP 200, an audio MIME type, and 4,096
  bytes. Results are in `expansion-stream-checks.json`.
- The existing seven stations also passed fresh transport checks.
- Otvoreni reports `audio/aac`, 48 kbps. Antena Zagreb reports `audio/aacp`, 96
  kbps. The other candidate streams report `audio/mpeg`; bravo main reports 96
  kbps, and the remaining MP3 candidates report 128 kbps.
- bravo main has an ICY station name ending in “AAC” despite its `audio/mpeg`
  response. A separate bounded in-memory sample started with MPEG-1 Layer III
  frame header `fffb7064`, consistent with MP3; no consecutive AAC ADTS frames
  were found. The audio sample was not saved.
- Local checks covered duplicate IDs, invalid/insecure/credential-bearing URLs,
  a successful bounded audio response, and a simulated timeout. A timeout returns
  `needs-review`; the script does not change or delete stations.

These checks establish current transport availability only. They do not establish
browser playback, uninterrupted listening, station content, permissions, or physical
iPhone playback with the screen locked. A single future failure should trigger a
repeat check and manual review rather than automatic removal.
