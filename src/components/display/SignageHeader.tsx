import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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

  // Visual header styling using config.headerThemeConfig or fallbacks
  const t = config.headerThemeConfig || {
    background: '#009FE3',
    text: '#FFFFFF',
    brandBg: '#003B5C',
    brandText: '#FFFFFF',
    dateText: '#FFFFFF',
    clockBg: '#06243A',
    clockText: '#FFD166',
    accent: '#00D9FF',
    autoContrast: true
  };

  const headerBg = t.background || '#009FE3';
  const headerTextColor = t.text || '#FFFFFF';
  const brandBgColor = t.brandBg || '#003B5C';
  const brandTextColor = t.brand || '#FFFFFF';
  const dateTextColor = t.date || t.dateText || headerTextColor;
  const clockBgColor = t.clockBackground || t.clockBg || '#06243A';
  const clockTextColor = t.clockText || '#FFD166';
  const accentBorderColor = t.accent || '#18181B';

  return (
    <header 
      id="simka-signage-header"
      className="w-full h-[60px] flex items-center justify-between px-6 select-none z-30 flex-shrink-0 border-b-2"
      style={{ 
        backgroundColor: headerBg, 
        color: headerTextColor,
        borderColor: accentBorderColor,
        boxSizing: 'border-box' 
      }}
    >
      {/* LEFT: School Logo / SIMKA Brand */}
      <div className="flex items-center gap-3">
        {t.logoEnabled && t.logoPath ? (
          <img 
            src={t.logoPath.startsWith('http') ? t.logoPath : supabase.storage.from('simka-logo').getPublicUrl(t.logoPath).data.publicUrl} 
            alt="Logo"
            style={{ width: t.logoWidth || 105, height: t.logoHeight || 42, objectFit: 'contain' }}
            className="select-none"
          />
        ) : (
          <div 
            className="px-4 py-1.5 font-black text-xl tracking-wider rounded font-display flex items-center gap-2 border border-black/20"
            style={{ backgroundColor: brandBgColor, color: brandTextColor }}
          >
            <span>{t.brandText || 'SIMKA'}</span>
          </div>
        )}
      </div>

      {/* CENTER: Main Board Center Title (e.g. PUSAT INFORMASI EMKA) */}
      <div className="flex items-center justify-center flex-1 mx-4 text-center">
        <h1 
          className="text-xl sm:text-2xl font-black uppercase tracking-widest font-display truncate"
          style={{ color: headerTextColor }}
        >
          {t.centerTitle || 'PUSAT INFORMASI EMKA'}
        </h1>
      </div>

      {/* RIGHT: Status Jadwal Les Realtime & Jam */}
      <div className="flex items-center gap-3.5">
        {/* Jadwal Les Realtime Indicator */}
        {currentPeriod && (
          <div className="hidden md:flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: clockTextColor }}>SEKARANG:</span>
              <span className="font-extrabold text-white">
                {currentPeriod.isBreak ? 'ISTIRAHAT' : `${currentPeriod.periodNumber ? `LES ${currentPeriod.periodNumber}: ` : ''}${currentPeriod.subject}`}
              </span>
            </div>
            {nextPeriod && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandTextColor }}>BERIKUTNYA:</span>
                <span className="font-bold text-gray-200">
                  {nextPeriod.isBreak ? 'ISTIRAHAT' : nextPeriod.subject}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Realtime Date & Clock */}
        <div className="hidden sm:block text-right">
          <div 
            className="text-[10px] font-mono font-bold tracking-wider"
            style={{ color: dateTextColor }}
          >
            {dateStr || 'HARI INI'}
          </div>
        </div>

        <div 
          className="px-3.5 py-1.5 rounded font-mono text-xl sm:text-2xl font-black tracking-widest border border-black/20 shadow-inner"
          style={{ backgroundColor: clockBgColor, color: clockTextColor }}
        >
          {timeStr || '00:00:00'}
        </div>
      </div>
    </header>
  );
};
