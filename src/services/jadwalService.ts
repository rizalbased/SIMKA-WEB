import { supabase } from '../lib/supabase';
import { LessonPeriod } from '../types';

export const jadwalService = {
  async getJadwal(): Promise<LessonPeriod[]> {
    const { data, error } = await supabase
      .from('jadwal_les')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Table "jadwal_les" does not exist yet. Please run schema.sql in Supabase.');
        return [];
      }
      console.error('Error fetching jadwal:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      periodNumber: item.period_number,
      startTime: item.start_time,
      endTime: item.end_time,
      subject: item.subject,
      teacher: item.teacher,
      room: item.room,
      isBreak: item.is_break
    }));
  },

  async saveJadwal(items: LessonPeriod[]) {
    // Replace all with new items for simplicity in this version
    await supabase.from('jadwal_les').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase.from('jadwal_les').insert(
      items.map((it, idx) => ({
        id: it.id,
        name: it.name || `LES ${it.periodNumber || idx + 1}`,
        period_number: it.periodNumber,
        start_time: it.startTime,
        end_time: it.endTime,
        subject: it.subject,
        teacher: it.teacher,
        room: it.room,
        is_break: it.isBreak,
        order_index: idx
      }))
    );

    if (error) throw error;
  },

  async updateJadwal(period: LessonPeriod) {
    const { error } = await supabase
      .from('jadwal_les')
      .update({
        name: period.name || `LES ${period.periodNumber}`,
        period_number: period.periodNumber,
        start_time: period.startTime,
        end_time: period.endTime,
        subject: period.subject,
        teacher: period.teacher,
        room: period.room,
        is_break: period.isBreak
      })
      .eq('id', period.id);
    if (error) throw error;
  },

  async addJadwal(period: LessonPeriod) {
    const { error } = await supabase.from('jadwal_les').insert([{
      id: period.id,
      name: period.name || `LES ${period.periodNumber}`,
      period_number: period.periodNumber,
      start_time: period.startTime,
      end_time: period.endTime,
      subject: period.subject,
      teacher: period.teacher,
      room: period.room,
      is_break: period.isBreak,
      order_index: period.periodNumber || 99
    }]);
    if (error) throw error;
  },

  async deleteJadwal(id: string) {
    const { error } = await supabase.from('jadwal_les').delete().eq('id', id);
    if (error) throw error;
  },

  async setJadwal(items: LessonPeriod[]) {
    await this.saveJadwal(items);
  }
};
