// src/components/admin/NewsSearch.tsx
// Modul Berita Terkini SIMKA Digital Signage (Desain Neo-Brutalism)

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Calendar, 
  MapPin, 
  Flame, 
  GraduationCap, 
  Trophy, 
  Briefcase, 
  Radio, 
  Globe, 
  Clock, 
  ArrowUpDown, 
  Download, 
  Image as ImageIcon, 
  RotateCw,
  Info,
  Check,
  Tag,
  Activity,
  Server,
  WifiOff,
  Terminal,
  Key,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { NewsHealthTest } from './NewsHealthTest';
import { 
  NewsArticle, 
  NewsCategory, 
  NewsSearchParams, 
  NewsSortOption, 
  NewsDateRange,
  AIQueryUnderstanding,
  FactCheckResult,
  UserRole,
  NewsSearchErrorDetail,
  NewsErrorCode
} from '../../types';
import { newsService } from '../../services/newsService';
import { COUNTRIES, EDUCATION_LEVELS, JOB_FIELDS } from '../../data/indonesiaLocations';

interface NewsSearchProps {
  userRole: UserRole;
}

const CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: 'SEMUA', label: 'SEMUA' },
  { id: 'BENCANA', label: '🚨 BENCANA' },
  { id: 'PENDIDIKAN', label: '🎓 PENDIDIKAN' },
  { id: 'KEJUARAAN', label: '🏆 KEJUARAAN' },
  { id: 'PEKERJAAN', label: '💼 PEKERJAAN' },
  { id: 'SEKOLAH', label: '🏫 SEKOLAH' },
  { id: 'PEMERINTAHAN', label: '🏛️ PEMERINTAHAN' },
  { id: 'EKONOMI', label: '📈 EKONOMI' },
  { id: 'TEKNOLOGI', label: '💻 TEKNOLOGI' },
  { id: 'KESEHATAN', label: '🩺 KESEHATAN' },
  { id: 'NASIONAL', label: '🇮🇩 NASIONAL' },
  { id: 'INTERNASIONAL', label: '🌐 INTERNASIONAL' },
  { id: 'OLAHRAGA', label: '⚽ OLAHRAGA' },
  { id: 'BUDAYA', label: '🎭 BUDAYA' },
  { id: 'LALU_LINTAS', label: '🚦 LALU LINTAS' },
  { id: 'PENGUMUMAN', label: '📢 PENGUMUMAN' },
  { id: 'LAINNYA', label: '📌 LAINNYA' },
];

const PRESETS = [
  { label: '🔥 Populer Hari Ini', query: 'berita terpopuler terkini indonesia', category: 'SEMUA' },
  { label: '🚨 Bencana Terkini', query: 'bencana alam banjir cuaca ekstrem', category: 'BENCANA' },
  { label: '🎓 Pendidikan Terkini', query: 'kemendikbud sekolah pendidikan guru siswa', category: 'PENDIDIKAN' },
  { label: '🏆 Prestasi & Kejuaraan', query: 'juara olimpiade medali prestasi siswa', category: 'KEJUARAAN' },
  { label: '💼 Lowongan Kerja', query: 'lowongan kerja loker smk d3 s1', category: 'PEKERJAAN' },
  { label: '📢 Info Sekolah', query: 'pengumuman sekolah kalender pendidikan kurikulum', category: 'SEKOLAH' },
  { label: '🌎 Nasional', query: 'nasional indonesia terkini', category: 'NASIONAL' },
  { label: '🌐 Internasional', query: 'internasional dunia perkembangan teknologi', category: 'INTERNASIONAL' },
];

export const NewsSearch: React.FC<NewsSearchProps> = ({ userRole }) => {
  // Search parameters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('SEMUA');
  const [selectedCountry, setSelectedCountry] = useState('Indonesia');
  const [selectedProvince, setSelectedProvince] = useState('Sumatera Utara');
  const [selectedCity, setSelectedCity] = useState('Semua Kota/Kabupaten');
  const [selectedDateRange, setSelectedDateRange] = useState<NewsDateRange>('latest');
  const [selectedSort, setSelectedSort] = useState<NewsSortOption>('RELEVAN_TERBARU');

  // Job specific filters
  const [selectedEducation, setSelectedEducation] = useState('Semua Pendidikan');
  const [selectedJobField, setSelectedJobField] = useState('Semua Bidang');

  // Results & status state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [recommendations, setRecommendations] = useState<NewsArticle[]>([]);
  const [queryUnderstanding, setQueryUnderstanding] = useState<AIQueryUnderstanding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AI SEDANG MENCARI BERITA TERKINI...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<NewsSearchErrorDetail | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showHealthPanel, setShowHealthPanel] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [healthResult, setHealthResult] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Fact Check state
  const [activeFactCheck, setActiveFactCheck] = useState<FactCheckResult | null>(null);
  const [isFactChecking, setIsFactChecking] = useState(false);

  // Provinces and cities helper
  const currentCountryData = COUNTRIES.find(c => c.name === selectedCountry) || COUNTRIES[0];
  const currentProvinceData = currentCountryData.provinces.find(p => p.name === selectedProvince);
  const availableCities = currentProvinceData ? currentProvinceData.cities : ['Semua Kota/Kabupaten'];

  const getErrorCodeBadge = (code?: NewsErrorCode) => {
    switch (code) {
      case 'EDGE_FUNCTION_UNREACHABLE':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-900',
          border: 'border-rose-800',
          icon: WifiOff,
          label: 'EDGE_FUNCTION_UNREACHABLE'
        };
      case 'EDGE_FUNCTION_HTTP_ERROR':
      case 'EDGE_FUNCTION_ERROR':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-900',
          border: 'border-rose-800',
          icon: AlertTriangle,
          label: code === 'EDGE_FUNCTION_HTTP_ERROR' ? 'EDGE_FUNCTION_HTTP_ERROR' : 'EDGE_FUNCTION_ERROR'
        };
      case 'OMNIROUTE_AUTH_ERROR':
        return {
          bg: 'bg-red-100',
          text: 'text-red-900',
          border: 'border-red-800',
          icon: Key,
          label: 'OMNIROUTE_AUTH_ERROR'
        };
      case 'OMNIROUTE_CONNECTION_ERROR':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-900',
          border: 'border-orange-800',
          icon: Activity,
          label: 'OMNIROUTE_CONNECTION_ERROR'
        };
      case 'OMNIROUTE_NOT_FOUND':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-900',
          border: 'border-amber-800',
          icon: Server,
          label: 'OMNIROUTE_NOT_FOUND'
        };
      case 'PROVIDER_ERROR':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-900',
          border: 'border-purple-800',
          icon: Radio,
          label: 'PROVIDER_ERROR'
        };
      case 'OMNIROUTE_ERROR':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-900',
          border: 'border-orange-800',
          icon: Activity,
          label: 'OMNIROUTE_ERROR'
        };
      case 'INVALID_RESPONSE':
      case 'INVALID_AI_RESPONSE':
        return {
          bg: 'bg-fuchsia-100',
          text: 'text-fuchsia-900',
          border: 'border-fuchsia-800',
          icon: Terminal,
          label: code === 'INVALID_RESPONSE' ? 'INVALID_RESPONSE' : 'INVALID_AI_RESPONSE'
        };
      case 'NO_NEWS_FOUND':
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-900',
          border: 'border-blue-800',
          icon: Search,
          label: 'NO_NEWS_FOUND'
        };
    }
  };

  // Initial load
  useEffect(() => {
    handleSearch({
      query: 'berita terkini sumatera utara medan',
      category: 'SEMUA',
      province: 'Sumatera Utara',
      city: 'Medan'
    });
    loadRecommendations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadRecommendations = async () => {
    try {
      const recs = await newsService.getSchoolRecommendations();
      setRecommendations(recs);
    } catch {
      // Non-critical
    }
  };

  const handleHealthCheck = async () => {
    setHealthStatus('checking');
    try {
      const res = await newsService.checkHealth();
      if (res.online) {
        setHealthStatus('online');
        setHealthResult(res.data);
        setErrorDetail(null);
        setErrorMessage(null);
        showToast('✓ EDGE_FUNCTION_ONLINE: Edge Function news-search aktif.');
      } else {
        setHealthStatus('offline');
        setHealthResult(res.error || res.data);
        if (res.error) {
          setErrorDetail(res.error);
          setErrorMessage(res.error.message);
          showToast(`⚠ ${res.error.code}${res.error.responseStatus ? ` (HTTP ${res.error.responseStatus})` : ''}: ${res.error.message}`);
        } else {
          showToast('⚠ Gagal cek status Edge Function news-search');
        }
      }
    } catch (err: any) {
      setHealthStatus('offline');
      setHealthResult(err);
      const detail: NewsSearchErrorDetail = {
        code: 'EDGE_FUNCTION_UNREACHABLE',
        functionName: 'news-search',
        stage: 'health_check',
        title: 'Edge Function Tidak Dapat Dihubungi',
        message: err?.message || 'Gagal mengirim request ke Edge Function news-search',
        errorName: err?.name,
        errorMessage: err?.message
      };
      setErrorDetail(detail);
      setErrorMessage(detail.message);
      showToast(`⚠ EDGE_FUNCTION_UNREACHABLE: ${err?.message || 'Gagal terhubung'}`);
    }
  };

  const handleSearch = async (customParams?: Partial<NewsSearchParams>) => {
    const rawQuery = customParams?.query !== undefined ? customParams.query : searchQuery;
    const finalQuery = (rawQuery || '').trim();

    // Jangan kirim query kosong ke Edge Function
    if (!finalQuery) {
      showToast('Masukkan kata kunci berita terlebih dahulu.');
      setErrorMessage('Masukkan kata kunci berita terlebih dahulu.');
      setErrorDetail({
        code: 'EDGE_FUNCTION_HTTP_ERROR',
        functionName: 'news-search',
        stage: 'request_validation',
        title: 'Kata Kunci Belum Diisi',
        message: 'Masukkan kata kunci berita terlebih dahulu.',
        recommendation: 'Ketik topik atau kata kunci pencarian (misal: "KORUPSI", "berita terkini Sumatera Utara Medan").'
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setErrorDetail(null);
    setLoadingMessage('AI SEDANG MENCARI BERITA TERKINI...');

    try {
      const params: NewsSearchParams = {
        query: finalQuery,
        category: customParams?.category !== undefined ? customParams.category : selectedCategory,
        country: selectedCountry,
        province: customParams?.province !== undefined ? customParams.province : selectedProvince,
        city: customParams?.city !== undefined ? customParams.city : selectedCity,
        dateRange: selectedDateRange,
        sort: selectedSort,
        minEducation: selectedEducation,
        jobField: selectedJobField
      };

      const result = await newsService.searchNews(params);
      setArticles(result.articles);
      setQueryUnderstanding(result.queryUnderstanding || null);

      if (result.articles.length > 0) {
        setErrorMessage(null);
        setErrorDetail(null);
      } else if (result.errorDetail) {
        setErrorMessage(result.errorDetail.message);
        setErrorDetail(result.errorDetail);
      } else if (result.error) {
        setErrorMessage(result.error);
        setErrorDetail({
          code: 'EDGE_FUNCTION_ERROR',
          title: 'Gagal Memuat Berita',
          message: result.error,
          errorMessage: result.error
        });
      } else {
        const notFound: NewsSearchErrorDetail = {
          code: 'NO_NEWS_FOUND',
          title: 'Berita Tidak Ditemukan',
          message: 'Pencarian AI tidak menemukan artikel berita yang cocok dengan kriteria ini.',
          recommendation: 'Coba gunakan kata kunci yang lebih umum atau pilih preset kategori berita di atas.'
        };
        setErrorMessage(notFound.message);
        setErrorDetail(notFound);
      }
    } catch (err: any) {
      console.error('[SIMKA BERITA] Search error:', err);
      const detail: NewsSearchErrorDetail = {
        code: 'EDGE_FUNCTION_HTTP_ERROR',
        title: 'Gagal Memproses Pencarian Berita',
        message: err.message || 'Terjadi kesalahan saat memproses pencarian berita.',
        errorName: err.name,
        errorMessage: err.message,
        recommendation: 'Periksa log terminal atau coba ulangi pencarian dengan kata kunci lain.'
      };
      setErrorMessage(detail.message);
      setErrorDetail(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setSearchQuery(preset.query);
    setSelectedCategory(preset.category as NewsCategory);
    handleSearch({ query: preset.query, category: preset.category as NewsCategory });
  };

  const handleFactCheck = async (article: NewsArticle) => {
    setIsFactChecking(true);
    setLoadingMessage('MEMERIKSA SUMBER & MENGECEK FAKTA...');
    try {
      const result = await newsService.verifyArticleSource(article);
      setActiveFactCheck(result);
    } catch (err) {
      console.error('Fact check error:', err);
      showToast('Gagal memverifikasi sumber saat ini.');
    } finally {
      setIsFactChecking(false);
    }
  };

  const handleSaveToMedia = async (article: NewsArticle) => {
    const res = await newsService.saveNewsImageToMediaLibrary(article);
    showToast(res.message);
  };

  const renderStatusBadge = (status: string, score: number) => {
    switch (status) {
      case 'SUMBER_KUAT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-1.5 border-emerald-800 text-[11px] font-mono font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            ✓ SUMBER KUAT ({score}%)
          </span>
        );
      case 'TERKONFIRMASI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-900 border-1.5 border-cyan-800 text-[11px] font-mono font-black">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
            ✓ TERKONFIRMASI ({score}%)
          </span>
        );
      case 'PERLU_VERIFIKASI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border-1.5 border-amber-800 text-[11px] font-mono font-black">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            ⚠ PERLU VERIFIKASI ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border-1.5 border-rose-800 text-[11px] font-mono font-black">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            ✕ SUMBER TIDAK MEMADAI
          </span>
        );
    }
  };

  return (
    <div id="simka-news-module" className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FFD166] text-[#18181B] font-display font-black text-sm px-5 py-3.5 rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex items-center gap-3 animate-bounce">
          <Info className="w-5 h-5 text-[#18181B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner Modul Berita */}
      <header className="bg-[#FFFDF9] border-2.5 border-[#18181B] rounded-2xl p-6 shadow-[4px_4px_0px_#18181B] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#00E5FF] text-[#18181B] border-1.5 border-[#18181B] font-mono font-bold text-xs uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#18181B]" />
              <span>MODUL RESMI DIGITAL SIGNAGE</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#18181B] tracking-tight">
              📰 BERITA TERKINI & KURASI AKTUAL
            </h1>
            <p className="text-neutral-600 text-sm mt-1 max-w-3xl">
              Pencarian berita aktual, penting, dan terverifikasi untuk warga sekolah dengan dukungan pemahaman semantik AI, penyaringan multi-sumber resmi (ANTARA, BMKG, Portals), dan sistem pengecekan kredibilitas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-berita"
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-4 py-2.5 bg-[#FFFDF9] hover:bg-[#F4EFE6] text-[#18181B] font-display font-bold text-xs rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center gap-2 transition-all active:translate-y-[1px]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0096D6]' : ''}`} />
              <span>SEGARKAN</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Rekomendasi AI Untuk SIMKA (Syarat 24: Top 5 Berita Wajib Diketahui) */}
      {recommendations.length > 0 && (
        <section className="bg-[#FFF8E7] border-2 border-[#18181B] rounded-2xl p-5 shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFD166] border border-[#18181B]">
                <Flame className="w-4 h-4 text-rose-600" />
              </span>
              <h2 className="font-display font-black text-sm uppercase tracking-wide text-[#18181B]">
                🔥 5 BERITA YANG WAJIB DIKETAHUI HARI INI (REKOMENDASI AI UNTUK SIMKA)
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-neutral-500">
              Diperbarui Otomatis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {recommendations.slice(0, 5).map((rec, idx) => (
              <a
                key={rec.id || idx}
                href={rec.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FFFDF9] p-3 rounded-xl border-1.5 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:translate-y-[-1px] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-800">
                      #{idx + 1} {rec.category}
                    </span>
                    <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-[#0096D6]" />
                  </div>
                  <h3 className="font-display font-bold text-xs text-[#18181B] line-clamp-2 leading-tight">
                    {rec.title}
                  </h3>
                </div>
                <div className="mt-2 pt-1.5 border-t border-neutral-200 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
                  <span className="truncate">{rec.source_name}</span>
                  <span className="text-emerald-700 font-bold">{rec.confidence_score}%</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 3. Global AI Search Box */}
      <section className="bg-[#FFFDF9] border-2.5 border-[#18181B] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#18181B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0096D6]" />
            <h2 className="font-display font-black text-base text-[#18181B] uppercase tracking-wide">
              SEARCH BERITA DENGAN AI (PEMAHAMAN INTENSI BAHASA ALAMI)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHealthPanel(!showHealthPanel)}
              title="Buka panel diagnostik & tombol TEST HEALTH EDGE FUNCTION"
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showHealthPanel
                  ? 'bg-[#0096D6] text-white border-[#18181B] shadow-[1px_1px_0px_#18181B]'
                  : healthStatus === 'online'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-800'
                  : healthStatus === 'offline'
                  ? 'bg-rose-100 text-rose-900 border-rose-800'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>
                {healthStatus === 'online'
                  ? 'Edge Function: ONLINE'
                  : healthStatus === 'offline'
                  ? 'Edge Function: OFFLINE'
                  : 'Panel Diagnostik'}
              </span>
            </button>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-800 hidden sm:inline-block">
              Web Search Grounded
            </span>
          </div>
        </div>

        {/* Dedicated Health Test Component Panel */}
        {showHealthPanel && (
          <NewsHealthTest
            onSuccess={() => {
              setHealthStatus('online');
              setErrorDetail(null);
              setErrorMessage(null);
            }}
          />
        )}

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-news-search-ai"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ketik bahasa alami, contoh: banjir medan hari ini, lowongan kerja lulusan SMK, prestasi siswa Sumut..."
              className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] border-2 border-[#18181B] rounded-xl font-display font-bold text-sm text-[#18181B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDF9] focus:ring-2 focus:ring-[#00E5FF] transition-all"
            />
          </div>

          <button
            id="btn-submit-news-search"
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="px-6 py-3 bg-[#FFD166] hover:bg-[#FFC633] text-[#18181B] font-display font-black text-sm rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-[#18181B]" />
                <span>MENCARI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#18181B]" />
                <span>CARI DENGAN AI</span>
              </>
            )}
          </button>
        </div>

        {/* AI Intent Understanding Panel */}
        {queryUnderstanding && (
          <div className="bg-[#E0F7FA] p-3.5 rounded-xl border-1.5 border-[#0096D6] flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="font-bold text-[#006064] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0096D6]" />
              HASIL PEMAHAMAN AI:
            </span>
            <span className="px-2 py-0.5 bg-white rounded border border-[#0096D6] text-neutral-800">
              Topik: <strong>{queryUnderstanding.interpretedTopic}</strong>
            </span>
            {queryUnderstanding.interpretedCategory && queryUnderstanding.interpretedCategory !== 'SEMUA' && (
              <span className="px-2 py-0.5 bg-white rounded border border-[#0096D6] text-neutral-800">
                Kategori: <strong>{queryUnderstanding.interpretedCategory}</strong>
              </span>
            )}
            {queryUnderstanding.interpretedLocation && (
              <span className="px-2 py-0.5 bg-white rounded border border-[#0096D6] text-neutral-800 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0096D6]" />
                Lokasi: <strong>{queryUnderstanding.interpretedLocation.city || queryUnderstanding.interpretedLocation.province}</strong>
              </span>
            )}
            {queryUnderstanding.targetAudience && (
              <span className="px-2 py-0.5 bg-white rounded border border-[#0096D6] text-neutral-800">
                Target: <strong>{queryUnderstanding.targetAudience}</strong>
              </span>
            )}
            {queryUnderstanding.interpretedTime && (
              <span className="px-2 py-0.5 bg-white rounded border border-[#0096D6] text-neutral-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0096D6]" />
                Waktu: <strong>{queryUnderstanding.interpretedTime}</strong>
              </span>
            )}
          </div>
        )}

        {/* Preset Search Chips (Syarat 23) */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-mono font-bold uppercase text-neutral-500">
            PRESET PENCARIAN CEPAT:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FFD166] text-[#18181B] font-display font-bold text-xs rounded-lg border border-[#18181B] shadow-[1px_1px_0px_#18181B] transition-all flex items-center gap-1"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills (Syarat 8: 16 Kategori) */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-mono font-bold uppercase text-neutral-500">
            KATEGORI BERITA:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    handleSearch({ category: cat.id });
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-display font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#0096D6] text-white border-[#18181B] shadow-[2px_2px_0px_#18181B]'
                      : 'bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#18181B] border-neutral-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Time Filters (Syarat 9 & 22) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-neutral-200">
          {/* Provinsi */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase mb-1">
              Provinsi (Lokasi)
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity('Semua Kota/Kabupaten');
              }}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#18181B] rounded-lg font-display font-bold text-xs text-[#18181B] focus:outline-none"
            >
              {currentCountryData.provinces.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Kota/Kabupaten */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase mb-1">
              Kota / Kabupaten
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#18181B] rounded-lg font-display font-bold text-xs text-[#18181B] focus:outline-none"
            >
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Filter Waktu (Syarat 22) */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase mb-1">
              Rentang Waktu
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as NewsDateRange)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#18181B] rounded-lg font-display font-bold text-xs text-[#18181B] focus:outline-none"
            >
              <option value="latest">Terkini (Default)</option>
              <option value="today">Hari ini</option>
              <option value="24h">24 Jam Terakhir</option>
              <option value="3d">3 Hari Terakhir</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
            </select>
          </div>

          {/* Sorting (Syarat 21) */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-600 uppercase mb-1">
              Urutan (Sorting)
            </label>
            <select
              value={selectedSort}
              onChange={(e) => {
                const s = e.target.value as NewsSortOption;
                setSelectedSort(s);
                setArticles(prev => newsService.sortArticles(prev, s, searchQuery));
              }}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#18181B] rounded-lg font-display font-bold text-xs text-[#18181B] focus:outline-none"
            >
              <option value="RELEVAN_TERBARU">Paling Relevan + Terbaru</option>
              <option value="TERBARU">Terbaru (Waktu)</option>
              <option value="PALING_RELEVAN">Paling Relevan</option>
              <option value="PALING_PENTING">Paling Penting (Darurat/Bencana/Pendidikan)</option>
              <option value="SUMBER_TERKUAT">Sumber Terkuat (Kredibilitas)</option>
            </select>
          </div>
        </div>

        {/* Khusus Kategori Lowongan Kerja (Syarat 25) */}
        {selectedCategory === 'PEKERJAAN' && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-800 rounded-xl space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-800" />
              <span className="font-display font-black text-xs uppercase text-emerald-950">
                FILTER KHUSUS LOWONGAN PEKERJAAN & VOKASI
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-emerald-900 mb-1">
                  Pendidikan Minimal:
                </label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-800 rounded-lg text-xs font-display font-bold text-emerald-950 focus:outline-none"
                >
                  {EDUCATION_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-emerald-900 mb-1">
                  Bidang Pekerjaan:
                </label>
                <select
                  value={selectedJobField}
                  onChange={(e) => setSelectedJobField(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-800 rounded-lg text-xs font-display font-bold text-emerald-950 focus:outline-none"
                >
                  {JOB_FIELDS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Loading States (Syarat 37) */}
      {isLoading && (
        <div className="bg-[#FFFDF9] border-2 border-[#18181B] rounded-2xl p-10 text-center shadow-[3px_3px_0px_#18181B] space-y-3">
          <RotateCw className="w-8 h-8 animate-spin text-[#0096D6] mx-auto" />
          <h3 className="font-display font-black text-base text-[#18181B]">
            {loadingMessage}
          </h3>
          <p className="text-xs font-mono text-neutral-500">
            Memverifikasi keaslian sumber, memeriksa domain resmi, dan mengevaluasi status kepercayaan berita...
          </p>
        </div>
      )}

      {/* 5. Error & Empty State (Syarat 35, 36, dan Petunjuk Granular Error Handling) */}
      {!isLoading && (errorMessage || errorDetail) && (
        <div className="bg-[#FFFDF9] border-2.5 border-[#18181B] rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#18181B] space-y-5 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              {(() => {
                const badge = getErrorCodeBadge(errorDetail?.code);
                const IconComponent = badge.icon;
                return (
                  <div className={`p-2.5 rounded-xl ${badge.bg} ${badge.border} border-2`}>
                    <IconComponent className={`w-6 h-6 ${badge.text}`} />
                  </div>
                );
              })()}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-black uppercase px-2 py-0.5 rounded bg-neutral-900 text-white tracking-wider">
                    {errorDetail?.code || 'ERROR'}
                  </span>
                  {errorDetail?.responseStatus && (
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-800">
                      HTTP {errorDetail.responseStatus}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-[#18181B] mt-1">
                  {errorDetail?.title || errorMessage}
                </h3>
              </div>
            </div>

            <button
              onClick={handleHealthCheck}
              disabled={healthStatus === 'checking'}
              className="px-3.5 py-1.5 rounded-lg border-2 border-[#18181B] bg-[#E0F7FA] hover:bg-[#B2EBF2] text-[#006064] text-xs font-mono font-bold shadow-[2px_2px_0px_#18181B] flex items-center gap-1.5 active:translate-y-[1px] transition-all self-start sm:self-auto flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>{healthStatus === 'checking' ? 'Mengecek...' : 'Test Health Edge Function'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-display font-semibold text-neutral-800 leading-relaxed">
              {errorDetail?.message || errorMessage}
            </p>

            {errorDetail?.recommendation && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 font-mono">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black uppercase tracking-wide">Rekomendasi Tindakan: </span>
                  <span>{errorDetail.recommendation}</span>
                </div>
              </div>
            )}

            {/* Jika Edge Function belum dideploy (HTTP 404), tampilkan perintah CLI Supabase */}
            {((errorDetail?.code === 'EDGE_FUNCTION_HTTP_ERROR' || errorDetail?.code === 'OMNIROUTE_NOT_FOUND') && errorDetail.responseStatus === 404) && (
              <div className="p-4 bg-neutral-900 text-emerald-400 rounded-xl border-2 border-[#18181B] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-1 border-b border-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Perintah Deploy Edge Function (Supabase CLI)
                  </span>
                  <span className="text-neutral-500">Function: news-search</span>
                </div>
                <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
                  <code className="text-emerald-300 font-bold select-all">
                    npx supabase functions deploy news-search --no-verify-jwt
                  </code>
                </div>
              </div>
            )}

            {/* Technical Diagnostics Accordion */}
            {(errorDetail?.functionName || errorDetail?.stage || errorDetail?.errorName || errorDetail?.errorMessage || errorDetail?.responseBody) && (
              <div className="border border-neutral-300 rounded-xl overflow-hidden bg-neutral-50 text-xs font-mono">
                <button
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="w-full px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-neutral-600" />
                    Detail Diagnostik Teknis (Function, Stage, HTTP & Response)
                  </span>
                  {showTechDetails ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </button>

                {showTechDetails && (
                  <div className="p-4 space-y-2 text-neutral-700 bg-white border-t border-neutral-200 overflow-x-auto">
                    <div>
                      <span className="text-neutral-500 font-bold">Function Name: </span>
                      <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-900 font-bold">{errorDetail.functionName || 'news-search'}</code>
                    </div>
                    {errorDetail.stage && (
                      <div>
                        <span className="text-neutral-500 font-bold">Tahap (Stage): </span>
                        <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-900">{errorDetail.stage}</code>
                      </div>
                    )}
                    {errorDetail.errorName && (
                      <div>
                        <span className="text-neutral-500 font-bold">Error Name: </span>
                        <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-900">{errorDetail.errorName}</code>
                      </div>
                    )}
                    {errorDetail.errorMessage && (
                      <div>
                        <span className="text-neutral-500 font-bold">Error Message: </span>
                        <span className="text-neutral-900 font-medium">{errorDetail.errorMessage}</span>
                      </div>
                    )}
                    {errorDetail.responseStatus && (
                      <div>
                        <span className="text-neutral-500 font-bold">HTTP Status: </span>
                        <span className="font-bold text-rose-700">{errorDetail.responseStatus}</span>
                      </div>
                    )}
                    {errorDetail.responseBody && (
                      <div>
                        <span className="text-neutral-500 font-bold block mb-1">Response Body:</span>
                        <pre className="p-2.5 bg-neutral-900 text-neutral-200 rounded-lg text-[11px] overflow-x-auto font-mono">
                          {typeof errorDetail.responseBody === 'object'
                            ? JSON.stringify(errorDetail.responseBody, null, 2)
                            : String(errorDetail.responseBody)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-neutral-200">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-4 py-2 bg-[#FFD166] hover:bg-[#FFC633] text-[#18181B] font-display font-black text-xs rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] transition-all flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#18181B]" />
              <span>Coba Lagi Pencarian Ini</span>
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('SEMUA');
                handleSearch({ query: '', category: 'SEMUA' });
              }}
              className="px-4 py-2 bg-[#FAF8F5] hover:bg-white text-[#18181B] font-display font-bold text-xs rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] transition-all"
            >
              Lihat Semua Berita Terkini
            </button>
          </div>
        </div>
      )}

      {/* 6. Daftar Hasil Pencarian Berita (Syarat 15: Kartu Berita Neo-Brutalism) */}
      {!isLoading && !errorMessage && articles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-neutral-600 uppercase">
              MENAMPILKAN <strong>{articles.length} ARTIKEL BERITA TERVERIFIKASI</strong>
            </span>
            <span className="text-xs font-mono text-neutral-500">
              Kategori: <strong>{selectedCategory}</strong> • Wilayah: <strong>{selectedCity !== 'Semua Kota/Kabupaten' ? selectedCity : selectedProvince}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => {
              return (
                <article
                  key={article.id}
                  className="bg-[#FFFDF9] border-2.5 border-[#18181B] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#18181B] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                >
                  {/* Bagian Gambar Berita (Syarat 17: Gambar Asli atau Placeholder FOTO TIDAK TERSEDIA) */}
                  <div className="relative h-48 bg-neutral-200 border-b-2 border-[#18181B] overflow-hidden group">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Jika gagal load gambar asli, sembunyikan atau gantikan placeholder
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F3EFE6] text-neutral-500 p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-neutral-400 mb-1" />
                        <span className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-500">
                          FOTO TIDAK TERSEDIA
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          (Tidak mengarang foto AI fiktif)
                        </span>
                      </div>
                    )}

                    {/* Tag Kategori & Lokasi di pojok foto */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#18181B] text-white font-mono font-black text-[10px] uppercase border border-white/20">
                        {article.category}
                      </span>
                      {(article.city || article.province) && (
                        <span className="px-2 py-0.5 rounded-md bg-white/95 text-[#18181B] font-mono font-bold text-[10px] border border-[#18181B] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#0096D6]" />
                          {article.city || article.province}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Konten Kartu */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Status Verifikasi (Syarat 10: SUMBER KUAT / TERKONFIRMASI / PERLU VERIFIKASI) */}
                      <div>
                        {renderStatusBadge(article.verification_status, article.confidence_score)}
                      </div>

                      {/* Judul Berita */}
                      <h3 className="font-display font-black text-base text-[#18181B] leading-snug line-clamp-2 hover:text-[#0096D6] transition-colors">
                        {article.title}
                      </h3>

                      {/* Ringkasan Faktual AI (Syarat 19: Ringkasan tanpa mengubah fakta) */}
                      <p className="text-neutral-700 text-xs leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>

                      {/* Detail Lowongan Kerja jika kategori PEKERJAAN */}
                      {article.job_details && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-800 rounded-lg text-[11px] font-mono text-emerald-950 space-y-1">
                          <div>Pendidikan: <strong>{article.job_details.min_education}</strong></div>
                          <div>Bidang: <strong>{article.job_details.job_field}</strong></div>
                          <div>Batas: <strong>{article.job_details.deadline}</strong></div>
                        </div>
                      )}

                      {/* Atribusi Sumber & Tanggal (Syarat 18) */}
                      <div className="pt-2 border-t border-neutral-200 text-[11px] font-mono text-neutral-600 flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#0096D6]" />
                          <span className="font-bold text-[#18181B] truncate max-w-[140px]">{article.source_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Terkini'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi: BACA SUMBER ASLI, PERIKSA SUMBER, SIMPAN KE MEDIA */}
                    <div className="pt-3 border-t-2 border-[#18181B] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Tombol Baca Sumber Asli (Syarat 16: WAJIB Buka URL Asli di Tab Baru) */}
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-[#00E5FF] hover:bg-[#00D0E8] text-[#18181B] font-display font-black text-xs rounded-xl border-1.5 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center gap-1 text-center"
                        >
                          <span>BACA ASLI</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>

                        {/* Tombol Periksa Sumber AI Fact Check (Syarat 20) */}
                        <button
                          onClick={() => handleFactCheck(article)}
                          className="px-3 py-2 bg-[#FFFDF9] hover:bg-[#F3EFE6] text-[#18181B] font-display font-bold text-xs rounded-xl border-1.5 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0096D6]" />
                          <span>PERIKSA</span>
                        </button>
                      </div>

                      {/* Tombol Simpan ke Media (Syarat 32: Terpisah & Tidak Otomatis) */}
                      {article.image_url && (
                        <button
                          onClick={() => handleSaveToMedia(article)}
                          className="w-full px-3 py-1.5 bg-[#FAF8F5] hover:bg-emerald-100 text-neutral-700 hover:text-emerald-900 font-mono font-bold text-[11px] rounded-lg border border-neutral-300 hover:border-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3 h-3" />
                          <span>SIMPAN GAMBAR KE MEDIA</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Modal AI Fact Check (Syarat 20: Cross-Check & Evaluasi Bukti) */}
      {activeFactCheck && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] border-3 border-[#18181B] rounded-2xl max-w-xl w-full p-6 shadow-[8px_8px_0px_#18181B] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0096D6]" />
                <h3 className="font-display font-black text-base text-[#18181B] uppercase">
                  HASIL ANALISIS AI FACT CHECK (CROSS-CHECK)
                </h3>
              </div>
              <button
                onClick={() => setActiveFactCheck(null)}
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-rose-100 border border-[#18181B] flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500">Artikel yang Diteliti:</span>
                <h4 className="font-display font-black text-sm text-[#18181B] mt-0.5">
                  {activeFactCheck.title}
                </h4>
              </div>

              {/* Status & Confidence Score */}
              <div className="p-3.5 bg-[#FAF8F5] border-2 border-[#18181B] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Hasil Evaluasi:</span>
                  <div className="font-display font-black text-sm text-[#18181B] mt-0.5">
                    {activeFactCheck.status === 'TERKONFIRMASI' && '✓ TERKONFIRMASI OLEH SUMBER KREDIBEL'}
                    {activeFactCheck.status === 'SEBAGIAN_TERKONFIRMASI' && '⚠ SEBAGIAN TERKONFIRMASI (PERLU PEMBANDING)'}
                    {activeFactCheck.status === 'PERLU_VERIFIKASI' && '⚠ PERLU VERIFIKASI LANJUTAN'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Skor Keyakinan:</span>
                  <div className="font-mono font-black text-lg text-emerald-700">
                    {activeFactCheck.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Catatan Verifikasi */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-neutral-600">Catatan Pengecekan AI:</span>
                <ul className="space-y-1 text-xs font-mono text-neutral-700 bg-white p-3 rounded-xl border border-neutral-300">
                  {activeFactCheck.analysisNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kesimpulan Ringkas */}
              <div className="p-3 bg-cyan-50 border border-[#0096D6] rounded-xl text-xs text-neutral-800 leading-relaxed">
                <strong>Verifikasi Klaim:</strong> {activeFactCheck.claimVerification}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setActiveFactCheck(null)}
                className="px-5 py-2.5 bg-[#FFD166] text-[#18181B] font-display font-black text-xs rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]"
              >
                TUTUP LAPORAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
