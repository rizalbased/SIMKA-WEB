import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  QrCode, 
  CheckCircle2, 
  Bell, 
  Flame, 
  Compass, 
  ArrowUpRight,
  Wifi,
  Smartphone
} from 'lucide-react';
import { ExhibitItem, ScheduleEvent, TriviaQuestion, AnnouncementItem } from '../../types';

interface LayoutTripleBentoProps {
  exhibit: ExhibitItem;
  schedule: ScheduleEvent[];
  trivia: TriviaQuestion;
  announcement: AnnouncementItem;
}

export const LayoutTripleBento: React.FC<LayoutTripleBentoProps> = ({
  exhibit,
  schedule,
  trivia,
  announcement
}) => {
  return (
    <div className="w-full h-full p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden">
      {/* TOP-LEFT BENTO: Main Exhibit Hero (7 cols, 60% height) */}
      <div className="md:col-span-7 h-[58%] bg-white rounded-3xl simka-border simka-shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Photo Side */}
        <div className="w-full md:w-1/2 h-44 md:h-full relative overflow-hidden bg-black flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#18181B]">
          <img 
            src={exhibit.imageUrl || undefined} 
            alt={exhibit.title}
            className="w-full h-full object-cover object-center filter saturate-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-[#E06D53] text-white font-mono-code font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg simka-shadow-sm border border-white/20">
            {exhibit.badgeText}
          </div>
          <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-mono-code text-[11px] flex items-center justify-between border border-white/20">
            <span className="font-bold">{exhibit.zone}</span>
            <span className="text-[#F9C74F]">{exhibit.rating}</span>
          </div>
        </div>

        {/* Right Info Side */}
        <div className="flex-1 p-5 flex flex-col justify-between bg-[#FFFDF9]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#0D6E6E] text-white font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                {exhibit.category}
              </span>
              <span className="text-[11px] font-mono-code text-neutral-500 font-bold">
                {exhibit.ageGroup}
              </span>
            </div>

            <h2 className="font-editorial text-2xl xl:text-3xl font-extrabold text-[#18181B] leading-tight mb-1">
              {exhibit.title}
            </h2>
            <p className="font-display font-bold text-sm text-[#0D6E6E] mb-2">
              {exhibit.subtitle}
            </p>
            <p className="text-xs text-neutral-700 line-clamp-3 leading-relaxed">
              {exhibit.description}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-[#18181B]">
              <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>{exhibit.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-[#0D6E6E]">
              <Clock className="w-3.5 h-3.5" />
              <span>{exhibit.timeSlot}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT BENTO: Live Schedule Board (5 cols, 58% height) */}
      <div className="md:col-span-5 h-[58%] bg-[#F9C74F] p-5 rounded-3xl simka-border simka-shadow-lg flex flex-col justify-between text-[#18181B]">
        <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#18181B] animate-ping" />
            <h3 className="font-editorial text-lg font-black tracking-tight">
              SCHEDULE DISCOVERY
            </h3>
          </div>
          <span className="text-[10px] font-mono-code font-bold bg-white text-[#18181B] px-2 py-0.5 rounded border border-[#18181B]">
            STAGE A
          </span>
        </div>

        <div className="space-y-2 my-2 flex-1 flex flex-col justify-around">
          {schedule.slice(0, 3).map((item) => (
            <div 
              key={item.id}
              className="bg-white p-2.5 rounded-xl border-2 border-[#18181B] simka-shadow-sm flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-extrabold text-[11px] text-[#0D6E6E]">
                    {item.time}
                  </span>
                  <span className="text-[9px] font-mono-code font-black uppercase px-1.5 py-0.5 rounded bg-[#18181B] text-white">
                    {item.status}
                  </span>
                </div>
                <div className="font-display font-extrabold text-xs text-[#18181B] truncate mt-0.5">
                  {item.title}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-mono-code font-bold text-neutral-600">
                  {item.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] font-mono-code font-bold flex items-center justify-between border-t border-[#18181B]/30 pt-2">
          <span>Campus Wi-Fi: SIMKA-GUEST</span>
          <span className="uppercase">Floor Marshals: Level 1 & 2</span>
        </div>
      </div>

      {/* BOTTOM-LEFT BENTO: Visitor Announcement & Notice (7 cols, 38% height) */}
      <div className="md:col-span-7 h-[38%] bg-[#E06D53] text-white p-5 rounded-3xl simka-border simka-shadow-lg flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
              {announcement.tag}
            </span>
            <span className="text-[10px] font-mono-code text-white/80">
              {announcement.timestamp}
            </span>
          </div>

          <h3 className="font-editorial text-xl font-extrabold tracking-tight leading-snug mb-1 text-[#FFF8E7]">
            {announcement.title}
          </h3>
          <p className="text-xs text-white/90 font-medium line-clamp-2 leading-relaxed">
            {announcement.body}
          </p>
        </div>

        <div className="flex-shrink-0 hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white text-[#18181B] simka-border simka-shadow-sm p-2">
          <Sparkles className="w-7 h-7 text-[#E06D53] mb-1" />
          <span className="text-[9px] font-mono-code font-black uppercase text-center leading-none">
            MAKER LAB
          </span>
        </div>
      </div>

      {/* BOTTOM-RIGHT BENTO: Mobile Companion & QR Portal (5 cols, 38% height) */}
      <div className="md:col-span-5 h-[38%] bg-[#0D6E6E] text-white p-5 rounded-3xl simka-border simka-shadow-lg flex items-center justify-between gap-4">
        <div>
          <span className="bg-[#F9C74F] text-[#18181B] font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
            MOBILE COMPANION
          </span>
          <h4 className="font-editorial text-lg font-extrabold tracking-tight mt-1 mb-0.5 text-[#FFF8E7]">
            Interactive Map & Audio Guide
          </h4>
          <p className="text-xs text-white/80 font-medium">
            Scan to sync exhibit audio directly to your earbuds in 6 languages.
          </p>
        </div>

        <div className="flex-shrink-0 bg-white p-2.5 rounded-2xl border-2 border-[#18181B] simka-shadow-sm text-[#18181B] flex flex-col items-center">
          <QrCode className="w-14 h-14" />
          <span className="text-[9px] font-mono-code font-black mt-1">AUDIO GUIDE</span>
        </div>
      </div>
    </div>
  );
};
