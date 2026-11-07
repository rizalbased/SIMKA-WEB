import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { slideService } from '../../services/slideService';
import { runningTextService } from '../../services/runningTextService';
import { jadwalService } from '../../services/jadwalService';
import { settingsService } from '../../services/settingsService';
import { realtimeSyncService, SyncPayload } from '../../services/realtimeSyncService';
import { FullscreenDisplay } from './FullscreenDisplay';
import { DisplayConfig, BoardItem, LessonPeriod } from '../../types';
import { INITIAL_CONFIG, INITIAL_LESSON_PERIODS } from '../../data/initialData';
import { Loader2 } from 'lucide-react';

export const StandaloneFullscreen: React.FC = () => {
  const [config, setConfig] = useState<DisplayConfig>(INITIAL_CONFIG);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [lessonPeriods, setLessonPeriods] = useState<LessonPeriod[]>(INITIAL_LESSON_PERIODS);
  const [activeBoardIdOverride, setActiveBoardIdOverride] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Cached JSON strings to avoid unnecessary re-renders during quiet polling
  const lastBoardsJsonRef = useRef<string>('');
  const lastJadwalJsonRef = useRef<string>('');
  const lastRunningTextRef = useRef<string>('');
  const isFetchingRef = useRef<boolean>(false);

  // Helper to fetch all data cleanly
  const fetchAllData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current && !isInitial) return;
    isFetchingRef.current = true;

    try {
      const [
        dbBoards, 
        dbRunningText, 
        dbJadwal, 
        dbHeaderTheme, 
        dbRunningTextConfig,
        dbActiveBoardId
      ] = await Promise.all([
        slideService.getBoards(),
        runningTextService.getRunningText(),
        jadwalService.getJadwal(),
        settingsService.getHeaderTheme(),
        settingsService.getRunningTextConfig(),
        settingsService.getActiveBoardId()
      ]);

      if (dbBoards && dbBoards.length > 0) {
        const boardsStr = JSON.stringify(dbBoards);
        if (boardsStr !== lastBoardsJsonRef.current) {
          lastBoardsJsonRef.current = boardsStr;
          setBoards(dbBoards);
        }
      }

      if (dbActiveBoardId) {
        setActiveBoardIdOverride(dbActiveBoardId);
      }

      const activeText = dbRunningText?.find(t => t.is_active);
      const activeContent = activeText ? activeText.content : '';

      setConfig(prev => {
        const updates: any = {
          headerThemeConfig: dbHeaderTheme || prev.headerThemeConfig,
          runningTextContent: activeContent
        };
        
        if (dbRunningTextConfig) {
          Object.assign(updates, dbRunningTextConfig);
        }
        
        return { ...prev, ...updates };
      });

      if (dbJadwal && dbJadwal.length > 0) {
        const jadwalStr = JSON.stringify(dbJadwal);
        if (jadwalStr !== lastJadwalJsonRef.current) {
          lastJadwalJsonRef.current = jadwalStr;
          setLessonPeriods(dbJadwal);
        }
      }
    } catch (err) {
      console.error('[StandaloneFullscreen] Error fetching fullscreen data:', err);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) {
        setIsInitializing(false);
      }
    }
  }, []);

  // Dedicated reloaders for targeted updates
  const reloadSlides = useCallback(async () => {
    try {
      const [dbBoards, dbActiveBoardId] = await Promise.all([
        slideService.getBoards(),
        settingsService.getActiveBoardId()
      ]);
      if (dbBoards) {
        const boardsStr = JSON.stringify(dbBoards);
        if (boardsStr !== lastBoardsJsonRef.current) {
          lastBoardsJsonRef.current = boardsStr;
          setBoards(dbBoards);
        }
      }
      if (dbActiveBoardId) {
        setActiveBoardIdOverride(dbActiveBoardId);
      }
    } catch (err) {
      console.warn('[StandaloneFullscreen] Error reloading slides:', err);
    }
  }, []);

  const reloadRunningText = useCallback(async () => {
    try {
      const dbRunningText = await runningTextService.getRunningText();
      const activeText = dbRunningText?.find(t => t.is_active);
      const content = activeText ? activeText.content : '';
      if (content !== lastRunningTextRef.current) {
        lastRunningTextRef.current = content;
        setConfig(prev => ({
          ...prev,
          runningTextContent: content
        }));
      }
    } catch (err) {
      console.warn('[StandaloneFullscreen] Error reloading running text:', err);
    }
  }, []);

  const reloadJadwal = useCallback(async () => {
    try {
      const dbJadwal = await jadwalService.getJadwal();
      if (dbJadwal) {
        const jadwalStr = JSON.stringify(dbJadwal);
        if (jadwalStr !== lastJadwalJsonRef.current) {
          lastJadwalJsonRef.current = jadwalStr;
          setLessonPeriods(dbJadwal);
        }
      }
    } catch (err) {
      console.warn('[StandaloneFullscreen] Error reloading jadwal:', err);
    }
  }, []);

  const reloadDisplaySettings = useCallback(async () => {
    try {
      const dbHeaderTheme = await settingsService.getHeaderTheme();
      if (dbHeaderTheme) {
        setConfig(prev => ({ ...prev, headerThemeConfig: dbHeaderTheme }));
      }
    } catch (err) {
      console.warn('[StandaloneFullscreen] Error reloading display settings:', err);
    }
  }, []);

  const reloadRunningTextConfig = useCallback(async () => {
    try {
      const rtConfig = await settingsService.getRunningTextConfig();
      if (rtConfig) {
        setConfig(prev => ({ ...prev, ...rtConfig }));
      }
    } catch (err) {
      console.warn('[StandaloneFullscreen] Error reloading running text config:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Initial Load
    fetchAllData(true);

    // 2. Realtime Multi-Tier Broadcast Subscription (BroadcastChannel & Supabase Broadcast)
    const unsubscribeSync = realtimeSyncService.subscribeSync((payload: SyncPayload) => {
      console.log('[StandaloneFullscreen] Received realtime sync:', payload.entity, payload.action);
      switch (payload.entity) {
        case 'jadwal':
          reloadJadwal();
          break;
        case 'slides':
        case 'media':
        case 'videos':
          reloadSlides();
          break;
        case 'boards':
          if (payload.action === 'switch_board' && payload.activeBoardId) {
            setActiveBoardIdOverride(payload.activeBoardId);
          }
          reloadSlides();
          break;
        case 'running_text':
          reloadRunningText();
          reloadRunningTextConfig();
          break;
        case 'settings':
          reloadDisplaySettings();
          break;
        default:
          fetchAllData(false);
          break;
      }
    });

    // 3. Setup Supabase Postgres Changes Channel as extra layer
    const channelName = 'simka-fullscreen-realtime';
    const channel = isSupabaseConfigured()
      ? supabase.channel(channelName)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'slides' }, () => reloadSlides())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'slide_media' }, () => reloadSlides())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, () => reloadSlides())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => reloadSlides())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'running_text' }, () => reloadRunningText())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'jadwal_les' }, () => reloadJadwal())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'display_settings' }, (payload) => {
            if (payload.new) {
              const id = (payload.new as any).id;
              if (id === 'header_theme') {
                reloadDisplaySettings();
              } else if (id === 'running_text_settings') {
                reloadRunningTextConfig();
              } else if (id === 'active_board') {
                const bId = (payload.new as any).config?.activeBoardId;
                if (bId) setActiveBoardIdOverride(bId);
              }
            }
          })
          .subscribe()
      : null;

    // 4. Heartbeat Polling Fallback (5 seconds as confirmed by user)
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        reloadJadwal();
        reloadSlides();
      }
    }, 5000);

    // 5. Window Events (Visibility Change, Focus, Reconnect)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchAllData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleVisibilityOrFocus);

    return () => {
      unsubscribeSync();
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleVisibilityOrFocus);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [
    fetchAllData, 
    reloadJadwal, 
    reloadSlides, 
    reloadRunningText, 
    reloadRunningTextConfig, 
    reloadDisplaySettings
  ]);

  if (isInitializing) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#00E5FF] animate-spin mb-4" />
        <p className="text-sm font-black font-mono text-white uppercase tracking-widest">
          MEMULAI DISPLAY...
        </p>
      </div>
    );
  }

  // Allow exiting fullscreen by changing hash
  const handleOpenAdmin = () => {
    window.location.hash = ''; // Clear hash returns to admin
  };

  const activeBoardId = 
    activeBoardIdOverride || 
    boards.find(b => b.isActive)?.id || 
    boards[0]?.id;

  return (
    <FullscreenDisplay
      config={{ ...config, activeBoardId }}
      boards={boards}
      activeBoardId={activeBoardId}
      lessonPeriods={lessonPeriods}
      onOpenAdmin={handleOpenAdmin}
      onUpdateConfig={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
    />
  );
};
