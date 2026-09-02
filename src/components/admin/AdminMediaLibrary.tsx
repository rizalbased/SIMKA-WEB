import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, BoardItem, UserRole } from '../../types';
import { mediaService } from '../../services/mediaService';
import { videoService } from '../../services/videoService';
import { supabase } from '../../lib/supabase';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Film, 
  FileText, 
  Search, 
  X, 
  UploadCloud,
  Eye,
  Loader2,
  Lock,
  ImagePlus
} from 'lucide-react';

interface AdminMediaLibraryProps {
  mediaLibrary: MediaItem[];
  onUpdateMediaLibrary: (items: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => void;
  boards?: BoardItem[];
  userRole?: UserRole;
}

export const AdminMediaLibrary: React.FC<AdminMediaLibraryProps> = ({
  mediaLibrary,
  onUpdateMediaLibrary,
  boards = [],
  userRole = 'admin'
}) => {
  const isAdmin = userRole === 'admin';
  const [activeFilter, setActiveFilter] = useState<'all' | 'foto' | 'video' | 'poster'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'foto' | 'video' | 'poster'>('foto');
  const [newCategory, setNewCategory] = useState('');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media from Supabase on mount & set up realtime listener
  useEffect(() => {
    const loadMedia = async () => {
      try {
        const [photos, videos] = await Promise.all([
          mediaService.getAllMedia(),
          videoService.getAllVideos()
        ]);

        const combinedMedia: MediaItem[] = [
          ...photos,
          ...videos.map((v: any) => ({
            id: v.id,
            title: v.title,
            type: 'video' as const,
            url: v.url,
            filePath: v.file_path,
            category: 'Video',
            dimensions: `${v.width} × ${v.height}`,
            size: (v.file_size / (1024 * 1024)).toFixed(1) + ' MB',
            dateAdded: v.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          }))
        ];

        onUpdateMediaLibrary(combinedMedia);
      } catch (error) {
        console.error('SIMKA LOAD MEDIA ERROR:', error);
      }
    };

    loadMedia();

    const channel = supabase
      .channel('simka-media-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media'
        },
        async () => {
          await loadMedia();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        async () => {
          await loadMedia();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredMedia = mediaLibrary.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  
  const handleDirectUploadMediaLibrary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    try {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.round(video.duration);
          try {
            await videoService.uploadVideo(file, { width: video.videoWidth, height: video.videoHeight, duration });
            setUploadProgress(100);
            setIsUploading(false);
          } catch (err) {
            console.error(err);
            alert('Gagal mengunggah video.');
            setIsUploading(false);
          }
        };
        video.src = window.URL.createObjectURL(file);
      } else {
        const img = new Image();
        img.onload = async () => {
          window.URL.revokeObjectURL(img.src);
          try {
            await mediaService.uploadMedia(file, {
                            type: 'foto',
              width: img.width,
              height: img.height,
              orientation: img.width > img.height ? 'LANDSCAPE' : img.width < img.height ? 'PORTRAIT' : 'SQUARE'
            });
            setUploadProgress(100);
            setIsUploading(false);
          } catch (err) {
            console.error(err);
            alert('Gagal mengunggah gambar.');
            setIsUploading(false);
          }
        };
        img.src = window.URL.createObjectURL(file);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memproses file.');
      setIsUploading(false);
    }
  };
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Administrator yang dapat mengunggah media.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newTitle.trim()) {
      setNewTitle(file.name);
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      let uploadedItem: MediaItem | null = null;

      if (newType === 'video') {
        // Simple video metadata extraction
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.round(video.duration);
          const width = video.videoWidth;
          const height = video.videoHeight;
          
          try {
            setUploadProgress(30);
            const res = await videoService.uploadVideo(file, { width, height, duration });
            setUploadProgress(100);
            
            // App.tsx handles the state update via Realtime, 
            // but we can manually update for immediate feedback
            onUpdateMediaLibrary(prev => [
              {
                id: res.id,
                title: res.title,
                type: 'video',
                url: res.url,
                filePath: res.file_path,
                category: 'Video',
                dimensions: `${width} × ${height}`,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                dateAdded: new Date().toISOString().split('T')[0]
              },
              ...prev
            ]);
            
            setIsAddModalOpen(false);
            resetForm();
          } catch (err: any) {
            alert(`Gagal unggah video: ${err.message || 'Unknown error'}`);
          } finally {
            setIsUploading(false);
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        // Image metadata extraction
        const img = new Image();
        img.onload = async () => {
          const width = img.width;
          const height = img.height;
          const orientation = height > width ? 'portrait' : 'landscape';
          
          try {
            setUploadProgress(50);
            const res = await mediaService.uploadMedia(file, { 
              width, 
              height, 
              orientation, 
              type: newType 
            });
            
            if (res) {
              setUploadProgress(100);
              onUpdateMediaLibrary(prev => [res, ...prev]);
              setIsAddModalOpen(false);
              resetForm();
            }
          } catch (err: any) {
            alert(`Gagal unggah gambar: ${err.message || 'Unknown error'}`);
          } finally {
            setIsUploading(false);
          }
        };
        img.src = URL.createObjectURL(file);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Error: ${err.message}`);
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCategory('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (isDeleting) return;

    if (!window.confirm(`Hapus "${item.title}" secara permanen dari Supabase Storage dan Database?`)) return;

    setIsDeleting(item.id);
    try {
      if (item.type === 'video') {
        await videoService.deleteVideo(item.id, item.filePath || '');
      } else {
        await mediaService.deleteMedia(item.id, item.filePath || '');
      }
      
      // Reload public.media
      const [photos, videos] = await Promise.all([
        mediaService.getAllMedia(),
        videoService.getAllVideos()
      ]);
      
      const combinedMedia: MediaItem[] = [
        ...photos,
        ...videos.map((v: any) => ({
          id: v.id,
          title: v.title,
          type: 'video' as const,
          url: v.url,
          filePath: v.file_path,
          category: 'Video',
          dimensions: `${v.width} × ${v.height}`,
          size: (v.file_size / (1024 * 1024)).toFixed(1) + ' MB',
          dateAdded: v.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }))
      ];
      onUpdateMediaLibrary(combinedMedia);
    } catch (err: any) {
      console.error('Error deleting media:', err);
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0096D6]">
            <FolderKanban className="w-4 h-4 text-[#0096D6]" />
            <span>PUSTAKA SUMBER DAYA SUPABASE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#18181B] mt-1">
            MEDIA & GALERI KONTEN
          </h2>
          <p className="text-sm font-medium text-neutral-600 mt-0.5">
            Penyimpanan resmi di cloud Supabase. Semua perubahan tersinkronisasi secara realtime.
          </p>
        </div>

        {isAdmin ? (
          <label
            className="cursor-pointer bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-5 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
          >
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={handleDirectUploadMediaLibrary} />
            <Plus className="w-4 h-4 text-[#18181B]" />
            <span>{isUploading ? 'MENGUNGGAH...' : 'UNGGAH FILE BARU'}</span>
          </label>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 border-2 border-neutral-300 rounded-xl text-neutral-600 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>MODE BACA (READ-ONLY)</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-neutral-200">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'SEMUA MEDIA', icon: FolderKanban },
              { id: 'foto', label: 'FOTO (PORTRAIT)', icon: ImageIcon },
              { id: 'video', label: 'VIDEO (1080P)', icon: Film },
              { id: 'poster', label: 'POSTER RESMI', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl font-display font-bold text-xs flex items-center gap-2 border-2 transition-all ${
                    isActive
                      ? 'bg-[#0096D6] text-white border-[#18181B] shadow-[2px_2px_0px_#18181B]'
                      : 'bg-white hover:bg-neutral-100 text-[#18181B] border-neutral-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border-2 border-[#18181B] text-xs font-bold focus:outline-none focus:border-[#0096D6]"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] overflow-hidden flex flex-col group transition-all hover:border-[#0096D6]"
            >
              {/* Media Preview Box */}
              <div className="h-44 bg-black relative overflow-hidden flex items-center justify-center">
                {item.type === 'foto' && (
                  <img
                    src={item.url || undefined}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {item.type === 'poster' && (
                  <img
                    src={item.url || undefined}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                )}
                {item.type === 'video' && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-[#00E5FF]">
                    <Film className="w-10 h-10 mb-2" />
                    <span className="text-[10px] font-mono text-gray-300">1080p MP4 Video</span>
                  </div>
                )}

                {/* Badge Type */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/70 backdrop-blur-sm text-white border border-white/20">
                  {item.type}
                </div>

                {/* Quick Action Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewMedia(item)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
                    title="Lihat Pratinjau"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      disabled={isDeleting === item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDeleting === item.id 
                          ? 'bg-rose-600 text-white cursor-not-allowed' 
                          : 'bg-rose-500/30 hover:bg-rose-600 text-white'
                      }`}
                      title="Hapus Media"
                    >
                      <Trash2 className={`w-4 h-4 ${isDeleting === item.id ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-display font-black text-xs text-[#18181B] line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {item.category || 'Umum'} • {item.dimensions}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{item.dateAdded}</span>
                  {isAdmin ? (
                    <button
                      type="button"
                      disabled={isDeleting === item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item);
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold disabled:opacity-50"
                    >
                      {isDeleting === item.id ? 'Menghapus...' : 'Hapus'}
                    </button>
                  ) : (
                    <span className="text-neutral-400 font-mono">Tersimpan</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMedia.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-neutral-300 text-center space-y-4">
            <ImagePlus className="w-12 h-12 text-neutral-400" />
            <div>
              <p className="text-base font-black font-display text-[#18181B]">BELUM ADA MEDIA</p>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">Upload foto atau video untuk menampilkannya di board display Anda.</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0096D6] hover:bg-[#007AB0] text-white font-display font-bold text-xs px-4 py-2 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ UNGGAH FILE BARU</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: TAMBAH MEDIA BARU
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-200">
              <h3 className="text-lg font-black font-display text-[#18181B]">
                UNGGAH FILE KE SUPABASE
              </h3>
              <button 
                onClick={() => !isUploading && setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-2">
                  JENIS MEDIA
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'foto', label: 'Foto Portrait' },
                    { id: 'video', label: 'Video 1080p' },
                    { id: 'poster', label: 'Poster Resmi' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isUploading}
                      onClick={() => setNewType(t.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold font-display border-2 transition-all ${
                        newType === t.id
                          ? 'bg-[#0096D6] text-white border-[#18181B]'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      } disabled:opacity-50`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  NAMA / JUDUL MEDIA (OPSIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Nama file akan digunakan jika kosong..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none disabled:bg-neutral-100"
                />
              </div>

              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={newType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
                />
                
                {isUploading ? (
                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-[#0096D6] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-[#0096D6] animate-spin" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-[#18181B]">Sedang Mengunggah...</p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-1">{uploadProgress}% Selesai</p>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                      <div 
                        className="bg-[#0096D6] h-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white p-8 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#0096D6] hover:bg-[#0096D6]/5 flex flex-col items-center justify-center space-y-3 transition-all group"
                  >
                    <div className="p-3 rounded-full bg-neutral-100 group-hover:bg-[#0096D6]/20 transition-colors">
                      <UploadCloud className="w-6 h-6 text-neutral-500 group-hover:text-[#0096D6]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-[#18181B]">Klik untuk pilih file</p>
                      <p className="text-[10px] font-mono text-neutral-400 mt-1">
                        {newType === 'video' ? 'MP4, WEBM, MOV (Max 50MB)' : 'JPG, PNG, WEBP (Max 5MB)'}
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-50"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRATINJAU MEDIA TUNGGAL
         ========================================================================= */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A192F] rounded-2xl border-2 border-[#00E5FF]/40 max-w-3xl w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-display font-black text-base">{previewMedia.title}</h3>
              <button onClick={() => setPreviewMedia(null)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden bg-black rounded-xl p-2">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url || undefined} controls autoPlay className="max-h-[60vh] max-w-full rounded" />
              ) : (
                <img src={previewMedia.url || undefined} alt="" className="max-h-[60vh] max-w-full object-contain rounded" />
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#00E5FF]">
              <span>Kategori: {previewMedia.category}</span>
              <span>Dimensi: {previewMedia.dimensions}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
