import React, { useState } from 'react';
import { 
  ListMusic, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Clock, 
  LayoutGrid, 
  CheckCircle2, 
  Play, 
  Layers, 
  Sliders, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  PlaylistItem, 
  ExhibitItem, 
  LayoutPresetId, 
  DisplayConfig,
  ColorTheme
} from '../../types';

interface AdminPlaylistBuilderProps {
  playlist: PlaylistItem[];
  onUpdatePlaylist: (playlist: PlaylistItem[]) => void;
  exhibits: ExhibitItem[];
  config: DisplayConfig;
  onUpdateConfig: (config: Partial<DisplayConfig>) => void;
}

export const AdminPlaylistBuilder: React.FC<AdminPlaylistBuilderProps> = ({
  playlist,
  onUpdatePlaylist,
  exhibits,
  config,
  onUpdateConfig
}) => {
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(playlist[0]?.id || null);

  const totalCycleSeconds = playlist
    .filter(p => p.enabled)
    .reduce((acc, curr) => acc + curr.durationSec, 0);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...playlist];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    onUpdatePlaylist(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === playlist.length - 1) return;
    const newItems = [...playlist];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    onUpdatePlaylist(newItems);
  };

  const handleToggleEnable = (id: string) => {
    onUpdatePlaylist(
      playlist.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    );
  };

  const handleDurationChange = (id: string, durationSec: number) => {
    onUpdatePlaylist(
      playlist.map(item => item.id === id ? { ...item, durationSec } : item)
    );
  };

  const handleLayoutChange = (id: string, layout: LayoutPresetId) => {
    onUpdatePlaylist(
      playlist.map(item => item.id === id ? { ...item, layout } : item)
    );
  };

  const handleAddSlide = () => {
    const newSlide: PlaylistItem = {
      id: `pl-${Date.now()}`,
      slideId: `slide-${playlist.length + 1}`,
      contentId: exhibits[0]?.id || 'ex-1',
      contentType: 'exhibit',
      title: `Slide #${playlist.length + 1} Spotlight`,
      durationSec: 10,
      layout: 'layout-a-magazine',
      theme: 'teal',
      enabled: true
    };
    onUpdatePlaylist([...playlist, newSlide]);
    setSelectedSlideId(newSlide.id);
  };

  const handleDeleteSlide = (id: string) => {
    if (playlist.length <= 1) return;
    onUpdatePlaylist(playlist.filter(p => p.id !== id));
  };

  const layouts: { id: LayoutPresetId; label: string }[] = [
    { id: 'layout-3-photos', label: 'Display 3 Foto (Reference 1)' },
    { id: 'layout-video', label: 'Video Fullscreen (Reference 2)' },
    { id: 'layout-photo-schedule', label: 'Foto + Jadwal Les' },
    { id: 'layout-3-posters', label: '3 Poster Informasi' },
    { id: 'layout-single-poster', label: 'Poster Tunggal Resmi' },
    { id: 'layout-photo-grid', label: 'Grid 4 Foto Dokumentasi' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Title & Stats Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2.5 border-[#18181B] pb-4">
        <div>
          <h1 className="font-editorial text-2xl font-black text-[#18181B]">
            PLAYLIST & TIMELINE SEQUENCER
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Configure slide order, display durations, layout per slide, and transitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FFF8E7] px-4 py-2 rounded-xl simka-border-sm font-mono-code text-xs font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0D6E6E]" />
            <span>Total Cycle: <strong>{totalCycleSeconds}s</strong> (~{Math.round(totalCycleSeconds / 60 * 10) / 10}m)</span>
          </div>
          <button
            onClick={handleAddSlide}
            className="bg-[#F9C74F] hover:bg-[#e4b33c] text-[#18181B] px-4 py-2 rounded-xl simka-border simka-shadow font-display font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide to Timeline</span>
          </button>
        </div>
      </div>

      {/* Global Transition & Speed Settings */}
      <div className="bg-white p-5 rounded-3xl simka-border simka-shadow flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-[#0D6E6E]" />
          <div>
            <div className="font-display font-extrabold text-sm text-[#18181B]">
              Slide Transition Engine
            </div>
            <div className="text-xs text-neutral-500">
              Select animation type between screen advances
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(['fade', 'slide', 'zoom'] as const).map((effect) => (
            <button
              key={effect}
              onClick={() => onUpdateConfig({ transitionEffect: effect })}
              className={`px-3.5 py-1.5 rounded-xl font-mono-code font-bold text-xs uppercase border-2 transition-all ${
                config.transitionEffect === effect
                  ? 'bg-[#0D6E6E] text-white border-[#18181B] simka-shadow-sm'
                  : 'bg-[#F8F6F0] text-[#18181B] border-neutral-300'
              }`}
            >
              {effect} transition
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Timeline Sequence List */}
      <div className="space-y-3">
        {playlist.map((item, index) => {
          const matchingExhibit = exhibits.find(e => e.id === item.contentId) || exhibits[0];

          return (
            <div
              key={item.id}
              onClick={() => setSelectedSlideId(item.id)}
              className={`p-4 rounded-3xl border-2.5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                item.enabled
                  ? 'bg-white border-[#18181B] simka-shadow'
                  : 'bg-neutral-100 border-neutral-300 opacity-60'
              }`}
            >
              {/* Left Order Number & Slide Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono-code font-black text-lg text-neutral-400 w-7 text-center">
                    0{index + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-neutral-100 disabled:opacity-30 rounded"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                      disabled={index === playlist.length - 1}
                      className="p-1 hover:bg-neutral-100 disabled:opacity-30 rounded"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exhibit Thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-[#18181B]">
                  <img
                    src={matchingExhibit?.imageUrl || undefined}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-base font-extrabold text-[#18181B] truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono-code font-bold uppercase bg-[#E6F4F1] text-[#0D6E6E] px-2 py-0.5 rounded">
                      {item.layout.replace('layout-', '')}
                    </span>
                  </div>
                  <div className="text-xs font-mono-code text-neutral-500 truncate mt-0.5">
                    Linked Content: <strong>{matchingExhibit?.title}</strong> ({matchingExhibit?.location})
                  </div>
                </div>
              </div>

              {/* Right Controls: Duration, Layout Selector, Enable Toggle */}
              <div className="flex flex-wrap items-center gap-4 self-end lg:self-center">
                {/* Content Link Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono-code text-neutral-500 font-bold">Content:</span>
                  <select
                    value={item.contentId}
                    onChange={(e) => {
                      const selectedEx = exhibits.find(ex => ex.id === e.target.value);
                      onUpdatePlaylist(
                        playlist.map(p => p.id === item.id ? { 
                          ...p, 
                          contentId: e.target.value,
                          title: selectedEx ? selectedEx.title : p.title 
                        } : p)
                      );
                    }}
                    className="p-1.5 bg-[#F8F6F0] rounded-xl border border-[#18181B] text-xs font-display font-bold"
                  >
                    {exhibits.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Layout Preset Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono-code text-neutral-500 font-bold">Layout:</span>
                  <select
                    value={item.layout}
                    onChange={(e) => handleLayoutChange(item.id, e.target.value as LayoutPresetId)}
                    className="p-1.5 bg-[#F8F6F0] rounded-xl border border-[#18181B] text-xs font-display font-bold"
                  >
                    {layouts.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Slider / Input */}
                <div className="flex items-center gap-2 bg-[#FFF8E7] px-3 py-1.5 rounded-xl border border-[#18181B]">
                  <Clock className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <input
                    type="range"
                    min={5}
                    max={40}
                    step={1}
                    value={item.durationSec}
                    onChange={(e) => handleDurationChange(item.id, parseInt(e.target.value))}
                    className="w-20 accent-[#0D6E6E] cursor-pointer"
                  />
                  <span className="font-mono-code font-bold text-xs text-[#18181B] w-8">
                    {item.durationSec}s
                  </span>
                </div>

                {/* Toggle Enable Checkbox */}
                <button
                  onClick={() => handleToggleEnable(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs uppercase border-2 transition-all ${
                    item.enabled
                      ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                      : 'bg-white text-neutral-600 border-neutral-300'
                  }`}
                >
                  {item.enabled ? 'Active' : 'Disabled'}
                </button>

                {/* Delete Slide */}
                <button
                  onClick={() => handleDeleteSlide(item.id)}
                  className="p-2 text-neutral-400 hover:text-[#E06D53] hover:bg-neutral-100 rounded-xl"
                  title="Remove from playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
