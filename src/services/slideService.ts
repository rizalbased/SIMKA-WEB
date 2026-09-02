import { supabase, getPublicUrl } from '../lib/supabase';
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
          console.warn('Table "slides" does not exist yet.');
          return [];
        }
        console.error('Error fetching slides:', slidesError);
        return [];
      }

      if (!slidesData || slidesData.length === 0) {
        return [];
      }

      // 2. Group dynamically by board_id
      const boardsMap: Record<string, BoardItem> = {};

      slidesData.forEach(slide => {
        const bId = slide.board_id || 'board-main';
        if (!boardsMap[bId]) {
          const boardNum = Object.keys(boardsMap).length + 1;
          boardsMap[bId] = {
            id: bId,
            name: `Board ${boardNum}`,
            description: `Board digital signage ${boardNum}`,
            isActive: Object.keys(boardsMap).length === 0,
            loopMode: 'loop_forever',
            slides: []
          };
        }

        // Construct slide object
        const mediaItems = (slide.slide_media || [])
          .sort((a: any, b: any) => a.posisi - b.posisi)
          .map((sm: any) => {
            if (!sm.media) return null;
            return {
              ...sm.media,
              posisi: sm.posisi
            };
          })
          .filter((m: any) => m !== null);
        
        const content: any = { ...slide.config };

        // Map media based on slide type and their exact slot positions
        if (slide.tipe === '3_FOTO' || slide.tipe === 'GALERI') {
          const photos = ['', '', ''];
          mediaItems.forEach((m: any, index: number) => {
            const pos = typeof m.posisi === 'number' ? m.posisi : index;
            if (pos >= 0 && pos < 3) {
              photos[pos] = getPublicUrl(m.file_path);
            }
          });
          content.photos = photos;
        } else if (slide.tipe === 'FOTO_GRID' || slide.tipe === 'GRID') {
          const grid = ['', '', '', ''];
          mediaItems.forEach((m: any, index: number) => {
            const pos = typeof m.posisi === 'number' ? m.posisi : index;
            if (pos >= 0 && pos < 4) {
              grid[pos] = getPublicUrl(m.file_path);
            }
          });
          content.gridPhotos = grid;
        } else if (slide.tipe === '1_POSTER') {
          const m = mediaItems.find((m: any) => m.posisi === 0) || mediaItems[0];
          content.posterUrl = m ? getPublicUrl(m.file_path) : '';
        } else if (slide.tipe === '3_POSTER') {
          const posters = ['', '', ''];
          mediaItems.forEach((m: any, index: number) => {
            const pos = typeof m.posisi === 'number' ? m.posisi : index;
            if (pos >= 0 && pos < 3) {
              posters[pos] = getPublicUrl(m.file_path);
            }
          });
          content.posters = posters;
        } else if (slide.tipe === 'FOTO_INFORMASI' || slide.tipe === 'SPLIT') {
          const m = mediaItems.find((m: any) => m.posisi === 0) || mediaItems[0];
          content.splitPhotoUrl = m ? getPublicUrl(m.file_path) : '';
        } else if (slide.tipe === 'VIDEO') {
          const m = mediaItems.find((m: any) => m.posisi === 0) || mediaItems[0];
          content.videoUrl = m ? getPublicUrl(m.file_path) : '';
          content.videoTitle = m ? m.title : '';
        }

        boardsMap[bId].slides.push({
          id: slide.id,
          title: slide.judul,
          type: slide.tipe as any,
          durationSec: slide.durasi,
          transition: slide.efek_transisi as any,
          transitionDurationMs: slide.durasi_transisi,
          enabled: slide.aktif,
          content: content,
          slideMedia: mediaItems
        });
      });

      return Object.values(boardsMap);
    } catch (err) {
      console.warn('Network error fetching slides:', err);
      return [];
    }
  },

  async deleteBoard(boardId: string) {
    const { data: slides, error: fetchError } = await supabase
      .from('slides')
      .select('id')
      .eq('board_id', boardId);

    if (fetchError) throw fetchError;

    if (slides && slides.length > 0) {
      const slideIds = slides.map(s => s.id);
      await supabase.from('slide_media').delete().in('slide_id', slideIds);
      const { error: deleteErr } = await supabase.from('slides').delete().eq('board_id', boardId);
      if (deleteErr) throw deleteErr;
    }
  },

  async saveSlide(boardId: string, slide: any, mediaIds: any[] = []) {
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

    // 2. Update media relations (always clear old, insert if we have media items)
    await supabase.from('slide_media').delete().eq('slide_id', slideData.id);

    if (mediaIds && mediaIds.length > 0) {
      const relations = mediaIds.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          return {
            slide_id: slideData.id,
            media_id: item.mediaId || item.id,
            posisi: typeof item.posisi === 'number' ? item.posisi : index
          };
        }
        return {
          slide_id: slideData.id,
          media_id: item,
          posisi: index
        };
      }).filter((rel: any) => !!rel.media_id);

      if (relations.length > 0) {
        const { error: relError } = await supabase.from('slide_media').insert(relations);
        if (relError) throw relError;
      }
    }

    return slideData;
  },

  async deleteSlide(slideId: string) {
    // 1. Delete slide_media relations first to avoid foreign key violations
    const { error: relError } = await supabase
      .from('slide_media')
      .delete()
      .eq('slide_id', slideId);
    
    if (relError) {
      console.error('Error deleting slide_media relations:', relError);
      throw relError;
    }

    // 2. Delete the slide itself
    const { error: slideError } = await supabase
      .from('slides')
      .delete()
      .eq('id', slideId);

    if (slideError) {
      console.error('Error deleting slide from Supabase:', slideError);
      throw slideError;
    }
  }
};
