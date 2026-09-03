import React, { useState } from 'react';
import { 
  BoardItem, 
  SlideItem, 
  SlideType, 
  TransitionType, 
  DisplayConfig, 
  MediaItem,
  LessonPeriod,
  UserRole
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
import { slideService, isUUID } from '../../services/slideService';
import { settingsService, DEFAULT_HEADER_THEME } from '../../services/settingsService';
import { isSupabaseConfigured, supabase, getPublicUrl } from '../../lib/supabase';
import { LayoutThreePhotos } from '../layouts/LayoutThreePhotos';
import { LayoutVideoFullscreen } from '../layouts/LayoutVideoFullscreen';
import { LayoutThreePosters } from '../layouts/LayoutThreePosters';
import { LayoutSinglePoster } from '../layouts/LayoutSinglePoster';
import { LayoutPhotoGrid } from '../layouts/LayoutPhotoGrid';
import { LayoutPhotoSchedule } from '../layouts/LayoutPhotoSchedule';
import { SignageHeader } from '../display/SignageHeader';
import { SignageRunningText } from '../display/SignageRunningText';
import { MediaPicker } from './MediaPicker';

export const cleanSlideTitle = (title: string) => {
  if (!title) return 'Slide Konten';
  return title
    .replace(/^slide\s*\d+\s*[—–-]\s*/i, '')
    .replace(/^slide\s*\d+/i, '')
    .trim() || title;
};

interface AdminBoardDisplayProps {
  boards: BoardItem[];
  activeBoardId: string;
  config: DisplayConfig;
  mediaLibrary: MediaItem[];
  lessonPeriods?: LessonPeriod[];
  onUpdateBoards: (boards: BoardItem[]) => void;
  onUpdateMediaLibrary: (media: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => void;
  onUpdateConfig?: (config: Partial<DisplayConfig>) => void;
  onSetActiveBoard: (boardId: string) => void;
  onLaunchFullscreen: () => void;
  userRole?: UserRole;
}

export const AdminBoardDisplay: React.FC<AdminBoardDisplayProps> = ({
  boards,
  activeBoardId,
  config,
  mediaLibrary,
  lessonPeriods = [],
  onUpdateBoards,
  onUpdateMediaLibrary,
  onUpdateConfig,
  onSetActiveBoard,
  onLaunchFullscreen,
  userRole = 'admin'
}) => {
  const isAdmin = userRole === 'admin';
  const [selectedBoardId, setSelectedBoardId] = useState<string>(activeBoardId || boards[0]?.id || '');
  const currentBoard = boards.find(b => b.id === selectedBoardId) || boards[0] || { id: 'default', name: 'Board Utama', isActive: true, slides: [] };

  const currentTheme = config.headerThemeConfig || DEFAULT_HEADER_THEME;

  const [headerThemePreset, setHeaderThemePreset] = useState(currentTheme.preset || 'cyan');
  const [headerBg, setHeaderBg] = useState(currentTheme.background || '#009FE3');
  const [headerText, setHeaderText] = useState(currentTheme.text || '#FFFFFF');
  const [brandBg, setBrandBg] = useState(currentTheme.brandBg || '#003B5C');
  const [brandTextColor, setBrandTextColor] = useState(currentTheme.brand || currentTheme.brandText || '#FFFFFF');
  const [dateText, setDateText] = useState(currentTheme.date || currentTheme.dateText || '#FFFFFF');
  const [clockBg, setClockBg] = useState(currentTheme.clockBackground || currentTheme.clockBg || '#06243A');
  const [clockText, setClockText] = useState(currentTheme.clockText || '#FFD166');
  const [accent, setAccent] = useState(currentTheme.accent || '#00D9FF');
  const [autoContrast, setAutoContrast] = useState(currentTheme.autoContrast !== undefined ? currentTheme.autoContrast : true);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [savedHeaderSuccess, setSavedHeaderSuccess] = useState(false);
  
  const [boardToDelete, setBoardToDelete] = useState<BoardItem | null>(null);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);

  // Sync state if headerThemeConfig changes from outside/realtime
  React.useEffect(() => {
    if (config.headerThemeConfig) {
      const tc = config.headerThemeConfig;
      setHeaderThemePreset(tc.preset || 'cyan');
      setHeaderBg(tc.background || '#009FE3');
      setHeaderText(tc.text || '#FFFFFF');
      setBrandBg(tc.brandBg || '#003B5C');
      setBrandTextColor(tc.brand || tc.brandText || '#FFFFFF');
      setDateText(tc.date || tc.dateText || '#FFFFFF');
      setClockBg(tc.clockBackground || tc.clockBg || '#06243A');
      setClockText(tc.clockText || '#FFD166');
      setAccent(tc.accent || '#00D9FF');
      if (tc.autoContrast !== undefined) {
        setAutoContrast(tc.autoContrast);
      }
    }
  }, [config.headerThemeConfig]);

  const headerThemes = [
    {
      id: 'cyan',
      name: 'CYAN BIRU',
      description: 'Tema Biru Langit Standar SIMKA',
      background: '#009FE3',
      text: '#FFFFFF',
      brandBg: '#003B5C',
      brandText: '#FFFFFF',
      dateText: '#FFFFFF',
      clockBg: '#06243A',
      clockText: '#FFD166',
      accent: '#00D9FF'
    },
    {
      id: 'white',
      name: 'PUTIH BERSIH',
      description: 'Latar Putih Minimalis & Teks Hitam Kontras',
      background: '#FFFFFF',
      text: '#18181B',
      brandBg: '#E4E4E7',
      brandText: '#18181B',
      dateText: '#18181B',
      clockBg: '#18181B',
      clockText: '#FFD166',
      accent: '#18181B'
    },
    {
      id: 'yellow',
      name: 'KUNING KONTRAS TINGGI',
      description: 'Warna Kuning Perhatian Tinggi',
      background: '#F9C74F',
      text: '#18181B',
      brandBg: '#D99B00',
      brandText: '#18181B',
      dateText: '#18181B',
      clockBg: '#18181B',
      clockText: '#FFFFFF',
      accent: '#18181B'
    },
    {
      id: 'navy',
      name: 'BIRU NAVY',
      description: 'Navy Gelap Elegan & Aksen Cyan',
      background: '#0A192F',
      text: '#00E5FF',
      brandBg: '#002840',
      brandText: '#00E5FF',
      dateText: '#FFFFFF',
      clockBg: '#001D3D',
      clockText: '#FFD166',
      accent: '#00E5FF'
    },
    {
      id: 'black',
      name: 'HITAM MODERN',
      description: 'Latar Gelap Pekat Kontemporer',
      background: '#18181B',
      text: '#FFFFFF',
      brandBg: '#000000',
      brandText: '#00E5FF',
      dateText: '#FFFFFF',
      clockBg: '#000000',
      clockText: '#00E5FF',
      accent: '#38BDF8'
    },
    {
      id: 'emerald',
      name: 'HIJAU EMERALD SEKOLAH',
      description: 'Nuansa Edukasi Hijau Sejuk',
      background: '#0D6E6E',
      text: '#FFFFFF',
      brandBg: '#042424',
      brandText: '#84E1BC',
      dateText: '#FFFFFF',
      clockBg: '#042424',
      clockText: '#FFD166',
      accent: '#2DD4BF'
    }
  ];

  const isLightColor = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return false;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const handleHeaderBgChange = (newBg: string) => {
    setHeaderBg(newBg);
    if (autoContrast) {
      const light = isLightColor(newBg);
      setHeaderText(light ? '#18181B' : '#FFFFFF');
      setDateText(light ? '#18181B' : '#FFFFFF');
    }
  };

  const handleSaveHeaderTheme = async () => {
    setIsSavingHeader(true);
    const themePayload = {
      preset: headerThemePreset,
      background: headerBg,
      text: headerText,
      brand: brandTextColor,
      brandBg: brandBg,
      brandText: config.headerThemeConfig?.brandText || "",
      date: dateText,
      dateText: dateText,
      clockBackground: clockBg,
      clockBg: clockBg,
      clockText: clockText,
      accent: accent,
      autoContrast: autoContrast
    };

    try {
      await settingsService.saveHeaderTheme(themePayload);
      if (onUpdateConfig) {
        onUpdateConfig({
          headerThemeConfig: themePayload
        });
      }
      setSavedHeaderSuccess(true);
      setTimeout(() => setSavedHeaderSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error saving header theme:', err);
      alert(`Gagal menyimpan tema header: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleDeleteBoardConfirmed = async () => {
    if (!boardToDelete) return;
    setIsDeletingBoard(true);
    try {
      await slideService.deleteBoard(boardToDelete.id);
      const updatedBoards = await slideService.getBoards();
      onUpdateBoards(updatedBoards);
      
      if (updatedBoards.length > 0) {
        const nextBoard = updatedBoards.find(b => b.id !== boardToDelete.id) || updatedBoards[0];
        setSelectedBoardId(nextBoard.id);
        if (boardToDelete.isActive || activeBoardId === boardToDelete.id) {
          onSetActiveBoard(nextBoard.id);
        }
      } else {
        setSelectedBoardId('');
      }
      setBoardToDelete(null);
    } catch (err: any) {
      console.error('Error deleting board:', err);
      alert(`Gagal menghapus board dari database: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsDeletingBoard(false);
    }
  };

  // Modal states
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleDirectUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide || !isAdmin) return;
    
    setIsUploadingMedia(true);
    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase belum dikonfigurasi.");
        setIsUploadingMedia(false);
        return;
      }
      
      const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `photos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('galeri-emka').upload(storagePath, file);
      if (uploadError) throw uploadError;
      
      const { data: mediaData, error: dbError } = await supabase.from('media').insert({
        title: file.name,
        file_path: storagePath,
        file_type: file.type,
        file_size: file.size,
        type: file.type.startsWith('video/') ? 'video' : 'foto',
        category: 'Umum'
      }).select().single();
      
      if (dbError) {
        await supabase.storage.from('galeri-emka').remove([storagePath]);
        throw dbError;
      }
      
      const nextPos = (editingSlide.slideMedia || []).length;
      if (isUUID(editingSlide.id) && isUUID(mediaData.id)) {
        const { error: smError } = await supabase.from('slide_media').insert({
          slide_id: editingSlide.id,
          media_id: mediaData.id,
          posisi: nextPos
        });
        if (smError) console.warn('Could not insert immediate slide_media relation:', smError);
      }
      
      // Update local state for immediate feedback
      setEditingSlide({
        ...editingSlide,
        slideMedia: [...(editingSlide.slideMedia || []), mediaData]
      });
      
      // Also update media library locally
      onUpdateMediaLibrary([mediaData, ...mediaLibrary]);
      
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah foto.');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveMediaFromSlide = async (mediaId: string) => {
    if (!editingSlide || !isAdmin) return;
    
    try {
      if (isSupabaseConfigured() && isUUID(editingSlide.id) && isUUID(mediaId)) {
        const { error } = await supabase.from('slide_media')
          .delete()
          .eq('slide_id', editingSlide.id)
          .eq('media_id', mediaId);
          
        if (error) console.warn('Could not delete slide_media relation immediately:', error);
      }
      
      setEditingSlide({
        ...editingSlide,
        slideMedia: (editingSlide.slideMedia || []).filter((m: any) => m.id !== mediaId)
      });
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus media dari slide.');
    }
  };

  const handleAddExistingMediaToSlide = async (mediaData: any) => {
    if (!editingSlide || !isAdmin || activeSlotIndex === null) return;
    
    const newSlideMedia = [...(editingSlide.slideMedia || [])];
    newSlideMedia[activeSlotIndex] = { ...mediaData, posisi: activeSlotIndex };
    
    setEditingSlide({
      ...editingSlide,
      slideMedia: newSlideMedia
    });
    
    setIsMediaSelectorOpen(false);
    setActiveSlotIndex(null);
  };

  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);

  const handleMultipleUploadForSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingSlide || !isAdmin) return;
    
    if (files.length > 3) {
      alert("Maksimal 3 foto untuk template 3 FOTO.");
      e.target.value = '';
      return;
    }

    setIsUploadingMultiple(true);
    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase belum dikonfigurasi.");
        setIsUploadingMultiple(false);
        return;
      }

      const newSlideMedia = [...(editingSlide.slideMedia || [])];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storagePath = `photos/${fileName}`;
        
        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage.from('galeri-emka').upload(storagePath, file);
        if (uploadError) throw uploadError;
        
        // 2. Insert into media table
        const { data: mediaData, error: dbError } = await supabase.from('media').insert({
          title: file.name,
          file_path: storagePath,
          file_type: file.type,
          file_size: file.size,
          type: 'foto',
          category: 'Dokumentasi'
        }).select().single();
        
        if (dbError) {
          await supabase.storage.from('galeri-emka').remove([storagePath]);
          throw dbError;
        }

        // Assign to slot i
        newSlideMedia[i] = { ...mediaData, posisi: i };
      }

      setEditingSlide({
        ...editingSlide,
        slideMedia: newSlideMedia
      });

      // Update media library locally
      const { data: latestMedia } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (latestMedia) {
        onUpdateMediaLibrary(latestMedia.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type as any,
          url: getPublicUrl(item.file_path),
          filePath: item.file_path,
          category: item.category || 'Lainnya',
          dimensions: `${item.width || 0} × ${item.height || 0} px`,
          size: ((item.file_size || 0) / (1024 * 1024)).toFixed(1) + ' MB',
          orientation: item.orientation as any,
          dateAdded: item.created_at.split('T')[0]
        })));
      }

    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah beberapa foto.');
    } finally {
      setIsUploadingMultiple(false);
      e.target.value = '';
    }
  };

  const handleDirectSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide || !isAdmin) return;
    
    setIsUploadingMedia(true);
    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase belum dikonfigurasi.");
        return;
      }
      
      const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const isVideo = file.type.startsWith('video/');
      const storagePath = isVideo ? `videos/${fileName}` : `photos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('galeri-emka').upload(storagePath, file);
      if (uploadError) throw uploadError;
      
      const { data: mediaData, error: dbError } = await supabase.from('media').insert({
        title: file.name,
        file_path: storagePath,
        file_type: file.type,
        file_size: file.size,
        type: isVideo ? 'video' : 'foto',
        category: isVideo ? 'Video' : 'Dokumentasi'
      }).select().single();
      
      if (dbError) {
        await supabase.storage.from('galeri-emka').remove([storagePath]);
        throw dbError;
      }
      
      const newSlideMedia = [...(editingSlide.slideMedia || [])];
      newSlideMedia[slotIndex] = { ...mediaData, posisi: slotIndex };
      
      setEditingSlide({
        ...editingSlide,
        slideMedia: newSlideMedia
      });

      // Update media library locally
      const { data: latestMedia } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (latestMedia) {
        onUpdateMediaLibrary(latestMedia.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type as any,
          url: getPublicUrl(item.file_path),
          filePath: item.file_path,
          category: item.category || 'Lainnya',
          dimensions: `${item.width || 0} × ${item.height || 0} px`,
          size: ((item.file_size || 0) / (1024 * 1024)).toFixed(1) + ' MB',
          orientation: item.orientation as any,
          dateAdded: item.created_at.split('T')[0]
        })));
      }
      
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah file.');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

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
    if (!isAdmin) return;
    const newBoards = boards.map(b => b.id === updatedBoard.id ? updatedBoard : b);
    onUpdateBoards(newBoards);
  };

  const handleToggleBoardActive = (boardId: string) => {
    if (!isAdmin) return;
    const newBoards = boards.map(b => ({
      ...b,
      isActive: b.id === boardId
    }));
    onUpdateBoards(newBoards);
    onSetActiveBoard(boardId);
  };

  const handleCreateBoard = () => {
    if (!isAdmin || !newBoardName.trim()) return;
    const newBoard: BoardItem = {
      id: `board-${Date.now()}`,
      name: newBoardName.trim(),
      description: newBoardDesc.trim() || 'Board digital signage baru',
      isActive: false,
      loopMode: 'loop_forever',
      createdAt: new Date().toISOString().split('T')[0],
      slides: []
    };
    onUpdateBoards([...boards, newBoard]);
    setSelectedBoardId(newBoard.id);
    setIsNewBoardModalOpen(false);
    setNewBoardName('');
    setNewBoardDesc('');
  };

  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const startEditingSlide = (slide: SlideItem) => {
    const maxSlots = slide.type === '3_FOTO' || slide.type === '3_POSTER' ? 3 : (slide.type === 'FOTO_GRID' ? 4 : 1);
    const normalizedMedia = Array(maxSlots).fill(null);
    
    (slide.slideMedia || []).forEach((m: any, idx: number) => {
      const pos = typeof m.posisi === 'number' ? m.posisi : idx;
      if (pos >= 0 && pos < maxSlots) {
        normalizedMedia[pos] = { ...m, posisi: pos };
      }
    });

    setEditingSlide({
      ...slide,
      slideMedia: normalizedMedia
    });
  };

  // Slide Operations
  const handleAddSlide = async (type: SlideType) => {
    if (!isAdmin) return;
    const slideNumber = currentBoard.slides.length + 1;
    let title = `SLIDE ${slideNumber} — ${type}`;
    
    const newSlide: SlideItem = {
      id: `temp-${Date.now()}`,
      title,
      type,
      durationSec: 10,
      transition: 'fade',
      transitionDurationMs: 800,
      enabled: true,
      content: {}
    };

    try {
      if (isSupabaseConfigured()) {
        const savedSlideData = await slideService.saveSlide(currentBoard.id, newSlide, []);
        const actualSlide = { ...newSlide, id: savedSlideData.id, slideMedia: [] };
        const updatedBoard = {
          ...currentBoard,
          slides: [...currentBoard.slides, actualSlide]
        };
        handleBoardUpdate(updatedBoard);
        setIsAddSlideModalOpen(false);
        startEditingSlide(actualSlide);
      } else {
        const updatedBoard = {
          ...currentBoard,
          slides: [...currentBoard.slides, newSlide]
        };
        handleBoardUpdate(updatedBoard);
        setIsAddSlideModalOpen(false);
        startEditingSlide(newSlide);
      }
    } catch (err: any) {
      console.error('Error creating slide:', err);
      alert(`Gagal membuat slide: ${err?.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleDuplicateSlide = async (slide: SlideItem) => {
    if (!isAdmin) return;
    try {
      if (isSupabaseConfigured()) {
        const clonedSlideData = {
          ...slide,
          id: `temp-${Date.now()}`, // Temporary ID for saveSlide to insert as a new record
          title: `${slide.title} (SALINAN)`,
          content: JSON.parse(JSON.stringify(slide.content || {}))
        };
        const mediaWithPositions = (slide.slideMedia || []).map((m: any, index: number) => {
          if (!m) return null;
          return {
            id: m.id,
            posisi: typeof m.posisi === 'number' ? m.posisi : index
          };
        }).filter(Boolean);

        await slideService.saveSlide(currentBoard.id, clonedSlideData, mediaWithPositions);
        const dbBoards = await slideService.getBoards();
        onUpdateBoards(dbBoards);
      } else {
        const index = currentBoard.slides.findIndex(s => s.id === slide.id);
        const clonedSlide: SlideItem = {
          ...slide,
          id: `sld-${Date.now()}`,
          title: `${slide.title} (SALINAN)`,
          content: JSON.parse(JSON.stringify(slide.content || {}))
        };

        const newSlides = [...currentBoard.slides];
        newSlides.splice(index + 1, 0, clonedSlide);

        const updatedBoard = {
          ...currentBoard,
          slides: newSlides
        };
        handleBoardUpdate(updatedBoard);
      }
    } catch (err: any) {
      console.error('SIMKA DUPLICATE SLIDE ERROR:', err);
      alert(`Gagal menduplikasi slide: ${err?.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleConfirmDeleteSlide = async () => {
    if (!isAdmin || !slideToDelete) return;
    try {
      if (isSupabaseConfigured()) {
        await slideService.deleteSlide(slideToDelete.id);
        const dbBoards = await slideService.getBoards();
        onUpdateBoards(dbBoards);
      } else {
        const newSlides = currentBoard.slides.filter(s => s.id !== slideToDelete.id);
        const updatedBoard = {
          ...currentBoard,
          slides: newSlides
        };
        handleBoardUpdate(updatedBoard);
      }
      setSlideToDelete(null);
    } catch (err: any) {
      console.error('SIMKA DELETE SLIDE ERROR:', err);
      alert(`Slide gagal dihapus: ${err?.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    
    // Construct the media ids with their actual slot positions
    const mediaWithPositions = (updatedSlide.slideMedia || [])
      .map((m: any, index: number) => {
        if (!m) return null;
        return {
          id: m.id,
          posisi: index
        };
      })
      .filter(Boolean);

    // Compute layout URLs inside content so that it renders instantly and accurately
    const content = { ...updatedSlide.content };
    const mappedUrls = (updatedSlide.slideMedia || []).map((m: any) => m ? getPublicUrl(m.file_path || m.url) : '');

    if (updatedSlide.type === '3_FOTO') {
      content.photos = [mappedUrls[0] || '', mappedUrls[1] || '', mappedUrls[2] || ''];
    } else if (updatedSlide.type === 'FOTO_GRID') {
      content.gridPhotos = [mappedUrls[0] || '', mappedUrls[1] || '', mappedUrls[2] || '', mappedUrls[3] || ''];
    } else if (updatedSlide.type === '1_POSTER') {
      content.posterUrl = mappedUrls[0] || '';
    } else if (updatedSlide.type === '3_POSTER') {
      content.posters = [mappedUrls[0] || '', mappedUrls[1] || '', mappedUrls[2] || ''];
    } else if (updatedSlide.type === 'FOTO_INFORMASI') {
      content.splitPhotoUrl = mappedUrls[0] || '';
    } else if (updatedSlide.type === 'VIDEO') {
      content.videoUrl = mappedUrls[0] || '';
      const activeVideo = (updatedSlide.slideMedia || []).find((m: any) => m !== null);
      content.videoTitle = activeVideo ? activeVideo.title : '';
    }

    const finalizedSlide: SlideItem = {
      ...updatedSlide,
      content,
      // Keep only non-null elements in slideMedia for local states
      slideMedia: (updatedSlide.slideMedia || []).filter(Boolean).map((m: any, idx: number) => ({ ...m, posisi: idx }))
    };

    try {
      if (isSupabaseConfigured()) {
        const savedData = await slideService.saveSlide(currentBoard.id, finalizedSlide, mediaWithPositions);
        finalizedSlide.id = savedData.id;
      }
      
      const newSlides = currentBoard.slides.map(s => 
        (s.id === updatedSlide.id || s.id === finalizedSlide.id || (s.id.includes('temp-') && s.id === finalizedSlide.id)) 
          ? finalizedSlide 
          : s
      );
      const updatedBoard = {
        ...currentBoard,
        slides: newSlides
      };
      handleBoardUpdate(updatedBoard);
      setEditingSlide(null);
    } catch (err: any) {
      console.error('Error saving to Supabase:', err);
      alert(`Gagal menyimpan ke database: ${err?.message || 'Terjadi kesalahan'}`);
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
          <div className="w-full h-16 rounded overflow-hidden bg-black border border-[#18181B] flex items-center justify-center p-0.5">
            <img src={slide.content.posterUrl || undefined} alt="Poster" className="w-full h-full object-contain bg-black" />
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
                const cleanBoardName = b.name.replace(/^slide\s*/i, 'Board ');
                return (
                  <div key={b.id} className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBoardId(b.id)}
                      className={`px-4 py-2 rounded-xl font-display font-black text-sm transition-all flex items-center gap-2 border-2 ${
                        isSelected
                          ? 'bg-[#0096D6] text-white border-[#18181B] shadow-[2px_2px_0px_#18181B]'
                          : 'bg-white hover:bg-neutral-100 text-[#18181B] border-neutral-300'
                      }`}
                    >
                      <span>{cleanBoardName}</span>
                      {b.isActive && (
                        <span className="text-[10px] bg-[#FFD166] text-[#18181B] px-1.5 py-0.5 rounded font-mono font-extrabold">
                          AKTIF
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBoardToDelete(b);
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-300 transition-colors"
                        title="Hapus Board"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <button
                  onClick={() => setIsNewBoardModalOpen(true)}
                  className="px-3 py-2 rounded-xl font-display font-bold text-xs bg-white hover:bg-neutral-100 text-[#0096D6] border-2 border-dashed border-[#0096D6] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ TAMBAH BOARD</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Status Switcher & Loop Mode */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border-2 border-[#18181B]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-700">STATUS:</span>
              <button
                disabled={!isAdmin}
                onClick={() => handleToggleBoardActive(currentBoard.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-colors ${
                  currentBoard.isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                } ${!isAdmin ? 'cursor-not-allowed opacity-90' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full ${currentBoard.isActive ? 'bg-white animate-pulse' : 'bg-neutral-400'}`}></span>
                <span>{currentBoard.isActive ? '● AKTIF (SIARAN)' : '○ NONAKTIF'}</span>
              </button>
            </div>

            <div className="h-5 w-[1px] bg-neutral-300"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-700">MODE PUTAR:</span>
              <select
                disabled={!isAdmin}
                value={currentBoard.loopMode}
                onChange={(e) => {
                  handleBoardUpdate({
                    ...currentBoard,
                    loopMode: e.target.value as any
                  });
                }}
                className={`bg-[#F3EFE6] px-2 py-1 rounded-lg font-mono font-bold text-xs text-[#18181B] border border-[#18181B] focus:outline-none ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              >
                <option value="loop_forever">Ulangi Terus (Loop)</option>
                <option value="play_once">Urut dari Awal</option>
              </select>
            </div>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-neutral-300 text-center space-y-4">
            <Layers className="w-12 h-12 text-neutral-400" />
            <div>
              <p className="text-base font-black font-display text-[#18181B]">Belum Ada Board Siaran</p>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">Seluruh board telah dihapus dari Supabase. Buat board baru untuk mulai menyiarkan slide.</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsNewBoardModalOpen(true)}
                className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-6 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
              >
                <Plus className="w-4 h-4 text-[#18181B]" />
                <span>+ TAMBAH BOARD BARU</span>
              </button>
            )}
          </div>
        ) : (
          <>
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

              {isAdmin ? (
                <button
                  id="btn-tambah-slide"
                  onClick={() => setIsAddSlideModalOpen(true)}
                  className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-4 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                >
                  <Plus className="w-4 h-4 text-[#18181B]" />
                  <span>+ TAMBAH SLIDE</span>
                </button>
              ) : (
                <div className="px-3.5 py-1.5 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 text-xs font-mono font-bold">
                  MODE BACA (READ-ONLY)
                </div>
              )}
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
                      disabled={!isAdmin || index === 0}
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
                      disabled={!isAdmin || index === currentBoard.slides.length - 1}
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
                        {cleanSlideTitle(slide.title)}
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
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => startEditingSlide(slide)}
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
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setPreviewSlideIndex(index);
                        setIsPreviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] font-display font-bold text-xs rounded-lg border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0096D6]" />
                      <span>Lihat Pratinjau</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {currentBoard.slides.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-neutral-300 text-center space-y-4">
              <Layers className="w-12 h-12 text-neutral-400" />
              <div>
                <p className="text-base font-black font-display text-[#18181B]">Belum ada slide pada board ini.</p>
                <p className="text-xs text-neutral-500 max-w-sm mt-1">Tambahkan slide baru dengan berbagai pilihan layout seperti 3 Foto, Video, Poster, atau Foto Informasi.</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsAddSlideModalOpen(true)}
                  className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-bold text-xs px-4 py-2 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4 text-[#18181B]" />
                  <span>+ TAMBAH SLIDE</span>
                </button>
              )}
            </div>
          )}
        </div>
        </>
        )}
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
              <div className="space-y-4 bg-white p-5 rounded-xl border-2 border-[#18181B]">
                <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                  <h4 className="font-display font-black text-sm text-[#18181B] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#0096D6] rounded-full"></span>
                    <span>MEDIA SLIDE</span>
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-[#0096D6]/10 text-[#0096D6] px-2 py-0.5 rounded border border-[#0096D6]/30">
                    Sistem Slot Terstruktur
                  </span>
                </div>

                {/* Bulk Multi-Upload for 3 FOTO Template */}
                {editingSlide.type === '3_FOTO' && (
                  <div className="p-4 bg-[#F0F9FF] border border-sky-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-sky-800 font-display">UNGGAH 3 FOTO SEKALIGUS</h5>
                      <p className="text-[10px] text-sky-600 font-mono mt-0.5">Pilih maksimal 3 file gambar untuk mengisi slot 1, 2, dan 3 secara otomatis.</p>
                    </div>
                    <label className="shrink-0 px-4 py-2 bg-[#0096D6] hover:bg-[#0080B8] text-white border-2 border-[#18181B] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] active:shadow-[1px_1px_0px_#18181B] cursor-pointer flex items-center gap-1.5 transition-all">
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handleMultipleUploadForSlide} 
                      />
                      <span>+ PILIH FILE (MAKS 3)</span>
                    </label>
                  </div>
                )}

                {isUploadingMultiple && (
                  <div className="py-2 text-center text-xs font-mono font-bold text-[#0096D6] animate-pulse">
                    Mengunggah beberapa foto sekaligus...
                  </div>
                )}

                {isUploadingMedia && (
                  <div className="py-2 text-center text-xs font-mono font-bold text-[#0096D6] animate-pulse">
                    Sedang mengunggah media ke slot...
                  </div>
                )}

                {/* Grid of Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(() => {
                    const maxSlots = editingSlide.type === '3_FOTO' || editingSlide.type === '3_POSTER' ? 3 : (editingSlide.type === 'FOTO_GRID' ? 4 : 1);
                    const slots = Array.from({ length: maxSlots });
                    
                    return slots.map((_, idx) => {
                      const mediaItem = (editingSlide.slideMedia || [])[idx];
                      
                      if (mediaItem) {
                        return (
                          <div key={idx} className="border-2 border-[#18181B] rounded-xl overflow-hidden bg-[#F8F6F0] shadow-[3px_3px_0px_#18181B] flex flex-col justify-between">
                            <div className="bg-neutral-900 aspect-video relative flex items-center justify-center overflow-hidden border-b-2 border-[#18181B]">
                              {mediaItem.file_type?.startsWith('video/') || mediaItem.type === 'video' ? (
                                <video src={getPublicUrl(mediaItem.file_path || mediaItem.url)} className="w-full h-full object-cover" />
                              ) : (
                                <img 
                                  src={getPublicUrl(mediaItem.file_path || mediaItem.url)} 
                                  alt={`Slot ${idx + 1}`} 
                                  className={`w-full h-full ${editingSlide.type === '1_POSTER' || editingSlide.type === '3_POSTER' ? 'object-contain bg-black' : 'object-cover'}`} 
                                />
                              )}
                              <div className="absolute top-2 left-2 bg-black/75 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded border border-white/25">
                                SLOT {idx + 1}
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white space-y-2">
                              <div className="text-xs font-bold text-[#18181B] truncate" title={mediaItem.title}>
                                {mediaItem.title}
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSlotIndex(idx);
                                    setIsMediaSelectorOpen(true);
                                  }}
                                  className="flex-1 text-[10px] font-bold py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-700 transition-colors"
                                >
                                  Ganti
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMedia = [...(editingSlide.slideMedia || [])];
                                    newMedia[idx] = null;
                                    setEditingSlide({ ...editingSlide, slideMedia: newMedia });
                                  }}
                                  className="flex-1 text-[10px] font-bold py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-rose-600 transition-colors"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={idx} 
                            className="border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50/50 p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px] relative transition-colors hover:bg-neutral-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-mono font-black text-neutral-500">
                              {idx + 1}
                            </div>
                            
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-bold text-[#18181B]">SLOT {idx + 1} KOSONG</h5>
                              <p className="text-[9px] text-neutral-400 font-mono">Belum ada foto/video terpilih</p>
                            </div>

                            <div className="flex items-center gap-1.5 w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSlotIndex(idx);
                                  setIsMediaSelectorOpen(true);
                                }}
                                className="flex-1 text-[10px] font-bold py-1.5 bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] border border-[#18181B] rounded shadow-[1.5px_1.5px_0px_#18181B] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_#18181B] transition-all"
                              >
                                + Galeri
                              </button>
                              <label className="flex-1 text-[10px] font-bold py-1.5 bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] border border-[#18181B] rounded shadow-[1.5px_1.5px_0px_#18181B] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_#18181B] cursor-pointer text-center transition-all">
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept={editingSlide.type === 'VIDEO' ? 'video/*' : 'image/*'} 
                                  onChange={(e) => handleDirectSlotUpload(e, idx)} 
                                />
                                <span>+ Upload</span>
                              </label>
                            </div>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>

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
    
      {/* =========================================================================
          MODAL: MEDIA SELECTOR
         ========================================================================= */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b-2 border-neutral-200 shrink-0">
              <h3 className="text-xl font-black font-display text-[#18181B] uppercase">
                PILIH MEDIA DARI GALERI
              </h3>
              <button 
                onClick={() => setIsMediaSelectorOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaLibrary.map(media => (
                <div 
                  key={media.id}
                  onClick={() => handleAddExistingMediaToSlide(media)}
                  className="group aspect-square rounded-2xl border-2 border-[#18181B] bg-neutral-900 overflow-hidden relative cursor-pointer hover:shadow-[4px_4px_0px_#0096D6] transition-all hover:translate-y-[-2px] flex items-center justify-center p-2"
                >
                  {media.type === 'video' || (media as any).file_type?.startsWith('video/') ? (
                    <video src={getPublicUrl((media as any).file_path || media.url)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <img src={getPublicUrl((media as any).file_path || media.url)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-xs bg-[#0096D6] px-3 py-1.5 rounded-lg border border-[#18181B]">
                      PILIH
                    </span>
                  </div>
                </div>
              ))}
              {mediaLibrary.length === 0 && (
                <div className="col-span-full py-12 flex items-center justify-center text-neutral-400 font-mono text-xs">
                  Tidak ada media di galeri.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEMA HEADER DIGITAL SIGNAGE Section */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-neutral-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0096D6]">
              <Sliders className="w-4 h-4 text-[#0096D6]" />
              <span>PENGATURAN TEMA & WARNA HEADER</span>
            </div>
            <h3 className="text-2xl font-black font-display text-[#18181B] mt-1">
              TEMA HEADER DIGITAL SIGNAGE
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Sesuaikan warna latar belakang, teks, logo, jam, dan elemen header siaran secara realtime.
            </p>
          </div>

          {isAdmin && (
            <button
              disabled={isSavingHeader}
              onClick={handleSaveHeaderTheme}
              className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-6 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savedHeaderSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>BERHASIL DISIMPAN</span>
                </>
              ) : isSavingHeader ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#18181B]" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#18181B]" />
                  <span>SIMPAN TEMA HEADER</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Realtime Header Preview Box */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-neutral-700 uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#0096D6]" />
            PRATINJAU LANGSUNG HEADER (1920 × 62px)
          </span>
          <div className="rounded-xl overflow-hidden border-2 border-[#18181B] shadow-md bg-neutral-900 scale-100 origin-left">
            <SignageHeader
              config={{
                ...config,
                headerThemeConfig: {
                  ...config.headerThemeConfig,
                  preset: headerThemePreset,
                  background: headerBg,
                  text: headerText,
                  brandBg: brandBg,
                  brand: brandTextColor,
                  dateText: dateText,
                  clockBg: clockBg,
                  clockText: clockText,
                  accent: accent,
                  autoContrast: autoContrast
                }
              }}
              lessonPeriods={lessonPeriods}
            />
          </div>
        </div>

        {/* Preset Palettes */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-neutral-700 uppercase">PILIHAN PRESET WARNA:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {headerThemes.map(th => (
              <button
                key={th.id}
                onClick={() => {
                  setHeaderThemePreset(th.id);
                  setHeaderBg(th.background);
                  setHeaderText(th.text);
                  setBrandBg(th.brandBg);
                  setBrandTextColor(th.brandText);
                  setDateText(th.dateText);
                  setClockBg(th.clockBg);
                  setClockText(th.clockText);
                  setAccent(th.accent);
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                  headerThemePreset === th.id
                    ? 'border-[#0096D6] bg-[#0096D6]/10 shadow-[2px_2px_0px_#0096D6]'
                    : 'border-[#18181B] bg-white hover:bg-neutral-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-display font-black text-xs text-[#18181B]">{th.name}</div>
                  <div className="text-[11px] text-neutral-500 font-medium">{th.description}</div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: th.background }} title="Latar"></span>
                    <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: th.brandBg }} title="Brand"></span>
                    <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: th.clockBg }} title="Jam"></span>
                  </div>
                </div>
                {headerThemePreset === th.id && <CheckCircle2 className="w-5 h-5 text-[#0096D6]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t-2 border-neutral-200">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Latar Header:</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={headerBg} 
                onChange={(e) => handleHeaderBgChange(e.target.value)} 
                className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" 
              />
              <input 
                type="text" 
                value={headerBg} 
                onChange={(e) => handleHeaderBgChange(e.target.value)} 
                className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Teks Utama:</label>
            <div className="flex items-center gap-2">
              <input type="color" value={headerText} onChange={(e) => setHeaderText(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Brand/Logo BG:</label>
            <div className="flex items-center gap-2">
              <input type="color" value={brandBg} onChange={(e) => setBrandBg(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={brandBg} onChange={(e) => setBrandBg(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Brand/Logo Text:</label>
            <div className="flex items-center gap-2">
              <input type="color" value={brandTextColor} onChange={(e) => setBrandTextColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={brandTextColor} onChange={(e) => setBrandTextColor(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Tanggal:</label>
            <div className="flex items-center gap-2">
              <input type="color" value={dateText} onChange={(e) => setDateText(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={dateText} onChange={(e) => setDateText(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Jam (Background):</label>
            <div className="flex items-center gap-2">
              <input type="color" value={clockBg} onChange={(e) => setClockBg(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={clockBg} onChange={(e) => setClockBg(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Jam (Teks):</label>
            <div className="flex items-center gap-2">
              <input type="color" value={clockText} onChange={(e) => setClockText(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={clockText} onChange={(e) => setClockText(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-700">Warna Garis Aksen/Border:</label>
            <div className="flex items-center gap-2">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white" />
              <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border-2 border-[#18181B] font-mono text-xs uppercase" />
            </div>
          </div>
        </div>

        {/* Auto Contrast Setting */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="header-auto-contrast"
            checked={autoContrast}
            onChange={(e) => setAutoContrast(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-[#18181B] text-[#0096D6] focus:ring-0 cursor-pointer"
          />
          <label htmlFor="header-auto-contrast" className="text-xs font-mono font-bold text-neutral-800 cursor-pointer select-none">
            KONTRAS TINGGI OTOMATIS (Menyesuaikan teks secara otomatis berdasarkan kecerahan latar belakang)
          </label>
        </div>
      </div>

      {/* Board Delete Confirmation Modal */}
      {boardToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] max-w-md w-full p-6 rounded-3xl border-3 border-[#18181B] shadow-[8px_8px_0px_#18181B] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 border-2 border-rose-400 rounded-2xl text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black font-display text-[#18181B]">HAPUS BOARD?</h3>
                <p className="text-xs text-neutral-600">Board "{boardToDelete.name}" beserta seluruh slide di dalamnya akan dihapus.</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-mono">
              ⚠️ Peringatan: Tindakan ini menghapus data slide dari database Supabase secara permanen. File media di galeri tetap aman.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeletingBoard}
                onClick={() => setBoardToDelete(null)}
                className="px-5 py-2.5 rounded-xl border-2 border-[#18181B] font-display font-bold text-xs bg-white hover:bg-neutral-100 text-[#18181B] disabled:opacity-50"
              >
                BATAL
              </button>
              <button
                disabled={isDeletingBoard}
                onClick={handleDeleteBoardConfirmed}
                className="px-6 py-2.5 rounded-xl border-2 border-[#18181B] font-display font-black text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-[2px_2px_0px_#18181B] disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingBoard ? (
                  <>
                    <Trash2 className="w-4 h-4 animate-spin" />
                    <span>MENGHAPUS...</span>
                  </>
                ) : (
                  <span>HAPUS BOARD</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
};
