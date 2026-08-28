import React, { useState } from 'react';
import { DisplayConfig } from '../../types';
import { 
  Settings, 
  Tv, 
  ShieldAlert, 
  Clock, 
  Palette, 
  Building2, 
  Save, 
  Check, 
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface AdminSettingsProps {
  config: DisplayConfig;
  onUpdateConfig: (config: Partial<DisplayConfig>) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  config,
  onUpdateConfig
}) => {
  const [formData, setFormData] = useState<DisplayConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0096D6]">
            <Settings className="w-4 h-4 text-[#0096D6]" />
            <span>PENGATURAN GLOBAL SISTEM DIGITAL SIGNAGE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-[#18181B] mt-1">
            PENGATURAN
          </h2>
          <p className="text-sm font-medium text-neutral-600 mt-0.5">
            Konfigurasi identitas display, format jam, tema header, dan protokol siaran darurat.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-6 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4 text-[#FFD166]" />}
          <span>{savedSuccess ? 'BERHASIL DISIMPAN' : 'SIMPAN PENGATURAN'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Identitas Header Display */}
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
          <div className="flex items-center gap-2 text-sm font-black font-display text-[#18181B] border-b-2 border-neutral-200 pb-3">
            <Building2 className="w-4 h-4 text-[#0096D6]" />
            <span>IDENTITAS HEADER DIGITAL SIGNAGE</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                TEKS BRAND KIRI (LOGO / NAMA SEKOLAH)
              </label>
              <input
                type="text"
                value={formData.headerLeftText || ''}
                onChange={(e) => setFormData({ ...formData, headerLeftText: e.target.value })}
                className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                JUDUL TENGAH HEADER
              </label>
              <input
                type="text"
                value={formData.headerCenterText || ''}
                onChange={(e) => setFormData({ ...formData, headerCenterText: e.target.value })}
                className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                TAG KANAN HEADER (LABEL JAM & JADWAL)
              </label>
              <input
                type="text"
                value={formData.headerRightTag || ''}
                onChange={(e) => setFormData({ ...formData, headerRightTag: e.target.value })}
                className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Format Jam & Tampilan */}
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2.5 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
          <div className="flex items-center gap-2 text-sm font-black font-display text-[#18181B] border-b-2 border-neutral-200 pb-3">
            <Clock className="w-4 h-4 text-[#0096D6]" />
            <span>FORMAT WAKTU & TANGGAL INDONESIA</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                ZONA WAKTU
              </label>
              <select
                className="w-full bg-white p-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] focus:outline-none"
              >
                <option value="WIB">WIB (Waktu Indonesia Barat - UTC+7)</option>
                <option value="WITA">WITA (Waktu Indonesia Tengah - UTC+8)</option>
                <option value="WIT">WIT (Waktu Indonesia Timur - UTC+9)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showClock}
                  onChange={(e) => setFormData({ ...formData, showClock: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span>Tampilkan Jam Digital Real-time di Header</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showDate}
                  onChange={(e) => setFormData({ ...formData, showDate: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span>Tampilkan Tanggal Indonesia Lengkap di Header</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Protokol Siaran Darurat */}
        <div className="lg:col-span-2 bg-rose-50/70 p-6 rounded-2xl border-2.5 border-rose-400 shadow-[4px_4px_0px_#E06D53] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-rose-200 pb-3">
            <div className="flex items-center gap-2 text-sm font-black font-display text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>PENGATURAN PROTOKOL SIARAN DARURAT (EMERGENCY OVERRIDE)</span>
            </div>

            <label className="flex items-center gap-2 text-xs font-black text-rose-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emergencyOverride}
                onChange={(e) => setFormData({ ...formData, emergencyOverride: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600"
              />
              <span>AKTIFKAN SIARAN DARURAT SEKARANG</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-rose-900 mb-1">
                JUDUL PERINGATAN DARURAT
              </label>
              <input
                type="text"
                value={formData.emergencyMessage?.title || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyMessage: {
                    ...formData.emergencyMessage,
                    title: e.target.value
                  }
                })}
                className="w-full bg-white p-2.5 rounded-xl border-2 border-rose-300 text-xs font-bold text-[#18181B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-rose-900 mb-1">
                LEVEL BAHAYA
              </label>
              <select
                value={formData.emergencyMessage?.level || 'critical'}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyMessage: {
                    ...formData.emergencyMessage,
                    level: e.target.value as any
                  }
                })}
                className="w-full bg-white p-2.5 rounded-xl border-2 border-rose-300 text-xs font-bold text-[#18181B] focus:outline-none"
              >
                <option value="critical">KRITIS / BAHAYA TINGGI (MERAH)</option>
                <option value="warning">PERINGATAN WASPADA (ORANYE)</option>
                <option value="info">INFORMASI PENTING (KUNING)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold text-rose-900 mb-1">
                PETUNJUK TINDAKAN & EVAKUASI UNTUK SISWA / GURU
              </label>
              <textarea
                rows={2}
                value={formData.emergencyMessage?.actionInstruction || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyMessage: {
                    ...formData.emergencyMessage,
                    actionInstruction: e.target.value
                  }
                })}
                className="w-full bg-white p-2.5 rounded-xl border-2 border-rose-300 text-xs font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
