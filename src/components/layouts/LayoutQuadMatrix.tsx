import React from 'react';
import { Sparkles, MapPin, Clock, ArrowUpRight, Star } from 'lucide-react';
import { ExhibitItem } from '../../types';

interface LayoutQuadMatrixProps {
  exhibits: ExhibitItem[];
}

export const LayoutQuadMatrix: React.FC<LayoutQuadMatrixProps> = ({ exhibits }) => {
  // Ensure we have 4 exhibits to display in quad layout
  const quadItems = exhibits.slice(0, 4);

  const themeClasses: Record<string, { card: string; badge: string; text: string }> = {
    teal: {
      card: 'bg-white border-[#18181B]',
      badge: 'bg-[#0D6E6E] text-white',
      text: 'text-[#0D6E6E]'
    },
    yellow: {
      card: 'bg-white border-[#18181B]',
      badge: 'bg-[#F9C74F] text-[#18181B]',
      text: 'text-[#18181B]'
    },
    coral: {
      card: 'bg-white border-[#18181B]',
      badge: 'bg-[#E06D53] text-white',
      text: 'text-[#E06D53]'
    },
    offwhite: {
      card: 'bg-white border-[#18181B]',
      badge: 'bg-[#18181B] text-white',
      text: 'text-[#18181B]'
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 overflow-hidden">
      {quadItems.map((item, idx) => {
        const theme = themeClasses[item.theme] || themeClasses.teal;

        return (
          <div 
            key={item.id}
            className={`h-full rounded-3xl simka-border simka-shadow overflow-hidden flex flex-col md:flex-row ${theme.card}`}
          >
            {/* Image section */}
            <div className="w-full md:w-5/12 h-36 md:h-full relative overflow-hidden bg-black flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#18181B]">
              <img 
                src={item.imageUrl || undefined} 
                alt={item.title}
                className="w-full h-full object-cover object-center filter saturate-110 hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2">
                <span className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-lg simka-shadow-sm border border-white/20 ${theme.badge}`}>
                  ZONE 0{idx + 1}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 px-2 py-1 rounded-lg text-white font-mono-code text-[10px] flex items-center justify-between">
                <span>{item.ageGroup}</span>
                <span className="text-[#F9C74F] font-bold">{item.rating || '4.9 ★'}</span>
              </div>
            </div>

            {/* Content section */}
            <div className="flex-1 p-4 flex flex-col justify-between bg-[#FFFDF9]">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono-code font-extrabold uppercase text-neutral-500">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-[#E06D53] bg-[#FDEEE9] px-2 py-0.5 rounded">
                    {item.badgeText}
                  </span>
                </div>

                <h3 className="font-editorial text-lg xl:text-xl font-extrabold text-[#18181B] leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="font-display font-bold text-xs text-[#0D6E6E] mb-1.5">
                  {item.subtitle}
                </p>
                <p className="text-[11px] text-neutral-700 line-clamp-2 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono-code font-bold">
                <div className="flex items-center gap-1 text-[#18181B]">
                  <MapPin className="w-3 h-3 text-[#E06D53]" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[#0D6E6E]">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeSlot}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
