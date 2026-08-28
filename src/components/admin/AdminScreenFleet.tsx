import React, { useState } from 'react';
import { 
  Tv, 
  Plus, 
  RefreshCw, 
  RotateCw, 
  Sliders, 
  Sun, 
  Volume2, 
  Radio, 
  CheckCircle2, 
  Trash2, 
  Power, 
  Maximize, 
  Wifi, 
  ShieldCheck,
  X
} from 'lucide-react';
import { ScreenDevice, LayoutPresetId } from '../../types';

interface AdminScreenFleetProps {
  screens: ScreenDevice[];
  onUpdateScreens: (screens: ScreenDevice[]) => void;
}

export const AdminScreenFleet: React.FC<AdminScreenFleetProps> = ({
  screens,
  onUpdateScreens
}) => {
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const handleUpdateDevice = (id: string, updates: Partial<ScreenDevice>) => {
    onUpdateScreens(
      screens.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  };

  const handleDeleteDevice = (id: string) => {
    onUpdateScreens(screens.filter(s => s.id !== id));
  };

  const handleAddDevice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const location = (form.elements.namedItem('location') as HTMLInputElement).value;
    const resolution = (form.elements.namedItem('resolution') as HTMLSelectElement).value as any;
    const orientation = (form.elements.namedItem('orientation') as HTMLSelectElement).value as any;

    const newDevice: ScreenDevice = {
      id: `scr-${Date.now()}`,
      name,
      location,
      resolution,
      orientation,
      activePlaylistId: 'pl-main',
      activeLayout: orientation === 'portrait' ? 'layout-e-portrait' : 'layout-a-magazine',
      status: 'online',
      lastPing: 'Just now',
      pairingCode: `SIMKA-${Math.floor(1000 + Math.random() * 9000)}`,
      volume: 60,
      brightness: 90,
      autoRebootTime: '04:00 AM',
      ipAddress: `192.168.1.${Math.floor(100 + Math.random() * 50)}`
    };

    onUpdateScreens([...screens, newDevice]);
    setIsPairingModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Sync Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2.5 border-[#18181B] pb-4">
        <div>
          <h1 className="font-editorial text-2xl font-black text-[#18181B]">
            SCREEN FLEET & HARDWARE MANAGER
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Monitor, pair, and configure brightness, audio, layout overrides, and reboot policies across all physical monitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="bg-white hover:bg-neutral-100 text-[#18181B] px-4 py-2 rounded-xl simka-border-sm simka-shadow-sm font-display font-bold text-xs uppercase flex items-center gap-2 transition-transform active:translate-y-0.5"
          >
            <RefreshCw className={`w-4 h-4 text-[#0D6E6E] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Broadcasting Sync...' : 'Sync Fleet Now'}</span>
          </button>

          <button
            onClick={() => setIsPairingModalOpen(true)}
            className="bg-[#F9C74F] hover:bg-[#e4b33c] text-[#18181B] px-4 py-2 rounded-xl simka-border simka-shadow font-display font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Pair New Display</span>
          </button>
        </div>
      </div>

      {/* Screen Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {screens.map((device) => (
          <div 
            key={device.id}
            className="bg-white rounded-3xl simka-border simka-shadow-lg p-5 space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Header with status pill and orientation */}
              <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#18181B] text-[#F9C74F] flex items-center justify-center simka-shadow-sm">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-black text-[#18181B] leading-tight">
                      {device.name}
                    </h3>
                    <div className="text-xs font-mono-code text-neutral-500">
                      {device.location} • {device.ipAddress}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    device.status === 'online' ? 'bg-[#0D6E6E]' : 'bg-[#F9C74F] animate-ping'
                  }`} />
                  <span className="text-xs font-mono-code font-bold uppercase text-[#0D6E6E]">
                    {device.status}
                  </span>
                </div>
              </div>

              {/* Hardware Spec Badges */}
              <div className="grid grid-cols-3 gap-2 my-3 font-mono-code text-xs">
                <div className="bg-[#F8F6F0] p-2.5 rounded-xl border border-neutral-200">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Resolution</div>
                  <div className="font-bold text-[#18181B] mt-0.5">{device.resolution}</div>
                </div>
                <div className="bg-[#F8F6F0] p-2.5 rounded-xl border border-neutral-200">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Orientation</div>
                  <div className="font-bold text-[#0D6E6E] uppercase mt-0.5">{device.orientation}</div>
                </div>
                <div className="bg-[#FFF8E7] p-2.5 rounded-xl border border-[#18181B]">
                  <div className="text-[10px] text-neutral-500 font-bold uppercase">Pair Code</div>
                  <div className="font-bold text-[#18181B] mt-0.5">{device.pairingCode}</div>
                </div>
              </div>

              {/* Sliders: Brightness & Volume */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-neutral-700 w-28">
                    <Sun className="w-4 h-4 text-[#F9C74F]" />
                    <span>Brightness:</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={device.brightness}
                    onChange={(e) => handleUpdateDevice(device.id, { brightness: parseInt(e.target.value) })}
                    className="flex-1 accent-[#0D6E6E] cursor-pointer"
                  />
                  <span className="font-mono-code text-xs font-bold text-neutral-800 w-10 text-right">
                    {device.brightness}%
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-neutral-700 w-28">
                    <Volume2 className="w-4 h-4 text-[#0D6E6E]" />
                    <span>Audio Vol:</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={device.volume}
                    onChange={(e) => handleUpdateDevice(device.id, { volume: parseInt(e.target.value) })}
                    className="flex-1 accent-[#0D6E6E] cursor-pointer"
                  />
                  <span className="font-mono-code text-xs font-bold text-neutral-800 w-10 text-right">
                    {device.volume}%
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions: Layout Override & Delete */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code text-neutral-500 font-bold">Layout:</span>
                <select
                  value={device.activeLayout}
                  onChange={(e) => handleUpdateDevice(device.id, { activeLayout: e.target.value as LayoutPresetId })}
                  className="p-1 bg-[#F8F6F0] rounded-lg border border-neutral-300 text-xs font-display font-bold"
                >
                  <option value="layout-a-magazine">Layout A: Magazine Split</option>
                  <option value="layout-b-bento">Layout B: Triple Bento</option>
                  <option value="layout-c-hero">Layout C: Hero Bleed</option>
                  <option value="layout-d-quad">Layout D: Quad Matrix</option>
                  <option value="layout-e-portrait">Layout E: 9:16 Portrait</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateDevice(device.id, { status: device.status === 'online' ? 'standby' : 'online' })}
                  className={`p-1.5 rounded-lg border text-xs font-mono-code font-bold ${
                    device.status === 'online' ? 'bg-[#FFF8E7] text-[#18181B] border-[#18181B]' : 'bg-neutral-100 text-neutral-600'
                  }`}
                  title="Toggle Standby Power"
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  className="p-1.5 bg-[#FDEEE9] text-[#E06D53] hover:bg-[#fad3c8] rounded-lg border border-[#E06D53]"
                  title="Unpair Device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAIRING MODAL */}
      {isPairingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl simka-border simka-shadow-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#0D6E6E]" />
                <h2 className="font-editorial text-xl font-bold text-[#18181B]">
                  Pair New Signage Monitor
                </h2>
              </div>
              <button 
                onClick={() => setIsPairingModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
                  Device Display Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. West Wing Gallery Totem 02"
                  className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-display font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
                  Location / Physical Area
                </label>
                <input
                  name="location"
                  required
                  placeholder="e.g. Bio-Lab Corridor • Level 2"
                  className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-mono-code text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Native Resolution
                  </label>
                  <select
                    name="resolution"
                    className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-mono-code font-bold text-xs"
                  >
                    <option value="1920x1080">1920 × 1080 FHD</option>
                    <option value="3840x2160">3840 × 2160 4K UHD</option>
                    <option value="1080x1920">1080 × 1920 Portrait</option>
                    <option value="2560x1080">2560 × 1080 Ultrawide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
                    Screen Orientation
                  </label>
                  <select
                    name="orientation"
                    className="w-full p-2.5 rounded-xl border-2 border-[#18181B] font-mono-code font-bold text-xs"
                  >
                    <option value="landscape">Landscape (Horizontal)</option>
                    <option value="portrait">Portrait (Vertical Totem)</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#18181B] text-xs font-mono-code text-neutral-700">
                A 4-digit pairing PIN code will be automatically provisioned for remote handshake.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPairingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-neutral-300 font-display font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0D6E6E] text-white px-5 py-2 rounded-xl simka-border-sm simka-shadow font-display font-bold text-xs uppercase"
                >
                  Pair Display
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
