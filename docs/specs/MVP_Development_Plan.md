# MVP-1 Development Plan - Teams Meeting Recorder

## MVP-1 Scope
**Platform**: Windows  
**Core Features**: Teams detection + recording + replay ONLY  
**Timeline**: 2-3 weeks  

## Session Seeds

### Session 1: Teams Detection + Basic Recording
**Goal**: Detect Teams window and record video + audio  
**Duration**: 3-4 days  

**Tasks**:
- Initialize Cargo project with Windows-specific dependencies
- Implement Teams window detection (FindWindow API)
- Set up screen capture using Windows Graphics Capture API
- Implement audio capture using WASAPI
- Create basic recording controls (Record/Stop)
- Save recordings as MP4 with audio

**Key Decisions Needed**:
- Window detection method (title/class name)
- Video format and quality settings
- Audio source (system audio vs microphone)

**Deliverables**:
- Teams window detection
- Video + audio recording to MP4
- Basic Record/Stop controls

---

### Session 2: Simple Playback Interface
**Goal**: Replay recorded meetings  
**Duration**: 2-3 days  

**Tasks**:
- Implement basic video player component
- Add file selection for recorded meetings
- Implement video controls (play/pause/seek)
- Add basic recording info (duration, file size)
- Simple file list of recent recordings

**Key Decisions Needed**:
- Video player library choice
- File organization for recordings

**Deliverables**:
- Video playback functionality
- File selection interface
- Basic video controls

---

### Session 3: MVP Polish
**Goal**: Stabilize and refine core features  
**Duration**: 1-2 days  

**Tasks**:
- Error handling for recording failures
- Progress indicators during recording
- Basic settings (quality, output folder)
- Testing on different Teams window configurations
- Performance optimization

**Key Decisions Needed**:
- Default quality settings
- Error recovery strategies

**Deliverables**:
- Stable recording and playback
- Basic configuration options
- Error handling

---

## Technical Architecture

### Dependencies
```toml
[dependencies]
tauri = "1.0"
tokio = "1.0"
serde = { version = "1.0", features = ["derive"] }
ffmpeg-next = "6.0"
windows = { version = "0.52", features = [
    "Win32_UI_WindowsAndMessaging",
    "Win32_Graphics_Gdi", 
    "Win32_Media_Audio",
    "Win32_System_Threading"
] }
cpal = "0.15"
```

### Project Structure
```
me-mem/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── recording/
│   │   │   ├── mod.rs
│   │   │   ├── teams_detector.rs
│   │   │   ├── video_capture.rs
│   │   │   └── audio_capture.rs
│   │   ├── playback/
│   │   │   ├── mod.rs
│   │   │   └── video_player.rs
│   │   └── utils/
│   │       ├── mod.rs
│   │       └── file_manager.rs
│   └── Cargo.toml
├── src/
│   ├── App.svelte
│   └── components/
│       ├── Recorder.svelte
│       └── Player.svelte
└── recordings/
```

## Success Criteria for MVP

### Must-Have Features
- [ ] Teams window detection and capture
- [ ] Video + audio recording to MP4
- [ ] Basic playback with controls
- [ ] File selection for recordings
- [ ] Stable on Windows 10/11

### Performance Targets
- Recording latency <200ms
- Application startup <5 seconds
- Memory usage <500MB during recording
- Video quality: 1080p/30fps minimum

### Known Limitations (Acceptable for MVP)
- Single meeting recording at a time
- No file management or library features
- Basic UI with minimal controls
- Manual meeting start/stop
- Teams window only (no other apps)

## Risk Mitigation

### Technical Risks
1. **Teams Window Access**: Microsoft may restrict API access
   - *Mitigation*: Screen capture as fallback
2. **Audio Quality**: System audio capture complexity
   - *Mitigation*: Start with microphone only
3. **Video Performance**: High CPU usage during recording
   - *Mitigation*: Hardware acceleration options, quality settings

### User Experience Risks
1. **Complex Setup**: Installation and configuration
   - *Mitigation*: Single executable, minimal configuration
2. **Resource Usage**: High CPU/memory during recording
   - *Mitigation*: Resource monitoring, user warnings

## Next Steps After MVP

1. **User Testing**: Basic recording and playback workflow
2. **Phase 2**: Add Whisper transcription
3. **Phase 3**: Terms management and search
4. **Phase 4**: Advanced features (summarization, translation)

---

**MVP Target Completion**: 2-3 weeks from project start  
**User Testing**: Week 4  
**Phase 2 Planning**: Week 5
