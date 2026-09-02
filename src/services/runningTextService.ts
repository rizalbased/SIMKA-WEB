import { supabase } from '../lib/supabase';

export const runningTextService = {
  async getRunningText() {
    try {
      const { data, error } = await supabase
        .from('running_text')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Table "running_text" does not exist yet. Please run schema.sql in Supabase.');
          return [];
        }
        console.error('Error fetching running text:', error);
        return [];
      }

      return data;
    } catch (err) {
      console.warn('Network error fetching running text:', err);
      return [];
    }
  },

  async updateRunningText(items: { id?: string, content: string, is_active: boolean }[]) {
    // For simplicity, we can delete all and insert new ones or upsert
    // In a production app, we'd use upsert with proper IDs
    const { error: deleteError } = await supabase.from('running_text').delete().neq('content', '');
    if (deleteError) throw deleteError;

    const { data, error: insertError } = await supabase
      .from('running_text')
      .insert(items.map((it, idx) => ({
        content: it.content,
        is_active: it.is_active,
        order_index: idx
      })));

    if (insertError) throw insertError;
    return data;
  }
};
