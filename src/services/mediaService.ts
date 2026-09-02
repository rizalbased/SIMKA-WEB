import { supabase, BUCKET_NAME, getPublicUrl } from '../lib/supabase';
import { MediaItem } from '../types';

export const mediaService = {
  async getAllMedia(): Promise<MediaItem[]> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Table "media" does not exist yet.');
          return [];
        }
        console.error('Error fetching media:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as any,
        url: getPublicUrl(item.file_path),
        filePath: item.file_path, // Fixed to match MediaItem interface
        category: item.category || 'Lainnya',
        dimensions: `${item.width} × ${item.height} px`,
        size: (item.file_size / (1024 * 1024)).toFixed(1) + ' MB',
        orientation: item.orientation as any,
        dateAdded: item.created_at.split('T')[0]
      }));
    } catch (err) {
      console.warn('Network error fetching media:', err);
      return [];
    }
  },

  async isMediaInUse(mediaId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('slide_media')
      .select('*', { count: 'exact', head: true })
      .eq('media_id', mediaId);
    
    if (error) {
      console.error('Error checking media usage:', error);
      return false;
    }
    
    return (count || 0) > 0;
  },

  async uploadMedia(file: File, metadata: { width: number, height: number, orientation: string, type: string }): Promise<MediaItem | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const folder = metadata.type === 'foto' ? 'photos' : 'posters';
    const filePath = `${folder}/${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error('SUPABASE STORAGE ERROR', {
        message: uploadError.message,
        code: (uploadError as any).code
      });
      throw uploadError;
    }

    // 2. Insert into Database
    const { data, error: dbError } = await supabase
      .from('media')
      .insert({
        title: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        width: metadata.width,
        height: metadata.height,
        orientation: metadata.orientation,
        type: metadata.type,
        category: metadata.type === 'foto' ? 'Dokumentasi' : 'Pengumuman'
      })
      .select()
      .single();

    if (dbError) {
      console.error('SUPABASE DATABASE ERROR', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      
      // Rollback: delete from storage if DB insert fails
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      throw dbError;
    }

    return {
      id: data.id,
      title: data.title,
      type: data.type as any,
      url: getPublicUrl(data.file_path),
      filePath: data.file_path,
      category: data.category || 'Lainnya',
      dimensions: `${data.width} × ${data.height} px`,
      size: (data.file_size / (1024 * 1024)).toFixed(1) + ' MB',
      orientation: data.orientation as any,
      dateAdded: data.created_at.split('T')[0]
    };
  },

  async deleteMedia(id: string, filePath?: string): Promise<void> {
    try {
      // 1. Delete from Storage if file_path is provided
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        if (
          storageError &&
          !storageError.message?.toLowerCase().includes('not found')
        ) {
          console.warn('Storage remove warning (proceeding):', storageError);
        }
      }

      // 2. Clean up slide_media relations first to avoid foreign key violations
      const { error: relError } = await supabase
        .from('slide_media')
        .delete()
        .eq('media_id', id);

      if (relError) {
        console.warn('Error clearing slide_media relations for media:', relError);
      }

      // 3. Delete from Database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('SIMKA DELETE MEDIA ERROR:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('SIMKA DELETE MEDIA ERROR:', error);
      throw error;
    }
  }
};
