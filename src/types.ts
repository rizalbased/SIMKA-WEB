export type DisplayMode = 'admin' | 'display' | 'login';

export type UserRole = 'admin' | 'user';

export interface AdminProfile {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

export type AdminTab = 
  | 'beranda'
  | 'media'
  | 'board-display'
  | 'jadwal-les'
  | 'running-text'
  | 'pengaturan'
  | 'layar-penuh';

export type SlideType = 
  | '3_FOTO' 
  | 'VIDEO' 
  | '3_POSTER' 
  | '1_POSTER' 
  | 'FOTO_GRID' 
  | 'FOTO_INFORMASI';

// Legacy layout type alias
export type LayoutPresetId = 
  | 'layout-3-photos'
  | 'layout-video'
  | 'layout-photo-schedule'
  | 'layout-3-posters'
  | 'layout-single-poster'
  | 'layout-photo-grid'
  | 'layout-a-magazine'
  | 'layout-b-bento'
  | 'layout-c-hero'
  | 'layout-d-quad'
  | 'layout-e-portrait';

export type TransitionType = 
  | 'fade' 
  | 'crossfade' 
  | 'slide-left' 
  | 'slide-right' 
  | 'zoom';

export type ColorTheme = 'teal' | 'yellow' | 'coral' | 'offwhite' | 'dark' | 'cyan';

export interface SlideContentPayload {
  // 3 FOTO (3 columns 640px cover)
  photos?: [string, string, string];
  // VIDEO
  videoUrl?: string;
  videoTitle?: string;
  // 3 POSTER (3 columns contain)
  posters?: [string, string, string];
  // 1 POSTER (single centered)
  posterUrl?: string;
  posterTitle?: string;
  // FOTO GRID (2x2)
  gridPhotos?: [string, string, string, string];
  // FOTO + INFORMASI
  splitPhotoUrl?: string;
  infoTitle?: string;
  infoDetails?: string;
}

export interface SlideItem {
  id: string;
  title: string;
  type: SlideType;
  durationSec: number; // e.g. 5, 10, 15, 20, 30, 60 or custom
  videoPlayMode?: 'until_end' | 'duration';
  transition: TransitionType;
  transitionDurationMs: number;
  enabled: boolean;
  content: SlideContentPayload;
  slideMedia?: any[]; // Full media items from DB
}

export interface BoardItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  loopMode: 'loop_forever' | 'play_once';
  slides: SlideItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonPeriod {
  id: string;
  name?: string; // e.g. "LES 1", "LES 2", "ISTIRAHAT", "LES 3", "LES 4", "BIMBEL SORE"
  periodNumber?: number;
  startTime: string; // "07:00"
  endTime: string; // "07:45"
  subject?: string;
  teacher?: string;
  room?: string;
  isBreak?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'foto' | 'video' | 'poster';
  url: string;
  category?: string;
  thumbnailUrl?: string;
  description?: string;
  dimensions?: string;
  size?: string;
  orientation?: 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE';
  dateAdded?: string;
  filePath?: string; // Path in Supabase Storage
}

export interface TickerItem {
  id: string;
  text: string;
  category: string;
  badgeColor?: string;
  enabled?: boolean;
}

export interface ScreenDevice {
  id: string;
  name: string;
  location: string;
  resolution: '1920x1080' | '3840x2160' | '1080x1920' | '2560x1080';
  orientation: 'landscape' | 'portrait';
  activeBoardId?: string;
  status: 'online' | 'standby' | 'syncing' | 'offline';
  lastPing: string;
  pairingCode: string;
  ipAddress: string;
  activePlaylistId?: string;
  brightness?: number;
  volume?: number;
  activeLayout?: LayoutPresetId;
  autoRebootTime?: string;
}

export interface DisplayConfig {
  venueName: string; // e.g. "SIMKA"
  headerLeftText: string; // "SIMKA"
  headerCenterText: string; // "PUSAT INFORMASI EMKA"
  headerRightTag: string; // "JAM | JADWAL LES"
  runningTextContent: string;
  runningTextCategory?: string;
  runningTextSpeed?: number;
  runningTextBgColor?: string;
  runningTextTextColor?: string;
  runningTextBadgeBg?: string;
  runningTextBadgeTextColor?: string;
  showClock?: boolean;
  showDate?: boolean;
  headerTheme: 'cyan-blue' | 'yellow-contrast' | 'dark-minimal' | 'teal-clean';
  contrastMode: 'editorial-light' | 'high-contrast' | 'night-teal' | 'broadcast-cyan';
  tickerSpeedSec: number;
  autoAdvanceSec: number;
  transitionEffect: TransitionType;
  transitionDurationMs: number;
  emergencyOverride: boolean;
  emergencyMessage: {
    title: string;
    details: string;
    level: 'warning' | 'critical' | 'info';
    actionInstruction: string;
  };
  activeBoardId: string;
  activeLayout?: LayoutPresetId;
  slots?: {
    threePhotos?: [string, string, string];
    videoUrl?: string;
    videoTitle?: string;
    splitPhotoUrl?: string;
    threePosters?: [string, string, string];
    singlePosterUrl?: string;
    gridPhotos?: [string, string, string, string];
  };
}

// Backward compatibility types
export interface PlaylistItem {
  id: string;
  slideId: string;
  contentId: string;
  contentType: string;
  title: string;
  durationSec: number;
  layout: LayoutPresetId;
  theme: ColorTheme;
  enabled: boolean;
}

export interface ExhibitItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  location: string;
  zone: string;
  timeSlot: string;
  imageUrl: string;
  theme: ColorTheme;
  badgeText: string;
  ageGroup: string;
  rating?: string;
  featured?: boolean;
  interactiveFeature?: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  speaker: string;
  location: string;
  status: 'NOW' | 'SOON' | 'UPCOMING' | 'ENDED';
  category: string;
  theme: ColorTheme;
  durationMin: number;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  category: string;
  theme: ColorTheme;
  options: {
    id: string;
    text: string;
    votes: number;
    isCorrect: boolean;
  }[];
  revealed: boolean;
  funFact: string;
  totalVotes: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  priority: 'normal' | 'important' | 'urgent';
  tag: string;
  theme: ColorTheme;
  iconName: string;
  timestamp: string;
}
