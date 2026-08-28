-- SCHEMA FOR SIMKA DIGITAL SIGNAGE EMKA
-- Database: Supabase (PostgreSQL)

-- 1. Tabel Media (Foto & Poster)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    orientation TEXT, -- 'PORTRAIT', 'LANDSCAPE', 'SQUARE'
    type TEXT NOT NULL, -- 'foto', 'poster'
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Video
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    duration NUMERIC, -- dalam detik
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Slides (Konfigurasi Konten)
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id TEXT NOT NULL, -- 'slide-1', 'slide-2', 'slide-3'
    urutan INTEGER DEFAULT 0,
    judul TEXT,
    tipe TEXT NOT NULL, -- 'PENGUMUMAN', 'VIDEO', 'GALERI', 'SPLIT', 'GRID'
    durasi INTEGER DEFAULT 10, -- durasi tampil (detik)
    efek_transisi TEXT DEFAULT 'fade',
    durasi_transisi INTEGER DEFAULT 1000, -- dalam milidetik
    aktif BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}', -- Menyimpan metadata spesifik tipe layout
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Slide Media (Relasi Many-to-Many untuk Galeri/Grid)
CREATE TABLE IF NOT EXISTS slide_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slide_id UUID REFERENCES slides(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    posisi INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Running Text
CREATE TABLE IF NOT EXISTS running_text (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Jadwal Les
CREATE TABLE IF NOT EXISTS jadwal_les (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT, -- Nama sesi (misal: LES 1)
    period_number INTEGER, -- Urutan jam ke-
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject TEXT, -- Mata Pelajaran
    teacher TEXT, -- Nama Guru
    room TEXT, -- Ruangan
    is_break BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_les ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN AKSES PUBLIK (Untuk kemudahan operasional signage)
-- Catatan: Untuk produksi, disarankan memperketat policy ini.
DROP POLICY IF EXISTS "Public Access" ON media;
DROP POLICY IF EXISTS "Public Access" ON videos;
DROP POLICY IF EXISTS "Public Access" ON slides;
DROP POLICY IF EXISTS "Public Access" ON slide_media;
DROP POLICY IF EXISTS "Public Access" ON running_text;
DROP POLICY IF EXISTS "Public Access" ON jadwal_les;

CREATE POLICY "Enable Access for All" ON media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable Access for All" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable Access for All" ON slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable Access for All" ON slide_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable Access for All" ON running_text FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable Access for All" ON jadwal_les FOR ALL USING (true) WITH CHECK (true);
