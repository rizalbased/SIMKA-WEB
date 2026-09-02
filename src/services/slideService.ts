import { supabase } from '../lib/supabase';
import { BoardItem, MediaItem } from '../types';

export const slideService = {
  async getBoards(): Promise<BoardItem[]> {
    try {
      // 1. Fetch all slides
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*, slide_media(*, media(*))')
        .order('urutan', { ascending: true });

      if (slidesError) {
        if (slidesError.code === 'PGRST205') {
          console.warn('Table "slides" does not exist yet. Please run schema.sql in Supabase.');
          return [
            { id: 'slide-1', name: 'Slide 1 (Default)', isActive: true, loopMode: 'loop_forever', slides: [] },
            { id: 'slide-2', name: 'Slide 2 (Default)', isActive: false, loopMode: 'loop_forever', slides: [] },
            { id: 'slide-3', name: 'Slide 3 (Default)', isActive: false, loopMode: 'loop_forever', slides: [] },
          ];
        }
        console.error('Error fetching slides:', slidesError);
        return [];
      }

      // 2. Group by board_id
      const boards: Record<string, BoardItem> = {
        'slide-1': { id: 'slide-1', name: 'Slide 1', isActive: true, loopMode: 'loop_forever', slides: [] },
        'slide-2': { id: 'slide-2', name: 'Slide 2', isActive: false, loopMode: 'loop_forever', slides: [] },
        'slide-3': { id: 'slide-3', name: 'Slide 3', isActive: false, loopMode: 'loop_forever', slides: [] },
      };

      slidesData.forEach(slide => {
        const bId = slide.board_id;
        if (boards[bId]) {
          // Construct slide object
          const mediaItems = slide.slide_media
            .sort((a: any, b: any) => a.posisi - b.posisi)
            .map((sm: any) => sm.media);
          
          const content: any = { ...slide.config };

          // Map media based on slide type
          if (slide.tipe === 'GALERI' || slide.tipe === 'PENGUMUMAN') {
            content.photos = mediaItems.map((m: any) => 
              supabase.storage.from('media').getPublicUrl(m.file_path).data.publicUrl
            );
          } else if (slide.tipe === 'SPLIT') {
            const firstMedia = mediaItems[0];
            if (firstMedia) {
              content.splitPhotoUrl = supabase.storage.from('media').getPublicUrl(firstMedia.file_path).data.publicUrl;
            }
          }

          boards[bId].slides.push({
            id: slide.id,
            title: slide.judul,
            type: slide.tipe as any,
            durationSec: slide.durasi,
            transition: slide.efek_transisi as any,
            transitionDurationMs: slide.durasi_transisi,
            enabled: slide.aktif,
            content: content
          });
        }
      });

      return Object.values(boards);
    } catch (err) {
      console.warn('Network error fetching slides:', err);
      return [
        { id: 'slide-1', name: 'Slide 1 (Default)', isActive: true, loopMode: 'loop_forever', slides: [] },
        { id: 'slide-2', name: 'Slide 2 (Default)', isActive: false, loopMode: 'loop_forever', slides: [] },
        { id: 'slide-3', name: 'Slide 3 (Default)', isActive: false, loopMode: 'loop_forever', slides: [] },
      ];
    }
  },

  async saveSlide(boardId: string, slide: any, mediaIds: string[] = []) {
    // 1. Upsert slide
    const { data: slideData, error: slideError } = await supabase
      .from('slides')
      .upsert({
        id: slide.id.includes('temp-') ? undefined : slide.id, // Handle new slides
        board_id: boardId,
        urutan: 0, // Should be managed or calculated
        judul: slide.title,
        tipe: slide.type,
        durasi: slide.durationSec,
        efek_transisi: slide.transition,
        durasi_transisi: slide.transitionDurationMs,
        aktif: slide.enabled,
        config: slide.content
      })
      .select()
      .single();

    if (slideError) throw slideError;

    // 2. Update media relations
    if (mediaIds.length > 0) {
      // Clear old relations
      await supabase.from('slide_media').delete().eq('slide_id', slideData.id);

      // Insert new relations
      const relations = mediaIds.map((mId, index) => ({
        slide_id: slideData.id,
        media_id: mId,
        posisi: index
      }));

      const { error: relError } = await supabase.from('slide_media').insert(relations);
      if (relError) throw relError;
    }

    return slideData;
  }
};
