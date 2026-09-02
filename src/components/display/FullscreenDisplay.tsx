import React, { useState, useEffect, useRef } from 'react';
import { 
  DisplayConfig, 
  BoardItem, 
  SlideItem, 
  LessonPeriod 
} from '../../types';
import { SignageHeader } from './SignageHeader';
import { SignageRunningText } from './SignageRunningText';
import { LayoutThreePhotos } from '../layouts/LayoutThreePhotos';
import { LayoutVideoFullscreen } from '../layouts/LayoutVideoFullscreen';
import { LayoutThreePosters } from '../layouts/LayoutThreePosters';
import { LayoutSinglePoster } from '../layouts/LayoutSinglePoster';
import { LayoutPhotoGrid } from '../layouts/LayoutPhotoGrid';
import { LayoutPhotoSchedule } from '../layouts/LayoutPhotoSchedule';
import { EmergencyTakeover } from '../common/EmergencyTakeover';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Maximize, 
  Minimize, 
  ArrowLeft,
  Tv,
  Layers,
  Clock
} from 'lucide-react';

interface FullscreenDisplayProps {
  config: DisplayConfig;
  boards: BoardItem[];
  activeBoardId?: string;
  lessonPeriods?: LessonPeriod[];
  onOpenAdmin: () => void;
  onUpdateConfig?: (config: Partial<DisplayConfig>) => void;
}

export const FullscreenDisplay: React.FC<FullscreenDisplayProps> = ({
  config,
  boards,
  activeBoardId,
  lessonPeriods = [],
  onOpenAdmin
}) => {
  const currentBoardId = activeBoardId || config.activeBoardId;
  const currentBoard = boards.find(b => b.id === currentBoardId) || boards.find(b => b.isActive) || boards[0] || { id: 'default', name: 'Board Utama', isActive: true, slides: [] };
  
  const activeSlides: SlideItem[] = (currentBoard?.slides || []).filter(s => s.enabled);
  const totalSlides = activeSlides.length;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showHud, setShowHud] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const currentSlide = activeSlides[currentSlideIndex % (totalSlides || 1)] || activeSlides[0];

  // Auto-advance mechanism
  useEffect(() => {
    if (isPaused || config.emergencyOverride || totalSlides <= 1 || !currentSlide) return;

    // If video is configured to play until finished, the onEnded handler handles advance
    if (currentSlide.type === 'VIDEO' && currentSlide.videoPlayMode === 'until_end') {
      return;
    }

    const durationSec = currentSlide.durationSec || 10;
    const timer = setTimeout(() => {
      handleNextSlide();
    }, durationSec * 1000);

    return () => clearTimeout(timer);
  }, [currentSlideIndex, isPaused, config.emergencyOverride, totalSlides, currentSlide]);

  const handleNextSlide = () => {
    if (totalSlides <= 1) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => {
        if (prev + 1 >= totalSlides) {
          return currentBoard?.loopMode === 'play_once' ? prev : 0;
        }
        return prev + 1;
      });
      setTransitioning(false);
    }, 400);
  };

  const handlePrevSlide = () => {
    if (totalSlides <= 1) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      setTransitioning(false);
    }, 400);
  };

  const handleVideoEnded = () => {
    if (currentSlide?.type === 'VIDEO' && currentSlide.videoPlayMode === 'until_end') {
      handleNextSlide();
    }
  };

  // Keyboard navigation & HUD auto-hide
  useEffect(() => {
    let hudTimer: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowHud(true);
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => {
        setShowHud(false);
      }, 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenAdmin();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(hudTimer);
    };
  }, [totalSlides, onOpenAdmin, currentSlide]);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsNativeFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsNativeFullscreen(false);
      }).catch(() => {});
    }
  };

  // Render Slide Content based on Slide Type and per-slide payload
  const renderSlideContent = (slide: SlideItem) => {
    if (!slide) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-gray-400">
          <p className="text-xl font-bold font-mono">TIDAK ADA SLIDE AKTIF PADA BOARD</p>
        </div>
      );
    }

    switch (slide.type) {
      case '3_FOTO':
        return (
          <LayoutThreePhotos 
            config={config} 
            photos={slide.content?.photos} 
          />
        );

      case 'VIDEO':
        return (
          <LayoutVideoFullscreen 
            config={config} 
            videoUrl={slide.content?.videoUrl}
            videoTitle={slide.content?.videoTitle || slide.title}
            loop={slide.videoPlayMode !== 'until_end'}
            onEnded={handleVideoEnded}
          />
        );

      case '3_POSTER':
        return (
          <LayoutThreePosters 
            config={config} 
            posters={slide.content?.posters} 
          />
        );

      case '1_POSTER':
        return (
          <LayoutSinglePoster 
            config={config} 
            posterUrl={slide.content?.posterUrl}
            posterTitle={slide.content?.posterTitle || slide.title}
          />
        );

      case 'FOTO_GRID':
        return (
          <LayoutPhotoGrid 
            config={config} 
            photos={slide.content?.gridPhotos} 
          />
        );

      case 'FOTO_INFORMASI':
        return (
          <LayoutPhotoSchedule 
            config={config} 
            photoUrl={slide.content?.splitPhotoUrl}
            lessonPeriods={lessonPeriods}
          />
        );

      default:
        return (
          <LayoutThreePhotos 
            config={config} 
            photos={slide.content?.photos} 
          />
        );
    }
  };

  // Transition animation class helper
  const getTransitionStyle = (effect: string) => {
    switch (effect) {
      case 'slide-left':
        return transitioning ? 'opacity-0 -translate-x-12' : 'opacity-100 translate-x-0';
      case 'slide-right':
        return transitioning ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0';
      case 'zoom':
        return transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100';
      case 'crossfade':
      case 'fade':
      default:
        return transitioning ? 'opacity-0' : 'opacity-100';
    }
  };

  const currentTransition = currentSlide?.transition || config.transitionEffect || 'fade';

  return (
    <div 
      id="simka-digital-signage-canvas"
      className="w-screen h-screen overflow-hidden select-none bg-black text-white relative font-sans"
      style={{
        margin: 0,
        padding: 0,
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        display: 'grid',
        gridTemplateRows: '60px 1fr 60px',
        boxSizing: 'border-box'
      }}
    >
      {/* =========================================================================
          ZONE 1: SIGNAGE HEADER (1920 × 60px)
          - Constant across all slides
          - School Brand | Center Board Title | Realtime Lesson & Clock
         ========================================================================= */}
      <SignageHeader 
        config={{
          ...config,
          headerCenterText: currentBoard?.name || config.headerCenterText
        }} 
        lessonPeriods={lessonPeriods}
      />

      {/* =========================================================================
          ZONE 2: MAIN CONTENT BROADCAST AREA (1920 × 960px)
          - Full-bleed active slide with smooth transition
          - Zero outer margin, zero card padding, 100vw width
         ========================================================================= */}
      <main 
        id="simka-signage-main-content"
        className="w-full h-full relative overflow-hidden bg-black"
        style={{ 
          width: '100vw', 
          maxWidth: '100vw', 
          margin: 0, 
          padding: 0, 
          overflow: 'hidden' 
        }}
      >
        <div 
          className={`w-full h-full transition-all duration-500 ease-out transform ${getTransitionStyle(currentTransition)}`}
          style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            maxWidth: '100%'
          }}
        >
          {renderSlideContent(currentSlide)}
        </div>
      </main>

      {/* =========================================================================
          ZONE 3: RUNNING TEXT TICKER (1920 × 60px)
          - Constant across all slides
          - Smooth continuous marquee with amber badge
         ========================================================================= */}
      <SignageRunningText config={config} />

      {/* Emergency Takeover Override Overlay */}
      {config.emergencyOverride && (
        <div className="absolute inset-0 z-50">
          <EmergencyTakeover
            title={config.emergencyMessage.title}
            details={config.emergencyMessage.details}
            level={config.emergencyMessage.level}
            actionInstruction={config.emergencyMessage.actionInstruction}
          />
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE SIGNAGE BROADCAST HUD (Auto-hides on idle)
          - Control Bar in Indonesian
         ========================================================================= */}
      <div 
        id="simka-signage-hud-controls"
        className={`fixed top-18 right-8 z-40 transition-all duration-300 pointer-events-auto ${
          showHud ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-[#0A192F]/90 backdrop-blur-md border border-[#00E5FF]/30 p-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-white">
          {/* Board & Slide Status Pill */}
          <div className="px-3 py-1.5 bg-[#002840] border border-[#00E5FF]/40 rounded-lg flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-xs font-bold font-mono text-white">
              SLIDE {currentSlideIndex + 1} / {totalSlides}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#00E5FF]/20 text-[#00E5FF] font-mono rounded font-bold">
              {currentSlide?.type || 'SLIDE'}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-white/20"></div>

          {/* Prev Slide */}
          <button
            id="btn-hud-prev-slide"
            onClick={handlePrevSlide}
            disabled={totalSlides <= 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-30"
            title="Slide Sebelumnya (Panah Kiri)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            id="btn-hud-play-pause"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-lg bg-[#00E5FF] text-[#0A192F] hover:bg-[#00E5FF]/90 font-bold transition-all shadow-md"
            title={isPaused ? 'Lanjutkan Putar (P)' : 'Jeda Slide (P)'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>

          {/* Next Slide */}
          <button
            id="btn-hud-next-slide"
            onClick={handleNextSlide}
            disabled={totalSlides <= 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-30"
            title="Slide Berikutnya (Spasi / Panah Kanan)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="h-6 w-[1px] bg-white/20"></div>

          {/* Toggle Fullscreen */}
          <button
            id="btn-hud-toggle-native-fs"
            onClick={toggleNativeFullscreen}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[#FFD166]"
            title="Layar Penuh Layar Monitor"
          >
            {isNativeFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Return to Admin */}
          <button
            id="btn-hud-return-admin"
            onClick={onOpenAdmin}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Keluar ke Admin (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>KEMBALI KE ADMIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
