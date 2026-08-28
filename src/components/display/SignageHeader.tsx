import React, { useState, useEffect } from 'react';
import { DisplayConfig, LessonPeriod } from '../../types';

interface SignageHeaderProps {
  config: DisplayConfig;
  lessonPeriods?: LessonPeriod[];
}

export const SignageHeader: React.FC<SignageHeaderProps> = ({ config, lessonPeriods = [] }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [currentPeriod, setCurrentPeriod] = useState<LessonPeriod | null>(null);
  const [nextPeriod, setNextPeriod] = useState<LessonPeriod | null>(null);

  useEffect(() => {
    const updateTimeAndSchedule = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      setTimeStr(`${hours}:${minutes}:${secs}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setDateStr(now.toLocaleDateString('id-ID', options).toUpperCase());

      // Calculate active lesson period
      if (lessonPeriods.length > 0) {
        let active: LessonPeriod | null = null;
        let next: LessonPeriod | null = null;

        for (let i = 0; i < lessonPeriods.length; i++) {
          const item = lessonPeriods[i];
          if (currentTime >= item.startTime && currentTime <= item.endTime) {
            active = item;
            next = lessonPeriods[i + 1] || null;
            break;
          } else if (currentTime < item.startTime) {
            if (!next) {
              next = item;
            }
          }
        }

        // Fallback for demo if outside active hours: pick first or second for display demonstration
        if (!active && lessonPeriods.length > 0) {
          active = lessonPeriods[0];
          next = lessonPeriods[1] || null;
        }

        setCurrentPeriod(active);
        setNextPeriod(next);
      }
    };

    updateTimeAndSchedule();
    const interval = setInterval(updateTimeAndSchedule, 1000);
    return () => clearInterval(interval);
  }, [lessonPeriods]);

  // Visual header styling
  const isCyan = config.headerTheme === 'cyan-blue' || config.contrastMode === 'broadcast-cyan';
  const isYellow = config.headerTheme === 'yellow-contrast';
  const isDark = config.headerTheme === 'dark-minimal';

  let bgClass = 'bg-[#0096D6] text-white';
  let badgeClass = 'bg-[#003B5C] text-[#54D6FF]';
  let clockClass = 'bg-[#002840] text-[#FFD166]';

  if (isYellow) {
    bgClass = 'bg-[#F9C74F] text-[#18181B]';
    badgeClass = 'bg-[#18181B] text-[#F9C74F]';
    clockClass = 'bg-[#18181B] text-white';
  } else if (isDark) {
    bgClass = 'bg-[#111827] text-white border-b border-gray-800';
    badgeClass = 'bg-[#1F2937] text-[#38BDF8]';
    clockClass = 'bg-[#030712] text-[#F9C74F]';
  } else if (!isCyan) {
    // teal-clean
    bgClass = 'bg-[#0D6E6E] text-white';
    badgeClass = 'bg-[#084545] text-[#84E1BC]';
    clockClass = 'bg-[#042424] text-[#F9C74F]';
  }

  return (
    <header 
      id="simka-signage-header"
      className={`w-full h-[62px] flex items-center justify-between px-6 select-none z-30 flex-shrink-0 ${bgClass}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* LEFT: School Logo / SIMKA Brand */}
      <div className="flex items-center gap-3">
        <div className={`px-4 py-1.5 font-black text-xl tracking-wider rounded font-display flex items-center gap-2 ${badgeClass}`}>
          <span>{config.headerLeftText || 'SIMKA'}</span>
        </div>
      </div>

      {/* CENTER: Main Board Center Title (e.g. PUSAT INFORMASI EMKA) */}
      <div className="flex items-center justify-center flex-1 mx-4 text-center">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest font-display truncate">
          {config.headerCenterText || 'PUSAT INFORMASI EMKA'}
        </h1>
      </div>

      {/* RIGHT: Status Jadwal Les Realtime & Jam */}
      <div className="flex items-center gap-3.5">
        {/* Jadwal Les Realtime Indicator */}
        {currentPeriod && (
          <div className="hidden md:flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#FFD166] uppercase tracking-wider">SEKARANG:</span>
              <span className="font-extrabold text-white">{currentPeriod.name}</span>
            </div>
            {nextPeriod && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
                <span className="text-[10px] font-bold text-[#54D6FF] uppercase tracking-wider">BERIKUTNYA:</span>
                <span className="font-bold text-gray-200">{nextPeriod.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Realtime Date & Clock */}
        <div className="hidden sm:block text-right">
          <div className="text-[10px] font-mono opacity-85 font-bold tracking-wider">
            {dateStr || 'HARI INI'}
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded font-mono text-xl sm:text-2xl font-black tracking-widest ${clockClass}`}>
          {timeStr || '00:00:00'}
        </div>
      </div>
    </header>
  );
};
