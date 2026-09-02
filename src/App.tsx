import React, { useState, useEffect } from 'react';
import { 
  DisplayMode, 
  AdminTab, 
  DisplayConfig, 
  BoardItem,
  MediaItem,
  LessonPeriod,
  ScreenDevice,
  AdminProfile
} from './types';
import { 
  INITIAL_BOARDS,
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
import { Login } from './components/auth/Login';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Primary Mode: Admin vs Fullscreen Digital Signage
  const [mode, setMode] = useState<DisplayMode>('login');
  const [activeTab, setActiveTab] = useState<AdminTab>('beranda');
  const [userProfile, setUserProfile] = useState<AdminProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Application Data States
  const [config, setConfig] = useState<DisplayConfig>(INITIAL_CONFIG);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [lessonPeriods, setLessonPeriods] = useState<LessonPeriod[]>(INITIAL_LESSON_PERIODS);
  const [screens, setScreens] = useState<ScreenDevice[]>(INITIAL_SCREENS);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        if (data.is_active) {
          setUserProfile(data);
          setMode('admin');
        } else {
          await supabase.auth.signOut();
          setUserProfile(null);
          setMode('login');
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setMode('login');
    }
  };

  // Load initial data from Supabase
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');

    // Handle initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (modeParam === 'display') {
        setMode('display');
        setIsInitializing(false);
      } else if (session) {
        await fetchUserProfile(session.user.id);
        setIsInitializing(false);
      } else {
        setMode('login');
        setIsInitializing(false);
      }
    };

    checkSession();

    // Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        if (modeParam !== 'display') {
          setMode('login');
        }
      }
    });

    if (!isSupabaseConfigured()) {
      console.info('Supabase not configured. Using fallback data.');
      return;
    }

    const refreshMedia = async () => {
      const [photos, videos] = await Promise.all([
        mediaService.getAllMedia(),
        videoService.getAllVideos()
      ]);
      
      const combinedMedia: MediaItem[] = [
        ...photos,
        ...videos.map((v: any) => ({
          id: v.id,
          title: v.title,
          type: 'video' as const,
          url: v.url,
          filePath: v.file_path,
          category: 'Video',
          dimensions: `${v.width} × ${v.height}`,
          size: (v.file_size / (1024 * 1024)).toFixed(1) + ' MB',
          dateAdded: v.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }))
      ];
      
      setMediaLibrary(combinedMedia);
    };

    const initData = async () => {
      try {
        // Fetch all data in parallel
        const [dbBoards, dbRunningText, dbJadwal] = await Promise.all([
          slideService.getBoards(),
          runningTextService.getRunningText(),
          jadwalService.getJadwal()
        ]);

        await refreshMedia();
        setBoards(dbBoards.length > 0 ? dbBoards : INITIAL_BOARDS);
        if (dbJadwal.length > 0) setLessonPeriods(dbJadwal);
        
        if (dbRunningText.length > 0) {
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
    const mediaChannel = supabase.channel('media-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, () => refreshMedia())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => refreshMedia())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slides' }, () => slideService.getBoards().then(setBoards))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slide_media' }, () => slideService.getBoards().then(setBoards))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'running_text' }, () => {
        runningTextService.getRunningText().then(data => {
          const activeText = data.find(t => t.is_active);
          if (activeText) handleUpdateConfig({ runningTextContent: activeText.content });
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jadwal_les' }, () => {
        jadwalService.getJadwal().then(setLessonPeriods);
      })
      .on('postgres_changes', { event: '*', schema: 'storage', table: 'objects', filter: 'bucket_id=eq.galeri-emka' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const filePath = payload.old?.name;
          if (filePath) {
            supabase.from('media').delete().eq('file_path', filePath).then(() => refreshMedia());
            supabase.from('videos').delete().eq('file_path', filePath).then(() => refreshMedia());
          }
        } else {
          refreshMedia();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
      subscription.unsubscribe();
    };
  }, []);

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
        const checkAuth = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setMode('admin');
          } else {
            setMode('login');
          }
        };
        checkAuth();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setMode('login');
  };

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
  const activeBoard = boards.find(b => b.id === config.activeBoardId) || boards.find(b => b.isActive) || boards[0] || INITIAL_BOARDS[0];
  const activeBoardName = activeBoard?.name || 'Papan Utama';
  const totalSlidesCount = activeBoard?.slides?.filter(s => s.enabled)?.length || 0;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-[#0096D6] animate-spin mb-4" />
        <p className="text-sm font-black font-display text-[#18181B] uppercase tracking-widest">
          MENYIAPKAN SIMKA...
        </p>
      </div>
    );
  }

  // MODE 3: LOGIN
  if (mode === 'login') {
    return <Login onLoginSuccess={() => setMode('admin')} />;
  }

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
        userProfile={userProfile}
      />

      {/* 2. Admin Workspace: Sidebar + Dynamic Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLaunchFullscreen={() => setMode('display')}
          onLogout={handleLogout}
          activeBoardName={activeBoardName}
          totalSlidesCount={totalSlidesCount}
          userRole={userProfile?.role || 'user'}
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
              userRole={userProfile?.role || 'user'}
            />
          )}

          {activeTab === 'media' && (
            <AdminMediaLibrary
              mediaLibrary={mediaLibrary}
              onUpdateMediaLibrary={setMediaLibrary}
              boards={boards}
              userRole={userProfile?.role || 'user'}
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
              onUpdateConfig={handleUpdateConfig}
              onSetActiveBoard={handleSetActiveBoard}
              onLaunchFullscreen={() => setMode('display')}
              userRole={userProfile?.role || 'user'}
            />
          )}

          {activeTab === 'jadwal-les' && (
            <AdminJadwalLes
              lessonPeriods={lessonPeriods}
              onUpdateLessonPeriods={setLessonPeriods}
              userRole={userProfile?.role || 'user'}
            />
          )}

          {activeTab === 'running-text' && (
            <AdminRunningText
              config={config}
              onUpdateConfig={handleUpdateConfig}
              userRole={userProfile?.role || 'user'}
            />
          )}

          {activeTab === 'pengaturan' && (
            <AdminSettings
              config={config}
              onUpdateConfig={handleUpdateConfig}
              userRole={userProfile?.role || 'user'}
            />
          )}
        </main>
      </div>
    </div>
  );
}
