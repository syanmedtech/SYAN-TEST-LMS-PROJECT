import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Zap, Palette, Save, Loader2, 
  ChevronRight, PlayCircle, Shield, Info, Image as ImageIcon,
  RotateCcw, Eye, Play, Maximize, Cast, Download, Smartphone,
  Lock, ShieldAlert, MonitorSmartphone, Gauge, Timer, 
  Monitor, Smartphone as MobileIcon, MousePointer, Copy, FastForward,
  Terminal, History
} from 'lucide-react';
import { VideoPlayerSettings } from '../../types';
import { 
  dbGetVideoPlayerSettings, 
  dbSaveVideoPlayerSettings, 
  DEFAULT_VIDEO_SETTINGS 
} from '../../services/db/videoSettingsService';
import { VideoPlayer } from '../../components/VideoPlayer';

interface VideoPlayerSettingsProps {
  videoId: string;
  onClose?: () => void;
}

export const VideoPlayerSettingsComponent: React.FC<VideoPlayerSettingsProps> = ({ videoId, onClose }) => {
  const [settings, setSettings] = useState<VideoPlayerSettings>(DEFAULT_VIDEO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoWidthStr, setLogoWidthStr] = useState("100");
  
  // Safe string states for numeric inputs
  const [maxSpeedStr, setMaxSpeedStr] = useState("1.25");
  const [watermarkIntervalStr, setWatermarkIntervalStr] = useState("12");

  // Preview State
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [logs, setLogs] = useState<{ id: string, msg: string, time: string }[]>([]);
  const videoPlayerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await dbGetVideoPlayerSettings(videoId);
        setSettings(data);
        setLogoWidthStr(String(data.branding.logoWidth || 100));
        setMaxSpeedStr(String(data.security.maxAllowedSpeed || 1.25));
        setWatermarkIntervalStr(String(data.security.watermarkMoveIntervalSec || 12));
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [videoId]);

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now().toString(), msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalSettings: VideoPlayerSettings = {
        ...settings,
        branding: {
          ...settings.branding,
          logoWidth: parseInt(logoWidthStr) || 100
        },
        security: {
          ...settings.security,
          maxAllowedSpeed: parseFloat(maxSpeedStr) || 1.25,
          watermarkMoveIntervalSec: parseInt(watermarkIntervalStr) || 12
        }
      };
      await dbSaveVideoPlayerSettings(videoId, finalSettings);
      alert("Player configuration successfully updated!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Restore player configuration to platform defaults? Any unsaved changes will be lost.")) {
      setSettings(DEFAULT_VIDEO_SETTINGS);
      setLogoWidthStr(String(DEFAULT_VIDEO_SETTINGS.branding.logoWidth));
      setMaxSpeedStr(String(DEFAULT_VIDEO_SETTINGS.security.maxAllowedSpeed));
      setWatermarkIntervalStr(String(DEFAULT_VIDEO_SETTINGS.security.watermarkMoveIntervalSec));
    }
  };

  const updateGeneral = (field: keyof VideoPlayerSettings['general'], val: any) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: val }
    }));
  };

  const updateAdvanced = (field: keyof VideoPlayerSettings['advanced'], val: any) => {
    setSettings(prev => ({
      ...prev,
      advanced: { ...prev.advanced, [field]: val }
    }));
  };

  const updateBranding = (field: keyof VideoPlayerSettings['branding'], val: any) => {
    setSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: val }
    }));
  };

  const updateMobile = (field: keyof VideoPlayerSettings['mobile'], val: any) => {
    setSettings(prev => ({
      ...prev,
      mobile: { ...prev.mobile, [field]: val }
    }));
  };

  const updateSecurity = (field: keyof VideoPlayerSettings['security'], val: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: val }
    }));
  };

  // Simulation Handlers
  const simulateRightClick = () => {
    const videoElement = videoPlayerContainerRef.current?.querySelector('video');
    if (videoElement) {
      videoElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      addLog("Simulated Right Click");
    }
  };

  const simulateCopy = () => {
    const container = videoPlayerContainerRef.current;
    if (container) {
      container.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true }));
      addLog("Simulated Copy Attempt");
    }
  };

  const simulateSeekForward = () => {
    const videoElement = videoPlayerContainerRef.current?.querySelector('video');
    const slider = videoPlayerContainerRef.current?.querySelector('input[type=range]');
    if (videoElement && slider) {
      const targetTime = Math.min(videoElement.duration, videoElement.currentTime + 30);
      // Directly manipulating input to simulate user seek
      (slider as HTMLInputElement).value = String(targetTime);
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      addLog("Simulated Seek Forward (+30s)");
    }
  };

  const Toggle = ({ label, value, onChange, desc, disabled }: any) => (
    <div className={`flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 group transition-opacity ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="flex-1 pr-4">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 transition-colors">{label}</p>
        {desc && <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`w-11 h-6 flex-shrink-0 rounded-full p-1 transition-all duration-300 ${value ? 'bg-primary-500 shadow-sm' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary-600" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Player Schema...</p>
      </div>
    );
  }

  const mockUser: any = { id: 'admin_001', name: 'Dr. Admin', email: 'admin@syanmedical.com', token: 'mock' };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in pb-20">
      {/* Component Header */}
      <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
            <PlayCircle size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Player Configuration</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Video: {videoId.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-200 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <RotateCcw size={14} /> Reset
          </button>
          {onClose && (
            <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-xl font-black shadow-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Commit Changes
          </button>
        </div>
      </div>

      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Settings Sections */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Section 1: General Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20"><Settings size={18} /></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">General Controls</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
              <Toggle label="Preload video" value={settings.general.preload} onChange={(v: boolean) => updateGeneral('preload', v)} desc="Buffering strategy for faster start" />
              <Toggle label="Autoplay" value={settings.general.autoplay} onChange={(v: boolean) => updateGeneral('autoplay', v)} desc="Start video immediately on page load" />
              <Toggle label="Loop" value={settings.general.loop} onChange={(v: boolean) => updateGeneral('loop', v)} desc="Restart video when finished" />
              <Toggle label="Enable Download" value={settings.general.enableDownload} onChange={(v: boolean) => updateGeneral('enableDownload', v)} desc="Show download button to students" />
              <Toggle label="Show Title" value={settings.general.showTitle} onChange={(v: boolean) => updateGeneral('showTitle', v)} desc="Display course/video title in overlay" />
              <Toggle label="Allow PiP" value={settings.general.allowPiP} onChange={(v: boolean) => updateGeneral('allowPiP', v)} desc="Picture-in-picture mode support" />
              <Toggle label="Allow Chromecast/Airplay" value={settings.general.allowCast} onChange={(v: boolean) => updateGeneral('allowCast', v)} desc="Enable casting to external devices" />
              <Toggle label="Smart Resume" value={settings.general.resumePlayback} onChange={(v: boolean) => updateGeneral('resumePlayback', v)} desc="Resume from where student left off" />
            </div>
          </section>

          {/* Section 2: Mobile Overrides */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"><Smartphone size={18} /></div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">Mobile Experience</h3>
                </div>
                <button 
                  onClick={() => updateMobile('enabled', !settings.mobile.enabled)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.mobile.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {settings.mobile.enabled ? 'Enabled' : 'Disabled'}
                </button>
             </div>

             <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm transition-opacity duration-300 ${!settings.mobile.enabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <Toggle label="Data Saver Mode" value={settings.mobile.dataSaver} onChange={(v: boolean) => updateMobile('dataSaver', v)} desc="Default to lower quality on mobile networks" />
                <div className="flex items-center justify-between py-3 px-1 border-b border-slate-50 dark:border-slate-800 group">
                   <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Default Mobile Quality</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Starting resolution for mobile devices</p>
                   </div>
                   <select 
                    value={settings.mobile.defaultQuality}
                    onChange={(e) => updateMobile('defaultQuality', e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none cursor-pointer"
                   >
                      <option value="auto">Auto (Bitrate)</option>
                      <option value="720p">720p (HD)</option>
                      <option value="480p">480p (SD)</option>
                      <option value="360p">360p (Low)</option>
                   </select>
                </div>
                <Toggle label="HQ on WiFi" value={settings.mobile.allowHighQualityOnWifi} onChange={(v: boolean) => updateMobile('allowHighQualityOnWifi', v)} desc="Auto-switch to 1080p when on WiFi" />
                <Toggle label="Large Touch Controls" value={settings.mobile.touchControlsLarge} onChange={(v: boolean) => updateMobile('touchControlsLarge', v)} desc="Increase button sizes for easier tapping" />
                <Toggle label="Resume Bottom Sheet" value={settings.mobile.showResumeBottomSheet} onChange={(v: boolean) => updateMobile('showResumeBottomSheet', v)} desc="Show mobile-optimized resume prompt" />
                <Toggle label="Prefer Fullscreen" value={settings.general.mobilePreferFullscreen} onChange={(v: boolean) => updateGeneral('mobilePreferFullscreen', v)} desc="Auto-request fullscreen on mobile start" />
             </div>
          </section>

          {/* Section 4: Security Settings */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20"><Lock size={18} /></div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">Content Protection</h3>
                </div>
                <button 
                  onClick={() => updateSecurity('enabled', !settings.security.enabled)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.security.enabled ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 text-slate-400'}`}
                >
                  {settings.security.enabled ? 'Enforced' : 'Disabled'}
                </button>
             </div>

             <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm transition-opacity duration-300 ${!settings.security.enabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <Toggle label="Block Right Click" value={settings.security.blockRightClick} onChange={(v: boolean) => updateSecurity('blockRightClick', v)} />
                <Toggle label="Block Copy/Paste" value={settings.security.blockCopyPaste} onChange={(v: boolean) => updateSecurity('blockCopyPaste', v)} />
                <Toggle label="Block Text Selection" value={settings.security.blockTextSelection} onChange={(v: boolean) => updateSecurity('blockTextSelection', v)} />
                <Toggle label="Prevent Downloader Menus" value={settings.security.blockContextMenuDownload} onChange={(v: boolean) => updateSecurity('blockContextMenuDownload', v)} desc="Hide browser native context menu for videos" />
                <Toggle label="Lock Playback Rate" value={settings.security.disablePlaybackRateChange} onChange={(v: boolean) => updateSecurity('disablePlaybackRateChange', v)} desc="Force 1x speed viewing" />
                
                <div className="flex items-center justify-between py-3 px-1 border-b border-slate-50 dark:border-slate-800">
                   <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Max Allowed Speed</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Fallback speed limit if change is allowed</p>
                   </div>
                   <div className="relative w-24">
                      <Gauge className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input 
                        type="text"
                        value={maxSpeedStr}
                        onChange={(e) => setMaxSpeedStr(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full pl-7 p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-black text-center"
                      />
                   </div>
                </div>

                <Toggle label="Prevent Forward Seeking" value={settings.security.preventSeekForward} onChange={(v: boolean) => updateSecurity('preventSeekForward', v)} desc="Only allow backward seeking / rewind" />
                <Toggle label="Enforce Watch Order" value={settings.security.enforceWatchOrder} onChange={(v: boolean) => updateSecurity('enforceWatchOrder', v)} desc="Cannot watch beyond latest reached timestamp" />
                <Toggle label="Watermark Identity" value={settings.security.watermarkUserIdentity} onChange={(v: boolean) => updateSecurity('watermarkUserIdentity', v)} desc="Overlay student credentials" />
                
                <div className="flex items-center justify-between py-3 px-1 border-b border-slate-50 dark:border-slate-800">
                   <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Watermark Interval</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Seconds between position movements</p>
                   </div>
                   <div className="relative w-24">
                      <Timer className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input 
                        type="text"
                        value={watermarkIntervalStr}
                        onChange={(e) => setWatermarkIntervalStr(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-7 p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-black text-center"
                      />
                   </div>
                </div>

                <Toggle label="Log Security Events" value={settings.security.logSecurityEvents} onChange={(v: boolean) => updateSecurity('logSecurityEvents', v)} desc="Record suspicious interactions to Firestore" />
             </div>
          </section>

          {/* Section 3: Branding */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-900/20"><Palette size={18} /></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">Player Branding</h3>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 space-y-6 border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Player Theme Color</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={settings.branding.playerColor || '#0A8BC2'}
                    onChange={(e) => updateBranding('playerColor', e.target.value)}
                    className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border-none p-1 cursor-pointer shadow-sm"
                  />
                  <input 
                    type="text"
                    value={settings.branding.playerColor || '#0A8BC2'}
                    onChange={(e) => updateBranding('playerColor', e.target.value)}
                    className="flex-1 p-3 bg-white dark:bg-slate-900 border-none rounded-xl text-xs font-mono font-bold"
                    placeholder="#Hex Color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <ImageIcon size={12} /> Logo Overlay URL
                </label>
                <input 
                  type="text"
                  value={settings.branding.logoUrl || ''}
                  onChange={(e) => updateBranding('logoUrl', e.target.value)}
                  placeholder="https://syanmedical.com/logo.png"
                  className="w-full p-3 bg-white dark:bg-slate-900 border-none rounded-xl text-xs font-bold shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Position</label>
                  <select 
                    value={settings.branding.logoPosition || 'top-right'}
                    onChange={(e) => updateBranding('logoPosition', e.target.value as any)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border-none rounded-xl text-xs font-bold shadow-sm cursor-pointer outline-none"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Width (px)</label>
                  <input 
                    type="number"
                    value={logoWidthStr}
                    onChange={(e) => setLogoWidthStr(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border-none rounded-xl text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Player Preview Panel */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-6 sticky top-8 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye size={14} className="text-primary-500" /> Interactive Preview
                </h4>
                <div className="bg-white/5 p-1 rounded-xl flex gap-1">
                   <button 
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <Monitor size={14} />
                   </button>
                   <button 
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <MobileIcon size={14} />
                   </button>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 font-bold uppercase border border-primary-500/20">Active Draft</span>
            </div>

            {/* Real Player Runtime Preview */}
            <div 
              ref={videoPlayerContainerRef}
              className={`bg-black overflow-hidden relative transition-all duration-500 shadow-2xl border border-white/5 ${previewMode === 'mobile' ? 'w-[280px] h-[500px] mx-auto rounded-[3rem] ring-8 ring-slate-800' : 'w-full aspect-video rounded-3xl'}`}
            >
              <VideoPlayer 
                courseId="c1"
                user={mockUser}
                onBack={() => {}}
                onTakeQuiz={() => {}}
                onVideoProgress={() => {}}
                settingsOverride={settings}
                deviceOverride={{ mobile: previewMode === 'mobile' }}
                onLocalLog={(msg) => addLog(msg)}
              />
            </div>

            {/* Simulation Controls */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Security Simulation
              </h5>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={simulateRightClick}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <MousePointer size={18} className="text-slate-400 group-hover:text-primary-400" />
                  <span className="text-[8px] font-black uppercase text-slate-500">Right Click</span>
                </button>
                <button 
                  onClick={simulateCopy}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <Copy size={18} className="text-slate-400 group-hover:text-primary-400" />
                  <span className="text-[8px] font-black uppercase text-slate-500">Copy (Cmd+C)</span>
                </button>
                <button 
                  onClick={simulateSeekForward}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <FastForward size={18} className="text-slate-400 group-hover:text-primary-400" />
                  <span className="text-[8px] font-black uppercase text-slate-500">Seek +30s</span>
                </button>
              </div>
            </div>

            {/* Event Logs */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={12} /> Local Session Audit
                </h5>
                <button onClick={() => setLogs([])} className="text-[8px] font-black text-slate-600 hover:text-red-400 uppercase">Clear</button>
              </div>
              <div className="bg-black/50 rounded-xl p-3 h-32 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1">
                {logs.length === 0 ? (
                  <p className="text-slate-700 italic">No events recorded in current preview session.</p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="flex gap-2">
                      <span className="text-slate-600">[{log.time}]</span>
                      <span className="text-primary-400">LOG</span>
                      <span className="text-slate-300">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-primary-500/10 p-4 rounded-2xl border border-primary-500/20 flex gap-3">
              <Shield className="text-primary-500 shrink-0" size={20} />
              <p className="text-[10px] text-primary-400 leading-relaxed font-medium">
                Testing sandbox allows validation of content protection policies before committing to production. These events are logged locally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
