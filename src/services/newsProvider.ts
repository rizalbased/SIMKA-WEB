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
 * Klasifikasi detail error pencarian berita sesuai 7 kategori:
 * EDGE_FUNCTION_UNREACHABLE, EDGE_FUNCTION_HTTP_ERROR, OMNIROUTE_ERROR,
 * OMNIROUTE_AUTH_ERROR, OMNIROUTE_CONNECTION_ERROR, INVALID_RESPONSE, NO_NEWS_FOUND
 */
export function classifyNewsError(
  error: any,
  data: any,
  articlesCount: number,
  statusOverride?: number,
  bodyOverride?: any,
  stageOverride?: string
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
    if (data.error || data.message || data.code) {
      responseBody = responseBody || data;
    }
  }

  const errString = `${errorMessage} ${typeof responseBody === 'object' ? JSON.stringify(responseBody) : responseBody || ''} ${errorName}`.toLowerCase();

  // 1. OMNIROUTE_AUTH_ERROR (HTTP 401 / OMNIROUTE_API_KEY tidak valid)
  if (
    responseStatus === 401 ||
    responseBody?.status === 401 ||
    responseBody?.code === 'OMNIROUTE_AUTH_ERROR' ||
    responseBody?.error?.toLowerCase().includes('api key') ||
    errString.includes('omniroute api key tidak valid') ||
    errString.includes('omniroute_api_key belum dikonfigurasi') ||
    errString.includes('unauthorized') ||
    errString.includes('401')
  ) {
    return {
      code: 'OMNIROUTE_AUTH_ERROR',
      functionName: 'news-search',
      stage: stageOverride || 'omniroute_auth',
      title: 'Autentikasi OmniRoute Gagal (HTTP 401)',
      message: responseBody?.error || 'OmniRoute API key tidak valid atau belum dikonfigurasi pada Supabase Secrets.',
      errorName: errorName || 'OmniRouteAuthError',
      errorMessage: errorMessage || 'OmniRoute API key unauthorized (401)',
      responseStatus: 401,
      responseBody,
      recommendation: 'Periksa secret OMNIROUTE_API_KEY pada Supabase Edge Function Secrets.'
    };
  }

  // 2. OMNIROUTE_CONNECTION_ERROR (Cloudflare tunnel down / connection timeout / ECONNREFUSED)
  if (
    responseBody?.stage === 'omniroute_connection' ||
    responseBody?.code === 'OMNIROUTE_CONNECTION_ERROR' ||
    errString.includes('cloudflare') ||
    errString.includes('econnrefused') ||
    errString.includes('connection refused') ||
    errString.includes('tunnel') ||
    errString.includes('omniroute tidak dapat dihubungi') ||
    ((responseStatus === 502 || responseStatus === 503 || responseStatus === 504) && responseBody?.stage === 'provider')
  ) {
    return {
      code: 'OMNIROUTE_CONNECTION_ERROR',
      functionName: 'news-search',
      stage: stageOverride || 'omniroute_connection',
      title: `Koneksi OmniRoute Bermasalah (HTTP ${responseStatus || 502})`,
      message: responseBody?.error || 'Edge Function tidak dapat terhubung ke endpoint OmniRoute atau Cloudflare Tunnel sedang offline.',
      errorName: errorName || 'OmniRouteConnectionError',
      errorMessage: errorMessage || 'Koneksi ke OmniRoute gagal',
      responseStatus: responseStatus || 502,
      responseBody,
      recommendation: 'Pastikan Cloudflare Quick Tunnel aktif di komputer lokal Anda dan URL OMNIROUTE_BASE_URL dapat diakses publik.'
    };
  }

  // 3. OMNIROUTE_ERROR (Error dari OmniRoute atau konfigurasi Base URL)
  if (
    responseBody?.stage === 'omniroute' ||
    responseBody?.stage === 'configuration' ||
    responseBody?.code === 'OMNIROUTE_ERROR' ||
    errString.includes('omniroute_base_url') ||
    errString.includes('omniroute endpoint tidak ditemukan')
  ) {
    return {
      code: 'OMNIROUTE_ERROR',
      functionName: 'news-search',
      stage: stageOverride || 'omniroute',
      title: `Error Dari OmniRoute AI Gateway (HTTP ${responseStatus || 500})`,
      message: responseBody?.error || 'Terjadi kesalahan pada OmniRoute AI Gateway atau konfigurasi OMNIROUTE_BASE_URL.',
      errorName: errorName || 'OmniRouteError',
      errorMessage: errorMessage || responseBody?.error || 'OmniRoute error',
      responseStatus: responseStatus || responseBody?.status || 500,
      responseBody,
      recommendation: 'Periksa log pada terminal komputer OmniRoute dan pastikan endpoint /chat/completions valid.'
    };
  }

  // 4. INVALID_RESPONSE (Format response AI bukan JSON valid atau kosong)
  if (
    responseBody?.code === 'INVALID_RESPONSE' ||
    errString.includes('response omniroute tidak valid') ||
    errString.includes('invalid json') ||
    errString.includes('unexpected token') ||
    errString.includes('tidak valid json') ||
    (data && data.success === false && errString.includes('tidak valid'))
  ) {
    return {
      code: 'INVALID_RESPONSE',
      functionName: 'news-search',
      stage: stageOverride || 'parse_response',
      title: 'Response AI / OmniRoute Tidak Valid',
      message: responseBody?.error || 'Output dari model AI tidak dapat diurai menjadi daftar artikel berita JSON yang valid.',
      errorName: errorName || 'InvalidResponseError',
      errorMessage: errorMessage || 'Response OmniRoute tidak valid',
      responseStatus: responseStatus || 500,
      responseBody,
      recommendation: 'Pastikan model AI yang digunakan di OmniRoute mendukung output instruksi terstruktur (JSON).'
    };
  }

  // 5. EDGE_FUNCTION_HTTP_ERROR (HTTP 4xx / 5xx dari Supabase Edge runtime)
  const isHttpError =
    (typeof responseStatus === 'number' && responseStatus >= 400) ||
    errorName === 'FunctionsHttpError' ||
    responseBody?.code === 'NOT_FOUND' ||
    errString.includes('requested function was not found') ||
    errString.includes('non-2xx status code');

  if (isHttpError) {
    const is404 =
      responseStatus === 404 ||
      responseBody?.code === 'NOT_FOUND' ||
      errString.includes('requested function was not found');

    return {
      code: 'EDGE_FUNCTION_HTTP_ERROR',
      functionName: 'news-search',
      stage: stageOverride || 'edge_gateway',
      title: is404 ? 'Edge Function news-search Tidak Ditemukan (HTTP 404)' : `Edge Function Error (HTTP ${responseStatus || 500})`,
      message: is404
        ? "Edge Function 'news-search' mengembalikan status 404 Not Found pada project Supabase."
        : (responseBody?.error || responseBody?.message || errorMessage || `Edge Function mengembalikan status HTTP ${responseStatus}`),
      errorName: errorName || 'FunctionsHttpError',
      errorMessage: errorMessage || (is404 ? 'HTTP 404: Requested function was not found' : `Edge Function HTTP ${responseStatus}`),
      responseStatus: responseStatus || (is404 ? 404 : 500),
      responseBody,
      recommendation: is404
        ? "Pastikan Edge Function dengan nama persis 'news-search' telah di-deploy ke Supabase project."
        : 'Periksa log eksekusi Edge Function news-search di dashboard Supabase.'
    };
  }

  // 6. EDGE_FUNCTION_UNREACHABLE (Network Failure / CORS Preflight Error)
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
      functionName: 'news-search',
      stage: stageOverride || 'network_or_cors',
      title: 'Edge Function Tidak Dapat Dihubungi',
      message: 'Koneksi jaringan atau CORS preflight ke Supabase Edge Function gagal.',
      errorName: errorName || 'FunctionsFetchError',
      errorMessage: errorMessage || 'Failed to send request to the Edge Function',
      responseStatus,
      responseBody,
      recommendation: 'Periksa koneksi internet dan pastikan Edge Function menangani preflight OPTIONS dengan benar.'
    };
  }

  // 7. General internal Edge Function error
  if (error || (data && data.success === false)) {
    return {
      code: 'EDGE_FUNCTION_HTTP_ERROR',
      functionName: 'news-search',
      stage: stageOverride || 'edge_function_internal',
      title: `Error Pada Edge Function (HTTP ${responseStatus || 500})`,
      message: responseBody?.error || responseBody?.message || errorMessage || 'Edge Function mengembalikan status error.',
      errorName: errorName || 'FunctionsHttpError',
      errorMessage: errorMessage || 'Edge Function returned error',
      responseStatus: responseStatus || 500,
      responseBody,
      recommendation: 'Buka dashboard Supabase > Edge Functions > news-search > Logs untuk meninjau log error.'
    };
  }

  // 8. NO_NEWS_FOUND (Pencarian berhasil tapi 0 berita ditemukan)
  if (articlesCount === 0) {
    return {
      code: 'NO_NEWS_FOUND',
      functionName: 'news-search',
      stage: stageOverride || 'news_results',
      title: 'Tidak Ada Berita Ditemukan',
      message: 'Pencarian AI tidak menemukan artikel berita yang cocok dengan kata kunci ini.',
      recommendation: 'Gunakan kata kunci pencarian yang lebih umum atau coba preset kategori di atas.'
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
  console.log('[SIMKA BERITA] Menjalankan test health Edge Function news-search dengan body: { health: true }...');
  try {
    // Gunakan supabase.functions.invoke standard dengan auth header otomatis
    const res = await supabase.functions.invoke('news-search', {
      body: { health: true }
    });

    const { data, error, response } = res;

    if (!error && data && (data.success === true || data.status === 'online')) {
      console.log('[SIMKA BERITA] Test health berhasil: EDGE_FUNCTION_ONLINE');
      return {
        online: true,
        data: {
          success: true,
          service: 'news-search',
          status: 'online',
          ...data
        }
      };
    }

    // Ekstraksi response status dan response body HTTP sebenarnya
    let status: number | undefined = undefined;
    let body: any = undefined;

    const resp = response || (error?.context instanceof Response ? error.context : undefined);
    if (resp) {
      status = resp.status;
      try {
        body = await resp.clone().json();
      } catch {
        try {
          body = await resp.clone().text();
        } catch {}
      }
    } else if (error?.context && typeof error.context.status === 'number') {
      status = error.context.status;
    }

    const detail = classifyNewsError(error, data, 0, status, body, 'health_check');
    return {
      online: false,
      data,
      error: detail || {
        code: 'EDGE_FUNCTION_HTTP_ERROR',
        functionName: 'news-search',
        stage: 'health_check',
        title: `Health Check Gagal (HTTP ${status || 500})`,
        message: error?.message || 'Edge Function news-search tidak mengembalikan status online.',
        errorName: error?.name,
        errorMessage: error?.message,
        responseStatus: status,
        responseBody: body,
        recommendation: 'Periksa status Edge Function news-search di dashboard Supabase.'
      }
    };
  } catch (err: any) {
    return {
      online: false,
      error: {
        code: 'EDGE_FUNCTION_UNREACHABLE',
        functionName: 'news-search',
        stage: 'health_check',
        title: 'Edge Function Tidak Dapat Dihubungi',
        message: err?.message || 'Gagal mengirim request health test ke Supabase Edge Function.',
        errorName: err?.name || 'NetworkError',
        errorMessage: err?.message,
        recommendation: 'Periksa koneksi jaringan dan pastikan domain project Supabase dapat diakses.'
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

