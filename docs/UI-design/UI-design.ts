import React, { useState, useEffect } from 'react';
import { 
  Video, 
  History, 
  Settings, 
  Monitor, 
  Circle, 
  Square, 
  Volume2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  FolderOpen,
  RefreshCw,
  Search,
  MoreVertical,
  ChevronRight,
  Clock,
  HardDrive
} from 'lucide-react';

const App = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState('recorder');
  const [isRecording, setIsRecording] = useState(false);
  const [detectionState, setDetectionState] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playbackState, setPlaybackState] = useState({ playing: false, progress: 0, speed: '1.0x' });

  // Mock Data
  const recordings = [
    { id: 1, name: 'teams-2026-04-07-143210.mp4', date: 'Apr 7, 2026', time: '02:32 PM', duration: '00:12:44', size: '834 MB' },
    { id: 2, name: 'teams-2026-04-06-101500.mp4', date: 'Apr 6, 2026', time: '10:15 AM', duration: '01:05:22', size: '2.1 GB' },
    { id: 3, name: 'teams-2026-04-05-090000.mp4', date: 'Apr 5, 2026', time: '09:00 AM', duration: '00:45:10', size: '1.4 GB' },
    { id: 4, name: 'teams-2026-04-04-162011.mp4', date: 'Apr 4, 2026', time: '04:20 PM', duration: '00:22:15', size: '412 MB' },
  ];

  // --- Light Theme Design Tokens ---
  const theme = {
    bg: '#F3F3F3',          // Windows Light Background
    sidebar: '#EBEBEB',     // Sidebar/Panel Background
    surface: '#FFFFFF',     // Card Surface
    border: '#D1D1D1',      // Subtle borders
    accent: '#0078D4',      // Windows Blue
    success: '#107C10',
    warning: '#9D5D00',
    error: '#C42B1C',
    textPrimary: '#1A1A1A',
    textSecondary: '#5E5E5E',
    textMuted: '#707070'
  };

  // --- Logic ---
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return [hrs, mins, secs].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const handleDetect = () => {
    setDetectionState('idle');
    setTimeout(() => setDetectionState('detected'), 800);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setShowSuccessBanner(true);
    } else {
      setIsRecording(true);
      setShowSuccessBanner(false);
    }
  };

  const handleSpeedChange = (e) => {
    setPlaybackState(prev => ({ ...prev, speed: e.target.value }));
  };

  // --- Compact Components ---

  const Badge = ({ type, children }) => {
    const styles = {
      idle: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <AlertCircle size={10}/> },
      detected: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={10}/> },
      error: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle size={10}/> },
    };
    const s = styles[type] || styles.idle;
    return (
      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${s.bg} ${s.text} border border-black/5`}>
        {s.icon} {children}
      </span>
    );
  };

  const Card = ({ title, children, className = "" }) => (
    <div className={`rounded border overflow-hidden ${className}`} style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <div className="px-3 py-1.5 border-b flex items-center justify-between bg-black/[0.02]" style={{ borderColor: theme.border }}>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  return (
    <div className="flex h-screen w-full select-none font-sans overflow-hidden text-[13px]" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
      
      {/* --- Compact Sidebar --- */}
      <aside className="w-48 flex flex-col border-r shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.sidebar }}>
        <div className="p-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#0078D4] flex items-center justify-center font-bold text-xs text-white">M</div>
          <span className="text-base font-bold tracking-tight">Me-mem</span>
        </div>
        
        <nav className="flex-1 px-2 space-y-0.5 mt-1">
          <button 
            onClick={() => setActiveTab('recorder')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-all ${activeTab === 'recorder' ? 'bg-white shadow-sm text-black border border-black/5' : 'hover:bg-black/5 text-gray-600'}`}
          >
            <Video size={16} className={activeTab === 'recorder' ? 'text-[#0078D4]' : ''} />
            <span className="font-semibold">Recorder</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('player');
              if (!selectedVideo) setSelectedVideo(recordings[0]);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-all ${activeTab === 'player' ? 'bg-white shadow-sm text-black border border-black/5' : 'hover:bg-black/5 text-gray-600'}`}
          >
            <History size={16} className={activeTab === 'player' ? 'text-[#0078D4]' : ''} />
            <span className="font-semibold">Player</span>
          </button>
        </nav>

        <div className="p-2 border-t" style={{ borderColor: theme.border }}>
          <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-black/5 text-gray-500 transition-colors">
            <Settings size={16} />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mock Window Controls (Light) */}
        <div className="h-7 flex items-center justify-end px-3 gap-6 bg-white/50 border-b" style={{ borderColor: theme.border }}>
          <div className="flex gap-4 items-center">
            <div className="w-3 h-px bg-gray-500"></div>
            <div className="w-2.5 h-2.5 border border-gray-500"></div>
            <div className="w-3 h-3 text-gray-500 flex items-center justify-center text-xs cursor-default">✕</div>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-5">
          {activeTab === 'recorder' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-bold">Recorder</h1>
                  <p className="text-gray-500 text-xs mt-0.5">Capture Teams video + audio locally.</p>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest bg-red-50 px-2 py-1 rounded border border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Live Capture
                  </div>
                )}
              </header>

              {showSuccessBanner && (
                <div className="flex items-center justify-between px-3 py-2 rounded border bg-green-50 border-green-200 text-green-700 animate-in fade-in slide-in-from-top-1 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span className="font-bold">Saved: teams-2026-04-07-143210.mp4</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="font-bold hover:underline">Open Folder</button>
                    <button onClick={() => setActiveTab('player')} className="font-bold hover:underline">View</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A. Detection & B. Controls Grid */}
                <div className="space-y-4">
                  <Card title="Detection">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge type={detectionState}>
                          {detectionState === 'idle' ? 'Scanning...' : 'Detected'}
                        </Badge>
                        <button onClick={handleDetect} className="text-[10px] font-bold text-[#0078D4] hover:underline flex items-center gap-1">
                          <RefreshCw size={10} /> RE-SCAN
                        </button>
                      </div>
                      
                      {detectionState === 'detected' ? (
                        <div className="text-xs bg-gray-50 p-2 rounded border border-gray-100 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Target:</span>
                            <span className="font-semibold truncate max-w-[120px]">Product Sync</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Audio:</span>
                            <span className="text-green-600 font-bold">READY</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 leading-tight">Waiting for active Microsoft Teams window...</p>
                      )}
                    </div>
                  </Card>

                  <Card title="Output Info">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Location</p>
                        <p className="truncate">Videos/Me-mem</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Storage</p>
                        <p>{isRecording ? `${(timer * 1.1).toFixed(1)} MB` : '0 MB'}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card title="Controls" className="flex flex-col justify-center">
                  <div className="flex flex-col items-center py-2">
                    <div className={`text-3xl font-bold tabular-nums mb-4 ${isRecording ? 'text-black' : 'text-gray-300'}`}>
                      {formatTime(timer)}
                    </div>
                    
                    <button 
                      disabled={detectionState === 'idle'}
                      onClick={toggleRecording}
                      className={`w-full py-2.5 rounded font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-20 ${
                        isRecording ? 'bg-[#C42B1C] hover:bg-[#a82318] text-white' : 'bg-[#0078D4] hover:bg-[#006abc] text-white'
                      }`}
                    >
                      {isRecording ? <Square size={14} fill="white" /> : <Circle size={14} fill="white" />}
                      {isRecording ? 'STOP' : 'START RECORDING'}
                    </button>

                    {/* Compact Audio VU */}
                    <div className="w-full mt-4 space-y-1">
                      <div className="h-1 bg-gray-100 rounded-full flex gap-0.5 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full w-full transition-all duration-100 ${
                              !isRecording ? 'bg-gray-200' : i > 16 ? 'bg-amber-400' : 'bg-green-500'
                            }`}
                            style={{ opacity: isRecording ? (Math.random() * 0.7 + 0.3) : 1 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Educational Compact Footer */}
              <div className="p-2 border border-dashed rounded flex items-center gap-3 bg-blue-50/30" style={{ borderColor: theme.border }}>
                <AlertCircle size={14} className="text-[#0078D4]" />
                <p className="text-[11px] text-gray-500">Tip: Keep the Teams window in the foreground for optimal capture quality.</p>
              </div>
            </div>
          ) : (
            /* --- COMPACT PLAYER VIEW --- */
            <div className="h-full flex flex-col space-y-4">
              <header className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Player</h1>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-black/5 text-gray-600"><FolderOpen size={14} /></button>
                  <button className="p-1.5 rounded hover:bg-black/5 text-gray-600"><RefreshCw size={14} /></button>
                </div>
              </header>

              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                {/* Left: Recording List (30%) - Compact */}
                <div className="w-[30%] flex flex-col border rounded overflow-hidden shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <div className="p-2 border-b bg-gray-50" style={{ borderColor: theme.border }}>
                    <div className="relative">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Filter..." 
                        className="w-full bg-white border border-gray-200 rounded pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-[#0078D4]"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {recordings.map((rec) => (
                      <div 
                        key={rec.id}
                        onClick={() => setSelectedVideo(rec)}
                        className={`p-2.5 cursor-pointer transition-all flex items-center gap-2 ${selectedVideo?.id === rec.id ? 'bg-[#0078D4]/5 border-l-2 border-l-[#0078D4]' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-bold truncate leading-tight">{rec.name}</h4>
                          <div className="flex gap-1.5 text-[10px] text-gray-500 mt-0.5">
                            <span>{rec.date}</span>
                            <span>•</span>
                            <span>{rec.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Compact Video Player (70%) */}
                <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                  <div className="flex-1 relative bg-black rounded border overflow-hidden flex flex-col group shadow-md" style={{ borderColor: theme.border }}>
                    {selectedVideo ? (
                      <>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                             <Play size={24} className="text-white ml-1 opacity-40" />
                          </div>
                        </div>
                        
                        {/* Playback Controls (Compact) */}
                        <div className="bg-white/95 border-t p-2 space-y-2" style={{ borderColor: theme.border }}>
                          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                            <div className="h-full bg-[#0078D4]" style={{ width: '22%' }} />
                          </div>

                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setPlaybackState(prev => ({...prev, playing: !prev.playing}))} className="text-black hover:text-[#0078D4]">
                                {playbackState.playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                              </button>
                              <span className="text-[10px] font-bold tabular-nums text-gray-500">00:02:44 / {selectedVideo.duration}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <Volume2 size={12} className="text-gray-400" />
                                <div className="w-12 h-0.5 bg-gray-200 rounded-full">
                                  <div className="h-full bg-gray-400 w-2/3" />
                                </div>
                              </div>
                              <select 
                                value={playbackState.speed}
                                onChange={handleSpeedChange}
                                className="bg-transparent text-[10px] font-bold border-none outline-none text-[#0078D4] cursor-pointer"
                              >
                                <option value="1.0x">1.0x</option>
                                <option value="1.5x">1.5x</option>
                                <option value="2.0x">2.0x</option>
                              </select>
                              <Maximize size={12} className="text-gray-400 hover:text-black cursor-pointer" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-700 bg-gray-900">
                        <Play size={32} className="mb-2 opacity-10 text-white" />
                        <p className="text-xs text-gray-400">Select file to play</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata Below Player - Compact */}
                  {selectedVideo && (
                    <div className="px-3 py-2 rounded border flex items-center justify-between bg-white shadow-sm" style={{ borderColor: theme.border }}>
                      <div className="min-w-0">
                        <h2 className="text-[12px] font-bold truncate">{selectedVideo.name}</h2>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                          <span>{selectedVideo.date}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>HD Capture</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                         <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ExternalLink size={14} /></button>
                         <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><MoreVertical size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* --- Condensed Global Status Bar --- */}
        <footer className="h-6 border-t flex items-center justify-between px-3 text-[9px] font-bold uppercase tracking-wider" style={{ borderColor: theme.border, backgroundColor: theme.sidebar, color: theme.textMuted }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-600' : 'bg-green-600'}`} />
              <span className={isRecording ? 'text-red-600' : 'text-green-700'}>
                {isRecording ? 'Capturing' : 'Idle'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor size={10} />
              <span>{detectionState === 'detected' ? 'Teams' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <HardDrive size={10} />
              <span>Disk: 242GB</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>07:22 PM</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;