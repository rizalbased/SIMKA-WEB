// src/services/newsProvider.ts
// Arsitektur Multi-Provider Berita untuk SIMKA Digital Signage

import { supabase } from '../lib/supabase';
import { NewsArticle, NewsCategory, NewsSearchParams, NewsVerificationStatus } from '../types';

export interface NewsProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  search(params: NewsSearchParams): Promise<NewsArticle[]>;
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
        const res = await fetch(feed.url);
        if (!res.ok) continue;
        const xmlText = await res.text();

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
            const textMatch = title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
            if (!textMatch && params.category === 'SEMUA') {
              // Lewatkan jika tidak relevan dengan query user
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
 * 2. Provider: OmniRoute AI Gateway (Web Search Grounded)
 * Semua request AI dialirkan melalui Supabase Edge Function 'news-search'
 * OMNIROUTE_API_KEY, OMNIROUTE_BASE_URL, dan OMNIROUTE_MODEL dikonfigurasi di server
 */
export class OmniRouteNewsProvider implements NewsProvider {
  id = 'omniroute-ai';
  name = 'OmniRoute AI Gateway';

  isAvailable(): boolean {
    return true;
  }

  async search(params: NewsSearchParams): Promise<NewsArticle[]> {
    // 1. Prioritas: Kirim request AI melalui Supabase Edge Function 'news-search'
    try {
      const { data, error } = await supabase.functions.invoke('news-search', {
        body: {
          action: 'search',
          query: params.query,
          category: params.category,
          country: params.country || 'Indonesia',
          province: params.province,
          city: params.city,
          dateRange: params.dateRange || 'latest',
          language: params.language || 'id',
          minEducation: params.minEducation,
          jobField: params.jobField
        }
      });

      if (!error && data && Array.isArray(data.articles) && data.articles.length > 0) {
        return data.articles;
      }
    } catch {
      // lanjut ke fallback proxy dev
    }

    // 2. Fallback: Proxy backend dev server
    try {
      const response = await fetch('/api/news-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query: params.query,
          category: params.category,
          country: params.country || 'Indonesia',
          province: params.province,
          city: params.city,
          dateRange: params.dateRange || 'latest',
          language: params.language || 'id',
          minEducation: params.minEducation,
          jobField: params.jobField
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.articles) && data.articles.length > 0) {
          return data.articles;
        }
      }
    } catch {
      return [];
    }

    return [];
  }
}

