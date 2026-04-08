# Session 2 Spec: Simple Playback Interface

## Session Goal
Build a minimal but fully functional playback UI so the user can select any recording produced in Session 1 and replay it with standard video controls.

## Context
- **Depends on**: Session 1 complete — MP4 files exist in the recordings folder
- **Project**: me-mem — Rust/Tauri, Windows 10/11
- **MVP-1 Scope**: recording + playback only; nothing else
- **Video format**: H.264/AAC inside MP4 (output of Session 1)

## Constraints
- Playback must use the same FFmpeg already linked in Session 1
- No streaming; files are local only
- No transcript panel, no subtitle overlay — pure video player
- Minimal UI: functional over beautiful

---

## Deliverables

### D1 — Video player backend (`playback/video_player.rs`)
- Decodes MP4 (H.264 + AAC) via FFmpeg
- Renders frames to a window/canvas surface
- Supports hardware-accelerated decode (D3D11VA) if available; CPU fallback
- Accurate seek by timestamp
- Playback speed: 0.5×, 1×, 1.5×, 2×
- Volume control (0–100%)

### D2 — File manager (`utils/file_manager.rs`)
- Scans recordings directory for `*.mp4` files
- Extracts metadata: duration, resolution, file size, created-at timestamp
- Returns a sorted list (newest first)
- Exposes Tauri command `get_recordings_list() -> Vec<RecordingInfo>`

### D3 — Player UI (`src/components/Player.svelte`)
Implement the Player tab from `docs/UI-design/UI-design.ts`. Exact structure:

**Layout** (full height flex column):
- Header: "Player" title + FolderOpen + RefreshCw icon buttons
- Body: horizontal flex — recording list (30%) | video player area (70%)

**Recording List (left panel)**:
- Search/filter input with Search icon (filters by filename)
- Scrollable list; each row: file name (bold, truncated) + date + duration
- Selected row: blue `#0078D4` left border + light blue background tint
- Unselected: transparent left border + gray hover

**Video Player (right panel)**:
- Black canvas area (flex-1) with centered Play icon placeholder (opacity-40)
- When no video selected: dark gray background + "Select file to play" hint
- **Controls bar** (white/95, border-top):
  - Seek bar: thin `h-1` progress bar, blue fill, clickable
  - Bottom row left: Play/Pause toggle + `current / total` time (tabular-nums)
  - Bottom row right: Volume icon + thin volume bar + Speed selector (1.0x/1.5x/2.0x) + Maximize icon
- **Metadata strip** below player (when selected): file name + date + "HD Capture" label + ExternalLink + MoreVertical buttons

**Navigation**:
- Switching to Player auto-selects first recording if none selected
- Selecting a new recording from list stops current playback and loads new file

### D4 — App navigation (`src/App.svelte`)
- Tab or sidebar toggle between **Recorder** (Session 1) and **Player** (Session 2)
- Active tab persists across hot reloads during development

---

## Key Interfaces

```rust
// playback/video_player.rs
pub enum PlaybackState { Idle, Playing, Paused, Stopped, Error(String) }

pub struct VideoPlayer { state: PlaybackState }
impl VideoPlayer {
    pub fn new(file_path: &Path) -> Result<Self>
    pub fn play(&mut self) -> Result<()>
    pub fn pause(&mut self) -> Result<()>
    pub fn stop(&mut self) -> Result<()>
    pub fn seek(&mut self, seconds: f64) -> Result<()>
    pub fn set_speed(&mut self, speed: f32) -> Result<()>   // 0.5 | 1.0 | 1.5 | 2.0
    pub fn set_volume(&mut self, level: f32) -> Result<()>  // 0.0 – 1.0
    pub fn duration(&self) -> f64     // total seconds
    pub fn position(&self) -> f64     // current seconds
}

// utils/file_manager.rs
#[derive(Serialize, Deserialize)]
pub struct RecordingInfo {
    pub file_path: String,
    pub file_name: String,
    pub duration_secs: u64,
    pub file_size_bytes: u64,
    pub created_at: DateTime<Utc>,
    pub resolution: (u32, u32),
}

pub fn get_recordings_list() -> Result<Vec<RecordingInfo>>
pub fn get_recording_info(file_path: &Path) -> Result<RecordingInfo>

// Tauri commands
#[tauri::command] async fn get_recordings_list() -> Result<Vec<RecordingInfo>, String>
#[tauri::command] async fn load_video(file_path: String) -> Result<(), String>
#[tauri::command] async fn play_video() -> Result<(), String>
#[tauri::command] async fn pause_video() -> Result<(), String>
#[tauri::command] async fn stop_video() -> Result<(), String>
#[tauri::command] async fn seek_video(seconds: f64) -> Result<(), String>
#[tauri::command] async fn set_playback_speed(speed: f32) -> Result<(), String>
#[tauri::command] async fn set_volume(level: f32) -> Result<(), String>
#[tauri::command] async fn get_playback_position() -> Result<f64, String>
```

---

## Acceptance Criteria
- [ ] Recording list loads and shows all MP4 files in the recordings folder with correct metadata
- [ ] Clicking a recording in the list loads and auto-plays it
- [ ] Play/Pause toggles correctly
- [ ] Seek bar can be dragged to any position; playback resumes from that point
- [ ] Volume slider works (mute at 0, full at 100)
- [ ] Speed selector changes playback rate visibly
- [ ] Fullscreen toggle works and ESC exits fullscreen
- [ ] Switching to a new recording while one is playing stops the current one cleanly
- [ ] No crash if recordings folder is empty
- [ ] Navigator (tab/sidebar) switches between Recorder and Player without losing state

## Known Risks
| Risk | Mitigation |
|------|-----------|
| FFmpeg frame rendering to Tauri WebView | Use `tauri::Window::emit` to push frame data or render to a native overlay |
| Seek precision on large files | Use keyframe-aligned seeking as fallback |
| Audio/video drift on speed change | Use FFmpeg's `setpts` + `atempo` filters |

## Out of Scope for This Session
- Deleting or renaming recordings
- Any UI settings or configuration panel
- Subtitle or transcript overlay
- Thumbnail generation for recordings
