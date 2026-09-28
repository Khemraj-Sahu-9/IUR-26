# ASHA Worker Digital Platform — Demo Video Technical Notes

## 1. Video & Audio Specifications

* **Output Video:** `presentation/asha_demo_video.mp4`
* **Alternate WebM Format:** `presentation/asha_demo_video.webm`
* **Video Container / Codec:** MP4 container, H.264 (AVC1), 60/30 fps, Progressive scan
* **Target Resolution:** 1920 × 1080 (Full HD, 16:9 Aspect Ratio)
* **Audio Track:** ElevenLabs AI Narration (`uploaded_media_1790627822688.mp3`)
* **Audio Codec:** AAC-LC, Stereo, 44,100 Hz, 192 kbps
* **Duration:** Exactly 04:38.31 (278.31 seconds)
* **Synchronization Tolerance:** ±0.5 seconds between speech cue and screen state transition

---

## 2. Browser & Recording Environment

* **Automation Engine:** Playwright Chromium headless/headed video capture
* **Base URL:** `http://127.0.0.1:3000/` (Vite production/dev preview server)
* **Viewport Size:** 1920 × 1080
* **Device Emulation:** Clean desktop viewport presenting the centered responsive mobile-first application container (`max-w-xl`, ~576px wide on `slate-50` background), preserving full readability and touch-target proportions without cropping.
* **Network Emulation:** Playwright CDP network emulation (`page.context().setOffline(true/false)`) to trigger native browser `online`/`offline` DOM events and Dexie.js offline queueing.

---

## 3. Playwright Automation Design

* **Zero Application Code Changes:** Recording is orchestrated purely through external Playwright automation and local video tools.
* **Deterministic Timing:** Every screen transition waits for specific audio timestamps calculated from the original ElevenLabs narration track.
* **Real Offline Verification:** The recording does not fake offline state; it cuts the simulated network, triggering the application's actual `connectivityService` and `SyncStatusBar` indicators.
* **Real Sync Verification:** The recording triggers actual background sync upon reconnection, displaying the live sync indicator transitions (`Offline ➔ Syncing ➔ All changes synced`).
