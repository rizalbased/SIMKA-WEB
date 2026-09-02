const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminBoardDisplay.tsx', 'utf8');

const regex = /const handleSaveEditedSlide = async \(updatedSlide: SlideItem\) => \{[\s\S]*?alert\('Gagal menyimpan ke database\.'\);\n    \}\n  \};/;
const replacement = `const handleSaveEditedSlide = async (updatedSlide: SlideItem) => {
    if (!isAdmin) return;
    
    // We already maintain updatedSlide.slideMedia directly for existing slides.
    // If it's a temp- slide, we need to pass mediaIds so slideService creates them.
    // For existing slides, we can also pass them, and slideService will delete and re-insert them.
    const mediaIds: string[] = (updatedSlide.slideMedia || []).map((m: any) => m.id);

    try {
      if (isSupabaseConfigured()) {
        const savedData = await slideService.saveSlide(currentBoard.id, updatedSlide, mediaIds);
        // Ensure id is synced
        updatedSlide.id = savedData.id;
      }
      
      const newSlides = currentBoard.slides.map(s => s.id === updatedSlide.id || (s.id.includes('temp-') && s.id === updatedSlide.id) ? updatedSlide : s);
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
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/admin/AdminBoardDisplay.tsx', content);
