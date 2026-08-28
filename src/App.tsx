import React, { useState, useEffect } from 'react';
import { 
  DisplayMode, 
  AdminTab, 
  DisplayConfig, 
  BoardItem,
  MediaItem,
  LessonPeriod,
  ScreenDevice
} from './types';
import { 
  INITIAL_BOARDS,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_LESSON_PERIODS,
  INITIAL_SCREENS, 
  INITIAL_CONFIG 
} from './data/initialData';
import { mediaDb } from './lib/mediaDb';
import { FullscreenDisplay } from './components/display/FullscreenDisplay';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminMediaLibrary } from './components/admin/AdminMediaLibrary';
import { AdminBoardDisplay } from './components/admin/AdminBoardDisplay';
import { AdminJadwalLes } from './components/admin/AdminJadwalLes';
import { AdminRunningText } from './components/admin/AdminRunningText';
import { AdminSettings } from './components/admin/AdminSettings';

export default function App() {
  // Primary Mode: Admin vs Fullscreen Digital Signage
  const [mode, setMode] = useState<DisplayMode>('admin');
  const [activeTab, setActiveTab] = useState<AdminTab>('beranda');

  // Application Data States with LocalStorage Persistence
  const [config, setConfig] = useState<DisplayConfig>(() => {
    const saved = localStorage.getItem('simka_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [boards, setBoards] = useState<BoardItem[]>(() => {
    const saved = localStorage.getItem('simka_boards');
    return saved ? JSON.parse(saved) : INITIAL_BOARDS;
  });

  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('simka_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA_LIBRARY;
  });

  // Persistent Media Loading & URL Re-mapping
  useEffect(() => {
    const loadPersistentMedia = async () => {
      try {
        const storedMedia = await mediaDb.getAllMedia();
        if (storedMedia.length === 0) return;

        // 1. Create new object URLs and map IDs to them
        const idToNewUrl: Record<string, string> = {};
        const persistentItems: MediaItem[] = storedMedia.map(item => {
          const newUrl = URL.createObjectURL(item.blob);
          idToNewUrl[item.id] = newUrl;
          return {
            id: item.id,
            title: item.title,
            type: item.type,
            url: newUrl,
            category: item.type === 'foto' ? 'Dokumentasi' : item.type === 'video' ? 'Kegiatan' : 'Pengumuman',
            dimensions: `${item.width} × ${item.height} px`,
            size: (item.fileSize / (1024 * 1024)).toFixed(1) + ' MB',
            orientation: item.orientation,
            dateAdded: item.createdAt.split('T')[0]
          };
        });

        // 2. Bridge old URLs to new URLs using the stored media library from localStorage
        const oldMediaLibraryRaw = localStorage.getItem('simka_media');
        if (oldMediaLibraryRaw) {
          const oldMediaLibrary: MediaItem[] = JSON.parse(oldMediaLibraryRaw);
          const oldUrlToNewUrl: Record<string, string> = {};
          
          oldMediaLibrary.forEach(oldItem => {
            if (idToNewUrl[oldItem.id]) {
              oldUrlToNewUrl[oldItem.url] = idToNewUrl[oldItem.id];
            }
          });

          // 3. Update Boards content with the new URLs
          setBoards(prevBoards => {
            return prevBoards.map(board => ({
              ...board,
              slides: board.slides.map(slide => {
                const content = { ...slide.content };
                let changed = false;

                const replaceUrl = (url: string) => {
                  if (url && oldUrlToNewUrl[url]) {
                    changed = true;
                    return oldUrlToNewUrl[url];
                  }
                  return url;
                };

                if (content.photos) content.photos = content.photos.map(replaceUrl) as any;
                if (content.videoUrl) content.videoUrl = replaceUrl(content.videoUrl);
                if (content.posterUrl) content.posterUrl = replaceUrl(content.posterUrl);
                if (content.posters) content.posters = content.posters.map(replaceUrl) as any;
                if (content.gridPhotos) content.gridPhotos = content.gridPhotos.map(replaceUrl) as any;
                if (content.splitPhotoUrl) content.splitPhotoUrl = replaceUrl(content.splitPhotoUrl);

                return changed ? { ...slide, content } : slide;
              })
            }));
          });
        }

        // 4. Update Media Library state with the newly created URLs
        setMediaLibrary(prev => {
          const others = prev.filter(p => !idToNewUrl[p.id]);
          return [...persistentItems, ...others];
        });

      } catch (error) {
        console.error('Failed to load or migrate persistent media:', error);
      }
    };

    loadPersistentMedia();
  }, []);

  const [lessonPeriods, setLessonPeriods] = useState<LessonPeriod[]>(() => {
    const saved = localStorage.getItem('simka_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSON_PERIODS;
  });

  const [screens, setScreens] = useState<ScreenDevice[]>(() => {
    const saved = localStorage.getItem('simka_screens');
    return saved ? JSON.parse(saved) : INITIAL_SCREENS;
  });

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem('simka_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('simka_boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('simka_media', JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  useEffect(() => {
    localStorage.setItem('simka_lessons', JSON.stringify(lessonPeriods));
  }, [lessonPeriods]);

  useEffect(() => {
    localStorage.setItem('simka_screens', JSON.stringify(screens));
  }, [screens]);

  // Global Keyboard listener: Escape returns to admin when in display mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'display') {
        setMode('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  // Update Config Helper
  const handleUpdateConfig = (newConfig: Partial<DisplayConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Set Active Board Helper
  const handleSetActiveBoard = (boardId: string) => {
    setBoards(prev => prev.map(b => ({
      ...b,
      isActive: b.id === boardId
    })));
    setConfig(prev => ({
      ...prev,
      activeBoardId: boardId
    }));
  };

  // Find active board
  const activeBoard = boards.find(b => b.id === config.activeBoardId) || boards.find(b => b.isActive) || boards[0];
  const activeBoardName = activeBoard?.name || 'Papan Utama';
  const totalSlidesCount = activeBoard?.slides?.filter(s => s.enabled)?.length || 0;

  // MODE 2: FULLSCREEN DISPLAY SIGNAGE
  if (mode === 'display') {
    return (
      <FullscreenDisplay
        config={config}
        boards={boards}
        activeBoardId={config.activeBoardId}
        lessonPeriods={lessonPeriods}
        onOpenAdmin={() => setMode('admin')}
        onUpdateConfig={handleUpdateConfig}
      />
    );
  }

  // MODE 1: ADMIN CONTROL PANEL
  return (
    <div id="simka-admin-app-root" className="min-h-screen bg-[#F8F6F0] text-[#18181B] flex flex-col font-sans selection:bg-[#00E5FF] selection:text-black">
      {/* 1. Header Admin Bar */}
      <AdminHeader
        config={config}
        activeBoardName={activeBoardName}
        onUpdateConfig={handleUpdateConfig}
        onSwitchMode={setMode}
      />

      {/* 2. Admin Workspace: Sidebar + Dynamic Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLaunchFullscreen={() => setMode('display')}
          activeBoardName={activeBoardName}
          totalSlidesCount={totalSlidesCount}
        />

        {/* Dynamic Admin View */}
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5] p-4 sm:p-6 lg:p-8">
          {activeTab === 'beranda' && (
            <AdminDashboard
              boards={boards}
              activeBoardId={config.activeBoardId}
              mediaLibrary={mediaLibrary}
              lessonPeriods={lessonPeriods}
              screens={screens}
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onLaunchFullscreen={() => setMode('display')}
            />
          )}

          {activeTab === 'media' && (
            <AdminMediaLibrary
              mediaLibrary={mediaLibrary}
              onUpdateMediaLibrary={setMediaLibrary}
              boards={boards}
            />
          )}

          {activeTab === 'board-display' && (
            <AdminBoardDisplay
              boards={boards}
              activeBoardId={config.activeBoardId}
              config={config}
              mediaLibrary={mediaLibrary}
              lessonPeriods={lessonPeriods}
              onUpdateBoards={setBoards}
              onUpdateMediaLibrary={setMediaLibrary}
              onSetActiveBoard={handleSetActiveBoard}
              onLaunchFullscreen={() => setMode('display')}
            />
          )}

          {activeTab === 'jadwal-les' && (
            <AdminJadwalLes
              lessonPeriods={lessonPeriods}
              onUpdateLessonPeriods={setLessonPeriods}
            />
          )}

          {activeTab === 'running-text' && (
            <AdminRunningText
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />
          )}

          {activeTab === 'pengaturan' && (
            <AdminSettings
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
}
