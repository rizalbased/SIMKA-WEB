import React, { useState, useEffect } from 'react';
import { 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  LayoutGrid, 
  Volume2, 
  VolumeX, 
  Layers, 
  ShieldAlert, 
  MonitorPlay,
  RotateCcw
} from 'lucide-react';
import { LayoutPresetId, DisplayConfig } from '../../types';

interface FloatingControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  currentLayout: LayoutPresetId;
  onSelectLayout: (layout: LayoutPresetId) => void;
  onOpenAdmin: () => void;
  config: DisplayConfig;
  onToggleEmergency: () => void;
  isNativeFullscreen: boolean;
  onToggleNativeFullscreen: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  isPaused,
  onTogglePause,
  onPrevSlide,
  onNextSlide,
  currentLayout,
  onSelectLayout,
  onOpenAdmin,
  config,
  onToggleEmergency,
  isNativeFullscreen,
  onToggleNativeFullscreen
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  let timeoutId: any = null;

  const handleMouseMove = () => {
    setIsVisible(true);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!isLayoutMenuOpen) {
        setIsVisible(false);
      }
    }, 4000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [isLayoutMenuOpen]);

  const layouts: { id: LayoutPresetId; label: string; iconLabel: string }[] = [
    { id: 'layout-a-magazine', label: 'Layout A: Magazine Split', iconLabel: 'MAG' },
    { id: 'layout-b-bento', label: 'Layout B: Triple Bento', iconLabel: 'BENTO' },
    { id: 'layout-c-hero', label: 'Layout C: Hero Bleed', iconLabel: 'HERO' },
    { id: 'layout-d-quad', label: 'Layout D: Quad Matrix', iconLabel: 'QUAD' },
    { id: 'layout-e-portrait', label: 'Layout E: 9:16 Kiosk', iconLabel: 'KIOSK' }
  ];

  return (
    <div 
      className={`fixed bottom-14 right-6 z-40 transition-all duration-300 ${
        isVisible || isLayoutMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Layout quick-picker popover */}
      {isLayoutMenuOpen && (
        <div className="absolute bottom-14 right-0 mb-2 w-64 bg-white p-3 rounded-2xl simka-border simka-shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="text-[11px] font-mono-code font-bold uppercase text-[#18181B]/60 px-2 pb-2 mb-1 border-b border-neutral-200">
            Switch Display Layout
          </div>
          <div className="space-y-1">
            {layouts.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onSelectLayout(l.id);
                  setIsLayoutMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold font-display flex items-center justify-between transition-colors ${
                  currentLayout === l.id 
                    ? 'bg-[#0D6E6E] text-white' 
                    : 'hover:bg-[#FFF8E7] text-[#18181B]'
                }`}
              >
                <span>{l.label}</span>
                <span className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded ${
                  currentLayout === l.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-[#18181B]'
                }`}>
                  {l.iconLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Floating HUD Bar */}
      <div className="flex items-center gap-1.5 bg-[#18181B]/95 text-white p-1.5 rounded-2xl simka-shadow-lg backdrop-blur-md border border-white/20">
        <button
          onClick={onPrevSlide}
          title="Previous Slide"
          className="p-2 hover:bg-white/20 rounded-xl transition-colors text-neutral-200 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume Rotation' : 'Pause Rotation'}
          className={`p-2 rounded-xl transition-colors ${
            isPaused ? 'bg-[#F9C74F] text-[#18181B]' : 'hover:bg-white/20 text-neutral-200 hover:text-white'
          }`}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={onNextSlide}
          title="Next Slide"
          className="p-2 hover:bg-white/20 rounded-xl transition-colors text-neutral-200 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

        <button
          onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
          title="Layout Selector"
          className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition-colors ${
            isLayoutMenuOpen ? 'bg-[#0D6E6E] text-white' : 'hover:bg-white/20 text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Layout</span>
        </button>

        <button
          onClick={onToggleEmergency}
          title="Simulate Emergency Override"
          className={`p-2 rounded-xl transition-colors ${
            config.emergencyOverride ? 'bg-[#E06D53] text-white animate-pulse' : 'hover:bg-white/20 text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleNativeFullscreen}
          title="Toggle Native Fullscreen"
          className="p-2 hover:bg-white/20 rounded-xl transition-colors text-neutral-200 hover:text-white"
        >
          {isNativeFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

        <button
          onClick={onOpenAdmin}
          className="px-3 py-1.5 bg-[#F9C74F] hover:bg-[#e4b33c] text-[#18181B] font-display font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 simka-border-sm"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Admin Studio</span>
        </button>
      </div>
    </div>
  );
};
