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
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { mediaService } from './services/mediaService';
import { videoService } from './services/videoService';
import { slideService } from './services/slideService';
import { runningTextService } from './services/runningTextService';
import { jadwalService } from './services/jadwalService';
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

  // Load initial data from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.info('Supabase not configured. Using local data.');
      return;
    }

    const initData = async () => {
      try {
        // Fetch all data in parallel
        const [dbMedia, dbBoards, dbRunningText, dbJadwal] = await Promise.all([
          mediaService.getAllMedia(),
          slideService.getBoards(),
          runningTextService.getRunningText(),
          jadwalService.getJadwal()
        ]);

        if (dbMedia.length > 0) setMediaLibrary(dbMedia);
        if (dbBoards.length > 0) setBoards(dbBoards);
        if (dbJadwal.length > 0) setLessonPeriods(dbJadwal);
        if (dbRunningText.length > 0) {
          // Sync config running text with first active running text
          const activeText = dbRunningText.find(t => t.is_active);
          if (activeText) {
            handleUpdateConfig({ runningTextContent: activeText.content });
          }
        }
      } catch (err) {
        console.error('Error initializing Supabase data:', err);
      }
    };

    initData();

    // Set up Realtime Subscriptions
    const mediaSub = supabase.channel('public:media')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, () => {
        mediaService.getAllMedia().then(setMediaLibrary);
      })
      .subscribe();

    const slidesSub = supabase.channel('public:slides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slides' }, () => {
        slideService.getBoards().then(setBoards);
      })
      .subscribe();

    const runningTextSub = supabase.channel('public:running_text')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'running_text' }, () => {
        runningTextService.getRunningText().then(data => {
          const activeText = data.find(t => t.is_active);
          if (activeText) {
            handleUpdateConfig({ runningTextContent: activeText.content });
          }
        });
      })
      .subscribe();

    const jadwalSub = supabase.channel('public:jadwal_les')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jadwal_les' }, () => {
        jadwalService.getJadwal().then(setLessonPeriods);
      })
      .subscribe();

    const videosSub = supabase.channel('public:videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        videoService.getAllVideos().then(setMediaLibrary);
      })
      .subscribe();

    return () => {
      mediaSub.unsubscribe();
      slidesSub.unsubscribe();
      runningTextSub.unsubscribe();
      jadwalSub.unsubscribe();
      videosSub.unsubscribe();
    };
  }, []);

  const [lessonPeriods, setLessonPeriods] = useState<LessonPeriod[]>(INITIAL_LESSON_PERIODS);
  const [screens, setScreens] = useState<ScreenDevice[]>(INITIAL_SCREENS);

  // Local storage persistence (Optional fallback)
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
