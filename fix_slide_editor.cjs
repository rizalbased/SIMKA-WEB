const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminBoardDisplay.tsx', 'utf8');

// 1. Replace handleAddSlide
const addSlideRegex = /const handleAddSlide = \(type: SlideType\) => \{[\s\S]*?handleBoardUpdate\(updatedBoard\);\n    setIsAddSlideModalOpen\(false\);\n  \};/m;

const newHandleAddSlide = `const handleAddSlide = async (type: SlideType) => {
    if (!isAdmin) return;
    const slideNumber = currentBoard.slides.length + 1;
    let title = \`SLIDE \${slideNumber} — \${type}\`;
    
    const newSlide: SlideItem = {
      id: \`temp-\${Date.now()}\`,
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
        setEditingSlide(actualSlide);
      } else {
        const updatedBoard = {
          ...currentBoard,
          slides: [...currentBoard.slides, newSlide]
        };
        handleBoardUpdate(updatedBoard);
        setIsAddSlideModalOpen(false);
        setEditingSlide(newSlide);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat slide.');
    }
  };`;

content = content.replace(addSlideRegex, newHandleAddSlide);

// 2. Replace Editor Slide Modal Content (Specifically the type switch)
// The switch for slide.type is between line: {/* Specific Content Inputs based on Slide Type */} and {/* Durasi Tampil */}
const editorRegex = /\{\/\* Specific Content Inputs based on Slide Type \*\/\}[\s\S]*?\{\/\* Durasi Tampil \*\/}/m;

const newEditorContent = `{/* Specific Content Inputs based on Slide Type */}
              <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#18181B]">
                <h4 className="font-display font-black text-sm text-[#18181B] mb-2 flex items-center justify-between">
                  <span>MEDIA SLIDE</span>
                </h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setIsMediaSelectorOpen(true)}
                    className="px-4 py-2 bg-[#F8F6F0] hover:bg-[#E5E0D8] text-[#18181B] border-2 border-[#18181B] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] active:shadow-[1px_1px_0px_#18181B] flex items-center gap-1.5"
                  >
                    + TAMBAH MEDIA
                  </button>
                  <label className="px-4 py-2 bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] border-2 border-[#18181B] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] active:shadow-[1px_1px_0px_#18181B] flex items-center gap-1.5 cursor-pointer">
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={handleDirectUploadMedia} />
                    + UPLOAD FOTO/VIDEO
                  </label>
                  {isUploadingMedia && <span className="text-xs font-mono font-bold text-[#0096D6] animate-pulse ml-2">Mengunggah...</span>}
                </div>

                {/* Thumbnails of used media */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(editingSlide.slideMedia || []).map((m: any, idx: number) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#18181B] bg-neutral-900">
                      {m.file_type?.startsWith('video/') || m.type === 'video' ? (
                        <video src={getPublicUrl(m.file_path || m.url)} className="w-full h-full object-cover" />
                      ) : (
                        <img src={getPublicUrl(m.file_path || m.url)} className="w-full h-full object-cover" />
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all p-2 gap-2">
                        <button
                          onClick={() => handleRemoveMediaFromSlide(m.id)}
                          className="px-2 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg border border-rose-700 w-full"
                        >
                          HAPUS DARI SLIDE
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editingSlide.slideMedia || editingSlide.slideMedia.length === 0) && (
                    <div className="col-span-full py-6 flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-neutral-400 font-mono text-xs">
                      Belum ada media di slide ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Durasi Tampil */}`;

content = content.replace(editorRegex, newEditorContent);

fs.writeFileSync('src/components/admin/AdminBoardDisplay.tsx', content);
