import { supabase, getPublicUrl } from '../lib/supabase';
import { BoardItem, MediaItem } from '../types';

export const isUUID = (str: any): boolean => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

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
    try {
      // 1. Primary: Call Supabase RPC delete_board
      let { data, error } = await supabase.rpc('delete_board', {
        p_board_id: boardId
      });

      if (error && (error.message?.includes('p_board_id') || error.code === '42883')) {
        // Retry with board_id parameter if function signature differs
        const res2 = await supabase.rpc('delete_board', {
          board_id: boardId
        } as any);
        data = res2.data;
        error = res2.error;
      }

      if (error) {
        console.warn('RPC delete_board returned error, falling back to direct delete:', error);
        // Fallback: Delete slide_media relations and slides only (never media records or storage files)
        const { data: slides, error: fetchError } = await supabase
          .from('slides')
          .select('id')
          .eq('board_id', boardId);

        if (fetchError) throw fetchError;

        if (slides && slides.length > 0) {
          const slideIds = slides.map(s => s.id).filter(isUUID);
          if (slideIds.length > 0) {
            await supabase.from('slide_media').delete().in('slide_id', slideIds);
          }
          const { error: deleteErr } = await supabase.from('slides').delete().eq('board_id', boardId);
          if (deleteErr) throw deleteErr;
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error in deleteBoard:', err);
      throw err;
    }
  },

  async saveSlide(boardId: string, slide: any, mediaIds: any[] = []) {
    // 1. Upsert slide payload
    const slidePayload: any = {
      board_id: boardId,
      urutan: typeof slide.urutan === 'number' ? slide.urutan : 0,
      judul: slide.title || 'Slide Tanpa Judul',
      tipe: slide.type || '3_FOTO',
      durasi: slide.durationSec || 10,
      efek_transisi: slide.transition || 'fade',
      durasi_transisi: slide.transitionDurationMs || 800,
      aktif: slide.enabled !== undefined ? slide.enabled : true,
      config: slide.content || {}
    };

    // Only supply ID if it is a valid UUID to prevent PostgreSQL error 22P02
    if (slide.id && isUUID(slide.id)) {
      slidePayload.id = slide.id;
    }

    const { data: slideData, error: slideError } = await supabase
      .from('slides')
      .upsert(slidePayload)
      .select()
      .single();

    if (slideError) throw slideError;

    // 2. Update media relations (always clear old, insert if we have media items)
    if (slideData?.id && isUUID(slideData.id)) {
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
        }).filter((rel: any) => !!rel.media_id && isUUID(rel.media_id));

        if (relations.length > 0) {
          const { error: relError } = await supabase.from('slide_media').insert(relations);
          if (relError) {
            console.warn('Error inserting slide_media relations:', relError);
          }
        }
      }
    }

    return slideData;
  },

  async deleteSlide(slideId: string) {
    if (!slideId) return;

    if (isUUID(slideId)) {
      // 1. Delete slide_media relations first to avoid foreign key violations
      const { error: relError } = await supabase
        .from('slide_media')
        .delete()
        .eq('slide_id', slideId);
      
      if (relError) {
        console.warn('Error deleting slide_media relations:', relError);
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
    } else {
      // In case slides.id is text in database
      try {
        await supabase.from('slide_media').delete().eq('slide_id', slideId);
        await supabase.from('slides').delete().eq('id', slideId);
      } catch (e) {
        console.warn('Delete non-UUID slide fallback:', e);
      }
    }
  }
};
