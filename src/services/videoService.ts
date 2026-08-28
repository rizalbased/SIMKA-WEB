import { supabase, BUCKET_VIDEOS } from '../lib/supabase';

export const videoService = {
  async getAllVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Table "videos" does not exist yet. Please run schema.sql in Supabase.');
        return [];
      }
      console.error('Error fetching videos:', error);
      return [];
    }

    return data.map(v => ({
      ...v,
      url: supabase.storage.from(BUCKET_VIDEOS).getPublicUrl(v.file_path).data.publicUrl
    }));
  },

  async uploadVideo(file: File, metadata: { width: number, height: number, duration: number }) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `raw/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_VIDEOS)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

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

    if (dbError) throw dbError;

    return {
      ...data,
      url: supabase.storage.from(BUCKET_VIDEOS).getPublicUrl(data.file_path).data.publicUrl
    };
  }
};
