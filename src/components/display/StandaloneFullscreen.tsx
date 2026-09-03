import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { slideService } from '../../services/slideService';
import { runningTextService } from '../../services/runningTextService';
import { jadwalService } from '../../services/jadwalService';
import { settingsService } from '../../services/settingsService';
import { FullscreenDisplay } from './FullscreenDisplay';
import { DisplayConfig, BoardItem, LessonPeriod } from '../../types';
import { INITIAL_CONFIG, INITIAL_LESSON_PERIODS } from '../../data/initialData';
import { Loader2 } from 'lucide-react';

export const StandaloneFullscreen: React.FC = () => {
  const [config, setConfig] = useState<DisplayConfig>(INITIAL_CONFIG);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [lessonPeriods, setLessonPeriods] = useState<LessonPeriod[]>(INITIAL_LESSON_PERIODS);
  const [isInitializing, setIsInitializing] = useState(true);

  // Helper to fetch all data cleanly
  const fetchAllData = async () => {
    try {
      const [dbBoards, dbRunningText, dbJadwal, dbHeaderTheme, dbRunningTextConfig] = await Promise.all([
        slideService.getBoards(),
        runningTextService.getRunningText(),
        jadwalService.getJadwal(),
        settingsService.getHeaderTheme(),
        settingsService.getRunningTextConfig()
      ]);

      if (dbBoards && dbBoards.length > 0) {
        setBoards(dbBoards);
      } else {
        setBoards([]); // Handle empty gracefully
      }

      const activeText = dbRunningText?.find(t => t.is_active);
      setConfig(prev => {
        const updates: any = {
          headerThemeConfig: dbHeaderTheme || prev.headerThemeConfig,
          runningTextContent: activeText ? activeText.content : ''
        };
        
        if (dbRunningTextConfig) {
          Object.assign(updates, dbRunningTextConfig);
        }
        
        return { ...prev, ...updates };
      });

      if (dbJadwal) setLessonPeriods(dbJadwal);
    } catch (err) {
      console.error('Error fetching fullscreen data:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  // Dedicated reloaders to avoid refetching everything for minor events
  const reloadSlides = async () => {
    const dbBoards = await slideService.getBoards();
    setBoards(dbBoards || []);
  };

  const reloadRunningText = async () => {
    const dbRunningText = await runningTextService.getRunningText();
    const activeText = dbRunningText?.find(t => t.is_active);
    setConfig(prev => ({
      ...prev,
      runningTextContent: activeText ? activeText.content : ''
    }));
  };

  const reloadJadwal = async () => {
    const dbJadwal = await jadwalService.getJadwal();
    setLessonPeriods(dbJadwal || []);
  };

  const reloadDisplaySettings = async () => {
    const dbHeaderTheme = await settingsService.getHeaderTheme();
    if (dbHeaderTheme) {
      setConfig(prev => ({ ...prev, headerThemeConfig: dbHeaderTheme }));
    }
  };

  const reloadRunningTextConfig = async () => {
    const config = await settingsService.getRunningTextConfig();
    if (config) {
      setConfig(prev => ({ ...prev, ...config }));
    }
  };

  useEffect(() => {
    // 1. Initial Load
    fetchAllData();

    // 2. Setup Realtime Channel
    const channelName = 'simka-fullscreen-realtime';
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slides' }, () => {
        reloadSlides();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slide_media' }, () => {
        reloadSlides();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, () => {
        reloadSlides(); // Since slides embed media urls
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        reloadSlides();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'running_text' }, () => {
        reloadRunningText();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jadwal_les' }, () => {
        reloadJadwal();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_settings' }, (payload) => {
        if (payload.new) {
          const id = (payload.new as any).id;
          if (id === 'header_theme') {
            reloadDisplaySettings();
          } else if (id === 'running_text_settings') {
            reloadRunningTextConfig();
          }
        }
      })
      .subscribe((status) => {
        console.log(`Fullscreen Realtime Status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully connected to Supabase Realtime');
        }
      });

    return () => {
      console.log('Cleaning up fullscreen realtime channel');
      supabase.removeChannel(channel);
    };
  }, []);

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
    window.location.hash = ''; // Clear hash will return to admin
  };

  const activeBoardId = boards.find(b => b.isActive)?.id || boards[0]?.id;

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
