import React from 'react';
import { Volume2, Sparkles, BellRing, Info, Flame } from 'lucide-react';
import { TickerItem } from '../../types';

interface MarqueeTickerProps {
  items: TickerItem[];
  speedSec?: number;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  items,
  speedSec = 28
}) => {
  // Duplicate list to create seamless infinite loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <footer className="w-full flex-shrink-0 bg-[#18181B] text-white simka-border-sm border-x-0 border-b-0 overflow-hidden flex items-center h-12 relative z-20">
      {/* Fixed High-Contrast Tag Pill on Left */}
      <div className="flex-shrink-0 z-10 bg-[#E06D53] text-[#18181B] h-full px-4 flex items-center gap-2 border-r-2 border-black font-display font-extrabold text-xs tracking-wider uppercase">
        <Sparkles className="w-3.5 h-3.5 fill-[#18181B] text-[#18181B]" />
        <span>CAMPUS PULSE</span>
      </div>

      {/* Smooth Marquee Stream */}
      <div className="overflow-hidden flex-1 relative flex items-center">
        <div 
          className="animate-marquee flex items-center py-1 gap-8"
          style={{ animationDuration: `${speedSec}s` }}
        >
          {duplicatedItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider bg-white/15 text-[#F9C74F] border border-white/20">
                {item.category}
              </span>
              <span className="text-xs font-bold font-display tracking-wide text-[#F8F6F0]">
                {item.text}
              </span>
              <span className="text-[#E06D53] text-sm">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Fixed Audio / Sync Indicator */}
      <div className="flex-shrink-0 z-10 bg-[#0D6E6E] text-white h-full px-3.5 flex items-center gap-1.5 border-l-2 border-black font-mono-code text-[11px] font-bold">
        <span className="w-2 h-2 rounded-full bg-[#F9C74F] animate-ping" />
        <span className="hidden sm:inline">LIVE BROADCAST</span>
      </div>
    </footer>
  );
};
