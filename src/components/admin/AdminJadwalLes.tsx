import React, { useState, useEffect } from 'react';
import { LessonPeriod } from '../../types';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Coffee, 
  GraduationCap,
  X,
  Radio
} from 'lucide-react';

import { jadwalService } from '../../services/jadwalService';

interface AdminJadwalLesProps {
  lessonPeriods: LessonPeriod[];
  onUpdateLessonPeriods: (periods: LessonPeriod[]) => void;
}

export const AdminJadwalLes: React.FC<AdminJadwalLesProps> = ({
  lessonPeriods,
  onUpdateLessonPeriods
}) => {
  const [editingPeriod, setEditingPeriod] = useState<LessonPeriod | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('08:00');

  // Real-time time updater for preview
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine current active period & next period based on clock
  let activePeriod: LessonPeriod | null = null;
  let nextPeriod: LessonPeriod | null = null;

  for (let i = 0; i < lessonPeriods.length; i++) {
    const p = lessonPeriods[i];
    if (currentTimeStr >= p.startTime && currentTimeStr <= p.endTime) {
      activePeriod = p;
      nextPeriod = lessonPeriods[i + 1] || null;
      break;
    }
    if (currentTimeStr < p.startTime && !nextPeriod) {
      nextPeriod = p;
    }
  }

  const handleSavePeriod = async (period: LessonPeriod) => {
    try {
      await jadwalService.updateJadwal(period);
      const updated = lessonPeriods.map(p => p.id === period.id ? period : p);
      onUpdateLessonPeriods(updated);
      setEditingPeriod(null);
    } catch (err) {
      console.error('Error saving period:', err);
      alert('Gagal menyimpan ke database.');
    }
  };

  const handleAddPeriod = async (newP: Partial<LessonPeriod>) => {
    const period: LessonPeriod = {
      id: `les-${Date.now()}`,
      periodNumber: lessonPeriods.length + 1,
      startTime: newP.startTime || '13:00',
      endTime: newP.endTime || '13:45',
      subject: newP.subject || 'Bimbingan Belajar',
      teacher: newP.teacher || 'Guru Pengampu',
      room: newP.room || 'R. Teori',
      isBreak: Boolean(newP.isBreak)
    };
    try {
      await jadwalService.addJadwal(period);
      onUpdateLessonPeriods([...lessonPeriods, period]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding period:', err);
      alert('Gagal menyimpan ke database.');
    }
  };

  const handleDeletePeriod = async (id: string) => {
    try {
      await jadwalService.deleteJadwal(id);
      onUpdateLessonPeriods(lessonPeriods.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting period:', err);
      alert('Gagal menghapus dari database.');
    }
  };

  const handleResetDefault = async () => {
    const defaultPeriods: LessonPeriod[] = [
      { id: 'les-1', periodNumber: 1, startTime: '07:00', endTime: '07:45', subject: 'Upacara / Pembiasaan Pagi', teacher: 'Tim Kesiswaan', room: 'Lapangan Utama', isBreak: false },
      { id: 'les-2', periodNumber: 2, startTime: '07:45', endTime: '08:30', subject: 'Matematika Terapan', teacher: 'Dra. Siti Aminah', room: 'R. 201', isBreak: false },
      { id: 'les-3', periodNumber: 3, startTime: '08:30', endTime: '09:15', subject: 'Fisika & Sains Digital', teacher: 'Bambang S., M.Pd', room: 'Lab Sains', isBreak: false },
      { id: 'les-4', periodNumber: 4, startTime: '09:15', endTime: '10:00', subject: 'Bahasa Indonesia', teacher: 'Nurul Hidayah, S.Pd', room: 'R. 201', isBreak: false },
      { id: 'les-5', periodNumber: 5, startTime: '10:00', endTime: '10:30', subject: 'Istirahat & Snack Pagi', teacher: '-', room: 'Kantin & Area Selasar', isBreak: true },
      { id: 'les-6', periodNumber: 6, startTime: '10:30', endTime: '11:15', subject: 'Pemrograman & Robotika', teacher: 'Rian Pratama, S.Kom', room: 'Lab Komputer 1', isBreak: false },
      { id: 'les-7', periodNumber: 7, startTime: '11:15', endTime: '12:00', subject: 'Bahasa Inggris Komunikasi', teacher: 'Sarah Jenkins, B.Ed', room: 'Lab Bahasa', isBreak: false },
      { id: 'les-8', periodNumber: 8, startTime: '12:00', endTime: '13:00', subject: 'Istirahat Siang & Sholat Dzuhur', teacher: 'Tim Rohis', room: 'Masjid Sekolah', isBreak: true },
      { id: 'les-9', periodNumber: 9, startTime: '13:00', endTime: '14:30', subject: 'Ekstrakurikuler & Minat Bakat', teacher: 'Pelatih Pembina', room: 'Studio Seni / GOR', isBreak: false }
    ];
    try {
      await jadwalService.setJadwal(defaultPeriods);
      onUpdateLessonPeriods(defaultPeriods);
    } catch (err) {
      console.error('Error resetting periods:', err);
      alert('Gagal me-reset database.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0096D6]">
            <CalendarClock className="w-4 h-4 text-[#0096D6]" />
            <span>SINKRONISASI WAKTU & JADWAL PEMBELAJARAN</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#18181B] mt-1">
            JADWAL LES & BIMBINGAN
          </h2>
          <p className="text-sm font-medium text-neutral-600 mt-0.5">
            Jadwal ini disiarkan secara real-time pada Header Fullscreen Display dan Slide Foto+Informasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefault}
            className="bg-white hover:bg-neutral-100 text-[#18181B] font-display font-bold text-xs px-3.5 py-2.5 rounded-xl border-2 border-[#18181B] flex items-center gap-2 transition-all shadow-[2px_2px_0px_#18181B]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-600" />
            <span>Reset Standar EMKA</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-xs px-4 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
          >
            <Plus className="w-4 h-4 text-[#FFD166]" />
            <span>+ TAMBAH JAM LES</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Card Indicator */}
      <div className="bg-[#0A192F] text-white p-6 rounded-2xl border-3 border-[#00E5FF]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF]">
            <Radio className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span className="font-bold">STATUS REALTIME JAM KANVAS DISPLAY ({currentTimeStr})</span>
          </div>
          <div className="text-xl font-black font-display text-white">
            {activePeriod 
              ? `${activePeriod.isBreak ? 'ISTIRAHAT' : `LES KE-${activePeriod.periodNumber}`}: ${activePeriod.subject}`
              : 'DILUAR JAM PEMBELAJARAN EFEKTIF'}
          </div>
          <div className="text-xs font-mono text-gray-400">
            {activePeriod ? `Waktu: ${activePeriod.startTime} - ${activePeriod.endTime} | ${activePeriod.room}` : 'Jadwal berikutnya akan otomatis tampil saat jam les dimulai.'}
          </div>
        </div>

        {nextPeriod && (
          <div className="bg-[#002840] p-3 rounded-xl border border-[#00E5FF]/30 text-xs font-mono space-y-1">
            <span className="text-[#FFD166] font-bold">BERIKUTNYA:</span>
            <div className="text-white font-bold">{nextPeriod.subject} ({nextPeriod.startTime})</div>
          </div>
        )}
      </div>

      {/* Lesson Periods Table / List */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
        <div className="text-sm font-display font-black text-[#18181B] uppercase tracking-wider">
          DAFTAR JAM PEMBELAJARAN HARIAN
        </div>

        <div className="space-y-3">
          {lessonPeriods.map((period) => {
            const isCurrentlyActive = activePeriod?.id === period.id;

            return (
              <div
                key={period.id}
                className={`p-4 rounded-xl border-2 border-[#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCurrentlyActive
                    ? 'bg-[#E6F7FF] shadow-[4px_4px_0px_#0096D6] border-[#0096D6]'
                    : period.isBreak
                    ? 'bg-[#FFF8E7] shadow-[2px_2px_0px_#18181B]'
                    : 'bg-white shadow-[2px_2px_0px_#18181B]'
                }`}
              >
                {/* Period Badge & Time */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-12 rounded-xl border-2 border-[#18181B] flex flex-col items-center justify-center font-mono font-black ${
                    period.isBreak ? 'bg-[#FFD166] text-[#18181B]' : 'bg-[#0096D6] text-white'
                  }`}>
                    {period.isBreak ? <Coffee className="w-5 h-5" /> : (
                      <>
                        <span className="text-[9px] uppercase">LES</span>
                        <span className="text-base leading-tight">{period.periodNumber}</span>
                      </>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold bg-[#18181B] text-white px-2 py-0.5 rounded">
                        {period.startTime} - {period.endTime}
                      </span>
                      {isCurrentlyActive && (
                        <span className="text-[10px] font-mono font-black bg-emerald-500 text-white px-2 py-0.5 rounded animate-pulse">
                          ● SEDANG BERLANGSUNG
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-black text-sm text-[#18181B] mt-1">
                      {period.subject}
                    </h4>
                  </div>
                </div>

                {/* Teacher & Room */}
                <div className="text-xs font-mono text-neutral-600 space-y-0.5">
                  <div>Guru: <strong className="text-[#18181B]">{period.teacher || '-'}</strong></div>
                  <div>Ruangan: <strong className="text-[#18181B]">{period.room || '-'}</strong></div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setEditingPeriod(period)}
                    className="p-2 rounded-lg bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] transition-all"
                    title="Edit Jam Les"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0096D6]" />
                  </button>
                  <button
                    onClick={() => handleDeletePeriod(period.id)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-300 transition-all"
                    title="Hapus Jam Les"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Edit / Add Period */}
      {(editingPeriod || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-200">
              <h3 className="text-lg font-black font-display text-[#18181B]">
                {editingPeriod ? 'EDIT JAM LES' : 'TAMBAH JAM LES BARU'}
              </h3>
              <button 
                onClick={() => {
                  setEditingPeriod(null);
                  setIsAddModalOpen(false);
                }} 
                className="p-1 rounded-lg hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const startTime = (form.elements.namedItem('startTime') as HTMLInputElement).value;
                const endTime = (form.elements.namedItem('endTime') as HTMLInputElement).value;
                const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
                const teacher = (form.elements.namedItem('teacher') as HTMLInputElement).value;
                const room = (form.elements.namedItem('room') as HTMLInputElement).value;
                const isBreak = (form.elements.namedItem('isBreak') as HTMLInputElement).checked;

                if (editingPeriod) {
                  handleSavePeriod({
                    ...editingPeriod,
                    startTime,
                    endTime,
                    subject,
                    teacher,
                    room,
                    isBreak
                  });
                } else {
                  handleAddPeriod({
                    startTime,
                    endTime,
                    subject,
                    teacher,
                    room,
                    isBreak
                  });
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                    WAKTU MULAI
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    defaultValue={editingPeriod?.startTime || '08:00'}
                    required
                    className="w-full bg-white p-2 rounded-xl border-2 border-[#18181B] text-xs font-mono font-bold text-[#18181B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                    WAKTU SELESAI
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    defaultValue={editingPeriod?.endTime || '08:45'}
                    required
                    className="w-full bg-white p-2 rounded-xl border-2 border-[#18181B] text-xs font-mono font-bold text-[#18181B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  MATA PELAJARAN / KEGIATAN
                </label>
                <input
                  name="subject"
                  type="text"
                  defaultValue={editingPeriod?.subject || ''}
                  required
                  placeholder="Contoh: Matematika, Fisika, Istirahat..."
                  className="w-full bg-white p-2 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  GURU PENGAMPU
                </label>
                <input
                  name="teacher"
                  type="text"
                  defaultValue={editingPeriod?.teacher || ''}
                  placeholder="Nama guru / pembina..."
                  className="w-full bg-white p-2 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  RUANGAN / KELAS
                </label>
                <input
                  name="room"
                  type="text"
                  defaultValue={editingPeriod?.room || ''}
                  placeholder="Contoh: R. 201, Lab Komputer..."
                  className="w-full bg-white p-2 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    name="isBreak"
                    type="checkbox"
                    defaultChecked={editingPeriod?.isBreak || false}
                    className="w-4 h-4 rounded"
                  />
                  <span>Tandai sebagai Jam Istirahat / Sholat</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t-2 border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPeriod(null);
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-neutral-200 text-neutral-800"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-display font-black text-xs bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
