// src/services/newsProvider.ts
// Arsitektur Multi-Provider Berita untuk SIMKA Digital Signage

import { supabase } from '../lib/supabase';
import { NewsArticle, NewsCategory, NewsSearchParams, NewsVerificationStatus, NewsSearchErrorDetail } from '../types';

export interface OmniRouteSearchResult {
  articles: NewsArticle[];
  error?: string;
  errorDetail?: NewsSearchErrorDetail;
  status?: number;
  source?: string;
}

export interface NewsProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  search(params: NewsSearchParams): Promise<NewsArticle[] | OmniRouteSearchResult>;
}

/**
 * Normalisasi dan ekstraksi kategori dari teks berita
 */
export function detectCategory(title: string, summary: string, requestedCategory?: string): NewsCategory {
  if (requestedCategory && requestedCategory !== 'SEMUA') {
    return requestedCategory as NewsCategory;
  }

  const combined = `${title} ${summary}`.toLowerCase();

  if (combined.includes('banjir') || combined.includes('gempa') || combined.includes('longsor') || combined.includes('erupsi') || combined.includes('tsunami') || combined.includes('kebakaran hutan') || combined.includes('puting beliung') || combined.includes('bnpb') || combined.includes('bpbd')) {
    return 'BENCANA';
  }
  if (combined.includes('lowongan') || combined.includes('loker') || combined.includes('karir') || combined.includes('rekrutmen') || combined.includes('kemnaker') || combined.includes('bkn') || combined.includes('pekerjaan') || combined.includes('magang')) {
    return 'PEKERJAAN';
  }
  if (combined.includes('juara') || combined.includes('olimpiade') || combined.includes('medali') || combined.includes('prestasi') || combined.includes('kompetisi') || combined.includes('turnamen') || combined.includes('pemenang')) {
    return 'KEJUARAAN';
  }
  if (combined.includes('sekolah') || combined.includes('smk') || combined.includes('sma') || combined.includes('siswa') || combined.includes('guru') || combined.includes('kurikulum') || combined.includes('kemendikbud') || combined.includes('kemendikdasmen') || combined.includes('ppdb') || combined.includes('beasiswa') || combined.includes('kampus') || combined.includes('pelajar')) {
    return 'PENDIDIKAN';
  }
  if (combined.includes('presiden') || combined.includes('gubernur') || combined.includes('walikota') || combined.includes('pemkot') || combined.includes('pemprov') || combined.includes('dprd') || combined.includes('kementerian') || combined.includes('kebijakan')) {
    return 'PEMERINTAHAN';
  }
  if (combined.includes('ai ') || combined.includes('kecerdasan buatan') || combined.includes('aplikasi') || combined.includes('robot') || combined.includes('gadget') || combined.includes('sains') || combined.includes('teknologi') || combined.includes('digital')) {
    return 'TEKNOLOGI';
  }
  if (combined.includes('kesehatan') || combined.includes('rumah sakit') || combined.includes('vaksin') || combined.includes('penyakit') || combined.includes('dokter') || combined.includes('kemenkes') || combined.includes('gizi')) {
    return 'KESEHATAN';
  }
  if (combined.includes('sepak bola') || combined.includes('liga') || combined.includes('badminton') || combined.includes('atlet') || combined.includes('pssi') || combined.includes('pon ') || combined.includes('olahraga')) {
    return 'OLAHRAGA';
  }
  if (combined.includes('inflasi') || combined.includes('pasar') || combined.includes('harga') || combined.includes('umkm') || combined.includes('investasi') || combined.includes('bisnis') || combined.includes('ekonomi')) {
    return 'EKONOMI';
  }
  if (combined.includes('macet') || combined.includes('tol ') || combined.includes('dishub') || combined.includes('lalulintas') || combined.includes('lalu lintas') || combined.includes('rekayasa jalan')) {
    return 'LALU_LINTAS';
  }
  if (combined.includes('budaya') || combined.includes('seni') || combined.includes('festival') || combined.includes('adat') || combined.includes('tari') || combined.includes('museum')) {
    return 'BUDAYA';
  }
  if (combined.includes('pengumuman') || combined.includes('himbauan') || combined.includes('surat edaran')) {
    return 'PENGUMUMAN';
  }

  return 'NASIONAL';
}

/**
 * Verifikasi sumber resmi dan hitung confidence score
 */
export function evaluateVerification(sourceName: string, domain: string, category: NewsCategory, title: string): { status: NewsVerificationStatus; score: number } {
  const s = (sourceName + ' ' + domain).toLowerCase();
  const t = title.toLowerCase();

  // Clickbait detection indicators
  const clickbaitWords = ['bikin geger', 'syok', 'ternyata ini', 'viral!', 'heboh', 'jangan kaget', 'tidak disangka', 'merinding'];
  const hasClickbait = clickbaitWords.some(w => t.includes(w));

  // Kategori Bencana: BNPB, BMKG, BPBD, Pemda
  if (category === 'BENCANA' && (s.includes('bmkg') || s.includes('bnpb') || s.includes('bpbd') || s.includes('pemprov') || s.includes('pemkot'))) {
    return { status: 'SUMBER_KUAT', score: 96 };
  }

  // Kategori Pendidikan: Kemendikdasmen, Kemendikbud, Dinas Pendidikan, Kampus
  if (category === 'PENDIDIKAN' && (s.includes('kemdikbud') || s.includes('kemendikdasmen') || s.includes('dinas pendidikan') || s.includes('bps.go.id'))) {
    return { status: 'SUMBER_KUAT', score: 95 };
  }

  // Kategori Pekerjaan: Kemnaker, BKN, portal resmi
  if (category === 'PEKERJAAN' && (s.includes('kemnaker') || s.includes('bkn.go.id') || s.includes('karirhub') || s.includes('rekrutmen'))) {
    return { status: 'SUMBER_KUAT', score: 94 };
  }

  // Media Berita Nasional Bereputasi Kuat (ANTARA, Kompas, CNN Indonesia, Tempo, Detik, Bisnis)
  if (s.includes('antara') || s.includes('antaranews') || s.includes('kompas') || s.includes('tempo') || s.includes('cnnindonesia') || s.includes('republika')) {
    if (hasClickbait) {
      return { status: 'PERLU_VERIFIKASI', score: 72 };
    }
    return { status: 'SUMBER_KUAT', score: 91 };
  }

  if (s.includes('detik') || s.includes('tribun') || s.includes('liputan6') || s.includes('merdeka') || s.includes('suara')) {
    if (hasClickbait) {
      return { status: 'PERLU_VERIFIKASI', score: 68 };
    }
    return { status: 'TERKONFIRMASI', score: 84 };
  }

  // Domain resmi pemerintah .go.id
  if (domain.includes('.go.id') || domain.includes('.ac.id') || domain.includes('.sch.id')) {
    return { status: 'SUMBER_KUAT', score: 95 };
  }

  if (hasClickbait) {
    return { status: 'PERLU_VERIFIKASI', score: 55 };
  }

  return { status: 'TERKONFIRMASI', score: 78 };
}

/**
 * 1. Provider: Real-time Public Verified Feeds (ANTARA, BMKG, Sumut Portal)
 * Memberikan berita nyata 100% dengan link asli, foto asli, dan tanggal publikasi aktual
 */
export class PublicVerifiedRssProvider implements NewsProvider {
  id = 'public-rss-feed';
  name = 'Verified News Network (ANTARA, BMKG, Portal Resmi)';

  isAvailable(): boolean {
    return true;
  }

  async search(params: NewsSearchParams): Promise<NewsArticle[]> {
    const feedsToFetch: { url: string; defaultCategory: NewsCategory; source: string; defaultProvince?: string; defaultCity?: string }[] = [];

    // Jika pencarian terkait Sumatera Utara / Medan
    const isSumut = (params.province?.toLowerCase().includes('sumatera utara') || params.city?.toLowerCase().includes('medan') || params.query?.toLowerCase().includes('medan') || params.query?.toLowerCase().includes('sumut'));

    if (isSumut) {
      feedsToFetch.push({
        url: 'https://sumut.antaranews.com/rss/terkini.xml',
        defaultCategory: 'NASIONAL',
        source: 'ANTARA Sumut',
        defaultProvince: 'Sumatera Utara',
        defaultCity: 'Medan'
      });
    }

    // Pemilihan feed ANTARA berdasarkan kategori
    if (params.category === 'PENDIDIKAN' || params.category === 'SEKOLAH' || params.query?.toLowerCase().includes('sekolah') || params.query?.toLowerCase().includes('pendidikan')) {
      feedsToFetch.push({
        url: 'https://www.antaranews.com/rss/pendidikan.xml',
        defaultCategory: 'PENDIDIKAN',
        source: 'ANTARA Pendidikan'
      });
    } else if (params.category === 'TEKNOLOGI') {
      feedsToFetch.push({
        url: 'https://www.antaranews.com/rss/teknologi.xml',
        defaultCategory: 'TEKNOLOGI',
        source: 'ANTARA Teknologi'
      });
    } else if (params.category === 'EKONOMI' || params.category === 'PEKERJAAN') {
      feedsToFetch.push({
        url: 'https://www.antaranews.com/rss/ekonomi.xml',
        defaultCategory: params.category === 'PEKERJAAN' ? 'PEKERJAAN' : 'EKONOMI',
        source: 'ANTARA Ekonomi & Bisnis'
      });
    } else if (params.category === 'OLAHRAGA' || params.category === 'KEJUARAAN') {
      feedsToFetch.push({
        url: 'https://www.antaranews.com/rss/olahraga.xml',
        defaultCategory: 'OLAHRAGA',
        source: 'ANTARA Olahraga'
      });
    } else {
      // Default: Top News & Terkini
      feedsToFetch.push({
        url: 'https://www.antaranews.com/rss/terkini.xml',
        defaultCategory: 'NASIONAL',
        source: 'ANTARA Terkini'
      });
      feedsToFetch.push({
        url: 'https://www.antaranews.com/rss/top-news.xml',
        defaultCategory: 'NASIONAL',
        source: 'ANTARA Top News'
      });
    }

    const articles: NewsArticle[] = [];

    // Jika user mencari bencana/gempa, sertakan BMKG
    if (params.category === 'BENCANA' || params.query?.toLowerCase().includes('gempa') || params.query?.toLowerCase().includes('bencana')) {
      try {
        const bmkgRes = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
        if (bmkgRes.ok) {
          const bmkgData = await bmkgRes.json();
          const g = bmkgData.Infogempa?.gempa;
          if (g) {
            articles.push({
              id: `bmkg-auto-${g.Tanggal}-${g.Jam}`,
              title: `Info Gempa Terkini M ${g.Magnitude}: ${g.Wilayah}`,
              summary: `Gempa bumi dirasakan berkekuatan M ${g.Magnitude} pada kedalaman ${g.Kedalaman}. ${g.Potensi}. Lokasi koordinat: ${g.Coordinates}. Sumber rilis resmi BMKG Indonesia.`,
              category: 'BENCANA',
              country: 'Indonesia',
              province: g.Wilayah?.split(',')[1]?.trim() || 'Nasional',
              city: g.Wilayah?.split(',')[0]?.trim() || 'Indonesia',
              source_name: 'BMKG Indonesia',
              source_domain: 'bmkg.go.id',
              source_url: 'https://www.bmkg.go.id',
              image_url: g.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` : null,
              published_at: `${g.Tanggal} ${g.Jam} WIB`,
              discovered_at: new Date().toISOString(),
              verification_status: 'SUMBER_KUAT',
              confidence_score: 98,
              cross_checked: true
            });
          }
        }
      } catch (e) {
        console.warn('BMKG fetch warning:', e);
      }
    }

    // Fetch RSS feeds
    for (const feed of feedsToFetch) {
      try {
        let xmlText = '';
        // Coba proxy internal terlebih dahulu untuk mencegah CORS error di browser
        try {
          const proxyRes = await fetch(`/api/rss-proxy?url=${encodeURIComponent(feed.url)}`);
          if (proxyRes.ok) {
            xmlText = await proxyRes.text();
          }
        } catch {}

        if (!xmlText) {
          const res = await fetch(feed.url);
          if (res.ok) {
            xmlText = await res.text();
          }
        }

        if (!xmlText) continue;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 15);

        for (const item of items) {
          const title = item.querySelector('title')?.textContent?.trim() || '';
          let link = item.querySelector('link')?.textContent?.trim() || '';
          const pubDate = item.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
          let description = item.querySelector('description')?.textContent?.trim() || '';

          // Ekstraksi gambar jika ada di enclosure atau tag img
          let imageUrl: string | null = null;
          const enclosure = item.querySelector('enclosure');
          if (enclosure && enclosure.getAttribute('type')?.includes('image')) {
            imageUrl = enclosure.getAttribute('url');
          }

          // Bersihkan HTML tag dari deskripsi
          if (description.includes('<')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const imgInside = tempDiv.querySelector('img');
            if (!imageUrl && imgInside?.src) {
              imageUrl = imgInside.src;
            }
            description = tempDiv.textContent?.trim() || '';
          }

          if (!title || !link) continue;

          // Periksa filter query jika diisi
          if (params.query) {
            const q = params.query.toLowerCase();
            const words = q.split(/\s+/).filter(w => w.length > 2);
            const textMatch = words.some(w => title.toLowerCase().includes(w) || description.toLowerCase().includes(w));
            if (!textMatch && params.category === 'SEMUA') {
              continue;
            }
          }

          const cat = detectCategory(title, description, params.category === 'SEMUA' ? undefined : params.category);
          const domain = new URL(link).hostname;
          const verification = evaluateVerification(feed.source, domain, cat, title);

          // Ekstraksi detail loker jika kategori Pekerjaan
          let jobDetails = undefined;
          if (cat === 'PEKERJAAN') {
            jobDetails = {
              min_education: params.minEducation || 'SMK / SMA / Diploma',
              job_field: params.jobField || 'Umum & Teknologi',
              company: feed.source,
              deadline: 'Segera / Terbuka'
            };
          }

          articles.push({
            id: `rss-${encodeURIComponent(link).slice(-32)}`,
            title,
            summary: description.slice(0, 240) + (description.length > 240 ? '...' : ''),
            category: cat,
            country: 'Indonesia',
            province: feed.defaultProvince || (params.province && params.province !== 'Semua Provinsi' ? params.province : 'Sumatera Utara'),
            city: feed.defaultCity || (params.city && params.city !== 'Semua Kota/Kabupaten' ? params.city : 'Medan'),
            source_name: feed.source,
            source_domain: domain,
            source_url: link,
            image_url: imageUrl,
            published_at: pubDate,
            discovered_at: new Date().toISOString(),
            verification_status: verification.status,
            confidence_score: verification.score,
            cross_checked: verification.score >= 88,
            job_details: jobDetails
          });
        }
      } catch (err) {
        console.warn(`Error reading RSS ${feed.url}:`, err);
      }
    }

    return articles;
  }
}

/**
 * Klasifikasi detail error pencarian berita sesuai 8 kategori:
 * EDGE_FUNCTION_UNREACHABLE, EDGE_FUNCTION_ERROR, OMNIROUTE_ERROR,
 * OMNIROUTE_AUTH_ERROR, OMNIROUTE_NOT_FOUND, PROVIDER_ERROR,
 * INVALID_AI_RESPONSE, NO_NEWS_FOUND
 */
export function classifyNewsError(
  error: any,
  data: any,
  articlesCount: number,
  statusOverride?: number,
  bodyOverride?: any
): NewsSearchErrorDetail | null {
  if (articlesCount > 0) return null;

  const errorName = error?.name || '';
  const errorMessage = error?.message || '';
  let responseStatus = statusOverride;
  let responseBody = bodyOverride;

  if (error?.context) {
    if (typeof error.context.status === 'number') {
      responseStatus = responseStatus || error.context.status;
    }
  }

  if (data && typeof data === 'object') {
    if (typeof data.status === 'number') {
      responseStatus = responseStatus || data.status;
    }
    if (data.error || data.message) {
      responseBody = responseBody || data;
    }
  }

  const errString = `${errorMessage} ${JSON.stringify(responseBody || {})} ${errorName}`.toLowerCase();

  // 1. OMNIROUTE_AUTH_ERROR (HTTP 401 / OMNIROUTE_API_KEY tidak valid)
  if (
    responseStatus === 401 ||
    responseBody?.status === 401 ||
    responseBody?.error?.toLowerCase().includes('api key') ||
    errString.includes('omniroute api key tidak valid') ||
    errString.includes('unauthorized') ||
    errString.includes('401')
  ) {
    return {
      code: 'OMNIROUTE_AUTH_ERROR',
      title: 'Autentikasi OmniRoute Gagal (HTTP 401)',
      message: responseBody?.error || 'OmniRoute API key tidak valid atau belum dikonfigurasi.',
      errorName: errorName || 'OmniRouteAuthError',
      errorMessage: errorMessage || 'OmniRoute API key tidak valid',
      responseStatus: 401,
      responseBody,
      recommendation: 'Periksa secret OMNIROUTE_API_KEY pada Supabase Edge Function atau environment server.'
    };
  }

  // 2. OMNIROUTE_NOT_FOUND (HTTP 404 / Edge Function news-search belum di-deploy atau endpoint 404)
  const is404 =
    responseStatus === 404 ||
    responseBody?.status === 404 ||
    responseBody?.code === 'NOT_FOUND' ||
    errString.includes('requested function was not found') ||
    errString.includes('endpoint atau model tidak ditemukan') ||
    errString.includes('404 not found') ||
    errString.includes('tidak ditemukan');

  if (is404) {
    const isEdgeFunctionMissing =
      responseBody?.code === 'NOT_FOUND' ||
      errString.includes('requested function was not found') ||
      responseStatus === 404;

    return {
      code: 'OMNIROUTE_NOT_FOUND',
      title: isEdgeFunctionMissing ? 'Edge Function Belum Tersedia (HTTP 404)' : 'Endpoint OmniRoute Tidak Ditemukan (HTTP 404)',
      message: isEdgeFunctionMissing
        ? "Function 'news-search' belum di-deploy ke Supabase project (xrkmwovpxchjxmmdhtop)."
        : (responseBody?.error || 'Endpoint atau model tidak ditemukan pada OMNIROUTE_BASE_URL.'),
      errorName: errorName || 'FunctionsHttpError',
      errorMessage: errorMessage || 'HTTP 404: Requested function was not found',
      responseStatus: 404,
      responseBody,
      recommendation: isEdgeFunctionMissing
        ? 'Jalankan deployment Edge Function: npx supabase functions deploy news-search --no-verify-jwt'
        : 'Periksa nilai OMNIROUTE_BASE_URL dan pastikan route /chat/completions valid.'
    };
  }

  // 3. EDGE_FUNCTION_UNREACHABLE (Network Error, CORS preflight fail, FunctionsFetchError)
  if (
    errorName === 'FunctionsFetchError' ||
    errString.includes('failed to send request') ||
    errString.includes('failed to send a request') ||
    errString.includes('failed to fetch') ||
    errString.includes('networkerror') ||
    errString.includes('cors')
  ) {
    return {
      code: 'EDGE_FUNCTION_UNREACHABLE',
      title: 'Edge Function Tidak Dapat Dihubungi',
      message: 'Gagal mengirim request ke Supabase Edge Function (Network / CORS Preflight Error).',
      errorName: errorName || 'FunctionsFetchError',
      errorMessage: errorMessage || 'Failed to send request to the Edge Function',
      responseStatus,
      responseBody,
      recommendation: 'Pastikan koneksi internet stabil, Edge Function aktif, dan header CORS mengizinkan preflight OPTIONS.'
    };
  }

  // 4. PROVIDER_ERROR (HTTP 503/504 / stage === 'provider')
  if (
    responseStatus === 503 ||
    responseStatus === 504 ||
    responseBody?.stage === 'provider' ||
    errString.includes('provider ai tidak tersedia') ||
    errString.includes('provider error')
  ) {
    return {
      code: 'PROVIDER_ERROR',
      title: `Provider AI Tidak Tersedia (HTTP ${responseStatus || 503})`,
      message: responseBody?.error || 'Provider model AI upstream pada OmniRoute sedang offline atau mengalami gangguan.',
      errorName: errorName || 'ProviderError',
      errorMessage: errorMessage || 'Provider AI tidak tersedia',
      responseStatus: responseStatus || 503,
      responseBody,
      recommendation: 'Coba beberapa saat lagi atau beralih ke provider AI aktif lainnya di OmniRoute.'
    };
  }

  // 5. OMNIROUTE_ERROR (Konfigurasi URL kosong atau error OmniRoute)
  if (
    responseBody?.stage === 'configuration' ||
    errString.includes('omniroute_base_url') ||
    errString.includes('omniroute_api_key belum dikonfigurasi') ||
    responseBody?.stage === 'omniroute' ||
    errString.includes('omniroute tidak dapat dihubungi')
  ) {
    return {
      code: 'OMNIROUTE_ERROR',
      title: 'Konfigurasi OmniRoute Bermasalah',
      message: responseBody?.error || 'Terjadi kesalahan konfigurasi atau komunikasi dengan OmniRoute AI Gateway.',
      errorName: errorName || 'OmniRouteConfigError',
      errorMessage: errorMessage || responseBody?.error || 'OmniRoute error',
      responseStatus: responseStatus || responseBody?.status || 500,
      responseBody,
      recommendation: 'Pastikan OMNIROUTE_BASE_URL dan OMNIROUTE_API_KEY telah dikonfigurasi di secrets Supabase.'
    };
  }

  // 6. INVALID_AI_RESPONSE (Format response JSON rusak atau konten kosong)
  if (
    errString.includes('response omniroute tidak valid') ||
    errString.includes('invalid json') ||
    errString.includes('unexpected token') ||
    (data && data.success === false && errString.includes('tidak valid'))
  ) {
    return {
      code: 'INVALID_AI_RESPONSE',
      title: 'Response AI Tidak Valid',
      message: responseBody?.error || 'Output dari model AI tidak dapat diurai menjadi daftar berita JSON yang valid.',
      errorName: errorName || 'InvalidAiResponseError',
      errorMessage: errorMessage || 'Response OmniRoute tidak valid.',
      responseStatus: responseStatus || 500,
      responseBody,
      recommendation: 'Pastikan prompt menghasilkan JSON array murni tanpa format markdown tambahan.'
    };
  }

  // 7. EDGE_FUNCTION_ERROR (Internal Edge Function Error)
  if (error || (data && data.success === false)) {
    return {
      code: 'EDGE_FUNCTION_ERROR',
      title: `Error Pada Edge Function (HTTP ${responseStatus || 500})`,
      message: responseBody?.error || responseBody?.message || errorMessage || 'Edge Function mengembalikan status error.',
      errorName: errorName || 'FunctionsHttpError',
      errorMessage: errorMessage || 'Edge Function returned a non-2xx status code',
      responseStatus: responseStatus || 500,
      responseBody,
      recommendation: 'Buka dashboard Supabase > Edge Functions > news-search > Logs untuk meninjau error log.'
    };
  }

  // 8. NO_NEWS_FOUND
  if (articlesCount === 0) {
    return {
      code: 'NO_NEWS_FOUND',
      title: 'Tidak Ada Berita Ditemukan',
      message: 'Pencarian AI tidak menemukan artikel berita yang cocok dengan kata kunci atau filter ini.',
      recommendation: 'Gunakan kata kunci yang lebih umum atau gunakan preset topik populer.'
    };
  }

  return null;
}

/**
 * 9. Test Health Endpoint Edge Function
 * Memeriksa status hidup Edge Function sebelum request OmniRoute dilakukan
 */
export async function testEdgeFunctionHealth(): Promise<{
  online: boolean;
  data?: any;
  error?: NewsSearchErrorDetail;
}> {
  console.log('[SIMKA BERITA] Menjalankan test health Edge Function news-search...');
  try {
    const { data, error } = await supabase.functions.invoke('news-search', {
      body: { action: 'health' }
    });

    if (!error && data && data.success === true && data.status === 'online') {
      console.log('[SIMKA BERITA] Test health berhasil: Edge Function online');
      return {
        online: true,
        data
      };
    }

    let status: number | undefined;
    let body: any = undefined;
    if (error?.context) {
      if (typeof error.context.status === 'number') status = error.context.status;
      if (typeof error.context.clone === 'function') {
        try {
          body = await error.context.clone().json();
        } catch {
          try {
            body = await error.context.clone().text();
          } catch {}
        }
      }
    }

    const detail = classifyNewsError(error, data, 0, status, body);
    return {
      online: false,
      data,
      error: detail || {
        code: 'EDGE_FUNCTION_ERROR',
        title: 'Health Check Gagal',
        message: error?.message || 'Edge Function tidak merespon status online.',
        errorName: error?.name,
        errorMessage: error?.message,
        responseStatus: status,
        responseBody: body
      }
    };
  } catch (err: any) {
    return {
      online: false,
      error: {
        code: 'EDGE_FUNCTION_UNREACHABLE',
        title: 'Edge Function Tidak Dapat Dihubungi',
        message: err?.message || 'Gagal mengirim request health test ke Supabase Edge Function.',
        errorName: err?.name || 'NetworkError',
        errorMessage: err?.message
      }
    };
  }
}

/**
 * 2. Provider: OmniRoute AI Gateway (Web Search Grounded)
 * Semua request AI dialirkan melalui Supabase Edge Function 'news-search'
 * OMNIROUTE_API_KEY dikonfigurasi di server
 */
export class OmniRouteNewsProvider implements NewsProvider {
  id = 'omniroute-ai';
  name = 'OmniRoute AI Gateway';

  isAvailable(): boolean {
    return true;
  }

  async search(params: NewsSearchParams): Promise<OmniRouteSearchResult> {
    const query = params.query || '';
    const category = params.category || 'SEMUA';
    const province = params.province || '';
    const city = params.city || '';
    const timeRange = params.dateRange || 'latest';
    const sort = params.sort || 'RELEVAN_TERBARU';

    console.log('[SIMKA BERITA] 3. Memanggil Supabase Edge Function news-search:', {
      query,
      category,
      province,
      city,
      timeRange,
      sort
    });

    let data: any = null;
    let error: any = null;
    let responseStatus: number | undefined = undefined;
    let responseBody: any = undefined;

    try {
      // Pemanggilan function sesuai instruksi Bagian 2
      const response = await supabase.functions.invoke(
        'news-search',
        {
          body: {
            query,
            category,
            province,
            city,
            timeRange,
            sort
          }
        }
      );
      data = response.data;
      error = response.error;

      // Ekstraksi response status dan response body dari error context jika tersedia
      if (error && error.context) {
        if (typeof error.context.status === 'number') {
          responseStatus = error.context.status;
        }
        if (typeof error.context.clone === 'function') {
          try {
            responseBody = await error.context.clone().json();
          } catch {
            try {
              responseBody = await error.context.clone().text();
            } catch {}
          }
        }
      }
    } catch (err: any) {
      error = err;
    }

    // Jika response data mengembalikan struktur error (misal status HTTP non-2xx tapi tertangkap data)
    if (data && typeof data === 'object' && data.success === false) {
      responseBody = responseBody || data;
      if (typeof data.status === 'number') {
        responseStatus = responseStatus || data.status;
      }
    }

    // Jika Edge Function sukses mengembalikan artikel
    if (!error && data && Array.isArray(data.articles) && data.articles.length > 0) {
      console.log('[SIMKA BERITA] 4. Status HTTP: 200 (Supabase Edge Function)');
      console.log('[SIMKA BERITA] 5. Jumlah berita yang diterima:', data.articles.length);
      return {
        articles: data.articles,
        source: data.source || 'Supabase Edge Function -> OmniRoute'
      };
    }

    // Klasifikasi error granular (8 kategori)
    const articlesCount = (data?.articles && Array.isArray(data.articles)) ? data.articles.length : 0;
    const errorDetail = classifyNewsError(error, data, articlesCount, responseStatus, responseBody);

    console.error('[SIMKA BERITA] 4. Edge Function Failure Detail:', {
      code: errorDetail?.code,
      errorName: error?.name,
      errorMessage: error?.message,
      responseStatus,
      responseBody
    });

    return {
      articles: [],
      error: errorDetail?.message || error?.message || 'Pencarian berita dengan AI tidak menghasilkan artikel.',
      errorDetail: errorDetail || undefined,
      status: responseStatus || data?.status || 500
    };
  }
}

