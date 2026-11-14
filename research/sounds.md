# Sounds prototype

Six self-hosted sounds: rain, wood fire, airplane cabin, birdsong, generated white noise, and café chatter. Source licenses were verified as CC0 from the individual Freesound pages before download. Credits are shipped at public/sounds/CREDITS.md and linked to each author in the Sounds screen.

## Audio preparation

The five recordings use edited excerpts from their public MP3 previews, not copyrighted assets from the reference application. Processing is reproducible with scripts/prepare-sounds.py, NumPy and macOS afconvert. Inputs are named rain.mp3, fire.mp3, airplane.mp3, birds.mp3 and cafe.mp3. White noise is generated using a fixed random seed.

Mono 24 kHz WAV files avoid encoder padding at loop boundaries. Four seconds of overlapping audio blend the end into the beginning. There is no inserted silence; the wrap joins consecutive samples from the original excerpt. Resulting field loops are approximately 53–60 seconds; white noise is 30 seconds. No assertion is made that listeners cannot recognize recurring birdsong, voices or other identifiable events.

The generated measurement report checks peak, RMS, file hashes and boundary sample steps. Boundary steps are below the 99th percentile of ordinary within-recording sample steps for all six loops. This is a signal continuity check, not a subjective listening guarantee.

## Current playback design

One sound at a time. The Web Audio mixing engine was removed following a real-device report: radio continued in the background and with the screen locked, but Web Audio mixtures stopped. Sounds now uses the exact same persistent HTML audio element as radio, with its native loop property enabled. Radio turns looping off again. No AudioContext, silent playback, timer-driven repetition or background-execution workaround remains in the runtime.

Tap a sound: its URL is assigned and play is called synchronously from the user gesture. Pause/resume uses that same source; selecting another sound or station replaces it. Each sound loops as an ordinary media file. Native media pause/playing/waiting/error events update the UI. Media Session metadata and play/pause handlers reflect the selected sound. No mixing controls or saved-mix controls remain. Overall volume is controlled by the device.

## Acceptance

The user verified background radio playback on the actual iPhone, and reported that the previous Web Audio mixer stopped. The user confirmed on the actual iPhone that local WAV/HTML audio continues after leaving Safari and locking the screen in a short test (under two minutes). A longer test remains pending. Desktop browser tests cannot establish overnight reliability.

Licensing/provenance and loop preparation measurements remain valid. Historical four/six-layer mixer checks described in earlier chat refer to the removed implementation, not the current app.

### Single-sound verification

TypeScript and production build passed. In-app browser tests confirmed Rain and Birds play through exactly one HTML audio element with loop=true; switching back to Naxi reuses the element with loop=false. Starting Rain again replaces radio; pause updates both the card and dock. No console errors/warnings were captured during this test. Playback was paused after verification. The subsequent user test confirmed short background playback; longer playback remains pending.

### Player and sound revision

The shared player sheet is portaled to the document body and opens from both mini players. Starting a sound automatically opens its sheet. Settings moved to the header, leaving three bottom destinations. Fireplace now uses HenKonen’s Sauna fireplace loop (797669); Café uses evsecrets’ Cafe ambient sound (332271), both CC0. RMS normalization plus soft peak limiting prevents transient peaks from suppressing the rest of these recordings. White noise RMS dropped from 0.12 to 0.05. Updated assets use a versioned URL to refresh phone caches. All six sample-boundary checks pass; listening preference still requires user feedback.
