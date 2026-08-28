import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  MapPin, 
  Clock, 
  Calendar, 
  HelpCircle, 
  Bell, 
  Radio, 
  CheckCircle2,
  X,
  Flame,
  Lightbulb
} from 'lucide-react';
import { 
  ExhibitItem, 
  ScheduleEvent, 
  TriviaQuestion, 
  AnnouncementItem, 
  TickerItem,
  ColorTheme
} from '../../types';

interface AdminContentManagerProps {
  exhibits: ExhibitItem[];
  onUpdateExhibits: (exhibits: ExhibitItem[]) => void;
  schedule: ScheduleEvent[];
  onUpdateSchedule: (schedule: ScheduleEvent[]) => void;
  trivia: TriviaQuestion;
  onUpdateTrivia: (trivia: TriviaQuestion) => void;
  announcements: AnnouncementItem[];
  onUpdateAnnouncements: (announcements: AnnouncementItem[]) => void;
  tickerItems: TickerItem[];
  onUpdateTickerItems: (items: TickerItem[]) => void;
}

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({
  exhibits,
  onUpdateExhibits,
  schedule,
  onUpdateSchedule,
  trivia,
  onUpdateTrivia,
  announcements,
  onUpdateAnnouncements,
  tickerItems,
  onUpdateTickerItems
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'exhibits' | 'schedule' | 'trivia' | 'announcements' | 'ticker'>('exhibits');

  // Edit / Modal States
  const [editingExhibit, setEditingExhibit] = useState<ExhibitItem | null>(null);
  const [isAddingExhibit, setIsAddingExhibit] = useState(false);

  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);

  const [newTickerText, setNewTickerText] = useState('');
  const [newTickerCategory, setNewTickerCategory] = useState('CAMPUS');

  // Color theme picker options
  const themes: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'teal', label: 'Teal Lagoon', color: '#0D6E6E' },
    { id: 'yellow', label: 'Amber Yellow', color: '#F9C74F' },
    { id: 'coral', label: 'Vibrant Coral', color: '#E06D53' },
    { id: 'offwhite', label: 'Editorial Off-White', color: '#FFFFFF' }
  ];

  // Helper to handle exhibit save
  const handleSaveExhibit = (ex: ExhibitItem) => {
    if (editingExhibit) {
      onUpdateExhibits(exhibits.map(e => e.id === ex.id ? ex : e));
      setEditingExhibit(null);
    } else if (isAddingExhibit) {
      onUpdateExhibits([...exhibits, { ...ex, id: `ex-${Date.now()}` }]);
      setIsAddingExhibit(false);
    }
  };

  const handleDeleteExhibit = (id: string) => {
    onUpdateExhibits(exhibits.filter(e => e.id !== id));
  };

  // Helper to handle event save
  const handleSaveEvent = (ev: ScheduleEvent) => {
    if (editingEvent) {
      onUpdateSchedule(schedule.map(s => s.id === ev.id ? ev : s));
      setEditingEvent(null);
    } else if (isAddingEvent) {
      onUpdateSchedule([...schedule, { ...ev, id: `ev-${Date.now()}` }]);
      setIsAddingEvent(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    onUpdateSchedule(schedule.filter(s => s.id !== id));
  };

  // Helper to handle announcement save
  const handleSaveAnnouncement = (ann: AnnouncementItem) => {
    if (editingAnnouncement) {
      onUpdateAnnouncements(announcements.map(a => a.id === ann.id ? ann : a));
      setEditingAnnouncement(null);
    } else if (isAddingAnnouncement) {
      onUpdateAnnouncements([...announcements, { ...ann, id: `ann-${Date.now()}` }]);
      setIsAddingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    onUpdateAnnouncements(announcements.filter(a => a.id !== id));
  };

  // Add new marquee ticker
  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;
    const newItem: TickerItem = {
      id: `tk-${Date.now()}`,
      text: newTickerText.toUpperCase(),
      category: newTickerCategory.toUpperCase()
    };
    onUpdateTickerItems([...tickerItems, newItem]);
    setNewTickerText('');
  };

  const handleDeleteTicker = (id: string) => {
    onUpdateTickerItems(tickerItems.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Sub-tab Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2.5 border-[#18181B] pb-4">
        <div>
          <h1 className="font-editorial text-2xl font-black text-[#18181B]">
            CONTENT MANAGEMENT STUDIO
          </h1>
          <p className="text-xs text-neutral-600 font-medium mt-0.5">
            Manage exhibits, live timetables, interactive trivia polls, visitor alerts, and tickers.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-[#F8F6F0] p-1.5 rounded-2xl simka-border-sm">
          {[
            { id: 'exhibits', label: 'Exhibits & Spotlight', count: exhibits.length },
            { id: 'schedule', label: 'Timetable & Events', count: schedule.length },
            { id: 'trivia', label: 'Trivia & Daily Poll', count: '1 Active' },
            { id: 'announcements', label: 'Announcements', count: announcements.length },
            { id: 'ticker', label: 'Marquee Ticker', count: tickerItems.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-2 transition-all ${
                activeSubTab === tab.id
                  ? 'bg-[#0D6E6E] text-white simka-shadow-sm'
                  : 'hover:bg-neutral-200 text-[#18181B]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded ${
                activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-white text-neutral-800'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. EXHIBITS SUB-TAB */}
      {activeSubTab === 'exhibits' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-display font-extrabold text-[#18181B]">
              Published Exhibit Experiences ({exhibits.length})
            </div>
            <button
              onClick={() => {
                setEditingExhibit(null);
                setIsAddingExhibit(true);
              }}
              className="bg-[#F9C74F] hover:bg-[#e4b33c] text-[#18181B] px-4 py-2 rounded-xl simka-border-sm simka-shadow font-display font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Exhibit</span>
            </button>
          </div>

          {/* Exhibits Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exhibits.map((ex) => (
              <div 
                key={ex.id}
                className="bg-white rounded-3xl simka-border simka-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative overflow-hidden bg-black border-b-2 border-[#18181B]">
                    <img 
                      src={ex.imageUrl || undefined} 
                      alt={ex.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1">
                      <span className="bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                        {ex.category}
                      </span>
                      <span className="bg-[#E06D53] text-white font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                        {ex.badgeText}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-editorial text-xl font-bold text-[#18181B] leading-snug">
                      {ex.title}
                    </h3>
                    <p className="font-display font-bold text-xs text-[#0D6E6E]">
                      {ex.subtitle}
                    </p>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {ex.description}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-[11px] font-mono-code font-bold text-neutral-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E06D53]" />
                        {ex.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#0D6E6E]" />
                        {ex.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-neutral-100 mt-2">
                  <span className="text-xs font-mono-code font-bold text-neutral-500 uppercase">
                    Theme: {ex.theme}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingExhibit(ex)}
                      className="p-1.5 bg-[#FFF8E7] hover:bg-[#ffeec2] text-[#18181B] rounded-lg border border-[#18181B]"
                      title="Edit Exhibit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExhibit(ex.id)}
                      className="p-1.5 bg-[#FDEEE9] hover:bg-[#fad3c8] text-[#E06D53] rounded-lg border border-[#E06D53]"
                      title="Delete Exhibit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SCHEDULE SUB-TAB */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-display font-extrabold text-[#18181B]">
              Daily Timetable Schedule ({schedule.length} Events)
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setIsAddingEvent(true);
              }}
              className="bg-[#F9C74F] hover:bg-[#e4b33c] text-[#18181B] px-4 py-2 rounded-xl simka-border-sm simka-shadow font-display font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Scheduled Event</span>
            </button>
          </div>

          <div className="space-y-3">
            {schedule.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-4 rounded-2xl simka-border simka-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-sm px-3 py-2 rounded-xl">
                    {item.time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono-code font-black uppercase px-2 py-0.5 rounded ${
                        item.status === 'NOW'
                          ? 'bg-[#E06D53] text-white animate-pulse'
                          : 'bg-[#FFF8E7] text-[#18181B] border border-[#18181B]'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-mono-code text-[#0D6E6E] font-bold">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-editorial text-base font-extrabold text-[#18181B] mt-0.5">
                      {item.title}
                    </h3>
                    <div className="text-xs font-mono-code text-neutral-600 flex items-center gap-3 mt-0.5">
                      <span>Speaker: <strong>{item.speaker}</strong></span>
                      <span>•</span>
                      <span>Location: <strong>{item.location}</strong></span>
                      {item.capacity && <span>• Status: <strong>{item.capacity}</strong></span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setEditingEvent(item)}
                    className="p-2 bg-[#FFF8E7] hover:bg-[#ffeec2] text-[#18181B] rounded-xl border border-[#18181B]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(item.id)}
                    className="p-2 bg-[#FDEEE9] hover:bg-[#fad3c8] text-[#E06D53] rounded-xl border border-[#E06D53]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TRIVIA & DAILY POLL SUB-TAB */}
      {activeSubTab === 'trivia' && (
        <div className="bg-white p-6 rounded-3xl simka-border simka-shadow-lg max-w-3xl space-y-5">
          <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-3">
            <div>
              <span className="bg-[#0D6E6E] text-white font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                ACTIVE DAILY POLL
              </span>
              <h2 className="font-editorial text-xl font-bold text-[#18181B] mt-1">
                Interactive Science Trivia Question
              </h2>
            </div>
            <span className="text-xs font-mono-code font-bold bg-[#F9C74F] px-3 py-1 rounded-lg border border-[#18181B]">
              Total Votes: {trivia.totalVotes}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
                Question Text
              </label>
              <textarea
                value={trivia.question}
                onChange={(e) => onUpdateTrivia({ ...trivia, question: e.target.value })}
                rows={2}
                className="w-full p-3 rounded-xl border-2 border-[#18181B] font-display font-bold text-sm focus:outline-none focus:border-[#0D6E6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-2">
                Answer Options & Vote Tally
              </label>
              <div className="space-y-2.5">
                {trivia.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-3 bg-[#F8F6F0] p-3 rounded-xl border-2 border-neutral-200">
                    <span className="font-mono-code font-bold text-xs text-neutral-500 w-6">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = trivia.options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o);
                        onUpdateTrivia({ ...trivia, options: newOpts });
                      }}
                      className="flex-1 p-1.5 bg-white rounded-lg border border-neutral-300 font-display font-bold text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs font-mono-code font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => {
                            const newOpts = trivia.options.map(o => ({ ...o, isCorrect: o.id === opt.id }));
                            onUpdateTrivia({ ...trivia, options: newOpts });
                          }}
                          className="w-4 h-4 text-[#0D6E6E]"
                        />
                        <span>Correct Answer</span>
                      </label>
                      <input
                        type="number"
                        value={opt.votes}
                        onChange={(e) => {
                          const votes = parseInt(e.target.value) || 0;
                          const newOpts = trivia.options.map(o => o.id === opt.id ? { ...o, votes } : o);
                          const total = newOpts.reduce((acc, curr) => acc + curr.votes, 0);
                          onUpdateTrivia({ ...trivia, options: newOpts, totalVotes: total });
                        }}
                        className="w-16 p-1 bg-white rounded border text-center font-mono-code font-bold text-xs"
                        title="Simulated Vote Count"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
                Educational Fun Fact (Revealed Post-Vote)
              </label>
              <textarea
                value={trivia.funFact}
                onChange={(e) => onUpdateTrivia({ ...trivia, funFact: e.target.value })}
                rows={2}
                className="w-full p-3 rounded-xl border-2 border-[#18181B] font-display text-xs text-neutral-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. ANNOUNCEMENTS SUB-TAB */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-display font-extrabold text-[#18181B]">
              Active Broadcast Notices ({announcements.length})
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setIsAddingAnnouncement(true);
              }}
              className="bg-[#F9C74F] hover:bg-[#e4b33c] text-[#18181B] px-4 py-2 rounded-xl simka-border-sm simka-shadow font-display font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Notice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div 
                key={ann.id}
                className="bg-white p-5 rounded-3xl simka-border simka-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#E06D53] text-white font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                      {ann.tag}
                    </span>
                    <span className="text-xs font-mono-code text-neutral-500">
                      {ann.timestamp}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-[#18181B] leading-tight mb-1">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                    {ann.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-3">
                  <span className="text-[11px] font-mono-code font-bold uppercase text-neutral-500">
                    Priority: {ann.priority}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingAnnouncement(ann)}
                      className="p-1.5 bg-[#FFF8E7] hover:bg-[#ffeec2] text-[#18181B] rounded-lg border border-[#18181B]"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 bg-[#FDEEE9] hover:bg-[#fad3c8] text-[#E06D53] rounded-lg border border-[#E06D53]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TICKER SUB-TAB */}
      {activeSubTab === 'ticker' && (
        <div className="bg-white p-6 rounded-3xl simka-border simka-shadow-lg max-w-4xl space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#18181B]">
              Scrolling Marquee Ticker Messages
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              These items continuously stream across the bottom bar of all fullscreen digital displays.
            </p>
          </div>

          {/* Add Ticker Form */}
          <form onSubmit={handleAddTicker} className="flex flex-wrap sm:flex-nowrap gap-3">
            <select
              value={newTickerCategory}
              onChange={(e) => setNewTickerCategory(e.target.value)}
              className="p-2.5 bg-[#F8F6F0] rounded-xl border-2 border-[#18181B] font-mono-code font-bold text-xs uppercase"
            >
              <option value="CAMPUS">CAMPUS</option>
              <option value="ALERT">ALERT</option>
              <option value="INFO">INFO</option>
              <option value="INTERACTIVE">INTERACTIVE</option>
              <option value="DINING">DINING</option>
              <option value="SUPPORT">SUPPORT</option>
            </select>
            <input
              type="text"
              placeholder="ENTER NEW TICKER HEADLINE (E.G. PLANETARIUM SHOW AT 16:00)..."
              value={newTickerText}
              onChange={(e) => setNewTickerText(e.target.value)}
              className="flex-1 p-2.5 bg-white rounded-xl border-2 border-[#18181B] font-display font-bold text-xs"
            />
            <button
              type="submit"
              className="bg-[#0D6E6E] text-white px-5 py-2.5 rounded-xl simka-border-sm simka-shadow font-display font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Ticker</span>
            </button>
          </form>

          {/* Current Ticker List */}
          <div className="space-y-2">
            {tickerItems.map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-[#F8F6F0] p-3 rounded-xl border-2 border-neutral-300 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono-code text-xs text-neutral-400 font-bold">
                    0{idx + 1}
                  </span>
                  <span className="bg-[#18181B] text-[#F9C74F] font-mono-code font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="font-display font-bold text-xs text-[#18181B] truncate">
                    {item.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTicker(item.id)}
                  className="p-1.5 text-neutral-400 hover:text-[#E06D53] hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXHIBIT */}
      {(isAddingExhibit || editingExhibit) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl simka-border simka-shadow-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-3">
              <h2 className="font-editorial text-xl font-bold text-[#18181B]">
                {editingExhibit ? 'Edit Exhibit Details' : 'Create New Exhibit Spotlight'}
              </h2>
              <button 
                onClick={() => { setEditingExhibit(null); setIsAddingExhibit(false); }}
                className="p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Exhibit Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const updated: ExhibitItem = {
                  id: editingExhibit?.id || `ex-${Date.now()}`,
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  subtitle: (form.elements.namedItem('subtitle') as HTMLInputElement).value,
                  description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
                  category: (form.elements.namedItem('category') as HTMLInputElement).value,
                  location: (form.elements.namedItem('location') as HTMLInputElement).value,
                  zone: (form.elements.namedItem('zone') as HTMLInputElement).value,
                  timeSlot: (form.elements.namedItem('timeSlot') as HTMLInputElement).value,
                  imageUrl: (form.elements.namedItem('imageUrl') as HTMLInputElement).value,
                  theme: (form.elements.namedItem('theme') as HTMLSelectElement).value as ColorTheme,
                  badgeText: (form.elements.namedItem('badgeText') as HTMLInputElement).value,
                  ageGroup: (form.elements.namedItem('ageGroup') as HTMLInputElement).value,
                  interactiveFeature: (form.elements.namedItem('interactiveFeature') as HTMLInputElement).value,
                  rating: '4.9 ★'
                };
                handleSaveExhibit(updated);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Exhibit Title
                  </label>
                  <input
                    name="title"
                    defaultValue={editingExhibit?.title || ''}
                    required
                    className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-display font-bold text-xs"
                    placeholder="e.g. Quantum Bioluminescence"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Editorial Subtitle
                  </label>
                  <input
                    name="subtitle"
                    defaultValue={editingExhibit?.subtitle || ''}
                    required
                    className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-display text-xs"
                    placeholder="e.g. Deep-Ocean Photonic Organisms"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                  Description Text
                </label>
                <textarea
                  name="description"
                  defaultValue={editingExhibit?.description || ''}
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-display text-xs"
                  placeholder="Explain the experience and visitor takeaway..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Category Tag
                  </label>
                  <input
                    name="category"
                    defaultValue={editingExhibit?.category || 'Biophysics Lab'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Location / Wing
                  </label>
                  <input
                    name="location"
                    defaultValue={editingExhibit?.location || 'Pavilion A • Zone 03'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Zone Code
                  </label>
                  <input
                    name="zone"
                    defaultValue={editingExhibit?.zone || 'Zone 03'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Hours / Time Slot
                  </label>
                  <input
                    name="timeSlot"
                    defaultValue={editingExhibit?.timeSlot || 'Open 10:00 - 18:00'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Badge Callout
                  </label>
                  <input
                    name="badgeText"
                    defaultValue={editingExhibit?.badgeText || 'HOT SPOT'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Age Group
                  </label>
                  <input
                    name="ageGroup"
                    defaultValue={editingExhibit?.ageGroup || 'All Ages'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                  High-Resolution Image URL
                </label>
                <input
                  name="imageUrl"
                  defaultValue={editingExhibit?.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'}
                  className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Color Accent Theme
                  </label>
                  <select
                    name="theme"
                    defaultValue={editingExhibit?.theme || 'teal'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-mono-code font-bold text-xs"
                  >
                    <option value="teal">Teal (#0D6E6E)</option>
                    <option value="yellow">Yellow (#F9C74F)</option>
                    <option value="coral">Coral (#E06D53)</option>
                    <option value="offwhite">Off-White (#FFFFFF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Interactive Feature CTA
                  </label>
                  <input
                    name="interactiveFeature"
                    defaultValue={editingExhibit?.interactiveFeature || 'Touch screen interaction'}
                    className="w-full p-2 rounded-xl border-2 border-[#18181B] font-display text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingExhibit(null); setIsAddingExhibit(false); }}
                  className="px-4 py-2 rounded-xl border-2 border-neutral-300 font-display font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0D6E6E] text-white px-5 py-2 rounded-xl simka-border-sm simka-shadow font-display font-bold text-xs uppercase"
                >
                  Save Exhibit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
