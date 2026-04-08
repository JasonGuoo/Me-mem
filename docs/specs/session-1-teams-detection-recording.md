# Session 1 Spec: Teams Detection + Basic Recording

## Session Goal
Set up the Rust/Tauri project and deliver a working recording pipeline: detect the Teams window, capture its video, capture system audio, and mux both into a single MP4 file the user can save.

## Context
- **Project**: me-mem — a local Windows desktop app built in Rust + Tauri
- **MVP-1 Scope**: recording only; no transcription, no search, no library
- **Platform**: Windows 10/11 only
- **Previous work**: none — this is the first session

## Constraints
- All processing is local; no cloud calls
- Output must be a single `.mp4` (H.264 video + AAC audio)
- Must not require Teams to be run as administrator
- If Windows Graphics Capture API is unavailable, fall back to GDI BitBlt silently
- If system audio capture fails, fall back to microphone-only silently

---

## Deliverables

### D1 — Cargo project scaffold
- Tauri app builds and launches on Windows
- Logging (`tracing`) initialised at startup
- `recordings/` output directory created automatically in user's Documents folder

### D2 — Teams window detection (`recording/teams_detector.rs`)
- Detects a running Teams window by window class and title
- Returns `Option<HWND>`; handles zero, one, or multiple matches
- Exposes a Tauri command `detect_teams_window() -> bool`

### D3 — Video capture (`recording/video_capture.rs`)
- Captures the Teams `HWND` at 30 FPS
- Encodes to H.264 via FFmpeg
- Handles window resize/move during capture without crashing

### D4 — Audio capture (`recording/audio_capture.rs`)
- Captures system audio (loopback) via WASAPI at 48 kHz / 16-bit / stereo
- Falls back to default microphone if loopback fails
- Runs on a dedicated thread; does not block the UI

### D5 — Recording controller (`recording/mod.rs`)
- Coordinates video + audio with a shared timestamp origin
- Muxes streams into one MP4 at `stop_recording()`
- File name: `teams-YYYY-MM-DD-HHMMSS.mp4`
- Exposes Tauri commands: `start_recording()`, `stop_recording()`, `get_recording_status()`

### D6 — Recorder UI (`src/components/Recorder.svelte`)
Implement the Recorder tab from `docs/UI-design/UI-design.ts`. Exact structure:

**Layout** (max-w-3xl, centered):
- Header: "Recorder" title + subtitle + "Live Capture" pulse badge when recording
- 2-column grid: [Detection card + Output Info card] | [Controls card]
- Success banner (green) shown after stop with file name + "Open Folder" / "View" links
- Footer tip bar (blue dashed border)

**Detection Card**:
- Badge: `idle` (gray "Scanning...") → `detected` (green "Detected") state
- "RE-SCAN" button top-right
- When detected: shows target window name + Audio READY status
- When idle: "Waiting for active Microsoft Teams window..."

**Controls Card**:
- Large 3xl tabular-nums timer (gray when idle, black when recording)
- Single full-width button: blue "START RECORDING" (Circle icon) → red "STOP" (Square icon)
- Disabled when detection state is idle
- Compact 20-segment VU bar (green segments, amber at >16, gray when not recording)

**Output Info Card**:
- Location: output directory path (truncated)
- Storage: live MB counter during recording (`timer * 1.1` MB estimate)

**Global Sidebar** (shared across tabs, `w-48`):
- "M" logo (blue #0078D4) + "Me-mem" title
- Nav items: Recorder (Video icon), Player (History icon)
- Active item: white bg, shadow, blue icon
- Bottom: Settings button

**Status Bar** (footer, `h-6`):
- Left: recording state dot (red/green) + Teams connection state
- Right: Disk free + current time

**Theme tokens** (light, Windows-style):
```
bg: #F3F3F3  |  sidebar: #EBEBEB  |  surface: #FFFFFF
border: #D1D1D1  |  accent: #0078D4
success: #107C10  |  error: #C42B1C
```

---

## Key Interfaces

```rust
// recording/teams_detector.rs
pub fn find_teams_window() -> Option<HWND>
pub fn get_window_rect(hwnd: HWND) -> Option<RECT>
pub fn is_teams_window(hwnd: HWND) -> bool

// recording/video_capture.rs
pub struct VideoCapture { hwnd: HWND, frame_rate: u32 }
impl VideoCapture {
    pub fn new(hwnd: HWND) -> Result<Self>
    pub fn start(&mut self, output: &Path) -> Result<()>
    pub fn stop(&mut self) -> Result<()>
}

// recording/audio_capture.rs
pub struct AudioCapture { sample_rate: u32 }
impl AudioCapture {
    pub fn new(prefer_loopback: bool) -> Result<Self>
    pub fn start(&mut self, output: &Path) -> Result<()>
    pub fn stop(&mut self) -> Result<()>
    pub fn rms_level(&self) -> f32
}

// recording/mod.rs — state machine
// Idle → Detecting → Recording → Stopping → Idle
//   ↓ error at every transition → Error → Idle
pub enum RecordingState { Idle, Detecting, Recording, Stopping, Error(String) }

// Tauri commands
#[tauri::command] async fn detect_teams_window() -> Result<bool, String>
#[tauri::command] async fn start_recording() -> Result<String, String>
#[tauri::command] async fn stop_recording() -> Result<String, String>
#[tauri::command] async fn get_recording_status() -> Result<RecordingStatus, String>
```

## Cargo.toml Dependencies
```toml
[dependencies]
tauri       = { version = "1.0", features = ["api-all"] }
tokio       = { version = "1.0", features = ["full"] }
serde       = { version = "1.0", features = ["derive"] }
serde_json  = "1.0"
ffmpeg-next = "6.0"
cpal        = "0.15"
anyhow      = "1.0"
thiserror   = "1.0"
tracing     = "0.1"
tracing-subscriber = "0.3"
chrono      = { version = "0.4", features = ["serde"] }

[target.'cfg(windows)'.dependencies]
windows = { version = "0.52", features = [
    "Win32_Foundation",
    "Win32_UI_WindowsAndMessaging",
    "Win32_Graphics_Gdi",
    "Win32_Graphics_Dwm",
    "Win32_Graphics_Direct3D11",
    "Win32_Graphics_Dxgi",
    "Win32_Media_Audio",
    "Win32_System_Threading",
    "Win32_System_WinRT_Graphics_Capture",
] }
```

---

## Acceptance Criteria
- [ ] `cargo build --release` succeeds on Windows with no warnings
- [ ] App launches and shows the Recorder UI
- [ ] "Detect" button correctly identifies a running Teams window (true/false)
- [ ] Clicking "Record" starts capture; timer increments; audio VU bar responds
- [ ] Clicking "Stop" produces a valid `.mp4` in the recordings folder
- [ ] MP4 plays in VLC with audio and video in sync
- [ ] If Teams is not open, "Detect" returns false and "Record" shows an error
- [ ] No crash when Teams window is resized or moved during recording

## Known Risks
| Risk | Mitigation |
|------|-----------|
| Graphics Capture API requires Windows 10 1903+ | Check OS version at startup; fall back to BitBlt |
| WASAPI loopback unavailable on some setups | Fall back to microphone; log the reason |
| FFmpeg linking complexity on Windows | Pin `ffmpeg-next = "6.0"` and document vcpkg setup |

## Out of Scope for This Session
- Playback
- File listing or management
- Configuration UI
- Error log file
- Any transcription or AI features
