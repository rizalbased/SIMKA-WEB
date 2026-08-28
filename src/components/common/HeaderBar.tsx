import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Cloud, CloudRain, MapPin, Radio, Wifi } from 'lucide-react';
import { DisplayConfig } from '../../types';

interface HeaderBarProps {
  config: DisplayConfig;
  currentSlideIndex?: number;
  totalSlides?: number;
  progressPercent?: number;
  isPortrait?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  config,
  currentSlideIndex = 0,
  totalSlides = 4,
  progressPercent = 0,
  isPortrait = false
}) => {
  const [time, setTime] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('00');
  const [dateStr, setDateStr] = useState<string>('');
  const [ampm, setAmPm] = useState<string>('AM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      
      setTime(`${hours % 12 || 12}:${minutes}`);
      setSeconds(secs);
      setAmPm(hours >= 12 ? 'PM' : 'AM');

      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      };
      setDateStr(now.toLocaleDateString('en-US', options).toUpperCase());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full relative z-20 flex-shrink-0">
      {/* Slide Progress Bar */}
      <div className="w-full h-1.5 bg-[#18181B]/10 overflow-hidden">
        <div 
          className="h-full bg-[#0D6E6E] transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={`px-5 py-3 flex items-center justify-between gap-4 ${isPortrait ? 'flex-col items-stretch gap-3' : ''}`}>
        {/* Left: SIMKA Brand Logo + Venue Zone */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#18181B] text-white px-3.5 py-1.5 rounded-xl simka-shadow-sm">
            <span className="font-editorial text-xl font-extrabold tracking-wider text-[#F9C74F]">
              SIMKA
            </span>
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-[#F8F6F0]/80 bg-white/15 px-2 py-0.5 rounded-md">
              SIGNAGE
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl simka-border-sm simka-shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D6E6E] animate-pulse" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
              <span className="text-xs font-bold font-display uppercase tracking-wide text-[#18181B]">
                {config.venueZone}
              </span>
            </div>
          </div>

          {!isPortrait && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono-code bg-[#E6F4F1] text-[#0D6E6E] px-3 py-1.5 rounded-xl simka-border-sm font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE FEED</span>
              <span className="text-[#18181B]/40">•</span>
              <span>SLIDE {currentSlideIndex + 1}/{totalSlides}</span>
            </div>
          )}
        </div>

        {/* Center / Right: Live Weather + Date & Precise Clock */}
        <div className={`flex items-center gap-3 ${isPortrait ? 'justify-between' : ''}`}>
          {/* Weather Widget */}
          <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl simka-border-sm simka-shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-[#FFF8E7] flex items-center justify-center text-[#F9C74F]">
              <Sun className="w-4 h-4 fill-[#F9C74F] text-[#F9C74F]" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-black font-display text-[#18181B]">24°C / 75°F</div>
              <div className="text-[10px] font-mono-code font-medium text-[#18181B]/60 uppercase">Clear Sky</div>
            </div>
          </div>

          {/* Date Widget */}
          <div className="hidden sm:flex items-center bg-[#F9C74F] text-[#18181B] px-3.5 py-1.5 rounded-xl simka-border-sm simka-shadow-sm font-display font-extrabold text-xs tracking-wider">
            {dateStr}
          </div>

          {/* Precision Clock */}
          <div className="flex items-center gap-1.5 bg-[#18181B] text-white px-4 py-1.5 rounded-xl simka-shadow-sm font-mono-code">
            <span className="text-base font-bold tracking-tight text-[#FFF8E7]">
              {time}
            </span>
            <span className="text-[11px] font-semibold text-[#F9C74F]">
              :{seconds}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 ml-0.5">
              {ampm}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
