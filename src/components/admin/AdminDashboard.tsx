import React from 'react';
import { 
  BoardItem, 
  MediaItem, 
  LessonPeriod, 
  DisplayConfig,
  ScreenDevice
} from '../../types';
import { 
  Tv, 
  Layers, 
  Image as ImageIcon, 
  Film, 
  Radio, 
  Plus, 
  Maximize, 
  Play, 
  CalendarClock, 
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  boards: BoardItem[];
  activeBoardId: string;
  mediaLibrary: MediaItem[];
  lessonPeriods: LessonPeriod[];
  screens: ScreenDevice[];
  config: DisplayConfig;
  onNavigateTab: (tab: any) => void;
  onLaunchFullscreen: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  boards,
  activeBoardId,
  mediaLibrary,
  lessonPeriods,
  screens,
  config,
  onNavigateTab,
  onLaunchFullscreen
}) => {
  const activeBoard = boards.find(b => b.id === config.activeBoardId) || boards.find(b => b.isActive) || boards[0];
  const slides = activeBoard?.slides || [];
  
  const photoCount = mediaLibrary.filter(m => m.type === 'foto').length;
  const videoCount = mediaLibrary.filter(m => m.type === 'video').length;
  const posterCount = mediaLibrary.filter(m => m.type === 'poster').length;
  const onlineScreens = screens.filter(s => s.status === 'online').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0096D6] to-[#0A192F] text-white p-8 rounded-3xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FFD166] text-[#18181B] font-display font-black text-xs uppercase tracking-wider rounded-lg border border-[#18181B]">
              SIMKA DIGITAL SIGNAGE
            </span>
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              BROADCAST AKTIF
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-wide drop-shadow-sm">
            {config.headerCenterText || 'PUSAT INFORMASI EMKA'}
          </h1>
          <p className="text-sm font-medium text-white/80 max-w-xl">
            Sistem manajemen konten digital signage terintegrasi untuk TV koridor, lobby, dan ruang kelas sekolah.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={onLaunchFullscreen}
            className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-6 py-3.5 rounded-2xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex items-center gap-2.5 transition-all hover:translate-y-[-2px]"
          >
            <Maximize className="w-5 h-5 text-[#18181B]" />
            <span>BUKA LAYAR PENUH</span>
          </button>
        </div>
      </div>

      {/* 5 Main Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Board Aktif */}
        <div className="bg-white p-5 rounded-2xl border-2.5 border-[#18181B] shadow-[3px_3px_0px_#18181B] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">BOARD AKTIF</span>
            <Layers className="w-4 h-4 text-[#0096D6]" />
          </div>
          <div className="text-lg font-black font-display text-[#18181B] truncate" title={activeBoard?.name}>
            {activeBoard?.name || 'Pusat Informasi'}
          </div>
          <div className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{boards.length} Total Board</span>
          </div>
        </div>

        {/* Metric 2: Jumlah Slide */}
        <div className="bg-white p-5 rounded-2xl border-2.5 border-[#18181B] shadow-[3px_3px_0px_#18181B] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">JUMLAH SLIDE</span>
            <Radio className="w-4 h-4 text-[#FFD166]" />
          </div>
          <div className="text-2xl font-black font-display text-[#18181B]">
            {slides.length} <span className="text-sm font-bold text-neutral-500">Slide</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-600">
            Durasi: ~{slides.reduce((a, b) => a + (b.durationSec || 10), 0) || 0}s
          </div>
        </div>

        {/* Metric 3: Jumlah Foto */}
        <div className="bg-white p-5 rounded-2xl border-2.5 border-[#18181B] shadow-[3px_3px_0px_#18181B] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">JUMLAH FOTO</span>
            <ImageIcon className="w-4 h-4 text-[#0D6E6E]" />
          </div>
          <div className="text-2xl font-black font-display text-[#18181B]">
            {photoCount} <span className="text-sm font-bold text-neutral-500">Foto</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-600">
            Format: Portrait (640px)
          </div>
        </div>

        {/* Metric 4: Jumlah Video */}
        <div className="bg-white p-5 rounded-2xl border-2.5 border-[#18181B] shadow-[3px_3px_0px_#18181B] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">JUMLAH VIDEO</span>
            <Film className="w-4 h-4 text-[#E06D53]" />
          </div>
          <div className="text-2xl font-black font-display text-[#18181B]">
            {videoCount} <span className="text-sm font-bold text-neutral-500">Video</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-600">
            Format: 1080p MP4
          </div>
        </div>

        {/* Metric 5: Status Layar */}
        <div className="bg-white p-5 rounded-2xl border-2.5 border-[#18181B] shadow-[3px_3px_0px_#18181B] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">STATUS LAYAR</span>
            <Tv className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-display text-emerald-600">
            {onlineScreens}/{screens.length} <span className="text-sm font-bold text-neutral-500">Online</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-600">
            1920 × 1080 FHD
          </div>
        </div>
      </div>

      {/* Active Board Quick Visual & Slide Order Preview */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-neutral-200">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-[#0096D6]">SIARAN AKTIF</span>
            <h3 className="text-xl font-black font-display text-[#18181B]">
              ROTASI SLIDE BOARD: {activeBoard?.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('board-display')}
              className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-xs px-4 py-2 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center gap-1.5 transition-all"
            >
              <span>KELOLA BOARD DISPLAY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slide Mini-Cards Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {slides.slice(0, 8).map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white p-3 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 bg-[#F3EFE6] border border-[#18181B] rounded">
                  SLIDE {index + 1}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#0096D6]">
                  {slide.type}
                </span>
              </div>

              {/* Miniature Thumbnail */}
              <div className="w-full h-20 bg-black rounded overflow-hidden relative border border-neutral-200">
                {slide.type === '3_FOTO' && slide.content.photos && (
                  <div className="grid grid-cols-3 h-full gap-0.5">
                    <img src={slide.content.photos[0] || undefined} alt="" className="w-full h-full object-cover" />
                    <img src={slide.content.photos[1] || undefined} alt="" className="w-full h-full object-cover" />
                    <img src={slide.content.photos[2] || undefined} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {slide.type === 'VIDEO' && (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-[#00E5FF]">
                    <Film className="w-6 h-6" />
                  </div>
                )}
                {slide.type === '3_POSTER' && slide.content.posters && (
                  <div className="grid grid-cols-3 h-full gap-0.5 p-0.5 bg-[#0B1528]">
                    <img src={slide.content.posters[0] || undefined} alt="" className="w-full h-full object-contain" />
                    <img src={slide.content.posters[1] || undefined} alt="" className="w-full h-full object-contain" />
                    <img src={slide.content.posters[2] || undefined} alt="" className="w-full h-full object-contain" />
                  </div>
                )}
                {slide.type === '1_POSTER' && (
                  <img src={slide.content.posterUrl || undefined} alt="" className="w-full h-full object-contain bg-[#050C16]" />
                )}
                {slide.type === 'FOTO_GRID' && slide.content.gridPhotos && (
                  <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                    <img src={slide.content.gridPhotos[0] || undefined} alt="" className="w-full h-full object-cover" />
                    <img src={slide.content.gridPhotos[1] || undefined} alt="" className="w-full h-full object-cover" />
                    <img src={slide.content.gridPhotos[2] || undefined} alt="" className="w-full h-full object-cover" />
                    <img src={slide.content.gridPhotos[3] || undefined} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {slide.type === 'FOTO_INFORMASI' && (
                  <img src={slide.content.splitPhotoUrl || undefined} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="text-xs font-bold text-[#18181B] truncate">
                {slide.title}
              </div>

              <div className="text-[10px] font-mono text-neutral-500">
                {slide.type === 'VIDEO' && slide.videoPlayMode === 'until_end'
                  ? 'Sampai video selesai'
                  : `Durasi: ${slide.durationSec}s`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
