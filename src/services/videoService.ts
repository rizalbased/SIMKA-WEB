import { supabase, BUCKET_NAME, getPublicUrl } from '../lib/supabase';

export const videoService = {
  async getAllVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Table "videos" does not exist yet.');
          return [];
        }
        console.error('Error fetching videos:', error);
        return [];
      }

      return data.map(v => ({
        ...v,
        url: getPublicUrl(v.file_path)
      }));
    } catch (err) {
      console.warn('Network error fetching videos:', err);
      return [];
    }
  },

  async uploadVideo(file: File, metadata: { width: number, height: number, duration: number }) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

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
      .from('videos')
      .insert({
        title: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration
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
      ...data,
      url: getPublicUrl(data.file_path)
    };
  },

  async deleteVideo(id: string, filePath?: string): Promise<void> {
    try {
      // 1. Delete from Storage if filePath is provided
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
        console.warn('Error clearing slide_media relations for video:', relError);
      }

      // 3. Delete from Database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('SIMKA DELETE VIDEO ERROR:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('SIMKA DELETE VIDEO ERROR:', error);
      throw error;
    }
  }
};
