import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Star, 
  Volume2, 
  Flame, 
  Lightbulb, 
  ArrowRight,
  Maximize2,
  Compass
} from 'lucide-react';
import { ExhibitItem, ScheduleEvent } from '../../types';

interface LayoutHeroShowcaseProps {
  exhibit: ExhibitItem;
  nextScheduleItem?: ScheduleEvent;
}

export const LayoutHeroShowcase: React.FC<LayoutHeroShowcaseProps> = ({
  exhibit,
  nextScheduleItem
}) => {
  return (
    <div className="w-full h-full p-4 lg:p-6 overflow-hidden">
      <div className="w-full h-full relative rounded-3xl overflow-hidden simka-border simka-shadow-lg flex flex-col justify-between bg-black">
        {/* Background Full Bleed Photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src={exhibit.imageUrl || undefined} 
            alt={exhibit.title}
            className="w-full h-full object-cover object-center filter brightness-90 saturate-120"
            referrerPolicy="no-referrer"
          />
          {/* Multi-step Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/30" />
        </div>

        {/* Top Floating Badge Row */}
        <div className="relative z-10 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#F9C74F] text-[#18181B] font-mono-code font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl simka-border simka-shadow-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>MAIN SHOWCASE SPOTLIGHT</span>
            </div>
            <div className="bg-[#E06D53] text-white font-display font-extrabold text-xs uppercase px-3.5 py-2 rounded-xl simka-border simka-shadow-sm">
              {exhibit.badgeText}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md text-[#18181B] px-4 py-2 rounded-xl simka-border simka-shadow-sm font-mono-code text-xs font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0D6E6E]" />
            <span>{exhibit.location}</span>
          </div>
        </div>

        {/* Center / Bottom Massive Editorial Presentation */}
        <div className="relative z-10 p-6 md:p-10 max-w-4xl">
          <div className="flex items-center gap-2 text-[#F9C74F] font-mono-code font-bold text-xs uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F9C74F] animate-ping" />
            <span>{exhibit.category}</span>
            <span>•</span>
            <span>{exhibit.ageGroup}</span>
            <span>•</span>
            <span className="text-white">{exhibit.timeSlot}</span>
          </div>

          <h1 className="font-editorial text-4xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight mb-2 drop-shadow-md">
            {exhibit.title}
          </h1>

          <p className="font-display font-extrabold text-xl md:text-2xl text-[#F9C74F] mb-4">
            {exhibit.subtitle}
          </p>

          <p className="text-sm md:text-base text-neutral-200 font-normal leading-relaxed max-w-2xl mb-6 drop-shadow">
            {exhibit.description}
          </p>

          {/* Interactive Feature & Next Event Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {exhibit.interactiveFeature && (
              <div className="bg-[#0D6E6E] text-white px-4 py-2.5 rounded-2xl simka-border border-white/40 simka-shadow-sm flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-[#F9C74F]" />
                <span className="text-xs font-display font-bold">
                  {exhibit.interactiveFeature}
                </span>
              </div>
            )}

            {nextScheduleItem && (
              <div className="bg-white text-[#18181B] px-4 py-2.5 rounded-2xl simka-border simka-shadow-sm flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E06D53]" />
                <span className="text-xs font-mono-code font-bold">
                  Next Live Show: <strong className="font-display font-extrabold text-[#0D6E6E]">{nextScheduleItem.time}</strong> ({nextScheduleItem.title})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
