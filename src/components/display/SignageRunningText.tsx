import React from 'react';
import { DisplayConfig } from '../../types';

interface SignageRunningTextProps {
  config: DisplayConfig;
}

export const SignageRunningText: React.FC<SignageRunningTextProps> = ({ config }) => {
  const isCyan = config.headerTheme === 'cyan-blue' || config.contrastMode === 'broadcast-cyan';
  const isYellow = config.headerTheme === 'yellow-contrast';
  const isDark = config.headerTheme === 'dark-minimal';

  let defaultBg = '#0096D6';
  let defaultText = '#FFFFFF';
  let defaultBadgeBg = '#002840';
  let defaultBadgeText = '#FFD166';

  if (isYellow) {
    defaultBg = '#F9C74F';
    defaultText = '#18181B';
    defaultBadgeBg = '#18181B';
    defaultBadgeText = '#F9C74F';
  } else if (isDark) {
    defaultBg = '#111827';
    defaultText = '#FFFFFF';
    defaultBadgeBg = '#030712';
    defaultBadgeText = '#38BDF8';
  } else if (config.headerTheme === 'teal-clean') {
    defaultBg = '#0D6E6E';
    defaultText = '#FFFFFF';
    defaultBadgeBg = '#042424';
    defaultBadgeText = '#FFD166';
  }

  const bgColor = config.runningTextBgColor || defaultBg;
  const textColor = config.runningTextTextColor || defaultText;
  const badgeBg = config.runningTextBadgeBg || defaultBadgeBg;
  const badgeText = config.runningTextBadgeTextColor || defaultBadgeText;
  const badgeLabel = config.runningTextCategory || 'RUNNING TEXT';

  const rawText = config.runningTextContent || 'INFORMASI EMKA • Selamat mengikuti kegiatan pembelajaran hari ini • Agenda sekolah • Informasi bimbingan belajar & ujian semester • Simak display berkala •';
  
  // Repeat ticker message to ensure seamless continuous right-to-left flow across wide screens
  const fullText = `${rawText}    ★    ${rawText}    ★    ${rawText}    ★    ${rawText}`;
  const duration = config.runningTextSpeed || config.tickerSpeedSec || 25;

  return (
    <footer 
      id="simka-running-text-strip"
      className="w-full h-[60px] flex items-center overflow-hidden select-none z-30 flex-shrink-0 relative border-t border-black/20 shadow-md"
      style={{ 
        boxSizing: 'border-box',
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* Static Label Badge on the left */}
      <div 
        className="h-full flex items-center px-5 font-black text-sm uppercase tracking-widest flex-shrink-0 z-10 shadow-md border-r border-black/20"
        style={{
          backgroundColor: badgeBg,
          color: badgeText
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mr-2.5"></span>
        <span className="whitespace-nowrap">{badgeLabel}</span>
      </div>

      {/* Marquee Track Moving Right to Left */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div 
          className="flex whitespace-nowrap animate-marquee items-center"
          style={{
            animation: `marquee ${duration}s linear infinite`,
            willChange: 'transform'
          }}
        >
          <span 
            className="text-lg sm:text-xl font-bold tracking-wide uppercase px-4 drop-shadow-sm"
            style={{ color: textColor }}
          >
            {fullText}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
};
