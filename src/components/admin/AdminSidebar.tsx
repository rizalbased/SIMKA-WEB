import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Layers, 
  CalendarClock, 
  MessageSquareText, 
  Settings, 
  Maximize, 
  Radio, 
  Tv,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { AdminTab } from '../../types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLaunchFullscreen: () => void;
  activeBoardName: string;
  totalSlidesCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLaunchFullscreen,
  activeBoardName,
  totalSlidesCount
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'beranda', label: 'BERANDA', icon: LayoutDashboard },
    { id: 'media', label: 'MEDIA', icon: FolderKanban, badge: 'Media' },
    { id: 'board-display', label: 'BOARD DISPLAY', icon: Layers, badge: `${totalSlidesCount} Slide` },
    { id: 'jadwal-les', label: 'JADWAL LES', icon: CalendarClock, badge: 'Realtime' },
    { id: 'running-text', label: 'RUNNING TEXT', icon: MessageSquareText, badge: 'Ticker' },
    { id: 'pengaturan', label: 'PENGATURAN', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#FFFDF9] border-r-2.5 border-[#18181B] p-4 flex flex-col justify-between flex-shrink-0">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 px-3 mb-2">
            NAVIGASI UTAMA
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all font-display font-bold text-sm ${
                    isActive
                      ? 'bg-[#0096D6] text-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]'
                      : 'hover:bg-[#F3EFE6] text-[#18181B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD166]' : 'text-neutral-700'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Button: Buka Layar Penuh */}
        <div className="pt-2">
          <button
            id="btn-sidebar-layar-penuh"
            onClick={onLaunchFullscreen}
            className="w-full bg-[#FFD166] text-[#18181B] font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
          >
            <Maximize className="w-4 h-4 text-[#18181B]" />
            <span>LAYAR PENUH (1080P)</span>
          </button>
        </div>

        {/* Live Channel Status Card */}
        <div className="bg-[#FFF8E7] p-3.5 rounded-2xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#0096D6] flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>BOARD AKTIF</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="font-display font-black text-xs text-[#18181B] mb-1 truncate">
            {activeBoardName}
          </div>
          <div className="text-[11px] font-mono text-neutral-600">
            Kanvas: <strong className="text-[#18181B]">1920 × 1080 PX</strong>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t-2 border-neutral-200 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
        <span>SIMKA Digital Signage</span>
        <span className="text-[#0096D6] font-bold">● Online</span>
      </div>
    </aside>
  );
};
