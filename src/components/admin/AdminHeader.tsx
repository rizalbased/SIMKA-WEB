import React from 'react';
import { 
  ShieldAlert, 
  Maximize,
  User as UserIcon,
  BadgeCheck
} from 'lucide-react';
import { AdminProfile, DisplayConfig, DisplayMode } from '../../types';

interface AdminHeaderProps {
  config: DisplayConfig;
  activeBoardName: string;
  onUpdateConfig: (config: Partial<DisplayConfig>) => void;
  onSwitchMode: (mode: DisplayMode) => void;
  userProfile: AdminProfile | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  config,
  activeBoardName,
  onUpdateConfig,
  onSwitchMode,
  userProfile
}) => {
  return (
    <header className="bg-white border-b-2.5 border-[#18181B] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-30 flex-shrink-0">
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-[#0A192F] text-white px-3.5 py-1.5 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
          <span className="font-display text-xl font-black tracking-wider text-[#FFD166]">
            SIMKA
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0096D6] text-white px-2 py-0.5 rounded">
            STUDIO
          </span>
        </div>

        <div className="hidden sm:flex flex-col">
          <div className="text-xs font-mono font-bold uppercase text-[#18181B]/60 flex items-center gap-1.5">
            <span>SISTEM DISPLAY SIGNAGE</span>
            <span>•</span>
            <span className="text-[#0096D6] font-bold">{config.headerLeftText || 'SIMKA'}</span>
          </div>
          <div className="text-xs font-display font-extrabold text-[#18181B]">
            {activeBoardName || config.headerCenterText || 'Pusat Informasi EMKA'}
          </div>
        </div>
      </div>

      {/* Center Broadcast Status Indicator - User Info */}
      <div className="hidden lg:flex items-center gap-3 bg-[#F8F6F0] px-3.5 py-1.5 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FFD166] border-2 border-[#18181B] flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-[#18181B]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-[#18181B] uppercase leading-none mb-0.5">
              AKTIF SEBAGAI
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black font-display text-[#18181B]">
                {userProfile?.name || 'User'}
              </span>
              {userProfile?.role === 'admin' && (
                <BadgeCheck className="w-3 h-3 text-[#0096D6]" />
              )}
            </div>
          </div>
        </div>
        <span className="text-neutral-300">|</span>
        <div className="text-[10px] font-mono font-bold text-[#0096D6] uppercase px-2 py-0.5 rounded bg-[#0096D6]/10 border border-[#0096D6]/20">
          {userProfile?.role || 'Guest'}
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Emergency Broadcast Toggle Button - Only for Admins */}
        {userProfile?.role === 'admin' && (
          <button
            id="btn-toggle-darurat"
            onClick={() => onUpdateConfig({ emergencyOverride: !config.emergencyOverride })}
            className={`px-3.5 py-2 rounded-xl text-xs font-display font-black uppercase flex items-center gap-1.5 transition-all border-2 border-[#18181B] ${
              config.emergencyOverride
                ? 'bg-[#E06D53] text-white animate-pulse shadow-[2px_2px_0px_#18181B]'
                : 'bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] shadow-[2px_2px_0px_#18181B]'
            }`}
            title="Tombol Pengambilalihan Siaran Darurat"
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">
              {config.emergencyOverride ? 'DARURAT AKTIF' : 'SIARAN DARURAT'}
            </span>
          </button>
        )}

        {/* Launch Fullscreen Display Button */}
        <button
          id="btn-header-layar-penuh"
          onClick={() => onSwitchMode('display')}
          className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 transition-all border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] hover:translate-y-[-1px] active:translate-y-[1px]"
        >
          <Maximize className="w-4 h-4 text-[#FFD166]" />
          <span>BUKA LAYAR PENUH</span>
        </button>
      </div>
    </header>
  );
};
