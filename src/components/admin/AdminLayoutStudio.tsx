import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  Tv, 
  Layers, 
  Maximize, 
  CheckCircle2, 
  Sliders, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  FileText, 
  Grid3X3, 
  Sparkles,
  Upload,
  RefreshCw,
  ExternalLink,
  Eye,
  Type,
  Palette
} from 'lucide-react';
import { LayoutPresetId, DisplayConfig } from '../../types';
import { INITIAL_PRESET_PHOTOS, INITIAL_PRESET_POSTERS, INITIAL_PRESET_VIDEOS } from '../../data/initialData';
import { SignageHeader } from '../display/SignageHeader';
import { SignageRunningText } from '../display/SignageRunningText';
import { LayoutThreePhotos } from '../layouts/LayoutThreePhotos';
import { LayoutVideoFullscreen } from '../layouts/LayoutVideoFullscreen';
import { LayoutPhotoSchedule } from '../layouts/LayoutPhotoSchedule';
import { LayoutThreePosters } from '../layouts/LayoutThreePosters';
import { LayoutSinglePoster } from '../layouts/LayoutSinglePoster';
import { LayoutPhotoGrid } from '../layouts/LayoutPhotoGrid';

interface AdminLayoutStudioProps {
  config: DisplayConfig;
  onUpdateConfig: (config: Partial<DisplayConfig>) => void;
  onLaunchFullscreen: () => void;
}

export const AdminLayoutStudio: React.FC<AdminLayoutStudioProps> = ({
  config,
  onUpdateConfig,
  onLaunchFullscreen
}) => {
  const [activeLayoutTab, setActiveLayoutTab] = useState<LayoutPresetId>(config.activeLayout || 'layout-3-photos');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);

  const layoutsList: {
    id: LayoutPresetId;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    tag: string;
    description: string;
    refNumber?: string;
  }[] = [
    {
      id: 'layout-3-photos',
      label: '3 FOTO',
      sublabel: 'DISPLAY VERSI 3 FOTO (640px + 640px + 640px)',
      icon: <ImageIcon className="w-5 h-5 text-[#0096D6]" />,
      tag: 'REFERENSI 1',
      description: '3 kolom vertikal sama lebar (640px). Full height foto tanpa card, tanpa rounded corner, full-bleed.',
      refNumber: 'DISPLAY 1.jpg'
    },
    {
      id: 'layout-video',
      label: 'VIDEO FULLSCREEN',
      sublabel: 'TAMPILAN VERSI VIDEO (1920 × 956 PX)',
      icon: <Video className="w-5 h-5 text-[#E06D53]" />,
      tag: 'REFERENSI 2',
      description: 'Video memutar full canvas antara header dan running text (1920 × 956px) tanpa tombol browser.',
      refNumber: 'DISPLAY 2.jpg'
    },
    {
      id: 'layout-photo-schedule',
      label: 'FOTO + JADWAL',
      sublabel: 'SPLIT SCREEN (70% FOTO / 30% JADWAL LES)',
      icon: <Calendar className="w-5 h-5 text-[#F9C74F]" />,
      tag: 'AKADEMIK',
      description: 'Foto utama kegiatan di sebelah kiri dipadukan dengan tabel jadwal les/kegiatan real-time di kanan.'
    },
    {
      id: 'layout-3-posters',
      label: '3 POSTER',
      sublabel: '3 KOLOM POSTER (OBJECT-FIT: CONTAIN)',
      icon: <FileText className="w-5 h-5 text-[#00E5FF]" />,
      tag: 'INFORMASI',
      description: '3 kolom poster vertikal proporsional tanpa terpotong dengan background kontras bersih.'
    },
    {
      id: 'layout-single-poster',
      label: 'POSTER TUNGGAL',
      sublabel: 'SINGLE POSTER RESMI (CENTERED)',
      icon: <Maximize className="w-5 h-5 text-[#84E1BC]" />,
      tag: 'PENGUMUMAN',
      description: '1 poster pengumuman tunggal di tengah kanvas digital signage dengan resolusi tajam.'
    },
    {
      id: 'layout-photo-grid',
      label: 'GRID FOTO',
      sublabel: '2 × 2 GRID DOKUMENTASI (FULL BLEED)',
      icon: <Grid3X3 className="w-5 h-5 text-[#F9C74F]" />,
      tag: 'GALERI',
      description: 'Grid 4 foto dokumentasi kegiatan pembelajaran dan fasilitas sekolah.'
    }
  ];

  const handleSelectLayout = (layoutId: LayoutPresetId) => {
    setActiveLayoutTab(layoutId);
    onUpdateConfig({ activeLayout: layoutId });
  };

  // Content Slot Updates
  const updateSlotPhoto = (index: number, url: string) => {
    const current = [...(config.slots?.threePhotos || INITIAL_PRESET_PHOTOS.slice(0, 3))];
    current[index] = url;
    onUpdateConfig({
      slots: {
        ...config.slots,
        threePhotos: current as [string, string, string]
      }
    });
  };

  const updateSlotPoster = (index: number, url: string) => {
    const current = [...(config.slots?.threePosters || [INITIAL_PRESET_POSTERS[0].imageUrl, INITIAL_PRESET_POSTERS[1].imageUrl, INITIAL_PRESET_POSTERS[2].imageUrl])];
    current[index] = url;
    onUpdateConfig({
      slots: {
        ...config.slots,
        threePosters: current as [string, string, string]
      }
    });
  };

  const updateGridPhoto = (index: number, url: string) => {
    const current = [...(config.slots?.gridPhotos || INITIAL_PRESET_PHOTOS.slice(0, 4))];
    current[index] = url;
    onUpdateConfig({
      slots: {
        ...config.slots,
        gridPhotos: current as [string, string, string, string]
      }
    });
  };

  const currentLayoutObj = layoutsList.find(l => l.id === activeLayoutTab) || layoutsList[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* 1. TOP TITLE BAR & FULLSCREEN TRIGGER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2.5 border-[#18181B] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0096D6] text-white px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
              SIMKA 1920×1080 CANVAS
            </span>
            <h1 className="font-display text-2xl font-black text-[#18181B] uppercase tracking-tight">
              STUDIO LAYOUT DIGITAL SIGNAGE
            </h1>
          </div>
          <p className="text-xs text-neutral-600 mt-1 font-medium">
            Pilih dan atur komposisi digital signage 1920 × 1080 px (Header 62px • Main Content • Running Text 62px).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchFullscreen}
            className="bg-[#0096D6] hover:bg-[#0080B8] text-white px-6 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] font-display font-black text-sm uppercase flex items-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Maximize className="w-5 h-5 text-[#FFD166]" />
            <span>BUKA FULLSCREEN (1920×1080)</span>
          </button>
        </div>
      </div>

      {/* 2. 6 LAYOUT SELECTOR TILES (Exact 16:9 Wireframe Miniatures) */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center justify-between">
          <span>PILIH FORMAT TAMPILAN FULLSCREEN:</span>
          <span className="text-[#0096D6]">ASPECT RATIO 16:9 • FIXED PIXEL RATIO</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {layoutsList.map((layout) => {
            const isSelected = activeLayoutTab === layout.id;

            return (
              <div
                key={layout.id}
                onClick={() => handleSelectLayout(layout.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                  isSelected 
                    ? 'bg-[#0A192F] text-white border-[#0096D6] shadow-[4px_4px_0px_#0096D6]' 
                    : 'bg-white text-[#18181B] border-neutral-300 hover:border-neutral-500 hover:shadow-md'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                    isSelected ? 'bg-[#00E5FF] text-[#0A192F]' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {layout.tag}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#FFD166]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>AKTIF</span>
                    </span>
                  )}
                </div>

                {/* 16:9 Miniature Schematic Diagram */}
                <div className="w-full aspect-video bg-black/90 rounded-lg overflow-hidden border border-white/20 p-1 flex flex-col justify-between my-2">
                  {/* Header Strip */}
                  <div className="w-full h-2 bg-[#0096D6] rounded-sm flex items-center justify-between px-1">
                    <div className="w-2 h-1 bg-white rounded-xs" />
                    <div className="w-6 h-1 bg-white/70 rounded-xs" />
                    <div className="w-2 h-1 bg-[#FFD166] rounded-xs" />
                  </div>

                  {/* Main Zone Schematic */}
                  <div className="w-full flex-1 my-0.5 flex items-center justify-center overflow-hidden">
                    {layout.id === 'layout-3-photos' && (
                      <div className="w-full h-full grid grid-cols-3 gap-0.5">
                        <div className="bg-sky-600 flex items-center justify-center text-[7px] text-white font-mono">1</div>
                        <div className="bg-sky-500 flex items-center justify-center text-[7px] text-white font-mono">2</div>
                        <div className="bg-sky-700 flex items-center justify-center text-[7px] text-white font-mono">3</div>
                      </div>
                    )}
                    {layout.id === 'layout-video' && (
                      <div className="w-full h-full bg-red-900/80 flex items-center justify-center text-[8px] text-white font-mono font-bold">
                        ▶ VIDEO 1080P
                      </div>
                    )}
                    {layout.id === 'layout-photo-schedule' && (
                      <div className="w-full h-full flex gap-0.5">
                        <div className="w-[65%] bg-amber-600 flex items-center justify-center text-[7px] text-white font-mono">FOTO 70%</div>
                        <div className="w-[35%] bg-slate-800 flex items-center justify-center text-[7px] text-amber-300 font-mono">JADWAL</div>
                      </div>
                    )}
                    {layout.id === 'layout-3-posters' && (
                      <div className="w-full h-full grid grid-cols-3 gap-1 bg-slate-900 p-0.5">
                        <div className="bg-slate-700 h-full rounded-xs flex items-center justify-center text-[6px] text-cyan-300">P1</div>
                        <div className="bg-slate-700 h-full rounded-xs flex items-center justify-center text-[6px] text-cyan-300">P2</div>
                        <div className="bg-slate-700 h-full rounded-xs flex items-center justify-center text-[6px] text-cyan-300">P3</div>
                      </div>
                    )}
                    {layout.id === 'layout-single-poster' && (
                      <div className="w-full h-full bg-slate-950 flex items-center justify-center p-0.5">
                        <div className="w-1/2 h-full bg-emerald-700 rounded-xs flex items-center justify-center text-[7px] text-white font-mono">POSTER</div>
                      </div>
                    )}
                    {layout.id === 'layout-photo-grid' && (
                      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
                        <div className="bg-teal-600 text-[6px] flex items-center justify-center text-white">1</div>
                        <div className="bg-teal-700 text-[6px] flex items-center justify-center text-white">2</div>
                        <div className="bg-teal-800 text-[6px] flex items-center justify-center text-white">3</div>
                        <div className="bg-teal-900 text-[6px] flex items-center justify-center text-white">4</div>
                      </div>
                    )}
                  </div>

                  {/* Running Text Strip */}
                  <div className="w-full h-2 bg-[#0096D6] rounded-sm flex items-center px-1">
                    <div className="w-full h-0.5 bg-white/80 rounded-xs" />
                  </div>
                </div>

                {/* Info Text */}
                <div className="mt-2">
                  <div className="font-display font-black text-sm uppercase">
                    {layout.label}
                  </div>
                  <p className={`text-[11px] mt-1 leading-snug ${isSelected ? 'text-white/80' : 'text-neutral-600'}`}>
                    {layout.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. STUDIO WORKSPACE: LIVE CANVAS PREVIEW & CONTENT SLOT ASSIGNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 Cols): Scaled 16:9 Realtime Preview of Canvas */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0096D6]" />
              <h3 className="font-display text-sm font-black text-[#18181B] uppercase tracking-wide">
                LIVE PREVIEW: {currentLayoutObj.label} (1920 × 1080 CANVAS)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#E6F4F1] text-[#0096D6] px-2 py-0.5 rounded">
              WYSIWYG REALTIME
            </span>
          </div>

          {/* Scaled 16:9 Box with Exact 3-Zone Structure */}
          <div className="w-full bg-black p-2 rounded-2xl border-2 border-[#18181B] shadow-inner flex items-center justify-center">
            <div 
              className="w-full aspect-video bg-black overflow-hidden relative"
              style={{
                display: 'grid',
                gridTemplateRows: '36px 1fr 36px',
                borderRadius: '6px'
              }}
            >
              {/* Scaled Header */}
              <div className="w-full h-full bg-[#0096D6] text-white flex items-center justify-between px-3 text-[11px] font-bold">
                <span className="bg-[#002840] text-[#00E5FF] px-2 py-0.5 rounded font-mono text-[9px]">
                  {config.headerLeftText || 'SIMKA'}
                </span>
                <span className="font-display uppercase tracking-wider font-extrabold text-[10px]">
                  {config.headerCenterText || 'PUSAT INFORMASI EMKA'}
                </span>
                <span className="font-mono bg-[#002840] text-[#FFD166] px-2 py-0.5 rounded text-[9px]">
                  09:41:32
                </span>
              </div>

              {/* Scaled Main Content */}
              <div className="w-full h-full overflow-hidden relative bg-black flex items-center justify-center">
                {activeLayoutTab === 'layout-3-photos' && <LayoutThreePhotos config={config} />}
                {activeLayoutTab === 'layout-video' && <LayoutVideoFullscreen config={config} />}
                {activeLayoutTab === 'layout-photo-schedule' && <LayoutPhotoSchedule config={config} schedule={[]} />}
                {activeLayoutTab === 'layout-3-posters' && <LayoutThreePosters config={config} />}
                {activeLayoutTab === 'layout-single-poster' && <LayoutSinglePoster config={config} />}
                {activeLayoutTab === 'layout-photo-grid' && <LayoutPhotoGrid config={config} />}
              </div>

              {/* Scaled Running Text */}
              <div className="w-full h-full bg-[#0096D6] text-white flex items-center px-3 overflow-hidden text-[10px] font-bold">
                <span className="bg-[#002840] text-[#FFD166] text-[8px] font-mono uppercase px-1.5 py-0.5 rounded mr-2 flex-shrink-0">
                  TICKER
                </span>
                <span className="truncate text-white font-mono text-[9px] uppercase">
                  {config.runningTextContent || 'INFORMASI EMKA • Selamat mengikuti kegiatan pembelajaran hari ini • Agenda sekolah •'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>Canvas Resolution: <strong>1920 × 1080 Full HD (16:9)</strong></span>
            <button
              onClick={onLaunchFullscreen}
              className="text-[#0096D6] hover:underline font-bold flex items-center gap-1"
            >
              <span>Test Live View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right (5 Cols): Slot Assigners & Customizer */}
        <div className="lg:col-span-5 space-y-4">
          {/* SLOT CONTENT CONFIGURATOR */}
          <div className="bg-white p-5 rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#FFD166] text-[#18181B] px-2 py-0.5 rounded">
                  SLOT CONTENT MANAGER
                </span>
                <h3 className="font-display text-base font-black text-[#18181B] mt-1 uppercase">
                  PENGATURAN KONTEN ({currentLayoutObj.label})
                </h3>
              </div>
              {currentLayoutObj.icon}
            </div>

            {/* Content controls specific to active layout */}
            {activeLayoutTab === 'layout-3-photos' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Tentukan foto untuk masing-masing slot vertikal 640px:
                </p>
                {[0, 1, 2].map((slotIdx) => {
                  const currentPhotos = config.slots?.threePhotos || INITIAL_PRESET_PHOTOS.slice(0, 3);
                  return (
                    <div key={slotIdx} className="p-3 bg-[#F8F6F0] rounded-2xl border-2 border-neutral-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#0096D6]">
                          SLOT {slotIdx + 1} (FOTO {slotIdx + 1})
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">640 × 956 PX</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={currentPhotos[slotIdx] || undefined}
                          alt={`Slot ${slotIdx + 1}`}
                          className="w-12 h-12 object-cover rounded-lg border border-black/30 flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={currentPhotos[slotIdx] || ''}
                          onChange={(e) => updateSlotPhoto(slotIdx, e.target.value)}
                          placeholder="Paste image URL..."
                          className="flex-1 text-xs p-2 rounded-lg border border-neutral-300 bg-white font-mono"
                        />
                      </div>
                      {/* Preset Quick Buttons */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                        {INITIAL_PRESET_PHOTOS.map((presetUrl, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => updateSlotPhoto(slotIdx, presetUrl)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white hover:bg-[#0096D6] hover:text-white border border-neutral-300 transition-colors flex-shrink-0"
                          >
                            Preset {pIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeLayoutTab === 'layout-video' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Video akan otomatis diputar (autoplay, loop, muted) pada kanvas 1920 × 956px:
                </p>
                <div className="p-3 bg-[#F8F6F0] rounded-2xl border-2 border-neutral-300 space-y-2">
                  <label className="text-xs font-bold text-neutral-700 block">Video URL (MP4 / WebM):</label>
                  <input
                    type="text"
                    value={config.slots?.videoUrl || ''}
                    onChange={(e) => onUpdateConfig({
                      slots: {
                        ...config.slots,
                        videoUrl: e.target.value
                      }
                    })}
                    placeholder="https://.../video.mp4"
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 bg-white font-mono"
                  />

                  <label className="text-xs font-bold text-neutral-700 block mt-2">Judul Video / Watermark:</label>
                  <input
                    type="text"
                    value={config.slots?.videoTitle || ''}
                    onChange={(e) => onUpdateConfig({
                      slots: {
                        ...config.slots,
                        videoTitle: e.target.value
                      }
                    })}
                    placeholder="Judul profil fasilitas / kegiatan..."
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 bg-white font-display"
                  />

                  <div className="pt-2">
                    <span className="text-[11px] font-mono font-bold text-neutral-500 block mb-1">
                      PILIH VIDEO PRESET:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {INITIAL_PRESET_VIDEOS.map((vid) => (
                        <button
                          key={vid.id}
                          onClick={() => onUpdateConfig({
                            slots: {
                              ...config.slots,
                              videoUrl: vid.videoUrl,
                              videoTitle: vid.title
                            }
                          })}
                          className="p-2 rounded-lg bg-white hover:bg-[#0096D6] hover:text-white border border-neutral-300 text-left text-xs font-medium transition-colors"
                        >
                          ▶ {vid.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeLayoutTab === 'layout-photo-schedule' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Pengaturan Foto Utama (70%) di sebelah kiri tabel jadwal:
                </p>
                <div className="p-3 bg-[#F8F6F0] rounded-2xl border-2 border-neutral-300 space-y-2">
                  <label className="text-xs font-bold text-neutral-700 block">URL Foto Utama Kegiatan:</label>
                  <div className="flex items-center gap-2">
                    <img
                      src={config.slots?.splitPhotoUrl || INITIAL_PRESET_PHOTOS[0]}
                      alt="Foto Utama"
                      className="w-14 h-14 object-cover rounded-lg border border-black/30 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={config.slots?.splitPhotoUrl || ''}
                      onChange={(e) => onUpdateConfig({
                        slots: {
                          ...config.slots,
                          splitPhotoUrl: e.target.value
                        }
                      })}
                      placeholder="Paste main photo URL..."
                      className="flex-1 text-xs p-2 rounded-lg border border-neutral-300 bg-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                    {INITIAL_PRESET_PHOTOS.map((presetUrl, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => onUpdateConfig({
                          slots: {
                            ...config.slots,
                            splitPhotoUrl: presetUrl
                          }
                        })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white hover:bg-[#0096D6] hover:text-white border border-neutral-300 transition-colors flex-shrink-0"
                      >
                        Preset {pIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeLayoutTab === 'layout-3-posters' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Tentukan 3 poster pengumuman vertikal (Object-Fit Contain):
                </p>
                {[0, 1, 2].map((slotIdx) => {
                  const currentPosters = config.slots?.threePosters || [INITIAL_PRESET_POSTERS[0].imageUrl, INITIAL_PRESET_POSTERS[1].imageUrl, INITIAL_PRESET_POSTERS[2].imageUrl];
                  return (
                    <div key={slotIdx} className="p-3 bg-[#F8F6F0] rounded-2xl border-2 border-neutral-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#0096D6]">
                          POSTER {slotIdx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={currentPosters[slotIdx] || undefined}
                          alt={`Poster ${slotIdx + 1}`}
                          className="w-12 h-16 object-contain bg-black/20 rounded border border-black/30 flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={currentPosters[slotIdx] || ''}
                          onChange={(e) => updateSlotPoster(slotIdx, e.target.value)}
                          placeholder="Paste poster image URL..."
                          className="flex-1 text-xs p-2 rounded-lg border border-neutral-300 bg-white font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeLayoutTab === 'layout-single-poster' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Pilih poster tunggal utama untuk pengumuman penting:
                </p>
                <div className="p-3 bg-[#F8F6F0] rounded-2xl border-2 border-neutral-300 space-y-2">
                  <label className="text-xs font-bold text-neutral-700 block">URL Poster Utama:</label>
                  <div className="flex items-center gap-2">
                    <img
                      src={config.slots?.singlePosterUrl || INITIAL_PRESET_POSTERS[0].imageUrl}
                      alt="Poster Tunggal"
                      className="w-14 h-20 object-contain bg-black/20 rounded border border-black/30 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={config.slots?.singlePosterUrl || ''}
                      onChange={(e) => onUpdateConfig({
                        slots: {
                          ...config.slots,
                          singlePosterUrl: e.target.value
                        }
                      })}
                      placeholder="Paste poster image URL..."
                      className="flex-1 text-xs p-2 rounded-lg border border-neutral-300 bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {INITIAL_PRESET_POSTERS.map((preset, pIdx) => (
                      <button
                        key={preset.id}
                        onClick={() => onUpdateConfig({
                          slots: {
                            ...config.slots,
                            singlePosterUrl: preset.imageUrl
                          }
                        })}
                        className="p-1 text-[10px] rounded bg-white hover:bg-[#0096D6] hover:text-white border border-neutral-300 truncate"
                      >
                        {preset.title.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeLayoutTab === 'layout-photo-grid' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  4 foto grid dokumentasi kegiatan sekolah:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((gIdx) => {
                    const currentGrid = config.slots?.gridPhotos || INITIAL_PRESET_PHOTOS.slice(0, 4);
                    return (
                      <div key={gIdx} className="p-2 bg-[#F8F6F0] rounded-xl border border-neutral-300">
                        <span className="text-[10px] font-mono font-bold text-[#0096D6] block mb-1">
                          GRID 0{gIdx + 1}
                        </span>
                        <img
                          src={currentGrid[gIdx] || undefined}
                          alt={`Grid ${gIdx + 1}`}
                          className="w-full h-16 object-cover rounded mb-1"
                        />
                        <input
                          type="text"
                          value={currentGrid[gIdx] || ''}
                          onChange={(e) => updateGridPhoto(gIdx, e.target.value)}
                          placeholder="URL..."
                          className="w-full text-[10px] p-1 rounded border border-neutral-300 font-mono bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. BROADCAST HEADER & RUNNING TEXT CUSTOMIZER */}
          <div className="bg-white p-5 rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-neutral-100 pb-2">
              <Type className="w-4 h-4 text-[#0096D6]" />
              <h3 className="font-display text-sm font-black text-[#18181B] uppercase">
                HEADER & RUNNING TEXT (62PX STRIP)
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Header Left (Logo / Sekolah):</label>
                <input
                  type="text"
                  value={config.headerLeftText || 'SIMKA'}
                  onChange={(e) => onUpdateConfig({ headerLeftText: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 font-display font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Header Center (Judul / Tagline):</label>
                <input
                  type="text"
                  value={config.headerCenterText || 'PUSAT INFORMASI EMKA'}
                  onChange={(e) => onUpdateConfig({ headerCenterText: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 font-display font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Header Right Tag (Keterangan Jam):</label>
                <input
                  type="text"
                  value={config.headerRightTag || 'JAM | JADWAL LES'}
                  onChange={(e) => onUpdateConfig({ headerRightTag: e.target.value })}
                  className="w-full p-2 rounded-lg border border-neutral-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Running Text Footer (Marquee):</label>
                <textarea
                  rows={2}
                  value={config.runningTextContent || ''}
                  onChange={(e) => onUpdateConfig({ runningTextContent: e.target.value })}
                  placeholder="INFORMASI EMKA • Selamat mengikuti kegiatan pembelajaran hari ini..."
                  className="w-full p-2 rounded-lg border border-neutral-300 font-sans text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Tema Warna Header/Ticker:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateConfig({ headerTheme: 'cyan-blue', contrastMode: 'broadcast-cyan' })}
                    className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center justify-between border ${
                      config.headerTheme === 'cyan-blue' ? 'bg-[#0096D6] text-white border-black' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span>Cyan Digital</span>
                    <span className="w-3 h-3 rounded-full bg-[#0096D6] border border-white" />
                  </button>
                  <button
                    onClick={() => onUpdateConfig({ headerTheme: 'yellow-contrast', contrastMode: 'high-contrast' })}
                    className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center justify-between border ${
                      config.headerTheme === 'yellow-contrast' ? 'bg-[#F9C74F] text-[#18181B] border-black' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span>Yellow Contrast</span>
                    <span className="w-3 h-3 rounded-full bg-[#F9C74F] border border-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
