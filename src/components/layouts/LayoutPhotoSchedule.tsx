import React from 'react';
import { DisplayConfig, LessonPeriod, ScheduleEvent } from '../../types';
import { Calendar, Clock, MapPin, User, CheckCircle2, Flame, Bell } from 'lucide-react';

interface LayoutPhotoScheduleProps {
  config?: DisplayConfig;
  photoUrl?: string;
  schedule?: ScheduleEvent[];
  lessonPeriods?: LessonPeriod[];
  currentPeriod?: LessonPeriod | null;
  nextPeriod?: LessonPeriod | null;
}

export const LayoutPhotoSchedule: React.FC<LayoutPhotoScheduleProps> = ({ 
  config, 
  photoUrl: customPhotoUrl,
  schedule = [],
  lessonPeriods = [],
  currentPeriod,
  nextPeriod
}) => {
  const photoUrl = customPhotoUrl || config?.slots?.splitPhotoUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80';

  return (
    <div 
      id="layout-photo-schedule-canvas"
      className="w-full h-full flex flex-row bg-[#080E1A] overflow-hidden select-none"
      style={{ margin: 0, padding: 0 }}
    >
      {/* LEFT 70%: High Impact Photo */}
      <div className="w-[70%] h-full relative overflow-hidden bg-black border-r border-white/10 flex items-center justify-center">
        <img
          src={photoUrl || undefined}
          alt="Foto Utama Kegiatan"
          className="w-full h-full object-contain select-none"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 pointer-events-none">
          <div className="max-w-2xl pointer-events-auto">
            <span className="px-3 py-1 bg-[#00E5FF] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded">
              DOKUMENTASI UTAMA EMKA
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-white mt-2 tracking-wide font-display drop-shadow-md">
              Aktivitas Pembelajaran & Pengembangan Potensi Siswa
            </h2>
          </div>
        </div>
      </div>

      {/* RIGHT 30%: Jadwal Les & Status Realtime */}
      <div className="w-[30%] h-full bg-[#0B1528] flex flex-col p-6 overflow-hidden border-l border-white/5">
        {/* Header Widget */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FFD166]" />
            <h3 className="text-base font-black tracking-wider uppercase text-white font-display">
              JADWAL LES & KEGIATAN
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded">
            HARI INI
          </span>
        </div>

        {/* Realtime Status Badges (SEKARANG & BERIKUTNYA) */}
        {(currentPeriod || nextPeriod) && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/40 p-2.5 rounded flex flex-col">
              <span className="text-[10px] font-bold text-[#00E5FF] tracking-wider flex items-center gap-1 uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
                SEKARANG
              </span>
              <span className="text-xs font-black text-white truncate mt-1">
                {currentPeriod ? currentPeriod.name : 'TIDAK ADA LES'}
              </span>
              {currentPeriod?.subject && (
                <span className="text-[10px] text-gray-300 truncate">
                  {currentPeriod.subject}
                </span>
              )}
            </div>

            <div className="bg-[#FFD166]/10 border border-[#FFD166]/40 p-2.5 rounded flex flex-col">
              <span className="text-[10px] font-bold text-[#FFD166] tracking-wider flex items-center gap-1 uppercase">
                <Bell className="w-2.5 h-2.5 text-[#FFD166]" />
                BERIKUTNYA
              </span>
              <span className="text-xs font-black text-white truncate mt-1">
                {nextPeriod ? nextPeriod.name : 'SELESAI'}
              </span>
              {nextPeriod?.subject && (
                <span className="text-[10px] text-gray-300 truncate">
                  {nextPeriod.subject}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Schedule List */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          {(lessonPeriods.length > 0 ? lessonPeriods.slice(0, 5) : []).map((item) => {
            const isNow = currentPeriod?.id === item.id;
            return (
              <div
                key={item.id}
                className={`p-3 rounded transition-all duration-300 ${
                  isNow 
                    ? 'bg-[#0096D6]/30 border-l-4 border-l-[#00E5FF] border border-white/10' 
                    : item.isBreak
                    ? 'bg-[#18263D]/40 border border-dashed border-white/10 opacity-75'
                    : 'bg-[#132035]/80 border border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono tracking-wider text-[#00E5FF]">
                    {item.startTime} - {item.endTime}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    isNow 
                      ? 'bg-[#00E5FF] text-[#0A192F]' 
                      : item.isBreak
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    {item.name}
                  </span>
                </div>

                <div className="text-xs font-bold text-white mt-1 truncate">
                  {item.subject || item.name}
                </div>

                {item.teacher && item.teacher !== '-' && (
                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>{item.teacher}</span>
                    {item.room && <span>• {item.room}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
