import { 
  BoardItem, 
  SlideItem, 
  LessonPeriod, 
  MediaItem, 
  TickerItem, 
  ScreenDevice, 
  DisplayConfig,
  ScheduleEvent,
  ExhibitItem,
  TriviaQuestion,
  AnnouncementItem,
  PlaylistItem
} from '../types';

export const INITIAL_PRESET_PHOTOS = [
  // Group 1: Kegiatan Pembelajaran & Siswa
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
  // Group 2: Praktikum & Laboratorium Sains
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
  // Group 3: Ekstrakurikuler & Seni Budaya
  'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
  // Additional Photos
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1000&q=80'
];

export const INITIAL_PRESET_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Video Kegiatan Siswa & MPLS Sekolah',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
    durationSec: 15
  },
  {
    id: 'vid-2',
    title: 'Inovasi Robotika & Praktikum STEM',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1920&q=80',
    durationSec: 20
  },
  {
    id: 'vid-3',
    title: 'Tur Fasilitas Kampus & Perpustakaan Digital',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    durationSec: 18
  }
];

export const INITIAL_PRESET_POSTERS = [
  {
    id: 'pos-1',
    title: 'Jadwal Ujian Semester Ganjil 2026/2027',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    category: 'AKADEMIK'
  },
  {
    id: 'pos-2',
    title: 'Juara 1 Kompetisi Robotika Nasional',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    category: 'PRESTASI'
  },
  {
    id: 'pos-3',
    title: 'Pendaftaran Ekstrakurikuler & Club Sains',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    category: 'KEGIATAN'
  },
  {
    id: 'pos-4',
    title: 'Penerimaan Peserta Didik Baru (SPMB EMKA)',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    category: 'PENGUMUMAN'
  }
];

export const INITIAL_MEDIA_LIBRARY: MediaItem[] = [];

export const INITIAL_LESSON_PERIODS: LessonPeriod[] = [
  {
    id: 'les-1',
    name: 'LES 1',
    startTime: '07:30',
    endTime: '08:15',
    subject: 'Matematika Terapan',
    teacher: 'Drs. H. Bambang S., M.Pd',
    room: 'Ruang 101',
    isBreak: false
  },
  {
    id: 'les-2',
    name: 'LES 2',
    startTime: '08:15',
    endTime: '09:00',
    subject: 'Fisika & Elektronika Dasar',
    teacher: 'Siti Rahmawati, S.Si',
    room: 'Lab Fisika',
    isBreak: false
  },
  {
    id: 'les-break-1',
    name: 'ISTIRAHAT 1',
    startTime: '09:00',
    endTime: '09:15',
    subject: 'Istirahat & Minum Pagi',
    teacher: '-',
    room: 'Kantin / Area Sekolah',
    isBreak: true
  },
  {
    id: 'les-3',
    name: 'LES 3',
    startTime: '09:15',
    endTime: '10:00',
    subject: 'Bahasa Inggris Komunikasi Global',
    teacher: 'David Miller, M.Ed',
    room: 'Multimedia 01',
    isBreak: false
  },
  {
    id: 'les-4',
    name: 'LES 4',
    startTime: '10:00',
    endTime: '10:45',
    subject: 'Kimia Analitik & Praktikum',
    teacher: 'Nurul Hidayati, M.Sc',
    room: 'Lab Kimia',
    isBreak: false
  },
  {
    id: 'les-break-2',
    name: 'ISTIRAHAT SIANG',
    startTime: '10:45',
    endTime: '11:15',
    subject: 'Ishoma & Makan Siang',
    teacher: '-',
    room: 'Masjid & Kafetaria',
    isBreak: true
  },
  {
    id: 'les-5',
    name: 'LES 5',
    startTime: '11:15',
    endTime: '12:00',
    subject: 'Informatika & Pemrograman Web',
    teacher: 'Ahmad Fauzi, S.Kom',
    room: 'Lab Komputer 02',
    isBreak: false
  },
  {
    id: 'les-6',
    name: 'BIMBEL UTBK',
    startTime: '12:00',
    endTime: '13:00',
    subject: 'Bimbingan Belajar SNBT & Kedinasan',
    teacher: 'Tim Konsultan Belajar',
    room: 'Auditorium Lantai 2',
    isBreak: false
  }
];

export const INITIAL_BOARDS: BoardItem[] = [
  {
    id: 'board-main',
    name: 'Pusat Informasi EMKA',
    description: 'Board utama digital signage lobby & koridor sekolah (Rotasi Foto, Video, Poster, Jadwal)',
    isActive: true,
    loopMode: 'loop_forever',
    createdAt: '2026-08-28',
    slides: [
      {
        id: 'sld-1',
        title: 'SLIDE 1 — 3 FOTO POTRAIT',
        type: '3_FOTO',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          photos: [
            INITIAL_PRESET_PHOTOS[0], // Foto 1
            INITIAL_PRESET_PHOTOS[1], // Foto 2
            INITIAL_PRESET_PHOTOS[2]  // Foto 3
          ]
        }
      },
      {
        id: 'sld-2',
        title: 'SLIDE 2 — VIDEO KEGIATAN',
        type: 'VIDEO',
        durationSec: 20,
        videoPlayMode: 'until_end',
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          videoUrl: INITIAL_PRESET_VIDEOS[0].videoUrl,
          videoTitle: 'Video Kegiatan Siswa & MPLS Sekolah'
        }
      },
      {
        id: 'sld-3',
        title: 'SLIDE 3 — 3 FOTO POTRAIT (LAB & SAINS)',
        type: '3_FOTO',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          photos: [
            INITIAL_PRESET_PHOTOS[3], // Foto 4
            INITIAL_PRESET_PHOTOS[4], // Foto 5
            INITIAL_PRESET_PHOTOS[5]  // Foto 6
          ]
        }
      },
      {
        id: 'sld-4',
        title: 'SLIDE 4 — 3 FOTO POTRAIT (EKSKUL & SENI)',
        type: '3_FOTO',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          photos: [
            INITIAL_PRESET_PHOTOS[6], // Foto 7
            INITIAL_PRESET_PHOTOS[7], // Foto 8
            INITIAL_PRESET_PHOTOS[8]  // Foto 9
          ]
        }
      },
      {
        id: 'sld-5',
        title: 'SLIDE 5 — 3 POSTER INFORMASI',
        type: '3_POSTER',
        durationSec: 12,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          posters: [
            INITIAL_PRESET_POSTERS[0].imageUrl,
            INITIAL_PRESET_POSTERS[1].imageUrl,
            INITIAL_PRESET_POSTERS[2].imageUrl
          ]
        }
      },
      {
        id: 'sld-6',
        title: 'SLIDE 6 — POSTER RESMI SPMB',
        type: '1_POSTER',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          posterUrl: INITIAL_PRESET_POSTERS[3].imageUrl,
          posterTitle: 'Penerimaan Peserta Didik Baru (SPMB EMKA)'
        }
      },
      {
        id: 'sld-7',
        title: 'SLIDE 7 — GRID FOTO DOKUMENTASI',
        type: 'FOTO_GRID',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          gridPhotos: [
            INITIAL_PRESET_PHOTOS[0],
            INITIAL_PRESET_PHOTOS[3],
            INITIAL_PRESET_PHOTOS[6],
            INITIAL_PRESET_PHOTOS[9]
          ]
        }
      },
      {
        id: 'sld-8',
        title: 'SLIDE 8 — FOTO + JADWAL LES REALTIME',
        type: 'FOTO_INFORMASI',
        durationSec: 12,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          splitPhotoUrl: INITIAL_PRESET_PHOTOS[5],
          infoTitle: 'Jadwal Les & Bimbingan Belajar',
          infoDetails: 'Informasi rotasi kelas dan status jam pembelajaran real-time.'
        }
      }
    ]
  },
  {
    id: 'board-prestasi',
    name: 'Kegiatan & Prestasi Sekolah',
    description: 'Dokumentasi kejuaraan, inovasi lab robotika, dan kegiatan ekstrakurikuler',
    isActive: false,
    loopMode: 'loop_forever',
    createdAt: '2026-08-28',
    slides: [
      {
        id: 'sld-p1',
        title: 'SLIDE 1 — VIDEO ROBOTIKA STEM',
        type: 'VIDEO',
        durationSec: 18,
        videoPlayMode: 'until_end',
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          videoUrl: INITIAL_PRESET_VIDEOS[1].videoUrl,
          videoTitle: 'Inovasi Robotika & Praktikum STEM'
        }
      },
      {
        id: 'sld-p2',
        title: 'SLIDE 2 — 3 FOTO KEJUARAAN',
        type: '3_FOTO',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          photos: [
            INITIAL_PRESET_PHOTOS[6],
            INITIAL_PRESET_PHOTOS[7],
            INITIAL_PRESET_PHOTOS[8]
          ]
        }
      },
      {
        id: 'sld-p3',
        title: 'SLIDE 3 — POSTER JUARA ROBOTIKA',
        type: '1_POSTER',
        durationSec: 12,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          posterUrl: INITIAL_PRESET_POSTERS[1].imageUrl,
          posterTitle: 'Juara 1 Kompetisi Robotika Nasional'
        }
      }
    ]
  },
  {
    id: 'board-spmb',
    name: 'Pengumuman & Promosi SPMB',
    description: 'Informasi penerimaan siswa baru, beasiswa, dan agenda akademik',
    isActive: false,
    loopMode: 'loop_forever',
    createdAt: '2026-08-28',
    slides: [
      {
        id: 'sld-s1',
        title: 'SLIDE 1 — POSTER SPMB UTAMA',
        type: '1_POSTER',
        durationSec: 12,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          posterUrl: INITIAL_PRESET_POSTERS[3].imageUrl,
          posterTitle: 'Penerimaan Peserta Didik Baru (SPMB EMKA)'
        }
      },
      {
        id: 'sld-s2',
        title: 'SLIDE 2 — 3 POSTER PROGRAM',
        type: '3_POSTER',
        durationSec: 12,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          posters: [
            INITIAL_PRESET_POSTERS[0].imageUrl,
            INITIAL_PRESET_POSTERS[1].imageUrl,
            INITIAL_PRESET_POSTERS[2].imageUrl
          ]
        }
      },
      {
        id: 'sld-s3',
        title: 'SLIDE 3 — 3 FOTO FASILITAS',
        type: '3_FOTO',
        durationSec: 10,
        transition: 'fade',
        transitionDurationMs: 800,
        enabled: true,
        content: {
          photos: [
            INITIAL_PRESET_PHOTOS[0],
            INITIAL_PRESET_PHOTOS[3],
            INITIAL_PRESET_PHOTOS[4]
          ]
        }
      }
    ]
  }
];

export const INITIAL_TICKER_ITEMS: TickerItem[] = [
  { id: 'tk-1', text: 'INFORMASI EMKA: Selamat mengikuti kegiatan pembelajaran hari ini', category: 'SEKOLAH', enabled: true },
  { id: 'tk-2', text: 'JADWAL LES & BIMBEL: Sesi bimbingan UTBK & SNBT dimulai pukul 12:00 di Auditorium Lantai 2', category: 'AKADEMIK', enabled: true },
  { id: 'tk-3', text: 'PENGUMUMAN PERPUSTAKAAN: Layanan peminjaman buku referensi dibuka hingga pukul 16:00 WIB', category: 'FASILITAS', enabled: true },
  { id: 'tk-4', text: 'PRESTASI: Selamat kepada Tim Robotika atas Juara 1 Tingkat Nasional', category: 'PRESTASI', enabled: true },
  { id: 'tk-5', text: 'KEDISIPLINAN: Harap menjaga ketertiban, kebersihan kelas, dan keamanan fasilitas bersama', category: 'HIMBAUAN', enabled: true }
];

export const INITIAL_SCREENS: ScreenDevice[] = [
  {
    id: 'scr-101',
    name: 'Display Lobby Utama (1080p)',
    location: 'Lantai 1 • Pusat Informasi',
    resolution: '1920x1080',
    orientation: 'landscape',
    activeBoardId: 'board-main',
    status: 'online',
    lastPing: '2s lalu',
    pairingCode: 'EMKA-7824',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'scr-102',
    name: 'Display Koridor Multimedia',
    location: 'Lantai 2 • Sayap Timur',
    resolution: '1920x1080',
    orientation: 'landscape',
    activeBoardId: 'board-main',
    status: 'online',
    lastPing: '3s lalu',
    pairingCode: 'EMKA-3199',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'scr-103',
    name: 'Display Ruang Guru & Tata Usaha',
    location: 'Lantai 1 • Sayap Barat',
    resolution: '1920x1080',
    orientation: 'landscape',
    activeBoardId: 'board-main',
    status: 'online',
    lastPing: '1s lalu',
    pairingCode: 'EMKA-9021',
    ipAddress: '192.168.1.103'
  }
];

export const INITIAL_CONFIG: DisplayConfig = {
  venueName: 'SIMKA',
  headerLeftText: 'SIMKA',
  headerCenterText: 'PUSAT INFORMASI EMKA',
  headerRightTag: 'JAM | JADWAL LES',
  runningTextContent: 'INFORMASI EMKA • Selamat mengikuti kegiatan pembelajaran hari ini • Agenda sekolah • Informasi bimbingan belajar & ujian semester • Simak display berkala •',
  headerTheme: 'cyan-blue',
  headerThemeConfig: {
    preset: 'cyan-default',
    background: '#0096D6',
    text: '#FFFFFF',
    brandBg: '#003B5C',
    brandText: '#54D6FF',
    dateText: '#FFFFFF',
    clockBg: '#002840',
    clockText: '#FFD166',
    accent: '#00E5FF',
    autoContrast: true
  },
  contrastMode: 'broadcast-cyan',
  tickerSpeedSec: 25,
  autoAdvanceSec: 10,
  transitionEffect: 'fade',
  transitionDurationMs: 800,
  emergencyOverride: false,
  emergencyMessage: {
    title: 'PENGUMUMAN PENTING / EVAKUASI',
    details: 'Pemberitahuan resmi dari pihak sekolah. Seluruh siswa dan dewan guru diharap mengikuti instruksi keamanan.',
    level: 'warning',
    actionInstruction: 'Silakan menuju titik kumpul di lapangan upacara utama.'
  },
  activeBoardId: 'board-main'
};

export const INITIAL_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'ev-1',
    time: '07:30 - 08:15',
    title: 'Matematika Terapan',
    speaker: 'Drs. H. Bambang S., M.Pd',
    location: 'Ruang 101',
    status: 'NOW',
    category: 'LES 1',
    theme: 'yellow',
    durationMin: 45
  },
  {
    id: 'ev-2',
    time: '08:15 - 09:00',
    title: 'Fisika & Elektronika Dasar',
    speaker: 'Siti Rahmawati, S.Si',
    location: 'Lab Fisika',
    status: 'SOON',
    category: 'LES 2',
    theme: 'teal',
    durationMin: 45
  },
  {
    id: 'ev-3',
    time: '09:15 - 10:00',
    title: 'Bahasa Inggris Komunikasi Global',
    speaker: 'David Miller, M.Ed',
    location: 'Multimedia 01',
    status: 'UPCOMING',
    category: 'LES 3',
    theme: 'coral',
    durationMin: 45
  },
  {
    id: 'ev-4',
    time: '12:00 - 13:00',
    title: 'Bimbingan Belajar UTBK SNBT',
    speaker: 'Tim Pengajar EMKA',
    location: 'Auditorium Lantai 2',
    status: 'UPCOMING',
    category: 'BIMBEL',
    theme: 'yellow',
    durationMin: 60
  }
];

export const INITIAL_EXHIBITS: ExhibitItem[] = [
  {
    id: 'ex-1',
    title: 'Robotika & Kecerdasan Buatan',
    subtitle: 'Laboratorium Rekayasa Digital & Otomasi',
    description: 'Pameran proyek inovasi siswa dalam membangun articulated robot arm dan sensor cerdas Internet of Things.',
    category: 'Teknologi & Sains',
    location: 'Gedung Multimedia Lt. 2',
    zone: 'Zona Riset',
    timeSlot: '08:00 - 16:00',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    theme: 'cyan',
    badgeText: 'UNGGULAN',
    ageGroup: 'Semua Jenjang',
    rating: '4.9',
    featured: true,
    interactiveFeature: 'Simulasi Pemrograman Langsung'
  },
  {
    id: 'ex-2',
    title: 'Pameran Karya Seni Rupa & Desain Visual',
    subtitle: 'Koleksi Studio Desain Kreatif Siswa',
    description: 'Galeri karya lukis kanvas, fotografi jurnalistik sekolah, dan instalasi visual poster bertema kearifan lokal nusantara.',
    category: 'Seni & Budaya',
    location: 'Selasar Aula Utama',
    zone: 'Zona Galeri Seni',
    timeSlot: '08:00 - 15:30',
    imageUrl: 'https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=1200&q=80',
    theme: 'yellow',
    badgeText: 'KARYA SISWA',
    ageGroup: 'Umum',
    rating: '4.8',
    featured: true
  }
];

export const INITIAL_TRIVIA: TriviaQuestion[] = [
  {
    id: 'triv-1',
    question: 'Berapa jumlah planet dalam tata surya kita yang memiliki cincin utama?',
    category: 'Sains Antariksa',
    theme: 'cyan',
    options: [
      { id: 'opt-1', text: '1 (Hanya Saturnus)', votes: 14, isCorrect: false },
      { id: 'opt-2', text: '4 (Jupiter, Saturnus, Uranus, Neptunus)', votes: 88, isCorrect: true },
      { id: 'opt-3', text: '2 (Saturnus dan Uranus)', votes: 22, isCorrect: false },
      { id: 'opt-4', text: 'Semua planet gas & es', votes: 18, isCorrect: false }
    ],
    revealed: false,
    funFact: 'Semua 4 planet raksasa gas/es (Jupiter, Saturnus, Uranus, Neptunus) memiliki sistem cincin, meski cincin Saturnus paling terang terlihat dari Bumi!',
    totalVotes: 142
  }
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Pelaksanaan Try Out Bimbingan Belajar Gelombang II',
    body: 'Seluruh siswa kelas XII wajib hadir tepat waktu pukul 07.30 WIB di ruang ujian masing-masing dengan membawa kartu peserta.',
    priority: 'important',
    tag: 'AKADEMIK',
    theme: 'cyan',
    iconName: 'Bell',
    timestamp: 'Hari ini, 07:00 WIB'
  },
  {
    id: 'ann-2',
    title: 'Pendaftaran Seleksi Olimpiade Sains Nasional (OSN)',
    body: 'Pendaftaran dan konsultasi bimbingan tim OSN bidang Matematika, Fisika, dan Informatika dibuka di Ruang Bimbingan Konseling.',
    priority: 'normal',
    tag: 'PRESTASI',
    theme: 'yellow',
    iconName: 'Award',
    timestamp: '28 Agu 2026'
  }
];

export const INITIAL_PLAYLIST: PlaylistItem[] = [
  {
    id: 'pl-1',
    slideId: 'slide-1',
    contentId: 'ex-1',
    contentType: 'exhibit',
    title: 'Dokumentasi Utama SIMKA',
    durationSec: 10,
    layout: 'layout-3-photos',
    theme: 'cyan',
    enabled: true
  },
  {
    id: 'pl-2',
    slideId: 'slide-2',
    contentId: 'ex-2',
    contentType: 'video',
    title: 'Video Profil Sekolah',
    durationSec: 15,
    layout: 'layout-video',
    theme: 'yellow',
    enabled: true
  }
];
