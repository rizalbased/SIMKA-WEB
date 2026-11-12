import { supabase, getPublicUrl } from '../lib/supabase';
import { BoardItem, MediaItem } from '../types';

export const isUUID = (str: any): boolean => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

export const slideService = {
  /**
   * Mengambil seluruh board display beserta urutan slide-nya dari Supabase.
   * Mendukung tabel `boards`, registri `display_settings`, serta pengelompokan dari `slides`.
   */
  async getBoards(): Promise<BoardItem[]> {
    try {
      const boardsMap: Record<string, BoardItem> = {};

      // 1. Ambil data dari tabel `boards` (jika tabel sudah ada di Supabase)
      try {
        const { data: dbBoardsData, error: dbBoardsError } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: true });

        if (!dbBoardsError && dbBoardsData && dbBoardsData.length > 0) {
          dbBoardsData.forEach((b: any) => {
            boardsMap[b.id] = {
              id: b.id,
              name: b.name || `Board ${b.id}`,
              description: b.description || '',
              isActive: Boolean(b.is_active),
              loopMode: b.loop_mode || 'loop_forever',
              createdAt: b.created_at ? b.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              slides: []
            };
          });
        }
      } catch (err) {
        console.warn('[slideService] Query tabel boards dilewati:', err);
      }

      // 2. Ambil data dari registri `display_settings` (id: 'boards_registry') sebagai penyimpanan redundan yang pasti ada
      try {
        const { data: regData } = await supabase
          .from('display_settings')
          .select('*')
          .eq('id', 'boards_registry')
          .single();

        if (regData?.config?.boards && Array.isArray(regData.config.boards)) {
          regData.config.boards.forEach((b: any) => {
            if (!boardsMap[b.id]) {
              boardsMap[b.id] = {
                id: b.id,
                name: b.name,
                description: b.description || '',
                isActive: Boolean(b.isActive),
                loopMode: b.loopMode || 'loop_forever',
                createdAt: b.createdAt || new Date().toISOString().split('T')[0],
                slides: []
              };
            } else {
              // Pertahankan nama dan deskripsi jika tabel kosong
              if (b.name) boardsMap[b.id].name = b.name;
              if (b.description) boardsMap[b.id].description = b.description;
            }
          });
        }
      } catch {
        // Abaikan jika belum ada
      }

      // 3. Ambil seluruh slide dari tabel `slides` beserta relasi medianya
      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*, slide_media(*, media(*))')
        .order('urutan', { ascending: true });

      if (slidesError && slidesError.code !== 'PGRST205') {
        console.error('Error fetching slides:', slidesError);
      }

      if (slidesData && slidesData.length > 0) {
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
              createdAt: slide.created_at ? slide.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              slides: []
            };
          }

          // Konstruksi relasi media
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

          if (slide.tipe === '3_FOTO' || slide.tipe === 'GALERI') {
            const photos = ['', '', ''];
            mediaItems.forEach((m: any, index: number) => {
              const pos = typeof m.posisi === 'number' ? m.posisi : index;
              if (pos >= 0 && pos < 3) photos[pos] = getPublicUrl(m.file_path);
            });
            content.photos = photos;
          } else if (slide.tipe === 'FOTO_GRID' || slide.tipe === 'GRID') {
            const grid = ['', '', '', ''];
            mediaItems.forEach((m: any, index: number) => {
              const pos = typeof m.posisi === 'number' ? m.posisi : index;
              if (pos >= 0 && pos < 4) grid[pos] = getPublicUrl(m.file_path);
            });
            content.gridPhotos = grid;
          } else if (slide.tipe === '1_POSTER') {
            const m = mediaItems.find((m: any) => m.posisi === 0) || mediaItems[0];
            content.posterUrl = m ? getPublicUrl(m.file_path) : '';
          } else if (slide.tipe === '3_POSTER') {
            const posters = ['', '', ''];
            mediaItems.forEach((m: any, index: number) => {
              const pos = typeof m.posisi === 'number' ? m.posisi : index;
              if (pos >= 0 && pos < 3) posters[pos] = getPublicUrl(m.file_path);
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
      }

      // 4. Sinkronisasi status board aktif dari display_settings (active_board)
      try {
        const { data: activeSetting } = await supabase
          .from('display_settings')
          .select('*')
          .eq('id', 'active_board')
          .single();

        const activeId = activeSetting?.config?.activeBoardId;
        if (activeId && boardsMap[activeId]) {
          Object.keys(boardsMap).forEach(id => {
            boardsMap[id].isActive = id === activeId;
          });
        }
      } catch {
        // abaikan
      }

      return Object.values(boardsMap);
    } catch (err) {
      console.warn('[slideService] Error fetching boards:', err);
      return [];
    }
  },

  /**
   * Menyimpan board baru secara permanen ke Supabase
   */
  async createBoard(board: BoardItem): Promise<BoardItem> {
    const boardPayload = {
      id: board.id,
      name: board.name.trim(),
      description: board.description?.trim() || '',
      is_active: board.isActive ?? false,
      loop_mode: board.loopMode || 'loop_forever',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Coba INSERT langsung ke tabel `boards`
    try {
      const { error } = await supabase.from('boards').upsert(boardPayload);
      if (error) {
        console.warn('[slideService] Gagal upsert tabel boards (mungkin tabel belum dibuat):', error.message);
      } else {
        console.log('[slideService] Board berhasil disimpan di tabel "boards":', board.id);
      }
    } catch (err) {
      console.warn('[slideService] Exception upsert tabel boards:', err);
    }

    // 2. Simpan juga ke `display_settings` ('boards_registry') sebagai persistensi bergaransi
    try {
      const { data: regData } = await supabase
        .from('display_settings')
        .select('*')
        .eq('id', 'boards_registry')
        .single();

      const existingBoards: any[] = Array.isArray(regData?.config?.boards) 
        ? regData.config.boards 
        : [];

      const updatedBoards = existingBoards.filter((b: any) => b.id !== board.id);
      updatedBoards.push({
        id: board.id,
        name: board.name,
        description: board.description || '',
        isActive: board.isActive,
        loopMode: board.loopMode || 'loop_forever',
        createdAt: board.createdAt || new Date().toISOString().split('T')[0]
      });

      await supabase.from('display_settings').upsert({
        id: 'boards_registry',
        config: { boards: updatedBoards }
      });
      console.log('[slideService] Board berhasil dicadangkan ke display_settings (boards_registry)');
    } catch (regErr) {
      console.warn('[slideService] Gagal update display_settings boards_registry:', regErr);
    }

    // 3. Jika board diatur aktif, perbarui setting active_board
    if (board.isActive) {
      try {
        await supabase.from('display_settings').upsert({
          id: 'active_board',
          config: { activeBoardId: board.id }
        });
      } catch (err) {
        console.warn('[slideService] Gagal update active_board:', err);
      }
    }

    return board;
  },

  /**
   * Memperbarui informasi board di Supabase
   */
  async updateBoard(board: BoardItem): Promise<void> {
    // 1. Update di tabel `boards`
    try {
      await supabase.from('boards').update({
        name: board.name,
        description: board.description,
        is_active: board.isActive,
        loop_mode: board.loopMode,
        updated_at: new Date().toISOString()
      }).eq('id', board.id);
    } catch {}

    // 2. Update di `display_settings`
    try {
      const { data: regData } = await supabase
        .from('display_settings')
        .select('*')
        .eq('id', 'boards_registry')
        .single();

      const existingBoards: any[] = Array.isArray(regData?.config?.boards) ? regData.config.boards : [];
      const updatedBoards = existingBoards.map((b: any) => b.id === board.id ? {
        ...b,
        name: board.name,
        description: board.description,
        isActive: board.isActive,
        loopMode: board.loopMode
      } : b);

      await supabase.from('display_settings').upsert({
        id: 'boards_registry',
        config: { boards: updatedBoards }
      });
    } catch {}
  },

  /**
   * Menghapus board beserta seluruh slide dan relasi medianya dari Supabase
   */
  async deleteBoard(boardId: string) {
    try {
      // 1. Hapus seluruh relasi slide_media dan slide di tabel `slides`
      try {
        const { data: slides } = await supabase
          .from('slides')
          .select('id')
          .eq('board_id', boardId);

        if (slides && slides.length > 0) {
          const slideIds = slides.map(s => s.id).filter(isUUID);
          if (slideIds.length > 0) {
            await supabase.from('slide_media').delete().in('slide_id', slideIds);
          }
          await supabase.from('slides').delete().eq('board_id', boardId);
        }
      } catch (slideErr) {
        console.warn('[slideService] Gagal menghapus slides untuk board:', slideErr);
      }

      // 2. Hapus baris dari tabel `boards`
      try {
        await supabase.from('boards').delete().eq('id', boardId);
      } catch (bErr) {
        console.warn('[slideService] Gagal menghapus baris tabel boards:', bErr);
      }

      // 3. Hapus dari registri `display_settings`
      try {
        const { data: regData } = await supabase
          .from('display_settings')
          .select('*')
          .eq('id', 'boards_registry')
          .single();

        if (regData?.config?.boards && Array.isArray(regData.config.boards)) {
          const filtered = regData.config.boards.filter((b: any) => b.id !== boardId);
          await supabase.from('display_settings').upsert({
            id: 'boards_registry',
            config: { boards: filtered }
          });
        }
      } catch (regErr) {
        console.warn('[slideService] Gagal menghapus board dari registri display_settings:', regErr);
      }

      return { success: true };
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
