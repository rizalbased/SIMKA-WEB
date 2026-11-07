# Sinkronisasi Realtime & Respon Cepat Layar Fullscreen SIMKA

Pembaruan arsitektur sinkronisasi data terdistribusi multi-tier untuk memastikan penambahan kegiatan (jadwal les), foto dokumentasi, video, dan slide board langsung terupdate secara instan pada layar fullscreen (`https://simka.mkverse.my.id/#/fullscreen`) tanpa perlu keluar-masuk tampilan atau me-reload halaman.

## User Review & Critical Decisions

> [!IMPORTANT]
> Ringkasan keputusan penting berdasarkan preferensi yang telah dikonfirmasi:

- **Perilaku Transisi Slide**: **Pembaruan Seketika (Hot-Swap)** — Begitu admin menyimpan perubahan kegiatan atau gambar, layar fullscreen langsung merefresh data saat itu juga secara halus tanpa memotong transisi atau menyebabkan layar hitam.
- **Interval Polling Cadangan (Heartbeat)**: **Setiap 5 Detik** — Layar fullscreen memiliki heartbeat background polling berkala setiap 5 detik sebagai pelindung koneksi jika WebSocket terputus atau dibatasi oleh firewall jaringan sekolah.
- **Sinkronisasi Multi-Tier**: Menggabungkan **Supabase Realtime Broadcast** (lintas perangkat/jaringan internet), **Browser BroadcastChannel** (lintas tab/monitor lokal 0ms), dan **Postgres Changes** untuk keandalan maksimal.

---

## 1. Overview & Core Concept

### What It Does
Memberikan sinkronisasi data dua arah yang andal antara modul admin (Dashboard, Board Display, Galeri Media, Jadwal Les, Running Text) dan tampilan layar digital signage mandiri (`/ #/fullscreen`). Setiap penambahan kegiatan pembelajaran, upload foto galeri, pengaturan board slide, atau edit running text akan segera disiarkan dan langsung tercermin pada display signage secara otomatis.

### Target Audience & Persona
- **Operator & Tim Admin Sekolah**: Menginput perubahan jadwal kegiatan, les bimbingan, poster pengumuman, atau foto liputan acara dari laptop/ruang admin.
- **Layar Display Signage (TV / Monitor Fullscreen)**: Berjalan 24/7 di lobi sekolah, lorong kelas, atau aula tanpa intervensi keyboard/mouse manual.

### Key Value
Menghilangkan ketergantungan pada restart/refresh manual. Tampilan signage selalu menayangkan konten paling aktual secara otomatis, stabil, dan konsisten.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Admin Menambah/Mengedit Kegiatan**:
   - Admin membuka menu *Jadwal Les & Bimbingan* (`AdminJadwalLes`).
   - Admin menambahkan sesi kegiatan baru (misal: "Kegiatan Ekstrakurikuler Robotika").
   - Admin menekan tombol simpan: sistem menyimpan ke database Supabase dan secara bersamaan memancarkan sinyal `simka:sync` lewat WebSocket Broadcast dan BroadcastChannel.
2. **Layar Fullscreen Merespon Otomatis**:
   - Di tab/layar TV (`/#/fullscreen`), listener realtime menerima sinyal dalam hitungan milidetik.
   - Header banner jam & widget jadwal (status *SEKARANG* dan *BERIKUTNYA*) langsung memperbarui teks kegiatan.
   - Slide berformat *Foto + Informasi Jadwal* (`LayoutPhotoSchedule`) seketika memperbarui daftar les & kegiatan.
3. **Admin Menambah Foto / Slide Baru**:
   - Admin menambah foto dokumentasi atau mengubah urutan slide pada *Board Display*.
   - Layar fullscreen langsung menyelaraskan daftar slide aktif dan melanjutkan pemutaran tanpa flicker atau freeze.

### Visual Polish & Feedback
- **Indikator Realtime Halus di Signage Header**: Tampilan badge status `LIVE SYNC` yang minimalis dan elegan, menandakan koneksi realtime terhubung aktif.
- **Zero-Flicker Transition**: Pergantian data memanfaatkan state reconciliation React tanpa unmount total canvas, menjaga animasi transisi tetap stabil.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Arsitektur Multi-Tier (Broadcast Channel + Polling Cadangan)
- **Chosen Approach**: Menggabungkan WebSocket Broadcast Supabase, Web API `BroadcastChannel` (cross-tab 0ms), dan periodic background polling (5 detik).
- **Why**: Supabase `postgres_changes` bergantung pada konfigurasi publikasi PostgreSQL di server database yang terkadang belum aktif untuk akun anon/public. Sementara `channel.send({ type: 'broadcast' })` berjalan langsung di layer WebSocket Supabase tanpa bergantung pada schema publication database, menjamin 100% transmisi lintas perangkat.
- **Alternatives Considered**: Hanya mengandalkan polling (kurang responsif) atau hanya mengandalkan `postgres_changes` (rentan gagal jika replication publication belum diaktifkan).

### Decision 2: Penanganan Active Board ID di Supabase
- **Chosen Approach**: Menyimpan `active_board_id` secara terpusat pada tabel `display_settings` dan memancarkannya ke seluruh display.
- **Why**: Sebelumnya `activeBoardId` hanya tersimpan di local React state admin. Saat admin mengganti board aktif, layar fullscreen tidak mengetahui board mana yang harus diputar.
- **Alternatives Considered**: Menggunakan localStorage (hanya berfungsi jika satu browser yang sama, gagal jika display berada di Smart TV atau mini PC terpisah).

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       ADMIN STUDIO                          │
│  [AdminJadwalLes]  [AdminBoardDisplay]  [AdminRunningText]  │
└──────────────┬───────────────────────────────┬──────────────┘
               │ 1. Mutasi Data (DB)           │ 2. Broadcast Sinyal
               ▼                               ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│     SUPABASE POSTGRES DB      │   │ SUPABASE REALTIME HUB   │
│  • jadwal_les                 │   │ (channel: 'simka-sync') │
│  • slides & slide_media       │   │ Broadcast event: 'sync' │
│  • media & videos             │   └────────────┬────────────┘
│  • display_settings           │                │
└──────────────┬────────────────┘                │ WebSockets (Remote)
               │                                 │
               │ Polling Cadangan (5 detik)      │
               ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 STANDALONE FULLSCREEN DISPLAY               │
│                (URL: /#/fullscreen pada TV/Layar)           │
│                                                             │
│  • Realtime Broadcast Listener   • BroadcastChannel (Tab)   │
│  • Heartbeat Poller (5s)         • Window Visibility Hook   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SignageHeader (Waktu Realtime & Status Sesi Kegiatan) │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Layout Canvas (Slide Foto / Jadwal / Video / Grid)    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ SignageRunningText (Ticker Pengumuman Bergerak)       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Model & Sync Strategy
- **Broadcast Event Payload**:
  ```ts
  interface SimkaSyncPayload {
    entity: 'jadwal' | 'slides' | 'boards' | 'settings' | 'all';
    action: 'create' | 'update' | 'delete' | 'switch_board';
    activeBoardId?: string;
    timestamp: number;
  }
  ```
- **Sync Hub Service (`realtimeSyncService`)**:
  - `publishSync(entity, action, extra)`: Mengirimkan sinyal sinkronisasi serentak ke Supabase Realtime Broadcast dan Browser `BroadcastChannel`.
  - `subscribeSync(onSyncCallback)`: Mendaftarkan listener pada display fullscreen untuk mengeksekusi re-fetch instan.

### Interactive Component & State Mapping
- **`AdminJadwalLes.tsx`**: Memanggil `realtimeSyncService.publishSync('jadwal', ...)` setelah operasi add, update, delete, atau reset kegiatan.
- **`AdminBoardDisplay.tsx`**: Memanggil `realtimeSyncService.publishSync('slides', ...)` dan menyimpan `activeBoardId` ke `display_settings` saat admin menambah foto, membuat slide, atau mengganti board aktif.
- **`AdminRunningText.tsx` & `AdminSettings.tsx`**: Memancarkan event sinkronisasi saat ticker atau tema diubah.
- **`StandaloneFullscreen.tsx`**:
  - Mengintegrasikan `realtimeSyncService.subscribeSync()` untuk respon instan sub-detik.
  - Menjalankan interval 5 detik untuk pengecekan data berkala tanpa interupsi visual.
  - Memperbarui `lessonPeriods`, `boards`, `activeBoardId`, dan `config` secara reaktif dan instan.
- **`schema.sql`**: Memperbarui skrip database dengan perintah `ALTER PUBLICATION supabase_realtime ADD TABLE ...` agar sinkronisasi tingkat replikasi PostgreSQL juga aktif secara resmi.
