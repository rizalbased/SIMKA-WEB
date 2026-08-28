import React, { useState } from 'react';
import { 
  BoardItem, 
  SlideItem, 
  SlideType, 
  TransitionType, 
  DisplayConfig, 
  MediaItem,
  LessonPeriod
} from '../../types';
import { 
  Plus, 
  Play, 
  Copy, 
  Trash2, 
  Edit3, 
  MoveUp, 
  MoveDown, 
  Layers, 
  Tv, 
  Check, 
  X, 
  Film, 
  Image as ImageIcon, 
  LayoutGrid, 
  FileText, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Eye,
  Sliders,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { slideService } from '../../services/slideService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { LayoutThreePhotos } from '../layouts/LayoutThreePhotos';
import { LayoutVideoFullscreen } from '../layouts/LayoutVideoFullscreen';
import { LayoutThreePosters } from '../layouts/LayoutThreePosters';
import { LayoutSinglePoster } from '../layouts/LayoutSinglePoster';
import { LayoutPhotoGrid } from '../layouts/LayoutPhotoGrid';
import { LayoutPhotoSchedule } from '../layouts/LayoutPhotoSchedule';
import { SignageHeader } from '../display/SignageHeader';
import { SignageRunningText } from '../display/SignageRunningText';
import { MediaPicker } from './MediaPicker';

interface AdminBoardDisplayProps {
  boards: BoardItem[];
  activeBoardId: string;
  config: DisplayConfig;
  mediaLibrary: MediaItem[];
  lessonPeriods?: LessonPeriod[];
  onUpdateBoards: (boards: BoardItem[]) => void;
  onUpdateMediaLibrary: (media: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => void;
  onSetActiveBoard: (boardId: string) => void;
  onLaunchFullscreen: () => void;
}

export const AdminBoardDisplay: React.FC<AdminBoardDisplayProps> = ({
  boards,
  activeBoardId,
  config,
  mediaLibrary,
  lessonPeriods = [],
  onUpdateBoards,
  onUpdateMediaLibrary,
  onSetActiveBoard,
  onLaunchFullscreen
}) => {
  const [selectedBoardId, setSelectedBoardId] = useState<string>(activeBoardId || boards[0]?.id);
  const currentBoard = boards.find(b => b.id === selectedBoardId) || boards[0];

  // Modal states
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<SlideItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  // Photos & Media Presets
  const photoMedia = mediaLibrary.filter(m => m.type === 'foto');
  const videoMedia = mediaLibrary.filter(m => m.type === 'video');
  const posterMedia = mediaLibrary.filter(m => m.type === 'poster');

  // Handle Board Switch & Updates
  const handleBoardUpdate = async (updatedBoard: BoardItem) => {
    const newBoards = boards.map(b => b.id === updatedBoard.id ? updatedBoard : b);
    onUpdateBoards(newBoards);
  };

  const handleToggleBoardActive = (boardId: string) => {
    const newBoards = boards.map(b => ({
      ...b,
      isActive: b.id === boardId
    }));
    onUpdateBoards(newBoards);
    onSetActiveBoard(boardId);
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    const newBoard: BoardItem = {
      id: `board-${Date.now()}`,
      name: newBoardName.trim(),
      description: newBoardDesc.trim() || 'Board digital signage baru',
      isActive: false,
      loopMode: 'loop_forever',
      createdAt: new Date().toISOString().split('T')[0],
      slides: [
        {
          id: `sld-${Date.now()}-1`,
          title: 'SLIDE 1 — 3 FOTO POTRAIT',
          type: '3_FOTO',
          durationSec: 10,
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            photos: [
              photoMedia[0]?.url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
              photoMedia[1]?.url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
              photoMedia[2]?.url || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80'
            ]
          }
        }
      ]
    };
    onUpdateBoards([...boards, newBoard]);
    setSelectedBoardId(newBoard.id);
    setIsNewBoardModalOpen(false);
    setNewBoardName('');
    setNewBoardDesc('');
  };

  // Slide Operations
  const handleAddSlide = (type: SlideType) => {
    let newSlide: SlideItem;
    const slideNumber = currentBoard.slides.length + 1;

    switch (type) {
      case '3_FOTO':
        newSlide = {
          id: `sld-${Date.now()}`,
          title: `SLIDE ${slideNumber} — 3 FOTO POTRAIT`,
          type: '3_FOTO',
          durationSec: 10,
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            photos: [
              photoMedia[0]?.url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
              photoMedia[1]?.url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
              photoMedia[2]?.url || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80'
            ]
          }
        };
        break;

      case 'VIDEO':
        newSlide = {
          id: `sld-${Date.now()}`,
          title: `SLIDE ${slideNumber} — VIDEO KEGIATAN`,
          type: 'VIDEO',
          durationSec: 20,
          videoPlayMode: 'until_end',
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            videoUrl: videoMedia[0]?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoTitle: 'Video Kegiatan Siswa & MPLS Sekolah'
          }
        };
        break;

      case '3_POSTER':
        newSlide = {
          id: `sld-${Date.now()}`,
          title: `SLIDE ${slideNumber} — 3 POSTER INFORMASI`,
          type: '3_POSTER',
          durationSec: 12,
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            posters: [
              posterMedia[0]?.url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
              posterMedia[1]?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
              posterMedia[2]?.url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
            ]
          }
        };
        break;

      case '1_POSTER':
        newSlide = {
          id: `sld-${Date.now()}`,
          title: `SLIDE ${slideNumber} — POSTER RESMI`,
          type: '1_POSTER',
          durationSec: 10,
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            posterUrl: posterMedia[0]?.url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
            posterTitle: 'Pengumuman Resmi Sekolah'
          }
        };
        break;

      case 'FOTO_GRID':
        newSlide = {
          id: `sld-${Date.now()}`,
          title: `SLIDE ${slideNumber} — GRID 4 FOTO`,
          type: 'FOTO_GRID',
          durationSec: 10,
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            gridPhotos: [
              photoMedia[0]?.url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
              photoMedia[1]?.url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
              photoMedia[2]?.url || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
              photoMedia[3]?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80'
            ]
          }
        };
        break;

      case 'FOTO_INFORMASI':
        newSlide = {
          id: `sld-${Date.now()}`,
          title: `SLIDE ${slideNumber} — FOTO + INFORMASI`,
          type: 'FOTO_INFORMASI',
          durationSec: 12,
          transition: 'fade',
          transitionDurationMs: 800,
          enabled: true,
          content: {
            splitPhotoUrl: photoMedia[0]?.url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
            infoTitle: 'Jadwal Les & Bimbingan Belajar',
            infoDetails: 'Informasi rotasi kelas dan status jam pembelajaran real-time.'
          }
        };
        break;
    }

    const updatedBoard = {
      ...currentBoard,
      slides: [...currentBoard.slides, newSlide]
    };
    handleBoardUpdate(updatedBoard);
    setIsAddSlideModalOpen(false);
  };

  const handleDuplicateSlide = (slide: SlideItem) => {
    const index = currentBoard.slides.findIndex(s => s.id === slide.id);
    const clonedSlide: SlideItem = {
      ...slide,
      id: `sld-${Date.now()}`,
      title: `${slide.title} (SALINAN)`,
      content: JSON.parse(JSON.stringify(slide.content))
    };

    const newSlides = [...currentBoard.slides];
    newSlides.splice(index + 1, 0, clonedSlide);

    const updatedBoard = {
      ...currentBoard,
      slides: newSlides
    };
    handleBoardUpdate(updatedBoard);
  };

  const handleConfirmDeleteSlide = () => {
    if (!slideToDelete) return;
    const newSlides = currentBoard.slides.filter(s => s.id !== slideToDelete.id);
    const updatedBoard = {
      ...currentBoard,
      slides: newSlides
    };
    handleBoardUpdate(updatedBoard);
    setSlideToDelete(null);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBoard.slides.length) return;

    const newSlides = [...currentBoard.slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    const updatedBoard = {
      ...currentBoard,
      slides: newSlides
    };
    handleBoardUpdate(updatedBoard);
  };

  const handleSaveEditedSlide = async (updatedSlide: SlideItem) => {
    // Sync to Supabase
    const mediaIds: string[] = [];
    const content = updatedSlide.content;
    const findMediaId = (url: string) => mediaLibrary.find(m => m.url === url)?.id;

    if (content.photos) content.photos.forEach(url => { if (url) { const id = findMediaId(url); if (id) mediaIds.push(id); } });
    if (content.videoUrl) { const id = findMediaId(content.videoUrl); if (id) mediaIds.push(id); }
    if (content.posterUrl) { const id = findMediaId(content.posterUrl); if (id) mediaIds.push(id); }
    if (content.posters) content.posters.forEach(url => { if (url) { const id = findMediaId(url); if (id) mediaIds.push(id); } });
    if (content.gridPhotos) content.gridPhotos.forEach(url => { if (url) { const id = findMediaId(url); if (id) mediaIds.push(id); } });
    if (content.splitPhotoUrl) { const id = findMediaId(content.splitPhotoUrl); if (id) mediaIds.push(id); }

    try {
      if (isSupabaseConfigured()) {
        await slideService.saveSlide(currentBoard.id, updatedSlide, mediaIds);
      } else {
        console.warn('Supabase not configured. Saving locally only.');
      }
      
      const newSlides = currentBoard.slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
      const updatedBoard = {
        ...currentBoard,
        slides: newSlides
      };
      handleBoardUpdate(updatedBoard);
      setEditingSlide(null);
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      alert('Gagal menyimpan ke database.');
    }
  };

  // Helper to render miniature thumbnail representation
  const renderSlideThumbnails = (slide: SlideItem) => {
    switch (slide.type) {
      case '3_FOTO': {
        const photos = slide.content.photos || [];
        return (
          <div className="grid grid-cols-3 gap-1 w-full h-16 rounded overflow-hidden bg-black/40 border border-[#18181B]">
            <img src={photos[0] || undefined} alt="Foto 1" className="w-full h-full object-cover" />
            <img src={photos[1] || undefined} alt="Foto 2" className="w-full h-full object-cover" />
            <img src={photos[2] || undefined} alt="Foto 3" className="w-full h-full object-cover" />
          </div>
        );
      }
      case 'VIDEO':
        return (
          <div className="relative w-full h-16 rounded overflow-hidden bg-black border border-[#18181B] flex items-center justify-center">
            <Film className="w-6 h-6 text-[#00E5FF] absolute" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1">
              <span className="text-[9px] font-mono text-white truncate">{slide.content.videoTitle || 'Video 1080p'}</span>
            </div>
          </div>
        );
      case '3_POSTER': {
        const posters = slide.content.posters || [];
        return (
          <div className="grid grid-cols-3 gap-1 w-full h-16 rounded overflow-hidden bg-black/40 border border-[#18181B] p-0.5">
            <img src={posters[0] || undefined} alt="Poster 1" className="w-full h-full object-contain bg-[#0B1528]" />
            <img src={posters[1] || undefined} alt="Poster 2" className="w-full h-full object-contain bg-[#0B1528]" />
            <img src={posters[2] || undefined} alt="Poster 3" className="w-full h-full object-contain bg-[#0B1528]" />
          </div>
        );
      }
      case '1_POSTER':
        return (
          <div className="w-full h-16 rounded overflow-hidden bg-[#050C16] border border-[#18181B] flex items-center justify-center p-0.5">
            <img src={slide.content.posterUrl || undefined} alt="Poster" className="max-h-full object-contain" />
          </div>
        );
      case 'FOTO_GRID': {
        const grid = slide.content.gridPhotos || [];
        return (
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-16 rounded overflow-hidden bg-black border border-[#18181B]">
            <img src={grid[0] || undefined} alt="Grid 1" className="w-full h-full object-cover" />
            <img src={grid[1] || undefined} alt="Grid 2" className="w-full h-full object-cover" />
            <img src={grid[2] || undefined} alt="Grid 3" className="w-full h-full object-cover" />
            <img src={grid[3] || undefined} alt="Grid 4" className="w-full h-full object-cover" />
          </div>
        );
      }
      case 'FOTO_INFORMASI':
        return (
          <div className="flex w-full h-16 rounded overflow-hidden bg-[#080E1A] border border-[#18181B]">
            <div className="w-[65%] h-full">
              <img src={slide.content.splitPhotoUrl || undefined} alt="Split" className="w-full h-full object-cover" />
            </div>
            <div className="w-[35%] h-full bg-[#0B1528] p-1 flex flex-col justify-center text-[8px] font-mono text-[#00E5FF]">
              <span>JADWAL</span>
              <span>REALTIME</span>
            </div>
          </div>
        );
      default:
        return <div className="w-full h-16 bg-neutral-200 rounded" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0096D6]">
            <Layers className="w-4 h-4 text-[#0096D6]" />
            <span>PENGELOLAAN BOARD DISPLAY & PLAYLIST</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#18181B] mt-1">
            BOARD DISPLAY
          </h2>
          <p className="text-sm font-medium text-neutral-600 mt-0.5">
            Satu Board berisi urutan slide digital signage yang diputar otomatis di layar fullscreen.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pratinjau Board */}
          <button
            id="btn-pratinjau-board"
            onClick={() => {
              setPreviewSlideIndex(0);
              setIsPreviewModalOpen(true);
            }}
            className="bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] font-display font-black text-sm px-4 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-[#0096D6] fill-current" />
            <span>PRATINJAU BOARD</span>
          </button>

          {/* Buka Layar Penuh */}
          <button
            id="btn-board-layar-penuh"
            onClick={onLaunchFullscreen}
            className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-5 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
          >
            <Tv className="w-4 h-4 text-[#FFD166]" />
            <span>LAYAR PENUH</span>
          </button>
        </div>
      </div>

      {/* Board Selector Tabs & Details */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-neutral-200">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">PILIH BOARD AKTIF</span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {boards.map((b) => {
                const isSelected = b.id === selectedBoardId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBoardId(b.id)}
                    className={`px-4 py-2 rounded-xl font-display font-black text-sm transition-all flex items-center gap-2 border-2 ${
                      isSelected
                        ? 'bg-[#0096D6] text-white border-[#18181B] shadow-[2px_2px_0px_#18181B]'
                        : 'bg-white hover:bg-neutral-100 text-[#18181B] border-neutral-300'
                    }`}
                  >
                    <span>{b.name}</span>
                    {b.isActive && (
                      <span className="text-[10px] bg-[#FFD166] text-[#18181B] px-1.5 py-0.5 rounded font-mono font-extrabold">
                        AKTIF
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => setIsNewBoardModalOpen(true)}
                className="px-3 py-2 rounded-xl font-display font-bold text-xs bg-white hover:bg-neutral-100 text-[#0096D6] border-2 border-dashed border-[#0096D6] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ TAMBAH BOARD</span>
              </button>
            </div>
          </div>

          {/* Active Status Switcher & Loop Mode */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border-2 border-[#18181B]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-700">STATUS:</span>
              <button
                onClick={() => handleToggleBoardActive(currentBoard.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-colors ${
                  currentBoard.isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentBoard.isActive ? 'bg-white animate-pulse' : 'bg-neutral-400'}`}></span>
                <span>{currentBoard.isActive ? '● AKTIF (SIARAN)' : '○ NONAKTIF'}</span>
              </button>
            </div>

            <div className="h-5 w-[1px] bg-neutral-300"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-700">MODE PUTAR:</span>
              <select
                value={currentBoard.loopMode}
                onChange={(e) => {
                  handleBoardUpdate({
                    ...currentBoard,
                    loopMode: e.target.value as any
                  });
                }}
                className="bg-[#F3EFE6] px-2 py-1 rounded-lg font-mono font-bold text-xs text-[#18181B] border border-[#18181B] focus:outline-none"
              >
                <option value="loop_forever">Ulangi Terus (Loop)</option>
                <option value="play_once">Urut dari Awal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Board Details Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFF8E7] p-4 rounded-xl border-2 border-[#18181B]">
          <div>
            <h3 className="text-lg font-black font-display text-[#18181B]">{currentBoard.name}</h3>
            <p className="text-xs text-neutral-600">{currentBoard.description}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-700">
            <span>Total: <strong>{currentBoard.slides.length} Slide</strong></span>
            <span>•</span>
            <span>Total Durasi: <strong>~{currentBoard.slides.reduce((acc, s) => acc + (s.durationSec || 10), 0)} Detik</strong></span>
          </div>
        </div>

        {/* Action Button: Tambah Slide */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-display font-black text-[#18181B] uppercase tracking-wider flex items-center gap-2">
            <span>DAFTAR URUTAN SLIDE PADA BOARD</span>
          </div>

          <button
            id="btn-tambah-slide"
            onClick={() => setIsAddSlideModalOpen(true)}
            className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-4 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
          >
            <Plus className="w-4 h-4 text-[#FFD166]" />
            <span>+ TAMBAH SLIDE</span>
          </button>
        </div>

        {/* Slide List (Drag/Reorder, Duplicate, Edit, Delete) */}
        <div className="space-y-3">
          {currentBoard.slides.map((slide, index) => {
            return (
              <div
                key={slide.id}
                id={`slide-card-${slide.id}`}
                className="bg-white p-4 rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#0096D6]"
              >
                {/* Left: Reorder Handles & Slide Info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Order Controls */}
                  <div className="flex flex-col items-center gap-1 bg-[#F8F6F0] p-1.5 rounded-lg border border-[#18181B]">
                    <button
                      onClick={() => handleMoveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-neutral-700 hover:text-black disabled:opacity-20 transition-colors"
                      title="Pindahkan ke atas"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-extrabold text-[#18181B]">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => handleMoveSlide(index, 'down')}
                      disabled={index === currentBoard.slides.length - 1}
                      className="p-1 text-neutral-700 hover:text-black disabled:opacity-20 transition-colors"
                      title="Pindahkan ke bawah"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Representation */}
                  <div className="w-40 flex-shrink-0">
                    {renderSlideThumbnails(slide)}
                  </div>

                  {/* Slide Name, Type & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-black text-sm text-[#18181B]">
                        {slide.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0096D6]/10 text-[#0096D6] border border-[#0096D6]/30">
                        {slide.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {slide.type === 'VIDEO' && slide.videoPlayMode === 'until_end'
                          ? 'Mode: sampai video selesai'
                          : `Durasi: ${slide.durationSec} detik`}
                      </span>
                      <span>•</span>
                      <span>Transisi: <strong className="uppercase">{slide.transition}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setEditingSlide(slide)}
                    className="px-3 py-1.5 bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] font-display font-bold text-xs rounded-lg border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0096D6]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateSlide(slide)}
                    className="px-3 py-1.5 bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] font-display font-bold text-xs rounded-lg border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Duplikat</span>
                  </button>

                  <button
                    onClick={() => setSlideToDelete(slide)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-display font-bold text-xs rounded-lg border-2 border-rose-400 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL: PILIH JENIS SLIDE (+ TAMBAH SLIDE)
         ========================================================================= */}
      {isAddSlideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] max-w-2xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-200">
              <div>
                <span className="text-xs font-mono font-bold text-[#0096D6] uppercase">MODAL TAMBAH SLIDE</span>
                <h3 className="text-xl font-black font-display text-[#18181B]">PILIH JENIS SLIDE</h3>
              </div>
              <button 
                onClick={() => setIsAddSlideModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: 3 FOTO */}
              <button
                onClick={() => handleAddSlide('3_FOTO')}
                className="p-4 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFF8E7] text-left transition-all shadow-[2px_2px_0px_#18181B] hover:translate-y-[-2px] flex items-start gap-3.5"
              >
                <div className="p-2.5 bg-[#0096D6] text-white rounded-lg border border-[#18181B]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#18181B]">[ 3 FOTO ]</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    3 kolom portrait sama besar (640px) memenuhi tinggi kanvas (object-fit: cover).
                  </p>
                </div>
              </button>

              {/* Option 2: VIDEO */}
              <button
                onClick={() => handleAddSlide('VIDEO')}
                className="p-4 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFF8E7] text-left transition-all shadow-[2px_2px_0px_#18181B] hover:translate-y-[-2px] flex items-start gap-3.5"
              >
                <div className="p-2.5 bg-[#E06D53] text-white rounded-lg border border-[#18181B]">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#18181B]">[ VIDEO ]</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Video fullscreen 1080p dengan opsi putar sampai selesai atau durasi tertentu.
                  </p>
                </div>
              </button>

              {/* Option 3: 3 POSTER */}
              <button
                onClick={() => handleAddSlide('3_POSTER')}
                className="p-4 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFF8E7] text-left transition-all shadow-[2px_2px_0px_#18181B] hover:translate-y-[-2px] flex items-start gap-3.5"
              >
                <div className="p-2.5 bg-[#FFD166] text-[#18181B] rounded-lg border border-[#18181B]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#18181B]">[ 3 POSTER ]</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    3 poster informasi proporsional dengan letterboxing bersih (object-fit: contain).
                  </p>
                </div>
              </button>

              {/* Option 4: 1 POSTER */}
              <button
                onClick={() => handleAddSlide('1_POSTER')}
                className="p-4 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFF8E7] text-left transition-all shadow-[2px_2px_0px_#18181B] hover:translate-y-[-2px] flex items-start gap-3.5"
              >
                <div className="p-2.5 bg-[#0D6E6E] text-white rounded-lg border border-[#18181B]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#18181B]">[ 1 POSTER ]</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Poster tunggal resolusi tinggi di tengah layar untuk pengumuman resmi.
                  </p>
                </div>
              </button>

              {/* Option 5: FOTO GRID */}
              <button
                onClick={() => handleAddSlide('FOTO_GRID')}
                className="p-4 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFF8E7] text-left transition-all shadow-[2px_2px_0px_#18181B] hover:translate-y-[-2px] flex items-start gap-3.5"
              >
                <div className="p-2.5 bg-[#18181B] text-white rounded-lg border border-[#18181B]">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#18181B]">[ FOTO GRID ]</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Grid 4 foto (2 × 2) untuk dokumentasi kegiatan sekolah.
                  </p>
                </div>
              </button>

              {/* Option 6: FOTO + INFORMASI */}
              <button
                onClick={() => handleAddSlide('FOTO_INFORMASI')}
                className="p-4 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFF8E7] text-left transition-all shadow-[2px_2px_0px_#18181B] hover:translate-y-[-2px] flex items-start gap-3.5"
              >
                <div className="p-2.5 bg-[#0A192F] text-[#00E5FF] rounded-lg border border-[#18181B]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#18181B]">[ FOTO + INFORMASI ]</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Split-screen: 70% foto utama + 30% jadwal les & status realtime.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAddSlideModalOpen(false)}
                className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              >
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDITOR SLIDE
         ========================================================================= */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] w-full flex flex-col" style={{ width: 'min(92vw, 760px)', maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-6 border-b-2 border-neutral-200 shrink-0">
              <div>
                <span className="text-xs font-mono font-bold text-[#0096D6] uppercase">
                  EDITOR SLIDE — {editingSlide.type}
                </span>
                <h3 className="text-xl font-black font-display text-[#18181B]">
                  PENGATURAN KONTEN & DURASI
                </h3>
              </div>
              <button 
                onClick={() => setEditingSlide(null)}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Slide Title */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  JUDUL SLIDE (ADMIN)
                </label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-sm font-bold text-[#18181B] focus:outline-none focus:border-[#0096D6]"
                />
              </div>

              {/* Specific Content Inputs based on Slide Type */}
              {editingSlide.type === '3_FOTO' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                  <h4 className="font-display font-black text-sm text-[#18181B]">
                    PILIH 3 FOTO POTRAIT
                  </h4>
                  {[0, 1, 2].map((slotIdx) => (
                    <MediaPicker
                      key={slotIdx}
                      label={`FOTO ${slotIdx + 1}`}
                      type="foto"
                      value={editingSlide.content.photos?.[slotIdx] || ''}
                      mediaLibrary={mediaLibrary}
                      onUpdateMediaLibrary={onUpdateMediaLibrary}
                      onChange={(url) => {
                        const newPhotos = [...(editingSlide.content.photos || ['', '', ''])] as [string, string, string];
                        newPhotos[slotIdx] = url;
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, photos: newPhotos }
                        });
                      }}
                      expectedRatio="2/3"
                      boards={boards}
                    />
                  ))}
                </div>
              )}

              {editingSlide.type === 'VIDEO' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                  <h4 className="font-display font-black text-sm text-[#18181B]">
                    PENGATURAN VIDEO FULLSCREEN
                  </h4>
                  <div>
                    <MediaPicker
                      label="PILIH VIDEO"
                      type="video"
                      value={editingSlide.content.videoUrl || ''}
                      mediaLibrary={mediaLibrary}
                      onUpdateMediaLibrary={onUpdateMediaLibrary}
                      onChange={(url) => {
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, videoUrl: url }
                        });
                      }}
                      boards={boards}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                      JUDUL VIDEO
                    </label>
                    <input
                      type="text"
                      value={editingSlide.content.videoTitle || ''}
                      onChange={(e) => {
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, videoTitle: e.target.value }
                        });
                      }}
                      className="w-full bg-[#F8F6F0] p-2 rounded-lg border border-[#18181B] text-xs font-bold text-[#18181B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                      MODE PUTAR VIDEO
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="videoMode"
                          checked={editingSlide.videoPlayMode === 'until_end'}
                          onChange={() => setEditingSlide({ ...editingSlide, videoPlayMode: 'until_end' })}
                        />
                        <span>Putar sampai selesai</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="videoMode"
                          checked={editingSlide.videoPlayMode === 'duration'}
                          onChange={() => setEditingSlide({ ...editingSlide, videoPlayMode: 'duration' })}
                        />
                        <span>Durasi tertentu</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {editingSlide.type === '3_POSTER' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                  <h4 className="font-display font-black text-sm text-[#18181B]">
                    PILIH 3 POSTER
                  </h4>
                  {[0, 1, 2].map((slotIdx) => (
                    <MediaPicker
                      key={slotIdx}
                      label={`POSTER ${slotIdx + 1}`}
                      type="poster"
                      value={editingSlide.content.posters?.[slotIdx] || ''}
                      mediaLibrary={mediaLibrary}
                      onUpdateMediaLibrary={onUpdateMediaLibrary}
                      onChange={(url) => {
                        const newPosters = [...(editingSlide.content.posters || ['', '', ''])] as [string, string, string];
                        newPosters[slotIdx] = url;
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, posters: newPosters }
                        });
                      }}
                      expectedRatio="2/3"
                      boards={boards}
                    />
                  ))}
                </div>
              )}

              {editingSlide.type === '1_POSTER' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                  <h4 className="font-display font-black text-sm text-[#18181B]">
                    PENGATURAN POSTER TUNGGAL
                  </h4>
                  <div>
                    <MediaPicker
                      label="PILIH POSTER"
                      type="poster"
                      value={editingSlide.content.posterUrl || ''}
                      mediaLibrary={mediaLibrary}
                      onUpdateMediaLibrary={onUpdateMediaLibrary}
                      onChange={(url) => {
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, posterUrl: url }
                        });
                      }}
                      boards={boards}
                    />
                  </div>
                </div>
              )}

              {editingSlide.type === 'FOTO_GRID' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                  <h4 className="font-display font-black text-sm text-[#18181B]">
                    PILIH 4 FOTO GRID (2 × 2)
                  </h4>
                  {[0, 1, 2, 3].map((slotIdx) => (
                    <MediaPicker
                      key={slotIdx}
                      label={`FOTO ${slotIdx + 1}`}
                      type="foto"
                      value={editingSlide.content.gridPhotos?.[slotIdx] || ''}
                      mediaLibrary={mediaLibrary}
                      onUpdateMediaLibrary={onUpdateMediaLibrary}
                      onChange={(url) => {
                        const newGrid = [...(editingSlide.content.gridPhotos || ['', '', '', ''])] as [string, string, string, string];
                        newGrid[slotIdx] = url;
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, gridPhotos: newGrid }
                        });
                      }}
                      boards={boards}
                    />
                  ))}
                </div>
              )}

              {editingSlide.type === 'FOTO_INFORMASI' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                  <h4 className="font-display font-black text-sm text-[#18181B]">
                    PENGATURAN FOTO + INFORMASI JADWAL
                  </h4>
                  <div>
                    <MediaPicker
                      label="FOTO UTAMA (70%)"
                      type="foto"
                      value={editingSlide.content.splitPhotoUrl || ''}
                      mediaLibrary={mediaLibrary}
                      onUpdateMediaLibrary={onUpdateMediaLibrary}
                      onChange={(url) => {
                        setEditingSlide({
                          ...editingSlide,
                          content: { ...editingSlide.content, splitPhotoUrl: url }
                        });
                      }}
                      boards={boards}
                    />
                  </div>
                </div>
              )}

              {/* Durasi Tampil */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  DURASI TAMPIL
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[5, 10, 15, 20, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, durationSec: sec })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        editingSlide.durationSec === sec
                          ? 'bg-[#FFD166] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]'
                          : 'bg-[#F8F6F0] text-[#18181B] border-2 border-neutral-200 hover:bg-[#F3EFE6] hover:border-neutral-300'
                      }`}
                    >
                      {sec} detik
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-xs font-mono text-[#18181B]">Manual:</span>
                    <input
                      type="number"
                      min={3}
                      max={300}
                      value={editingSlide.durationSec}
                      onChange={(e) => setEditingSlide({ ...editingSlide, durationSec: parseInt(e.target.value) || 10 })}
                      className="w-16 bg-white p-1 rounded-lg border border-[#18181B] text-xs font-mono text-center text-[#18181B]"
                    />
                    <span className="text-xs font-mono text-[#18181B]">detik</span>
                  </div>
                </div>
              </div>

              {/* Transition Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    EFEK TRANSISI
                  </label>
                  <select
                    value={editingSlide.transition}
                    onChange={(e) => setEditingSlide({ ...editingSlide, transition: e.target.value as TransitionType })}
                    className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B]"
                  >
                    <option value="fade">Fade</option>
                    <option value="crossfade">Crossfade</option>
                    <option value="slide-left">Geser Kiri</option>
                    <option value="slide-right">Geser Kanan</option>
                    <option value="zoom">Zoom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                    DURASI TRANSISI (MS)
                  </label>
                  <select
                    value={editingSlide.transitionDurationMs}
                    onChange={(e) => setEditingSlide({ ...editingSlide, transitionDurationMs: parseInt(e.target.value) || 800 })}
                    className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold font-mono text-[#18181B]"
                  >
                    <option value={500}>0.5 detik (Cepat)</option>
                    <option value={700}>0.7 detik (Standar)</option>
                    <option value={1000}>1 detik (Halus)</option>
                    <option value={1500}>1.5 detik (Sangat Halus)</option>
                    <option value={2000}>2 detik (Lambat)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 p-6 border-t-2 border-neutral-200 shrink-0">
              <button
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              >
                BATAL
              </button>
              <button
                onClick={() => handleSaveEditedSlide(editingSlide)}
                className="px-5 py-2 rounded-xl font-display font-black text-xs bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]"
              >
                SIMPAN SLIDE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: KONFIRMASI HAPUS SLIDE
         ========================================================================= */}
      {slideToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-rose-400 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black font-display text-[#18181B]">
              Yakin ingin menghapus slide ini?
            </h3>
            <p className="text-xs text-neutral-600">
              "{slideToDelete.title}" akan dihapus secara permanen dari board "{currentBoard.name}".
            </p>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => setSlideToDelete(null)}
                className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteSlide}
                className="px-5 py-2 rounded-xl font-display font-black text-xs bg-rose-600 hover:bg-rose-700 text-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRATINJAU BOARD (SIMULASI TV 16:9 LIVE)
         ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A192F] rounded-2xl border-3 border-[#00E5FF]/40 shadow-2xl max-w-5xl w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <h3 className="text-base font-black font-display text-white">
                    PRATINJAU BOARD: {currentBoard.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#00E5FF]">
                    SIMULASI TAMPILAN FULLSCREEN 1920 × 1080
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onLaunchFullscreen}
                  className="px-3 py-1.5 rounded-lg bg-[#00E5FF] text-[#0A192F] text-xs font-black flex items-center gap-1.5"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>BUKA LAYAR PENUH</span>
                </button>
                <button 
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 16:9 Scaled Canvas Frame */}
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/20 relative shadow-2xl">
              <div 
                className="w-full h-full"
                style={{
                  display: 'grid',
                  gridTemplateRows: '40px 1fr 40px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Scaled Mini Header */}
                <div className="w-full h-full bg-[#0096D6] px-4 flex items-center justify-between text-xs font-bold text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#002840] text-[#00E5FF] font-black rounded text-[10px]">
                      {config.headerLeftText || 'SIMKA'}
                    </span>
                  </div>
                  <div className="font-display font-black text-sm uppercase tracking-wider">
                    {currentBoard.name}
                  </div>
                  <div className="px-2 py-0.5 bg-[#002840] text-[#FFD166] font-mono font-bold text-[10px] rounded">
                    09:41:32
                  </div>
                </div>

                {/* Scaled Content */}
                <div className="w-full h-full overflow-hidden bg-black relative">
                  {(() => {
                    const slide = currentBoard.slides[previewSlideIndex % (currentBoard.slides.length || 1)];
                    if (!slide) return <div className="p-4 text-center">Tidak ada slide</div>;

                    switch (slide.type) {
                      case '3_FOTO':
                        return <LayoutThreePhotos config={config} photos={slide.content.photos} />;
                      case 'VIDEO':
                        return <LayoutVideoFullscreen config={config} videoUrl={slide.content.videoUrl} videoTitle={slide.content.videoTitle} />;
                      case '3_POSTER':
                        return <LayoutThreePosters config={config} posters={slide.content.posters} />;
                      case '1_POSTER':
                        return <LayoutSinglePoster config={config} posterUrl={slide.content.posterUrl} posterTitle={slide.content.posterTitle} />;
                      case 'FOTO_GRID':
                        return <LayoutPhotoGrid config={config} photos={slide.content.gridPhotos} />;
                      case 'FOTO_INFORMASI':
                        return <LayoutPhotoSchedule config={config} photoUrl={slide.content.splitPhotoUrl} lessonPeriods={lessonPeriods} />;
                      default:
                        return null;
                    }
                  })()}
                </div>

                {/* Scaled Mini Running Text */}
                <div className="w-full h-full bg-[#0096D6] px-3 flex items-center overflow-hidden text-xs text-white">
                  <span className="px-2 py-0.5 bg-[#002840] text-[#FFD166] font-bold text-[9px] mr-2 rounded">
                    RUNNING TEXT
                  </span>
                  <span className="truncate text-[11px] font-semibold">
                    {config.runningTextContent}
                  </span>
                </div>
              </div>
            </div>

            {/* Pratinjau Controls */}
            <div className="flex items-center justify-between text-xs font-mono text-[#18181B]">
              <div className="flex items-center gap-2">
                <span>Slide Aktif:</span>
                <strong className="text-[#00E5FF]">
                  {previewSlideIndex + 1} dari {currentBoard.slides.length}
                </strong>
                <span>({currentBoard.slides[previewSlideIndex]?.title})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewSlideIndex(p => (p - 1 + currentBoard.slides.length) % currentBoard.slides.length)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-bold"
                >
                  ◀ Sebelumnya
                </button>
                <button
                  onClick={() => setPreviewSlideIndex(p => (p + 1) % currentBoard.slides.length)}
                  className="px-3 py-1 bg-[#00E5FF] text-[#0A192F] hover:bg-[#00E5FF]/90 rounded font-bold"
                >
                  Berikutnya ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH BOARD BARU
         ========================================================================= */}
      {isNewBoardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-200">
              <h3 className="text-lg font-black font-display text-[#18181B]">
                BUAT BOARD DISPLAY BARU
              </h3>
              <button 
                onClick={() => setIsNewBoardModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  NAMA BOARD
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kegiatan Sekolah, Promosi SPMB..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  DESKRIPSI (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan playlist..."
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-medium text-[#18181B] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsNewBoardModalOpen(false)}
                className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-200 text-neutral-800"
              >
                BATAL
              </button>
              <button
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim()}
                className="px-5 py-2 rounded-xl font-display font-black text-xs bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] disabled:opacity-40"
              >
                BUAT BOARD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
