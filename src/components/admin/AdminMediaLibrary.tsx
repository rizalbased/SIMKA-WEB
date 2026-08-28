import React, { useState } from 'react';
import { MediaItem, BoardItem } from '../../types';
import { mediaDb } from '../../lib/mediaDb';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Film, 
  FileText, 
  Search, 
  X, 
  Check, 
  UploadCloud,
  Eye
} from 'lucide-react';

interface AdminMediaLibraryProps {
  mediaLibrary: MediaItem[];
  onUpdateMediaLibrary: (items: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => void;
  boards?: BoardItem[];
}

export const AdminMediaLibrary: React.FC<AdminMediaLibraryProps> = ({
  mediaLibrary,
  onUpdateMediaLibrary,
  boards = []
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'foto' | 'video' | 'poster'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'foto' | 'video' | 'poster'>('foto');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredMedia = mediaLibrary.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddMedia = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      url: newUrl.trim(),
      category: newCategory.trim() || (newType === 'foto' ? 'Dokumentasi' : newType === 'video' ? 'Kegiatan' : 'Pengumuman'),
      dimensions: newType === 'foto' ? '1000 × 1500 (Portrait)' : newType === 'video' ? '1920 × 1080 Full HD' : '1080 × 1920 (Poster)',
      dateAdded: '28 Agu 2026'
    };

    onUpdateMediaLibrary([newItem, ...mediaLibrary]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewCategory('');
  };

  const isMediaInUse = (mediaId: string, mediaUrl: string) => {
    return boards.some(board => 
      board.slides.some(slide => {
        const content = slide.content;
        if (!content) return false;
        if (content.photos?.includes(mediaUrl)) return true;
        if (content.videoUrl === mediaUrl) return true;
        if (content.posterUrl === mediaUrl) return true;
        if (content.posters?.includes(mediaUrl)) return true;
        if (content.gridPhotos?.includes(mediaUrl)) return true;
        if (content.splitPhotoUrl === mediaUrl) return true;
        return false;
      })
    );
  };

  const handleDeleteMedia = async (id: string) => {
    if (isDeleting) return;

    const item = mediaLibrary.find(m => m.id === id);
    if (!item) return;

    if (isMediaInUse(id, item.url)) {
      alert(`Media "${item.title}" sedang digunakan pada board. Ganti atau hapus slide yang menggunakan media ini terlebih dahulu.`);
      return;
    }

    if (!window.confirm(`Hapus "${item.title}" secara permanen?`)) return;

    setIsDeleting(id);
    try {
      console.log('ADMIN DELETE MEDIA:', id);
      // Try to delete from IndexedDB
      if (id.startsWith('media-')) {
        await mediaDb.init();
        await mediaDb.deleteMedia(id);
        console.log('ADMIN STORAGE DELETE SUCCESS');
      }
      
      onUpdateMediaLibrary(prev => {
        const newList = prev.filter(m => m.id !== id);
        console.log('ADMIN STATE UPDATED, NEW COUNT:', newList.length);
        return newList;
      });

      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('Gagal menghapus media. Silakan coba lagi.');
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
            <span>PUSTAKA SUMBER DAYA DIGITAL SIGNAGE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#18181B] mt-1">
            MEDIA & GALERI KONTEN
          </h2>
          <p className="text-sm font-medium text-neutral-600 mt-0.5">
            Pusat penyimpanan foto portrait, video 1080p, dan poster resmi untuk seluruh slide.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-5 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
        >
          <Plus className="w-4 h-4 text-[#FFD166]" />
          <span>+ UNGGAH / TAMBAH MEDIA</span>
        </button>
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
                  <button
                    type="button"
                    disabled={isDeleting === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(item.id);
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
                  <button
                    type="button"
                    disabled={isDeleting === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(item.id);
                    }}
                    className="text-rose-500 hover:text-rose-700 font-bold disabled:opacity-50"
                  >
                    {isDeleting === item.id ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          MODAL: TAMBAH MEDIA BARU
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-200">
              <h3 className="text-lg font-black font-display text-[#18181B]">
                UNGGAH / TAMBAH MEDIA BARU
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
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
                      onClick={() => setNewType(t.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold font-display border-2 transition-all ${
                        newType === t.id
                          ? 'bg-[#0096D6] text-white border-[#18181B]'
                          : 'bg-white text-neutral-700 border-neutral-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  NAMA / JUDUL MEDIA
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Praktikum Fisika Kelas XII..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  URL MEDIA (GAMBAR ATAU MP4)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  KATEGORI
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelajaran, Ekstrakurikuler, Prestasi..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t-2 border-neutral-200">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-200 text-neutral-800"
              >
                BATAL
              </button>
              <button
                onClick={handleAddMedia}
                disabled={!newTitle.trim() || !newUrl.trim()}
                className="px-5 py-2 rounded-xl font-display font-black text-xs bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] disabled:opacity-40"
              >
                SIMPAN MEDIA
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
