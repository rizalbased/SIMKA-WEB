import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Sun, 
  Maximize, 
  Tv, 
  Sparkles, 
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';
import { 
  DisplayConfig, 
  ExhibitItem, 
  ScheduleEvent, 
  TriviaQuestion, 
  AnnouncementItem, 
  TickerItem, 
  PlaylistItem,
  LayoutPresetId,
  DisplayMode
} from '../../types';
import { SignageHeader } from '../display/SignageHeader';
import { SignageRunningText } from '../display/SignageRunningText';
import { LayoutThreePhotos } from '../layouts/LayoutThreePhotos';
import { LayoutVideoFullscreen } from '../layouts/LayoutVideoFullscreen';
import { LayoutPhotoSchedule } from '../layouts/LayoutPhotoSchedule';
import { LayoutThreePosters } from '../layouts/LayoutThreePosters';
import { LayoutSinglePoster } from '../layouts/LayoutSinglePoster';
import { LayoutPhotoGrid } from '../layouts/LayoutPhotoGrid';
import { EmergencyTakeover } from '../common/EmergencyTakeover';

interface AdminPreviewTesterProps {
  config: DisplayConfig;
  onUpdateConfig: (config: Partial<DisplayConfig>) => void;
  playlist: PlaylistItem[];
  exhibits: ExhibitItem[];
  schedule: ScheduleEvent[];
  trivia: TriviaQuestion;
  announcements: AnnouncementItem[];
  tickerItems: TickerItem[];
  onSwitchMode: (mode: DisplayMode) => void;
  onVoteTrivia?: (optionId: string) => void;
  onToggleTriviaReveal?: () => void;
}

export const AdminPreviewTester: React.FC<AdminPreviewTesterProps> = ({
  config,
  onUpdateConfig,
  playlist,
  exhibits,
  schedule,
  trivia,
  announcements,
  tickerItems,
  onSwitchMode
}) => {
  const [testSlideIndex, setTestSlideIndex] = useState(0);
  const [isTestPaused, setIsTestPaused] = useState(false);
  const [frameType, setFrameType] = useState<'monitor' | 'frameless'>('monitor');

  const activePlaylist = playlist.filter(p => p.enabled);
  const totalSlides = activePlaylist.length || 1;
  const currentSlide = activePlaylist[testSlideIndex % totalSlides] || activePlaylist[0];

  const activeLayout: LayoutPresetId = config.activeLayout || currentSlide?.layout || 'layout-3-photos';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2.5 border-[#18181B] pb-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#18181B] uppercase tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#0096D6]" />
            <span>TESTER & REMOTE CONTROLLER SIGNAGE</span>
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Simulasikan rotasi slide, respon pemutaran video, pergantian tata letak, dan status alert secara langsung.
          </p>
        </div>

        <button
          onClick={() => onSwitchMode('display')}
          className="bg-[#0096D6] hover:bg-[#0080B8] text-white px-5 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] font-display font-black text-xs uppercase flex items-center gap-2 transition-transform active:translate-y-0.5"
        >
          <Maximize className="w-4 h-4 text-[#FFD166]" />
          <span>Launch Fullscreen Signage</span>
        </button>
      </div>

      {/* Main Testing Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live Interactive Screen Simulator (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0096D6] animate-pulse" />
              <h3 className="font-display text-sm font-black text-[#18181B] uppercase">
                SIMULASI KANVAS 1920 × 1080 PX ({frameType.toUpperCase()})
              </h3>
            </div>

            {/* Frame selector */}
            <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-xl border border-neutral-300 text-xs font-mono">
              {(['monitor', 'frameless'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrameType(f)}
                  className={`px-3 py-1 rounded-lg uppercase font-bold text-[10px] transition-colors ${
                    frameType === f ? 'bg-[#18181B] text-white' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Bezel Container */}
          <div className={`w-full flex items-center justify-center p-2 rounded-2xl transition-all ${
            frameType === 'monitor'
              ? 'bg-[#18181B] border-4 border-[#27272A] shadow-xl'
              : 'bg-black border-2 border-neutral-400'
          }`}>
            <div 
              className="w-full aspect-video bg-black overflow-hidden relative"
              style={{
                display: 'grid',
                gridTemplateRows: '40px 1fr 40px',
                borderRadius: '4px'
              }}
            >
              {/* Header inside simulation */}
              <SignageHeader config={config} />

              {/* Main content view */}
              <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                {activeLayout === 'layout-3-photos' && <LayoutThreePhotos config={config} />}
                {activeLayout === 'layout-video' && <LayoutVideoFullscreen config={config} />}
                {activeLayout === 'layout-photo-schedule' && <LayoutPhotoSchedule config={config} schedule={schedule} />}
                {activeLayout === 'layout-3-posters' && <LayoutThreePosters config={config} />}
                {activeLayout === 'layout-single-poster' && <LayoutSinglePoster config={config} />}
                {activeLayout === 'layout-photo-grid' && <LayoutPhotoGrid config={config} />}
              </div>

              {/* Running text ticker inside simulation */}
              <SignageRunningText config={config} />

              {/* Emergency alert inside simulation */}
              <EmergencyTakeover
                config={config}
                onDismiss={() => onUpdateConfig({ emergencyOverride: false })}
              />
            </div>
          </div>

          {/* Test Playback Controls */}
          <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border-2 border-neutral-300 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTestSlideIndex(s => (s - 1 + totalSlides) % totalSlides)}
                className="p-2 bg-white hover:bg-neutral-100 rounded-xl border border-[#18181B]"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsTestPaused(!isTestPaused)}
                className="px-3 py-2 bg-[#0096D6] text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {isTestPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                <span>{isTestPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={() => setTestSlideIndex(s => (s + 1) % totalSlides)}
                className="p-2 bg-white hover:bg-neutral-100 rounded-xl border border-[#18181B]"
                title="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="font-bold text-[#18181B]">
              Slide {testSlideIndex + 1}/{totalSlides}: <span className="text-[#0096D6]">{currentSlide?.title}</span>
            </div>

            <span className="text-neutral-500 font-bold">Active Layout: <strong>{activeLayout}</strong></span>
          </div>
        </div>

        {/* RIGHT: Remote Simulator Commands & Quick Switches (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Layout Switcher */}
          <div className="bg-white p-5 rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-3">
            <h4 className="font-display text-sm font-black text-[#18181B] uppercase">
              QUICK LAYOUT SWITCH
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {[
                { id: 'layout-3-photos', label: '3 Foto' },
                { id: 'layout-video', label: 'Video Full' },
                { id: 'layout-photo-schedule', label: 'Foto + Jadwal' },
                { id: 'layout-3-posters', label: '3 Poster' },
                { id: 'layout-single-poster', label: 'Poster Tunggal' },
                { id: 'layout-photo-grid', label: 'Grid Foto' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateConfig({ activeLayout: item.id as LayoutPresetId })}
                  className={`p-2.5 rounded-xl border-2 uppercase text-center transition-all ${
                    activeLayout === item.id 
                      ? 'bg-[#0096D6] text-white border-[#18181B] shadow-[2px_2px_0px_#18181B]' 
                      : 'bg-[#F8F6F0] hover:bg-neutral-200 text-[#18181B] border-neutral-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Alert Takeover Simulator */}
          <div className="bg-white p-5 rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#E06D53]" />
                <h4 className="font-display text-sm font-black text-[#18181B] uppercase">
                  SIMULASI BROADCAST DARURAT
                </h4>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              Timpa seluruh tampilan signage secara instan dengan pengumuman evakuasi atau instruksi penting.
            </p>

            <button
              onClick={() => onUpdateConfig({ emergencyOverride: !config.emergencyOverride })}
              className={`w-full py-3 rounded-2xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 border-2 transition-all ${
                config.emergencyOverride
                  ? 'bg-[#E06D53] text-white border-[#18181B] animate-pulse shadow-[2px_2px_0px_#18181B]'
                  : 'bg-[#FDEEE9] hover:bg-[#fad3c8] text-[#E06D53] border-[#E06D53]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{config.emergencyOverride ? 'NONAKTIFKAN BROADCAST DARURAT' : 'PICU BROADCAST DARURAT'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
