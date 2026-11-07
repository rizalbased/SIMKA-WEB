import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type SyncEntity = 
  | 'jadwal' 
  | 'slides' 
  | 'media' 
  | 'videos' 
  | 'boards' 
  | 'running_text' 
  | 'settings' 
  | 'all';

export type SyncAction = 'create' | 'update' | 'delete' | 'switch_board' | 'reload';

export interface SyncPayload {
  entity: SyncEntity;
  action: SyncAction;
  activeBoardId?: string;
  extra?: any;
  timestamp: number;
  senderId: string;
}

const CLIENT_ID = 'simka_' + Math.random().toString(36).substring(2, 10);
const BROADCAST_CHANNEL_NAME = 'simka_realtime_sync_channel';
const SUPABASE_CHANNEL_NAME = 'simka-broadcast-sync';
const LOCAL_STORAGE_KEY = 'simka_last_sync_signal';

class RealtimeSyncService {
  private localBroadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: RealtimeChannel | null = null;
  private listeners: Set<(payload: SyncPayload) => void> = new Set();
  private lastProcessedTimestamp: number = 0;
  private isSubscribedToSupabase: boolean = false;

  constructor() {
    this.initLocalBroadcast();
    this.initSupabaseBroadcast();
    this.initStorageListener();
  }

  /**
   * Browser-level BroadcastChannel for instant 0ms cross-tab/window communication on the same origin
   */
  private initLocalBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.localBroadcastChannel.onmessage = (event: MessageEvent<SyncPayload>) => {
          if (event.data) {
            this.handleIncomingSync(event.data, 'BroadcastChannel');
          }
        };
      } catch (err) {
        console.warn('[RealtimeSync] BroadcastChannel init error:', err);
      }
    }
  }

  /**
   * Supabase Realtime Broadcast for cross-device/network synchronization (works everywhere without table publication restrictions)
   */
  private initSupabaseBroadcast() {
    if (!isSupabaseConfigured() || typeof window === 'undefined') return;

    try {
      this.supabaseChannel = supabase.channel(SUPABASE_CHANNEL_NAME, {
        config: {
          broadcast: { self: true }
        }
      });

      this.supabaseChannel
        .on('broadcast', { event: 'simka_sync' }, ({ payload }) => {
          if (payload) {
            this.handleIncomingSync(payload as SyncPayload, 'SupabaseBroadcast');
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isSubscribedToSupabase = true;
            console.log('[RealtimeSync] Supabase broadcast channel subscribed');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.isSubscribedToSupabase = false;
          }
        });
    } catch (err) {
      console.warn('[RealtimeSync] Error initializing Supabase broadcast:', err);
    }
  }

  /**
   * Window Storage event listener as fallback for browser compatibility
   */
  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue) as SyncPayload;
            this.handleIncomingSync(parsed, 'StorageEvent');
          } catch {
            // ignore JSON error
          }
        }
      });
    }
  }

  /**
   * Handles incoming sync payload and notifies registered listeners (deduplicating duplicate events within 150ms)
   */
  private handleIncomingSync(payload: SyncPayload, source: string) {
    if (!payload || !payload.timestamp) return;

    // Deduplicate if identical event received through multiple channels in short window
    const now = Date.now();
    if (Math.abs(payload.timestamp - this.lastProcessedTimestamp) < 150) {
      return;
    }
    this.lastProcessedTimestamp = payload.timestamp;

    console.log(`[RealtimeSync] Inbound sync event via ${source}:`, payload.entity, payload.action);
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[RealtimeSync] Error in sync listener:', err);
      }
    });
  }

  /**
   * Broadcasts a sync event across all tiers (Local BroadcastChannel, localStorage, and Supabase WebSocket Broadcast)
   */
  public async publishSync(entity: SyncEntity, action: SyncAction = 'update', extra?: any): Promise<void> {
    const payload: SyncPayload = {
      entity,
      action,
      activeBoardId: extra?.activeBoardId,
      extra,
      timestamp: Date.now(),
      senderId: CLIENT_ID
    };

    console.log('[RealtimeSync] Publishing sync:', entity, action);

    // 1. Dispatch locally via Browser BroadcastChannel
    if (this.localBroadcastChannel) {
      try {
        this.localBroadcastChannel.postMessage(payload);
      } catch (e) {
        console.warn('[RealtimeSync] Local broadcast error:', e);
      }
    }

    // 2. Dispatch locally via localStorage event for cross-window fallback
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }

    // 3. Dispatch to remote Supabase WebSocket Broadcast
    if (this.supabaseChannel && isSupabaseConfigured()) {
      try {
        await this.supabaseChannel.send({
          type: 'broadcast',
          event: 'simka_sync',
          payload
        });
      } catch (err) {
        console.warn('[RealtimeSync] Supabase broadcast send error:', err);
      }
    }

    // 4. Also notify local listeners in the same window (e.g. if fullscreen is embedded in the same window)
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[RealtimeSync] Error in local listener:', err);
      }
    });
  }

  /**
   * Subscribe to all sync events
   */
  public subscribeSync(callback: (payload: SyncPayload) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const realtimeSyncService = new RealtimeSyncService();
