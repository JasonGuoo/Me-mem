# Session 3 Spec: MVP Polish and Stabilization

## Session Goal
Harden the application built in Sessions 1 and 2. Add centralized error handling, a minimal configuration file, basic performance monitoring, and run full end-to-end tests so MVP-1 is stable enough for real-world use.

## Context
- **Depends on**: Sessions 1 and 2 complete and functional
- **Project**: me-mem — Rust/Tauri, Windows 10/11
- **MVP-1 Scope**: this is the final stabilization pass before user testing

## Constraints
- No new user-facing features — only stabilization and quality
- Config file must be human-readable (JSON)
- All error messages shown to the user must be plain English, never raw Rust panic strings
- App must exit cleanly (no orphaned threads or file handles) in all scenarios

---

## Deliverables

### D1 — Centralized error handling (`utils/error.rs`)
- Single `MeMemError` enum covering all failure domains
- `thiserror` derive for clean Display messages
- Every Tauri command returns `Result<T, String>` where the `String` is the `MeMemError` Display
- Error log written to `{recordings_dir}/me-mem.log` (append-only, timestamped)

```rust
#[derive(Debug, thiserror::Error)]
pub enum MeMemError {
    #[error("Microsoft Teams window not found. Please open Teams and try again.")]
    TeamsNotFound,
    #[error("Video capture failed: {0}")]
    VideoCaptureFailed(String),
    #[error("Audio capture failed: {0}")]
    AudioCaptureFailed(String),
    #[error("Recording could not be saved: {0}")]
    FileOperationFailed(String),
    #[error("Playback error: {0}")]
    PlaybackError(String),
    #[error("Configuration error: {0}")]
    ConfigError(String),
}
```

### D2 — Configuration management (`config/mod.rs`)
- JSON config file at `{recordings_dir}/config.json`
- Loaded at startup; missing keys use defaults; invalid values log a warning and use defaults
- Settings changeable at runtime via Tauri command; persisted immediately

```rust
#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    pub recording: RecordingConfig,
    pub playback: PlaybackConfig,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RecordingConfig {
    pub video_quality: VideoQuality,  // High | Medium | Low
    pub prefer_loopback_audio: bool,  // default: true
    pub output_directory: PathBuf,    // default: Documents/me-mem-recordings
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PlaybackConfig {
    pub default_volume: f32,          // 0.0 – 1.0, default: 0.8
    pub default_speed: f32,           // default: 1.0
}

#[derive(Serialize, Deserialize, Clone)]
pub enum VideoQuality {
    High,    // 1080p 30 fps ~8 Mbps
    Medium,  // 720p  30 fps ~4 Mbps
    Low,     //  480p 30 fps ~2 Mbps
}

// Tauri commands
#[tauri::command] async fn get_config() -> Result<Config, String>
#[tauri::command] async fn update_config(config: Config) -> Result<(), String>
```

### D3 — Minimal settings panel (`src/components/Settings.svelte`)
- Output folder picker (uses Tauri dialog)
- Video quality selector (High / Medium / Low)
- Audio source toggle (System audio / Microphone)
- Default volume and speed sliders (mirrors playback defaults)
- Save button — calls `update_config`

### D4 — Performance monitoring (inline, no separate module)
- During recording: log CPU %, memory MB, dropped frames, and disk free space every 10 seconds to `me-mem.log`
- If disk free space < 500 MB, emit a Tauri event `low_disk_space` → UI shows a warning banner
- If dropped frames > 5% of total frames, emit `performance_warning` → UI shows quality tip

### D5 — Stability fixes and testing
- Teams window disappears mid-recording → recording stops cleanly, file is saved
- App closed while recording → recording stops and file is flushed before exit
- Recordings folder deleted externally → app re-creates it on next action
- Two rapid Record→Stop cycles → no file handle leaks
- Playback of a recording that is still being written → show clear error, do not crash

---

## Acceptance Criteria
- [ ] All Tauri commands return user-friendly error strings on failure (no raw panics or Rust errors in the UI)
- [ ] `me-mem.log` is created and updated with timestamped entries during a recording session
- [ ] Config file is created with defaults on first launch; changes made in Settings are persisted after restart
- [ ] Low-disk-space warning appears when < 500 MB free
- [ ] App exits cleanly in all scenarios (task manager shows no orphaned process)
- [ ] End-to-end scenario passes:
  1. Launch app
  2. Open Teams
  3. Detect → Record → wait 60 seconds → Stop
  4. Switch to Player → select recording → playback works
  5. Close app → relaunch → recording still listed

## Known Risks
| Risk | Mitigation |
|------|-----------|
| Thread cleanup on forced close | Use `tauri::RunEvent::ExitRequested` to call stop routines |
| Log file growing unboundedly | Rotate log file at 10 MB |
| Config schema changes in future phases | Version field in JSON; migration on load |

## Out of Scope for This Session
- Any transcription, AI, or search features
- Installer / packaging (deferred to post-MVP)
- Auto-update mechanism
- Multi-language UI
