import { supabase, BUCKET_MEDIA } from '../lib/supabase';
import { MediaItem } from '../types';

export const mediaService = {
  async getAllMedia(): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Table "media" does not exist yet. Please run schema.sql in Supabase.');
        return [];
      }
      console.error('Error fetching media:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type as any,
      url: supabase.storage.from(BUCKET_MEDIA).getPublicUrl(item.file_path).data.publicUrl,
      category: item.category || 'Lainnya',
      dimensions: `${item.width} × ${item.height} px`,
      size: (item.file_size / (1024 * 1024)).toFixed(1) + ' MB',
      orientation: item.orientation as any,
      dateAdded: item.created_at.split('T')[0]
    }));
  },

  async uploadMedia(file: File, metadata: { width: number, height: number, orientation: string, type: string }): Promise<MediaItem | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_MEDIA)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
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
      console.error('Error saving metadata:', dbError);
      // Rollback storage if possible or handle cleanup
      throw dbError;
    }

    return {
      id: data.id,
      title: data.title,
      type: data.type as any,
      url: supabase.storage.from(BUCKET_MEDIA).getPublicUrl(data.file_path).data.publicUrl,
      category: data.category || 'Lainnya',
      dimensions: `${data.width} × ${data.height} px`,
      size: (data.file_size / (1024 * 1024)).toFixed(1) + ' MB',
      orientation: data.orientation as any,
      dateAdded: data.created_at.split('T')[0]
    };
  },

  async deleteMedia(id: string, filePath: string): Promise<void> {
    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_MEDIA)
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      throw storageError;
    }

    // 2. Delete from Database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      throw dbError;
    }
  }
};
