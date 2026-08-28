import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  QrCode, 
  Touchpad, 
  Hand, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Radio
} from 'lucide-react';
import { ExhibitItem, ScheduleEvent, TriviaQuestion, AnnouncementItem } from '../../types';

interface LayoutPortraitKioskProps {
  exhibit: ExhibitItem;
  schedule: ScheduleEvent[];
  trivia: TriviaQuestion;
  announcement: AnnouncementItem;
}

export const LayoutPortraitKiosk: React.FC<LayoutPortraitKioskProps> = ({
  exhibit,
  schedule,
  trivia,
  announcement
}) => {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-hidden max-w-lg mx-auto bg-[#F8F6F0]">
      {/* 1. TOP HERO CARD (40% height) */}
      <div className="h-[40%] bg-white rounded-3xl simka-border simka-shadow-lg overflow-hidden flex flex-col">
        <div className="h-[55%] relative overflow-hidden bg-black border-b-2 border-[#18181B]">
          <img 
            src={exhibit.imageUrl || undefined} 
            alt={exhibit.title}
            className="w-full h-full object-cover object-center filter saturate-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-[10px] uppercase px-2.5 py-1 rounded-md simka-shadow-sm">
              {exhibit.category}
            </span>
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 px-2.5 py-1 rounded-lg text-white font-mono-code text-[11px] flex items-center justify-between">
            <span className="font-bold">{exhibit.location}</span>
            <span className="text-[#F9C74F] font-bold">{exhibit.rating}</span>
          </div>
        </div>

        <div className="flex-1 p-3.5 flex flex-col justify-between bg-[#FFFDF9]">
          <div>
            <h2 className="font-editorial text-xl font-extrabold text-[#18181B] leading-tight">
              {exhibit.title}
            </h2>
            <p className="font-display font-bold text-xs text-[#0D6E6E] mb-1">
              {exhibit.subtitle}
            </p>
            <p className="text-[11px] text-neutral-700 line-clamp-2 leading-relaxed">
              {exhibit.description}
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-code font-bold text-[#18181B] pt-1 border-t border-neutral-200">
            <span>{exhibit.timeSlot}</span>
            <span className="bg-[#E06D53] text-white px-2 py-0.5 rounded">{exhibit.badgeText}</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SCHEDULE (32% height) */}
      <div className="h-[32%] bg-[#FFF8E7] p-3.5 rounded-3xl simka-border simka-shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E06D53] animate-ping" />
            <h3 className="font-editorial text-sm font-bold uppercase tracking-tight">
              LIVE TIMETABLE
            </h3>
          </div>
          <span className="text-[9px] font-mono-code font-bold bg-[#18181B] text-[#F9C74F] px-1.5 py-0.5 rounded">
            LEVEL 1 STAGE
          </span>
        </div>

        <div className="space-y-1.5 my-1 flex-1 flex flex-col justify-around">
          {schedule.slice(0, 2).map((item) => (
            <div key={item.id} className="bg-white p-2 rounded-xl border border-[#18181B] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-code font-bold text-[10px] text-[#0D6E6E]">{item.time}</span>
                  <span className="font-mono-code text-[8px] font-black uppercase px-1 rounded bg-[#E06D53] text-white">{item.status}</span>
                </div>
                <div className="font-display font-bold text-xs text-[#18181B] truncate mt-0.5">{item.title}</div>
              </div>
              <span className="text-[9px] font-mono-code text-neutral-500">{item.location}</span>
            </div>
          ))}
        </div>

        <div className="text-[9px] font-mono-code text-neutral-600 flex items-center justify-between pt-1 border-t border-neutral-300">
          <span>Free Lockers & Stroller Desk: Main Gate</span>
          <span className="font-bold text-[#0D6E6E]">Helpdesk: #01</span>
        </div>
      </div>

      {/* 3. BOTTOM TOUCH INTERACTIVE PROMPT (28% height) */}
      <div className="h-[28%] bg-[#0D6E6E] text-white p-3.5 rounded-3xl simka-border simka-shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Hand className="w-4 h-4 text-[#F9C74F] animate-bounce" />
            <span className="bg-[#F9C74F] text-[#18181B] font-mono-code font-bold text-[9px] uppercase px-1.5 py-0.5 rounded">
              INTERACTIVE KIOSK
            </span>
          </div>
          <h4 className="font-editorial text-base font-extrabold text-[#FFF8E7] leading-tight mb-0.5">
            Touch to Search Exhibits
          </h4>
          <p className="text-[10px] text-white/80 font-medium leading-tight">
            Find nearest restrooms, cafe orders & accessibility routes.
          </p>
        </div>

        <div className="bg-white text-[#18181B] p-2 rounded-2xl border-2 border-[#18181B] simka-shadow-sm flex flex-col items-center flex-shrink-0">
          <QrCode className="w-11 h-11" />
          <span className="text-[8px] font-mono-code font-black mt-0.5">MOBILE MAP</span>
        </div>
      </div>
    </div>
  );
};
