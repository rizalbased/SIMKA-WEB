import React, { useState } from 'react';
import { DisplayConfig } from '../../types';
import { 
  MessageSquareText, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Save, 
  Check, 
  Sliders,
  BellRing,
  Palette,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { runningTextService } from '../../services/runningTextService';
import { SignageRunningText } from '../display/SignageRunningText';

import { settingsService } from '../../services/settingsService';

interface AdminRunningTextProps {
  config: DisplayConfig;
  onUpdateConfig: (config: Partial<DisplayConfig>) => void;
}

export const AdminRunningText: React.FC<AdminRunningTextProps> = ({
  config,
  onUpdateConfig
}) => {
  const [tickerText, setTickerText] = useState(config.runningTextContent);
  const [badgeText, setBadgeText] = useState(config.runningTextCategory || 'INFORMASI RESMI');
  const [speedSec, setSpeedSec] = useState(config.runningTextSpeed || 32);
  const [bgColor, setBgColor] = useState(config.runningTextBgColor || '#0096D6');
  const [textColor, setTextColor] = useState(config.runningTextTextColor || '#FFFFFF');
  const [badgeBg, setBadgeBg] = useState(config.runningTextBadgeBg || '#002840');
  const [badgeTextColor, setBadgeTextColor] = useState(config.runningTextBadgeTextColor || '#FFD166');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preset Palettes with guaranteed readability
  const colorThemes = [
    {
      id: 'cyan-default',
      name: 'Cyan Biru (Default SIMKA)',
      bg: '#0096D6',
      text: '#FFFFFF',
      badgeBg: '#002840',
      badgeText: '#FFD166'
    },
    {
      id: 'white-clean',
      name: 'Putih Bersih & Hitam Kontras',
      bg: '#FFFFFF',
      text: '#18181B',
      badgeBg: '#18181B',
      badgeText: '#FFD166'
    },
    {
      id: 'yellow-high',
      name: 'Kuning Kontras Tinggi',
      bg: '#F9C74F',
      text: '#18181B',
      badgeBg: '#18181B',
      badgeText: '#F9C74F'
    },
    {
      id: 'navy-glow',
      name: 'Biru Navy Gelap & Cyan',
      bg: '#0A192F',
      text: '#00E5FF',
      badgeBg: '#002840',
      badgeText: '#FFD166'
    },
    {
      id: 'black-modern',
      name: 'Hitam Modern',
      bg: '#18181B',
      text: '#FFFFFF',
      badgeBg: '#000000',
      badgeText: '#00E5FF'
    },
    {
      id: 'emerald-green',
      name: 'Hijau Emerald Sekolah',
      bg: '#0D6E6E',
      text: '#FFFFFF',
      badgeBg: '#042424',
      badgeText: '#FFD166'
    }
  ];

  const presets = [
    {
      label: 'Pengumuman Ujian & Kedisiplinan',
      text: 'Selamat Datang di SIMKA Digital Signage EMKA ✦ Penilaian Tengah Semester (PTS) Genap akan dilaksanakan mulai hari Senin, 15 September 2026 ✦ Harap seluruh siswa mempersiapkan kartu ujian dan hadir tepat waktu ✦ Tetap jaga kebersihan lingkungan kelas dan selasar sekolah ✦ Prestasi Gemilang, Karakter Terpuji!'
    },
    {
      label: 'Penerimaan Siswa Baru (SPMB)',
      text: '✦ Penerimaan Murid Baru (SPMB) Gelombang 1 Telah Dibuka! ✦ Kunjungi sekretariat pendaftaran di Gedung Utama atau website resmi sekolah ✦ Dapatkan beasiswa prestasi akademik & non-akademik ✦ Hotline Informasi: 0812-3456-7890 ✦'
    },
    {
      label: 'Prestasi & Ekstrakurikuler',
      text: '✦ Selamat atas Juara 1 Lomba Robotika Tingkat Nasional diraih oleh Tim SIMKA EMKA ✦ Latihan gabungan ekstrakurikuler musik, bela diri, dan futsal diadakan setiap Jumat sore pukul 15.30 WIB ✦ Semangat berkarya untuk negeri! ✦'
    }
  ];

  const applyColorTheme = (theme: typeof colorThemes[0]) => {
    setBgColor(theme.bg);
    setTextColor(theme.text);
    setBadgeBg(theme.badgeBg);
    setBadgeTextColor(theme.badgeText);
  };

  const handleBgColorChange = (newBg: string) => {
    setBgColor(newBg);
    // If user picks a very light background (like white or light yellow), automatically ensure font is dark #18181B so it is never invisible
    const isLightBg = newBg.toLowerCase() === '#ffffff' || newBg.toLowerCase() === '#fff' || newBg.toLowerCase() === '#f9c74f' || newBg.toLowerCase() === '#f3efe6';
    if (isLightBg && textColor.toLowerCase() === '#ffffff') {
      setTextColor('#18181B');
    }
  };

  const handleSave = async () => {
    try {
      // 1. Sync to Supabase
      await runningTextService.updateRunningText([
        { content: tickerText, is_active: true }
      ]);
      
      const rtConfig = {
        runningTextContent: tickerText,
        runningTextCategory: badgeText,
        runningTextSpeed: speedSec,
        runningTextBgColor: bgColor,
        runningTextTextColor: textColor,
        runningTextBadgeBg: badgeBg,
        runningTextBadgeTextColor: badgeTextColor
      };

      await settingsService.saveRunningTextConfig(rtConfig);

      onUpdateConfig(rtConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving running text:', err);
      alert('Gagal menyimpan ke database.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0096D6]">
            <MessageSquareText className="w-4 h-4 text-[#0096D6]" />
            <span>PENGATURAN RUNNING TEXT TICKER DIGITAL SIGNAGE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#18181B] mt-1">
            RUNNING TEXT
          </h2>
          <p className="text-sm font-medium text-neutral-600 mt-0.5">
            Teks pengumuman berjalan kontinu di zona bawah layar (62px) sepanjang siaran aktif.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-6 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4 text-[#FFD166]" />}
          <span>{savedSuccess ? 'BERHASIL DISIMPAN' : 'SIMPAN RUNNING TEXT'}</span>
        </button>
      </div>

      {/* Live Preview Bar */}
      <div className="bg-[#0A192F] p-6 rounded-2xl border-3 border-[#00E5FF]/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#00E5FF]">
          <span className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            PRATINJAU LANGSUNG RUNNING TEXT (1920 × 62PX)
          </span>
          <span className="text-gray-400">Kecepatan: {speedSec} detik/siklus</span>
        </div>

        {/* 62px Scaled Preview Frame */}
        <div className="h-16 w-full rounded-xl overflow-hidden border border-white/20">
          <SignageRunningText 
            config={{
              ...config,
              runningTextContent: tickerText,
              runningTextCategory: badgeText,
              runningTextSpeed: speedSec,
              runningTextBgColor: bgColor,
              runningTextTextColor: textColor,
              runningTextBadgeBg: badgeBg,
              runningTextBadgeTextColor: badgeTextColor
            }} 
          />
        </div>
      </div>

      {/* Form Settings */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-6">
        {/* Color Presets & Custom Pickers */}
        <div className="space-y-4 pb-6 border-b-2 border-neutral-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-700 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#0096D6]" />
              <span>WARNA LATAR BELAKANG & FONT RUNNING TEXT</span>
            </label>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              ✓ Kontras Tinggi Otomatis
            </span>
          </div>

          {/* Quick Color Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {colorThemes.map((t) => {
              const isSelected = bgColor === t.bg && textColor === t.text;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyColorTheme(t)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-[#0096D6] ring-2 ring-[#0096D6] shadow-[2px_2px_0px_#18181B]'
                      : 'border-[#18181B] bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: t.bg }}
                    />
                    <span 
                      className="w-4 h-4 rounded-full border border-black/20 text-[8px] flex items-center justify-center font-bold"
                      style={{ backgroundColor: t.badgeBg, color: t.badgeText }}
                    >
                      A
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#18181B] truncate leading-tight">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Color Pickers with High Contrast Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border-2 border-[#18181B]">
            {/* 1. Background Color */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                WARNA LATAR (BACKGROUND)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="flex-1 bg-[#F8F6F0] p-2 rounded-lg border border-[#18181B] text-xs font-mono font-bold text-[#18181B]"
                />
              </div>
            </div>

            {/* 2. Text / Font Color */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                WARNA FONT / TEKS
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 bg-[#F8F6F0] p-2 rounded-lg border border-[#18181B] text-xs font-mono font-bold text-[#18181B]"
                />
              </div>
            </div>

            {/* 3. Badge Background */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                WARNA BADGE LABEL (KIRI)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={badgeBg}
                  onChange={(e) => setBadgeBg(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={badgeBg}
                  onChange={(e) => setBadgeBg(e.target.value)}
                  className="flex-1 bg-[#F8F6F0] p-2 rounded-lg border border-[#18181B] text-xs font-mono font-bold text-[#18181B]"
                />
              </div>
            </div>

            {/* 4. Badge Font Color */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                WARNA FONT BADGE
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={badgeTextColor}
                  onChange={(e) => setBadgeTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-[#18181B] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={badgeTextColor}
                  onChange={(e) => setBadgeTextColor(e.target.value)}
                  className="flex-1 bg-[#F8F6F0] p-2 rounded-lg border border-[#18181B] text-xs font-mono font-bold text-[#18181B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content and Badge Input with Guaranteed High Contrast Text in Admin */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
              TEKS BADGE KATEGORI (LABEL KIRI)
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Contoh: PENGUMUMAN, INFORMASI RESMI, PRESTASI..."
              className="w-full sm:w-80 bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-sm font-bold text-[#18181B] focus:outline-none focus:border-[#0096D6]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
              ISI KONTEN RUNNING TEXT (TEKS PENGUMUMAN)
            </label>
            <textarea
              rows={4}
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              className="w-full bg-white p-3.5 rounded-xl border-2 border-[#18181B] text-sm font-bold text-[#18181B] focus:outline-none focus:border-[#0096D6]"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Gunakan simbol bintang ✦ atau garis tegak | sebagai pemisah antar kalimat pengumuman.
            </p>
          </div>

          {/* Kecepatan Ticker */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
              KECEPATAN GERAK RUNNING TEXT: {speedSec} DETIK PER ROTASI
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={15}
                max={60}
                step={1}
                value={speedSec}
                onChange={(e) => setSpeedSec(Number(e.target.value))}
                className="w-full max-w-md accent-[#0096D6] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-neutral-700">
                {speedSec < 25 ? '⚡ Cepat' : speedSec > 40 ? '🐢 Lambat / Santai' : '👍 Standar (Ideal)'}
              </span>
            </div>
          </div>
        </div>

        {/* Template Presets */}
        <div className="pt-4 border-t-2 border-neutral-200 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-neutral-500">
            PILIH DARI PRESET TEMPLATE PENGUMUMAN SEKOLAH
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTickerText(p.text)}
                className="p-3 bg-white hover:bg-[#FFF8E7] rounded-xl border-2 border-[#18181B] text-left transition-all shadow-[2px_2px_0px_#18181B] flex flex-col justify-between"
              >
                <div className="font-display font-black text-xs text-[#18181B] mb-1">
                  {p.label}
                </div>
                <div className="text-[11px] text-neutral-600 line-clamp-2">
                  {p.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
