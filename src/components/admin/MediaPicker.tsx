import React, { useState, useRef } from 'react';
import { MediaItem, BoardItem } from '../../types';
import { UploadCloud, Image as ImageIcon, Film, X, Trash2, AlertCircle } from 'lucide-react';
import { mediaDb } from '../../lib/mediaDb';

interface MediaPickerProps {
  label: string;
  type: 'foto' | 'video' | 'poster';
  value: string;
  onChange: (url: string) => void;
  mediaLibrary: MediaItem[];
  onUpdateMediaLibrary: (library: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => void;
  expectedRatio?: string;
  boards?: BoardItem[];
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  label, type, value, onChange, mediaLibrary, onUpdateMediaLibrary, expectedRatio, boards = []
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp';
  const formatText = type === 'video' ? 'MP4, WEBM, MOV • Maks. 100 MB' : 'JPG, PNG, WEBP • Maks. 10 MB';
  const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleUpload = (file: File) => {
    setErrorMsg('');
    
    // Validasi ukuran
    if (file.size > maxSize) {
      setErrorMsg('Ukuran file terlalu besar.');
      return;
    }

    // Validasi format
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (type === 'video' && !isVideo) {
      setErrorMsg('Format video tidak didukung. Gunakan MP4, WEBM, atau MOV.');
      return;
    }
    if ((type === 'foto' || type === 'poster') && !isImage) {
      setErrorMsg('Format foto tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    // Simulasi Progress Upload
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishUpload(file);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const finishUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const saveToDb = async (width: number, height: number, orientation: 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE') => {
      const mediaId = `media-${Date.now()}`;
      
      try {
        await mediaDb.saveMedia({
          id: mediaId,
          title: file.name,
          type: type === 'poster' ? 'poster' : (type === 'video' ? 'video' : 'foto'),
          blob: file,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          width,
          height,
          orientation,
          createdAt: new Date().toISOString()
        });

        const newItem: MediaItem = {
          id: mediaId,
          title: file.name,
          type: type === 'poster' ? 'poster' : (type === 'video' ? 'video' : 'foto'),
          url: url,
          thumbnailUrl: url,
          dimensions: `${width} × ${height} px`,
          size: sizeInMB,
          orientation: orientation,
          dateAdded: new Date().toISOString().split('T')[0]
        };

        onUpdateMediaLibrary([newItem, ...mediaLibrary]);
        onChange(url);
      } catch (err) {
        console.error('Failed to save to IndexedDB:', err);
        setErrorMsg('Gagal menyimpan ke penyimpanan lokal.');
      } finally {
        setIsUploading(false);
      }
    };

    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        let orientation: 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE' = 'SQUARE';
        if (width > height) orientation = 'LANDSCAPE';
        if (height > width) orientation = 'PORTRAIT';

        saveToDb(width, height, orientation);
      };
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        let orientation: 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE' = 'SQUARE';
        if (width > height) orientation = 'LANDSCAPE';
        if (height > width) orientation = 'PORTRAIT';

        saveToDb(width, height, orientation);
      };
      video.src = url;
    }
  };

  const isMediaInUse = (mediaId: string, mediaUrl: string) => {
    // Check in all slides across all boards
    return boards.some(board => 
      board.slides.some(slide => {
        const content = slide.content;
        if (!content) return false;

        // Check various photo/video slots
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

  const handleDeleteFromLibrary = async (e: React.MouseEvent, media: MediaItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;

    if (isMediaInUse(media.id, media.url)) {
      alert(`Foto "${media.title}" sedang digunakan pada slide. Hapus slide atau ganti medianya terlebih dahulu.`);
      return;
    }

    if (!window.confirm(`Hapus "${media.title}" dari galeri secara permanen?`)) return;

    setIsDeleting(media.id);
    try {
      console.log('DELETING MEDIA:', media.id);
      
      // Remove from IndexedDB if it's a persistent item
      if (media.id.startsWith('media-')) {
        await mediaDb.init(); // Ensure initialized
        await mediaDb.deleteMedia(media.id);
        console.log('STORAGE DELETE SUCCESS');
      }

      // Update State using functional update to ensure fresh state
      onUpdateMediaLibrary(prev => {
        const newList = prev.filter(m => m.id !== media.id);
        console.log('STATE UPDATED, NEW COUNT:', newList.length);
        return newList;
      });

      // Cleanup blob URL
      if (media.url.startsWith('blob:')) {
        URL.revokeObjectURL(media.url);
      }

      // Clear selection if this was the selected item
      if (value === media.url) {
        onChange('');
      }
    } catch (err) {
      console.error('Failed to delete media:', err);
      alert('Gagal menghapus media. Silakan coba lagi.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Mencari data file yang dipilih dari library (jika ada) untuk menampilkan info
  const selectedMedia = mediaLibrary.find(m => m.url === value);
  const displayTitle = selectedMedia ? selectedMedia.title : (value.split('/').pop() || 'Media');

  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono font-bold uppercase text-neutral-700">
        {label}
      </label>

      {/* TAMPILAN PREVIEW JIKA SUDAH ADA VALUE */}
      {value ? (
        <div className="border-2 border-[#18181B] rounded-xl overflow-hidden bg-[#F8F6F0]">
          <div className="w-full flex items-center justify-center bg-neutral-200/50 p-4 border-b-2 border-[#18181B]">
            <div 
              className="relative bg-neutral-900 flex items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-black/20" 
              style={{ 
                aspectRatio: expectedRatio || 'auto', 
                height: expectedRatio ? '240px' : 'auto',
                width: expectedRatio ? 'auto' : '100%',
                minHeight: expectedRatio ? 'auto' : '120px', 
                maxHeight: '320px',
                maxWidth: '100%' 
              }}
            >
              {type === 'video' ? (
                <video src={value || undefined} controls className="w-full h-full object-contain" />
              ) : (
                <img src={value || undefined} alt="Preview" className="w-full h-full object-contain" />
              )}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono font-bold px-2 py-1 rounded border border-white/20 backdrop-blur-md">
                PREVIEW {type.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="p-3 bg-white">
            <p className="text-xs font-bold text-[#18181B] truncate" title={displayTitle}>{displayTitle}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] font-mono text-neutral-600">
              {selectedMedia?.size && <span>Ukuran: {selectedMedia.size}</span>}
              {selectedMedia?.dimensions && <span>Resolusi: {selectedMedia.dimensions}</span>}
              {selectedMedia?.orientation && <span>Orientasi: {selectedMedia.orientation}</span>}
            </div>
            
            {expectedRatio === '2/3' && selectedMedia?.orientation === 'LANDSCAPE' && (
              <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-1.5 rounded font-bold border border-amber-200">
                ⚠ FOTO LANDSCAPE. Slot ini direkomendasikan 640 × 960 px (Rasio 2:3).
              </div>
            )}
            
            <div className="flex gap-2 mt-3">
              <button 
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="flex-1 px-3 py-1.5 bg-[#F8F6F0] hover:bg-[#E5E0D8] text-[#18181B] border border-[#18181B] rounded-lg text-[11px] font-bold shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] active:shadow-[1px_1px_0px_#18181B] transition-all"
              >
                GANTI {type.toUpperCase()}
              </button>
              <button 
                type="button"
                onClick={() => onChange('')}
                className="flex-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold transition-colors"
              >
                HAPUS
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAMPILAN EMPTY / UPLOAD */
        <div 
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative overflow-hidden ${
            isDragging ? 'border-[#0096D6] bg-[#0096D6]/5' : 'border-[#18181B]/30 bg-white hover:bg-neutral-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="text-xs font-bold text-[#18181B] animate-pulse">MENGUNGGAH...</div>
              <div className="w-full max-w-[200px] h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0096D6] transition-all duration-200 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-neutral-500">{uploadProgress}%</div>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                ref={fileInputRef}
                accept={acceptedFormats} 
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                title="Seret & Lepas File"
              />
              <div className="flex flex-col items-center pointer-events-none">
                {type === 'video' ? <Film className="w-8 h-8 text-neutral-400 mb-2" /> : <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />}
                <p className="text-sm font-bold text-[#18181B]">
                  SERET {type.toUpperCase()} KE SINI
                </p>
                <p className="text-[10px] font-mono text-neutral-400 my-1">atau</p>
                
                <div className="flex gap-2 mt-1 relative z-20 pointer-events-auto">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                    className="px-3 py-1.5 bg-[#F8F6F0] hover:bg-[#E5E0D8] text-[#18181B] border border-[#18181B] rounded-lg text-[11px] font-bold shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] active:shadow-[1px_1px_0px_#18181B]"
                  >
                    + PILIH {type.toUpperCase()}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                    className="px-3 py-1.5 bg-[#0096D6] hover:bg-[#0080B8] text-white border border-[#18181B] rounded-lg text-[11px] font-bold shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] active:shadow-[1px_1px_0px_#18181B]"
                  >
                    BUKA GALERI
                  </button>
                </div>

                <p className="text-[10px] text-neutral-400 font-mono mt-3">
                  {formatText}
                </p>

                {errorMsg && (
                  <div className="mt-2 text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded font-bold border border-red-200 pointer-events-auto">
                    {errorMsg}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* PANDUAN UKURAN PIXEL MEDIA */}
      <div className="mt-2 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
        <p className="text-[10px] font-bold text-neutral-700 mb-1">UKURAN CANVAS DISPLAY</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-mono text-neutral-600 mb-2">
          <div>
            <p><strong>Foto Portrait:</strong> 640 × 960 px • Rasio 2:3</p>
            <p><strong>Foto Landscape:</strong> 1920 × 1080 px • Rasio 16:9</p>
            <p><strong>Foto Square:</strong> 1080 × 1080 px • Rasio 1:1</p>
          </div>
          <div>
            <p><strong>Video Landscape:</strong> 1920 × 1080 px • Rasio 16:9</p>
            <p><strong>Video Portrait:</strong> 1080 × 1920 px • Rasio 9:16</p>
            <p><strong>Format:</strong> JPG, PNG, WEBP, MP4, WEBM, MOV</p>
          </div>
        </div>
        <p className="text-[9px] font-mono text-neutral-500 italic">
          * Ukuran di atas adalah ukuran kanvas display yang direkomendasikan. File foto dapat memiliki resolusi lebih besar selama rasio tetap sesuai.
        </p>
      </div>

      {/* GALERI MEDIA MODAL (Inner) */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] w-full max-w-4xl max-h-[85vh] rounded-3xl border-2 border-[#18181B] shadow-[8px_8px_0px_#18181B] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Header Modal */}
            <div className="bg-white border-b-2 border-[#18181B] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-display font-black text-xl text-[#18181B] uppercase tracking-wide">
                  GALERI MEDIA
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Pilih {type.toUpperCase()} dari media yang pernah diunggah.</p>
              </div>
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Gallery */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8F6F0]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                
                {/* Upload Card */}
                <div 
                  className="aspect-square bg-white rounded-2xl border-2 border-dashed border-[#18181B]/30 hover:border-[#0096D6] hover:bg-[#0096D6]/5 flex flex-col items-center justify-center cursor-pointer transition-all"
                  onClick={() => {
                    setIsGalleryOpen(false);
                    fileInputRef.current?.click();
                  }}
                >
                  <UploadCloud className="w-8 h-8 text-[#0096D6] mb-2" />
                  <span className="text-[11px] font-bold text-[#18181B]">+ UNGGAH BARU</span>
                </div>

                {/* Media Items */}
                {mediaLibrary.filter(m => (type === 'foto' || type === 'poster') ? (m.type === 'foto' || m.type === 'poster') : m.type === 'video').map(media => (
                  <div 
                    key={media.id}
                    onClick={() => {
                      onChange(media.url);
                      setIsGalleryOpen(false);
                    }}
                    className="group aspect-square rounded-2xl border-2 border-[#18181B] bg-neutral-900 overflow-hidden relative cursor-pointer hover:shadow-[4px_4px_0px_#0096D6] transition-all hover:translate-y-[-2px] flex items-center justify-center p-2"
                  >
                    {media.type === 'video' ? (
                      <video src={media.url || undefined} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <img src={media.thumbnailUrl || media.url || undefined} alt={media.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    )}
                    
                    {/* Delete Button Overlay */}
                    <button
                      type="button"
                      disabled={isDeleting === media.id}
                      onClick={(e) => handleDeleteFromLibrary(e, media)}
                      className={`absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg transition-opacity z-20 border border-black/20 shadow-lg hover:bg-rose-600 ${
                        isDeleting === media.id ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Hapus Permanen dari Galeri"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${isDeleting === media.id ? 'animate-spin' : ''}`} />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="w-full">
                        <p className="text-white text-[10px] font-bold truncate w-full">{media.title}</p>
                        <p className="text-[8px] text-neutral-400 font-mono">{media.dimensions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
