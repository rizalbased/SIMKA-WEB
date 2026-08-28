import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  QrCode, 
  Vote, 
  CheckCircle2, 
  ArrowUpRight,
  Flame,
  Radio,
  Lightbulb
} from 'lucide-react';
import { ExhibitItem, ScheduleEvent, TriviaQuestion, AnnouncementItem } from '../../types';

interface LayoutMagazineSplitProps {
  exhibit: ExhibitItem;
  schedule: ScheduleEvent[];
  trivia: TriviaQuestion;
  announcement?: AnnouncementItem;
  onVoteTrivia: (optionId: string) => void;
  onToggleTriviaReveal: () => void;
}

export const LayoutMagazineSplit: React.FC<LayoutMagazineSplitProps> = ({
  exhibit,
  schedule,
  trivia,
  announcement,
  onVoteTrivia,
  onToggleTriviaReveal
}) => {
  // Determine color theme accent
  const themeBgMap: Record<string, string> = {
    teal: 'bg-[#0D6E6E] text-white',
    yellow: 'bg-[#F9C74F] text-[#18181B]',
    coral: 'bg-[#E06D53] text-white',
    offwhite: 'bg-white text-[#18181B]'
  };

  const themeBorderMap: Record<string, string> = {
    teal: 'border-[#0D6E6E]',
    yellow: 'border-[#F9C74F]',
    coral: 'border-[#E06D53]',
    offwhite: 'border-[#18181B]'
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
      {/* LEFT COLUMN: Hero Spotlight Card (60-62% / 7 cols) */}
      <div className="lg:col-span-7 h-full flex flex-col bg-white rounded-3xl simka-border simka-shadow-lg overflow-hidden relative">
        {/* Top Image Section */}
        <div className="relative h-[46%] w-full bg-neutral-900 overflow-hidden border-b-2.5 border-[#18181B]">
          <img 
            src={exhibit.imageUrl || undefined} 
            alt={exhibit.title}
            className="w-full h-full object-cover object-center filter saturate-110 transform hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-white/20 simka-shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-[#F9C74F]" />
              {exhibit.category}
            </span>
            <span className="bg-[#E06D53] text-white font-display font-extrabold text-xs uppercase tracking-wide px-3 py-1.5 rounded-xl border border-white/20 simka-shadow-sm">
              {exhibit.badgeText}
            </span>
          </div>

          {/* Bottom Photo Overlay Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white font-mono-code text-xs">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-[#F9C74F]" />
              <span className="font-bold">{exhibit.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
              <Clock className="w-3.5 h-3.5 text-[#F9C74F]" />
              <span className="font-bold">{exhibit.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#0D6E6E]">
                FEATURED EXHIBIT SPOTLIGHT
              </span>
              <div className="flex items-center gap-1 bg-[#FFF8E7] text-[#18181B] px-2.5 py-1 rounded-lg border border-[#18181B] text-xs font-bold font-display">
                <span>{exhibit.rating}</span>
                <span className="text-[10px] text-neutral-500">Visitor Score</span>
              </div>
            </div>

            <h1 className="font-editorial text-3xl xl:text-4xl font-extrabold tracking-tight text-[#18181B] leading-none mb-1">
              {exhibit.title}
            </h1>
            <p className="font-display font-bold text-base text-[#0D6E6E] mb-3">
              {exhibit.subtitle}
            </p>

            <p className="text-sm text-[#18181B]/80 leading-relaxed font-normal line-clamp-3">
              {exhibit.description}
            </p>
          </div>

          {/* Interactive Feature Banner at card bottom */}
          {exhibit.interactiveFeature && (
            <div className="mt-4 bg-[#E6F4F1] border-2 border-[#0D6E6E] p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0D6E6E] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  <Lightbulb className="w-5 h-5 text-[#F9C74F]" />
                </div>
                <div>
                  <div className="text-[11px] font-mono-code font-bold uppercase text-[#0D6E6E]">
                    VISITOR INTERACTION
                  </div>
                  <div className="text-xs font-display font-extrabold text-[#18181B]">
                    {exhibit.interactiveFeature}
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-flex bg-[#0D6E6E] text-white text-[10px] font-mono-code font-bold uppercase px-2.5 py-1 rounded-md">
                ZONE ACTIVE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Stacked Schedule & Interactive Trivia Cards (38-40% / 5 cols) */}
      <div className="lg:col-span-5 h-full flex flex-col gap-5 overflow-hidden">
        {/* TOP RIGHT: Live Today's Schedule Card */}
        <div className="h-[48%] bg-white p-5 rounded-3xl simka-border simka-shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E06D53] animate-ping" />
              <h2 className="font-editorial text-lg font-bold tracking-tight text-[#18181B]">
                TODAY'S TIMETABLE
              </h2>
            </div>
            <span className="text-[11px] font-mono-code font-bold bg-[#FFF8E7] text-[#18181B] px-2.5 py-0.5 rounded-md border border-[#18181B]">
              LIVE UPDATES
            </span>
          </div>

          {/* Schedule list items */}
          <div className="space-y-2.5 my-2 overflow-hidden flex-1 flex flex-col justify-around">
            {schedule.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-2xl border-2 transition-all ${
                  item.status === 'NOW'
                    ? 'bg-[#FFF8E7] border-[#18181B] simka-shadow-sm'
                    : 'bg-[#F8F6F0] border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-xs text-[#0D6E6E] bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {item.time}
                    </span>
                    <span className={`text-[10px] font-mono-code font-extrabold px-2 py-0.5 rounded uppercase ${
                      item.status === 'NOW'
                        ? 'bg-[#E06D53] text-white animate-pulse'
                        : item.status === 'SOON'
                        ? 'bg-[#F9C74F] text-[#18181B]'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-code text-neutral-500">
                    {item.location}
                  </span>
                </div>
                <div className="font-display font-extrabold text-sm text-[#18181B] mt-1 truncate">
                  {item.title}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] font-mono-code font-medium text-neutral-500">
            <span>Next session starts in 15 mins</span>
            <span className="text-[#0D6E6E] font-bold">Main Stage • Level 1</span>
          </div>
        </div>

        {/* BOTTOM RIGHT: Interactive Science Trivia / Daily Poll Card */}
        <div className="h-[48%] bg-[#0D6E6E] text-white p-5 rounded-3xl simka-border simka-shadow-lg flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decorative shapes */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#F9C74F] text-[#18181B] font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-[#18181B]">
                {trivia.category}
              </span>
            </div>
            <button 
              onClick={onToggleTriviaReveal}
              className="text-[10px] font-mono-code font-bold underline text-[#F9C74F] hover:text-white transition-colors"
            >
              {trivia.revealed ? 'Hide Answer' : 'Tap to Reveal'}
            </button>
          </div>

          {/* Question Text */}
          <div className="my-1.5">
            <h3 className="font-display font-extrabold text-sm xl:text-base leading-snug text-[#FFF8E7]">
              {trivia.question}
            </h3>
          </div>

          {/* Interactive Option Grid / Voting Pills */}
          <div className="grid grid-cols-2 gap-2 my-1">
            {trivia.options.map((opt) => {
              const pct = trivia.totalVotes > 0 ? Math.round((opt.votes / trivia.totalVotes) * 100) : 0;
              const isCorrectAndRevealed = trivia.revealed && opt.isCorrect;

              return (
                <button
                  key={opt.id}
                  onClick={() => onVoteTrivia(opt.id)}
                  className={`p-2 rounded-xl text-left border-2 transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isCorrectAndRevealed
                      ? 'bg-[#F9C74F] border-[#18181B] text-[#18181B] simka-shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  }`}
                >
                  {/* Vote progress fill bar when revealed */}
                  {trivia.revealed && (
                    <div 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 opacity-25 ${
                        opt.isCorrect ? 'bg-[#18181B]' : 'bg-white'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  <div className="flex items-center justify-between w-full relative z-10">
                    <span className="font-display font-bold text-xs truncate">
                      {opt.text}
                    </span>
                    {isCorrectAndRevealed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#18181B] flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono-code font-bold mt-1 relative z-10 opacity-80">
                    <span>{opt.votes} votes</span>
                    <span>{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Trivia Footer QR Scan Simulation */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-[#18181B] rounded-lg flex items-center justify-center p-1 border border-[#18181B]">
                <QrCode className="w-full h-full" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-mono-code font-bold text-[#F9C74F]">
                  SCAN ON PHONE TO VOTE
                </div>
                <div className="text-[9px] text-white/70">
                  simka.camp/vote • {trivia.totalVotes} total responses
                </div>
              </div>
            </div>
            <span className="bg-[#E06D53] text-white font-mono-code text-[10px] font-bold px-2 py-1 rounded-md">
              LIVE POLL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
