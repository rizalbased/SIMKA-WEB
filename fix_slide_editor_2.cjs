const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminBoardDisplay.tsx', 'utf8');

// Inject the states and handlers
const stateHookPos = content.indexOf('const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);');
if (stateHookPos !== -1) {
    const newStates = `const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
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
      
      const fileName = \`\${crypto.randomUUID()}-\${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}\`;
      const storagePath = \`photos/\${fileName}\`;
      
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
      const { error: smError } = await supabase.from('slide_media').insert({
        slide_id: editingSlide.id,
        media_id: mediaData.id,
        posisi: nextPos
      });
      if (smError) throw smError;
      
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
      if (isSupabaseConfigured() && !editingSlide.id.includes('temp-')) {
        const { error } = await supabase.from('slide_media')
          .delete()
          .eq('slide_id', editingSlide.id)
          .eq('media_id', mediaId);
          
        if (error) throw error;
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
    if (!editingSlide || !isAdmin) return;
    
    // Check if already added
    if ((editingSlide.slideMedia || []).some((m: any) => m.id === mediaData.id)) {
      alert('Media sudah ada di slide ini.');
      return;
    }
    
    try {
      const nextPos = (editingSlide.slideMedia || []).length;
      if (isSupabaseConfigured() && !editingSlide.id.includes('temp-')) {
        const { error } = await supabase.from('slide_media').insert({
          slide_id: editingSlide.id,
          media_id: mediaData.id,
          posisi: nextPos
        });
        if (error) throw error;
      }
      
      setEditingSlide({
        ...editingSlide,
        slideMedia: [...(editingSlide.slideMedia || []), mediaData]
      });
      setIsMediaSelectorOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan media ke slide.');
    }
  };
`;
    content = content.replace('const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);', newStates);
}

// 3. Inject the MediaSelectorModal UI at the end of the return statement before the last </div>
const modalPos = content.lastIndexOf('</div>\n  );\n};');
if (modalPos !== -1) {
    const modalUI = `
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
`;
    content = content.substring(0, modalPos) + modalUI + content.substring(modalPos);
}

fs.writeFileSync('src/components/admin/AdminBoardDisplay.tsx', content);
