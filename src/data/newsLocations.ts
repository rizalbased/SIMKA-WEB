// src/data/newsLocations.ts
// Dataset komprehensif lokasi untuk Modul Berita Terkini SIMKA
// Mendukung: Seluruh Dunia, Region Global, 38 Provinsi Indonesia & Kota/Kabupaten, Negara Internasional & Kota Dunia

import { NewsLocation, LocationScope } from '../types';

export interface CityData {
  name: string;
  isPopular?: boolean;
}

export interface ProvinceData {
  id: string;
  name: string;
  region: string; // e.g. Sumatera, Jawa, Kalimantan, Sulawesi, Bali & Nusa Tenggara, Maluku & Papua
  cities: string[];
}

export interface InternationalCountryData {
  id: string;
  name: string;
  englishName: string;
  flag: string;
  region: string;
  cities: string[];
}

export interface GlobalRegionData {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  description: string;
}

// ==========================================
// 1. REGION DUNIA (GLOBAL REGIONS)
// ==========================================
export const GLOBAL_REGIONS: GlobalRegionData[] = [
  { id: 'world', name: 'Seluruh Dunia (Global)', englishName: 'Global', icon: '🌎', description: 'Berita dari seluruh penjuru dunia' },
  { id: 'southeast_asia', name: 'Asia Tenggara (ASEAN)', englishName: 'Southeast Asia', icon: '🌏', description: 'Indonesia, Malaysia, Singapura, Thailand, dll' },
  { id: 'east_asia', name: 'Asia Timur', englishName: 'East Asia', icon: '🏯', description: 'Jepang, Korea Selatan, Tiongkok, Taiwan' },
  { id: 'middle_east', name: 'Timur Tengah', englishName: 'Middle East', icon: '🕌', description: 'Arab Saudi, UEA, Qatar, Turki, Mesir' },
  { id: 'europe', name: 'Eropa', englishName: 'Europe', icon: '🏰', description: 'Inggris, Jerman, Prancis, Belanda, Italia, dll' },
  { id: 'north_america', name: 'Amerika Utara', englishName: 'North America', icon: '🗽', description: 'Amerika Serikat, Kanada, Meksiko' },
  { id: 'south_asia', name: 'Asia Selatan & Tengah', englishName: 'South Asia', icon: '🍛', description: 'India, Pakistan, Bangladesh, Uzbekistan' },
  { id: 'oceania', name: 'Australia & Oseania', englishName: 'Australia & Oceania', icon: '🦘', description: 'Australia, Selandia Baru, Fiji' },
  { id: 'latin_america', name: 'Amerika Latin', englishName: 'Latin America', icon: '🌴', description: 'Brasil, Argentina, Kolombia, Cile' },
  { id: 'africa', name: 'Afrika', englishName: 'Africa', icon: '🦁', description: 'Afrika Selatan, Nigeria, Kenya, Maroko' },
];

// ==========================================
// 2. NEGARA-NEGARA INTERNASIONAL UTAMA
// ==========================================
export const INTERNATIONAL_COUNTRIES: InternationalCountryData[] = [
  {
    id: 'jp',
    name: 'Jepang',
    englishName: 'Japan',
    flag: '🇯🇵',
    region: 'Asia Timur',
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo', 'Fukuoka', 'Nagoya', 'Kobe']
  },
  {
    id: 'us',
    name: 'Amerika Serikat',
    englishName: 'United States',
    flag: '🇺🇸',
    region: 'Amerika Utara',
    cities: ['Washington D.C.', 'New York', 'Los Angeles', 'San Francisco', 'Chicago', 'Houston', 'Boston', 'Seattle']
  },
  {
    id: 'gb',
    name: 'Inggris (United Kingdom)',
    englishName: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Eropa',
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool', 'Oxford', 'Cambridge']
  },
  {
    id: 'sg',
    name: 'Singapura',
    englishName: 'Singapore',
    flag: '🇸🇬',
    region: 'Asia Tenggara',
    cities: ['Singapore', 'Jurong', 'Marina Bay', 'Changi']
  },
  {
    id: 'my',
    name: 'Malaysia',
    englishName: 'Malaysia',
    flag: '🇲🇾',
    region: 'Asia Tenggara',
    cities: ['Kuala Lumpur', 'Penang (George Town)', 'Johor Bahru', 'Selangor', 'Putrajaya', 'Sabah', 'Sarawak']
  },
  {
    id: 'sa',
    name: 'Arab Saudi',
    englishName: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Timur Tengah',
    cities: ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam']
  },
  {
    id: 'ae',
    name: 'Uni Emirat Arab',
    englishName: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Timur Tengah',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah']
  },
  {
    id: 'de',
    name: 'Jerman',
    englishName: 'Germany',
    flag: '🇩🇪',
    region: 'Eropa',
    cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart']
  },
  {
    id: 'fr',
    name: 'Prancis',
    englishName: 'France',
    flag: '🇫🇷',
    region: 'Eropa',
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Strasbourg']
  },
  {
    id: 'kr',
    name: 'Korea Selatan',
    englishName: 'South Korea',
    flag: '🇰🇷',
    region: 'Asia Timur',
    cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon']
  },
  {
    id: 'au',
    name: 'Australia',
    englishName: 'Australia',
    flag: '🇦🇺',
    region: 'Australia & Oseania',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra']
  },
  {
    id: 'cn',
    name: 'Tiongkok (China)',
    englishName: 'China',
    flag: '🇨🇳',
    region: 'Asia Timur',
    cities: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hong Kong', 'Hangzhou']
  },
  {
    id: 'nl',
    name: 'Belanda',
    englishName: 'Netherlands',
    flag: '🇳🇱',
    region: 'Eropa',
    cities: ['Amsterdam', 'Rotterdam', 'Den Haag (The Hague)', 'Utrecht', 'Eindhoven']
  },
  {
    id: 'tr',
    name: 'Turki',
    englishName: 'Turkey',
    flag: '🇹🇷',
    region: 'Timur Tengah & Eropa',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa']
  },
  {
    id: 'in',
    name: 'India',
    englishName: 'India',
    flag: '🇮🇳',
    region: 'Asia Selatan',
    cities: ['New Delhi', 'Mumbai', 'Bengaluru (Bangalore)', 'Hyderabad', 'Chennai']
  },
  {
    id: 'th',
    name: 'Thailand',
    englishName: 'Thailand',
    flag: '🇹🇭',
    region: 'Asia Tenggara',
    cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Nonthaburi']
  },
  {
    id: 'ph',
    name: 'Filipina',
    englishName: 'Philippines',
    flag: '🇵🇭',
    region: 'Asia Tenggara',
    cities: ['Manila', 'Quezon City', 'Cebu City', 'Davao City']
  },
  {
    id: 'vn',
    name: 'Vietnam',
    englishName: 'Vietnam',
    flag: '🇻🇳',
    region: 'Asia Tenggara',
    cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong']
  },
  {
    id: 'ca',
    name: 'Kanada',
    englishName: 'Canada',
    flag: '🇨🇦',
    region: 'Amerika Utara',
    cities: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal', 'Calgary']
  },
  {
    id: 'br',
    name: 'Brasil',
    englishName: 'Brazil',
    flag: '🇧🇷',
    region: 'Amerika Latin',
    cities: ['Brasilia', 'Sao Paulo', 'Rio de Janeiro', 'Salvador']
  },
  {
    id: 'eg',
    name: 'Mesir',
    englishName: 'Egypt',
    flag: '🇪🇬',
    region: 'Timur Tengah & Afrika',
    cities: ['Kairo', 'Alexandria', 'Giza']
  },
  {
    id: 'za',
    name: 'Afrika Selatan',
    englishName: 'South Africa',
    flag: '🇿🇦',
    region: 'Afrika',
    cities: ['Pretoria', 'Johannesburg', 'Cape Town', 'Durban']
  },
  {
    id: 'ru',
    name: 'Rusia',
    englishName: 'Russia',
    flag: '🇷🇺',
    region: 'Eropa & Asia',
    cities: ['Moskwa', 'Saint Petersburg', 'Novosibirsk', 'Kazan']
  }
];

// ==========================================
// 3. SELURUH 38 PROVINSI INDONESIA & KOTA/KABUPATEN
// ==========================================
export const INDONESIA_PROVINCES_38: ProvinceData[] = [
  // PULAU SUMATERA
  {
    id: 'sumut',
    name: 'Sumatera Utara',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Medan',
      'Deli Serdang',
      'Binjai',
      'Karo',
      'Pematangsiantar',
      'Tebing Tinggi',
      'Langkat',
      'Asahan',
      'Toba',
      'Simalungun',
      'Serdang Bedagai',
      'Batu Bara',
      'Labuhanbatu',
      'Labuhanbatu Utara',
      'Labuhanbatu Selatan',
      'Tapanuli Utara',
      'Tapanuli Tengah',
      'Tapanuli Selatan',
      'Sibolga',
      'Padangsidimpuan',
      'Gunungsitoli',
      'Nias',
      'Nias Selatan',
      'Nias Utara',
      'Nias Barat',
      'Dairi',
      'Pakpak Bharat',
      'Humbang Hasundutan',
      'Samosir',
      'Padang Lawas',
      'Padang Lawas Utara',
      'Mandailing Natal',
      'Tanjungbalai'
    ]
  },
  {
    id: 'aceh',
    name: 'Aceh',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Banda Aceh',
      'Lhokseumawe',
      'Langsa',
      'Sabang',
      'Subulussalam',
      'Aceh Besar',
      'Aceh Utara',
      'Aceh Timur',
      'Aceh Barat',
      'Aceh Selatan',
      'Aceh Tengah',
      'Bireuen',
      'Pidie',
      'Pidie Jaya'
    ]
  },
  {
    id: 'sumbar',
    name: 'Sumatera Barat',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Padang',
      'Bukittinggi',
      'Payakumbuh',
      'Solok',
      'Pariaman',
      'Padang Panjang',
      'Sawahlunto',
      'Agam',
      'Tanah Datar',
      'Lima Puluh Kota',
      'Pesisir Selatan'
    ]
  },
  {
    id: 'riau',
    name: 'Riau',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Pekanbaru',
      'Dumai',
      'Kampar',
      'Bengkalis',
      'Siak',
      'Indragiri Hilir',
      'Indragiri Hulu',
      'Pelalawan',
      'Rokan Hulu',
      'Rokan Hilir',
      'Kepulauan Meranti'
    ]
  },
  {
    id: 'kepri',
    name: 'Kepulauan Riau',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Batam',
      'Tanjungpinang',
      'Bintan',
      'Karimun',
      'Natuna',
      'Anambas',
      'Lingga'
    ]
  },
  {
    id: 'jambi',
    name: 'Jambi',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Jambi',
      'Sungai Penuh',
      'Muaro Jambi',
      'Batanghari',
      'Tanjung Jabung Barat',
      'Tanjung Jabung Timur',
      'Bungo',
      'Tebo',
      'Merangin',
      'Kerinci'
    ]
  },
  {
    id: 'sumsel',
    name: 'Sumatera Selatan',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Palembang',
      'Prabumulih',
      'Lubuklinggau',
      'Pagar Alam',
      'Ogan Komering Ilir',
      'Ogan Ilir',
      'Muara Enim',
      'Lahat',
      'Banyuasin',
      'Musi Banyuasin'
    ]
  },
  {
    id: 'babel',
    name: 'Kepulauan Bangka Belitung',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Pangkalpinang',
      'Bangka',
      'Bangka Barat',
      'Bangka Tengah',
      'Bangka Selatan',
      'Belitung',
      'Belitung Timur'
    ]
  },
  {
    id: 'bengkulu',
    name: 'Bengkulu',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Bengkulu',
      'Rejang Lebong',
      'Bengkulu Utara',
      'Bengkulu Selatan',
      'Mukomuko',
      'Kepahiang',
      'Lebong',
      'Kaur'
    ]
  },
  {
    id: 'lampung',
    name: 'Lampung',
    region: 'Sumatera',
    cities: [
      'Semua Kota/Kabupaten',
      'Bandar Lampung',
      'Metro',
      'Lampung Selatan',
      'Lampung Tengah',
      'Lampung Utara',
      'Lampung Timur',
      'Lampung Barat',
      'Pringsewu',
      'Pesawaran',
      'Tanggamus',
      'Tulang Bawang'
    ]
  },

  // PULAU JAWA
  {
    id: 'dki',
    name: 'DKI Jakarta',
    region: 'Jawa',
    cities: [
      'Semua Kota/Kabupaten',
      'Jakarta Pusat',
      'Jakarta Selatan',
      'Jakarta Timur',
      'Jakarta Barat',
      'Jakarta Utara',
      'Kepulauan Seribu'
    ]
  },
  {
    id: 'jabar',
    name: 'Jawa Barat',
    region: 'Jawa',
    cities: [
      'Semua Kota/Kabupaten',
      'Bandung',
      'Bekasi',
      'Bogor',
      'Depok',
      'Cimahi',
      'Cirebon',
      'Sukabumi',
      'Tasikmalaya',
      'Banjar',
      'Karawang',
      'Purwakarta',
      'Subang',
      'Cianjur',
      'Garut',
      'Sumedang',
      'Indramayu',
      'Majalengka',
      'Kuningan',
      'Ciamis',
      'Pangandaran'
    ]
  },
  {
    id: 'banten',
    name: 'Banten',
    region: 'Jawa',
    cities: [
      'Semua Kota/Kabupaten',
      'Serang',
      'Tangerang',
      'Tangerang Selatan',
      'Cilegon',
      'Lebak',
      'Pandeglang'
    ]
  },
  {
    id: 'jateng',
    name: 'Jawa Tengah',
    region: 'Jawa',
    cities: [
      'Semua Kota/Kabupaten',
      'Semarang',
      'Surakarta (Solo)',
      'Magelang',
      'Salatiga',
      'Pekalongan',
      'Tegal',
      'Banyumas (Purwokerto)',
      'Cilacap',
      'Kudus',
      'Klaten',
      'Boyolali',
      'Sukoharjo',
      'Karanganyar',
      'Wonogiri',
      'Sragen',
      'Pati',
      'Jepara',
      'Kebumen',
      'Purworejo',
      'Wonosobo',
      'Temanggung',
      'Kendal',
      'Batang',
      'Pemalang',
      'Brebes'
    ]
  },
  {
    id: 'diy',
    name: 'DI Yogyakarta',
    region: 'Jawa',
    cities: [
      'Semua Kota/Kabupaten',
      'Yogyakarta',
      'Sleman',
      'Bantul',
      'Kulon Progo',
      'Gunungkidul'
    ]
  },
  {
    id: 'jatim',
    name: 'Jawa Timur',
    region: 'Jawa',
    cities: [
      'Semua Kota/Kabupaten',
      'Surabaya',
      'Malang',
      'Sidoarjo',
      'Gresik',
      'Kediri',
      'Madiun',
      'Batu',
      'Blitar',
      'Mojokerto',
      'Pasuruan',
      'Probolinggo',
      'Banyuwangi',
      'Jember',
      'Lamongan',
      'Tuban',
      'Bojonegoro',
      'Tulungagung',
      'Ponorogo',
      'Nganjuk',
      'Jombang',
      'Madura (Bangkalan/Pamekasan/Sumenep)'
    ]
  },

  // BALI & NUSA TENGGARA
  {
    id: 'bali',
    name: 'Bali',
    region: 'Bali & Nusa Tenggara',
    cities: [
      'Semua Kota/Kabupaten',
      'Denpasar',
      'Badung (Kuta/Seminyak)',
      'Gianyar (Ubud)',
      'Buleleng (Singaraja)',
      'Tabanan',
      'Bangli',
      'Klungkung',
      'Karangasem',
      'Jembrana'
    ]
  },
  {
    id: 'ntb',
    name: 'Nusa Tenggara Barat',
    region: 'Bali & Nusa Tenggara',
    cities: [
      'Semua Kota/Kabupaten',
      'Mataram',
      'Bima',
      'Lombok Barat',
      'Lombok Tengah',
      'Lombok Timur',
      'Lombok Utara',
      'Sumbawa',
      'Sumbawa Barat',
      'Dompu'
    ]
  },
  {
    id: 'ntt',
    name: 'Nusa Tenggara Timur',
    region: 'Bali & Nusa Tenggara',
    cities: [
      'Semua Kota/Kabupaten',
      'Kupang',
      'Manggarai Barat (Labuan Bajo)',
      'Manggarai',
      'Ende',
      'Sikka (Maumere)',
      'Flores Timur',
      'Sumba Timur',
      'Sumba Barat',
      'Belu (Atambua)',
      'Alor'
    ]
  },

  // PULAU KALIMANTAN
  {
    id: 'kalbar',
    name: 'Kalimantan Barat',
    region: 'Kalimantan',
    cities: [
      'Semua Kota/Kabupaten',
      'Pontianak',
      'Singkawang',
      'Kubu Raya',
      'Sambas',
      'Ketapang',
      'Sintang',
      'Sanggau'
    ]
  },
  {
    id: 'kalteng',
    name: 'Kalimantan Tengah',
    region: 'Kalimantan',
    cities: [
      'Semua Kota/Kabupaten',
      'Palangka Raya',
      'Kotawaringin Timur (Sampit)',
      'Kotawaringin Barat (Pangkalan Bun)',
      'Kapuas',
      'Barito Selatan',
      'Katingan'
    ]
  },
  {
    id: 'kalsel',
    name: 'Kalimantan Selatan',
    region: 'Kalimantan',
    cities: [
      'Semua Kota/Kabupaten',
      'Banjarmasin',
      'Banjarbaru',
      'Banjar (Martapura)',
      'Barito Kuala',
      'Tanah Laut',
      'Tanah Bumbu',
      'Kotabaru',
      'Tabalong'
    ]
  },
  {
    id: 'kaltim',
    name: 'Kalimantan Timur',
    region: 'Kalimantan',
    cities: [
      'Semua Kota/Kabupaten',
      'Nusantara (IKN)',
      'Samarinda',
      'Balikpapan',
      'Kutai Kartanegara (Tenggarong)',
      'Bontang',
      'Kutai Timur (Sangatta)',
      'Berau',
      'Penajam Paser Utara',
      'Paser'
    ]
  },
  {
    id: 'kaltara',
    name: 'Kalimantan Utara',
    region: 'Kalimantan',
    cities: [
      'Semua Kota/Kabupaten',
      'Tarakan',
      'Bulungan (Tanjung Selor)',
      'Nunukan',
      'Malinau',
      'Tana Tidung'
    ]
  },

  // PULAU SULAWESI
  {
    id: 'sulut',
    name: 'Sulawesi Utara',
    region: 'Sulawesi',
    cities: [
      'Semua Kota/Kabupaten',
      'Manado',
      'Bitung',
      'Tomohon',
      'Kotamobagu',
      'Minahasa',
      'Minahasa Utara',
      'Minahasa Selatan',
      'Kepulauan Sangihe'
    ]
  },
  {
    id: 'gorontalo',
    name: 'Gorontalo',
    region: 'Sulawesi',
    cities: [
      'Semua Kota/Kabupaten',
      'Gorontalo',
      'Bone Bolango',
      'Gorontalo Utara',
      'Pahuwato',
      'Boalemo'
    ]
  },
  {
    id: 'sulteng',
    name: 'Sulawesi Tengah',
    region: 'Sulawesi',
    cities: [
      'Semua Kota/Kabupaten',
      'Palu',
      'Donggala',
      'Poso',
      'Toli-Toli',
      'Banggai (Luwuk)',
      'Morowali',
      'Parigi Moutong'
    ]
  },
  {
    id: 'sulbar',
    name: 'Sulawesi Barat',
    region: 'Sulawesi',
    cities: [
      'Semua Kota/Kabupaten',
      'Mamuju',
      'Polewali Mandar',
      'Majene',
      'Mamasa',
      'Pasangkayu'
    ]
  },
  {
    id: 'sulsel',
    name: 'Sulawesi Selatan',
    region: 'Sulawesi',
    cities: [
      'Semua Kota/Kabupaten',
      'Makassar',
      'Gowa',
      'Maros',
      'Parepare',
      'Palopo',
      'Bone (Watampone)',
      'Bulukumba',
      'Bantaeng',
      'Toraja (Tana Toraja/Toraja Utara)',
      'Luwu',
      'Wajo (Sengkang)',
      'Sidrap',
      'Pinrang',
      'Jeneponto'
    ]
  },
  {
    id: 'sultra',
    name: 'Sulawesi Tenggara',
    region: 'Sulawesi',
    cities: [
      'Semua Kota/Kabupaten',
      'Kendari',
      'Baubau',
      'Konawe',
      'Konawe Selatan',
      'Kolaka',
      'Muna (Raha)',
      'Wakatobi',
      'Bombana'
    ]
  },

  // KEPULAUAN MALUKU
  {
    id: 'maluku',
    name: 'Maluku',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Ambon',
      'Tual',
      'Maluku Tengah (Masohi)',
      'Seram Bagian Barat',
      'Seram Bagian Timur',
      'Buru (Namlea)',
      'Kepulauan Aru',
      'Kepulauan Tanimbar'
    ]
  },
  {
    id: 'malut',
    name: 'Maluku Utara',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Ternate',
      'Tidore Kepulauan',
      'Sofifi',
      'Halmahera Utara (Tobelo)',
      'Halmahera Selatan (Labuha)',
      'Halmahera Barat',
      'Halmahera Timur',
      'Halmahera Tengah',
      'Kepulauan Sula',
      'Pulau Morotai'
    ]
  },

  // PULAU PAPUA (6 PROVINSI PEMEKARAN RESMI)
  {
    id: 'papua',
    name: 'Papua',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Jayapura',
      'Keerom',
      'Sarmi',
      'Mamberamo Raya',
      'Biak Numfor',
      'Supiori',
      'Kepulauan Yapen (Serui)',
      'Waropen'
    ]
  },
  {
    id: 'papuabarat',
    name: 'Papua Barat',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Manokwari',
      'Fakfak',
      'Kaimana',
      'Teluk Bintuni',
      'Teluk Wondama',
      'Pegunungan Arfak',
      'Manokwari Selatan'
    ]
  },
  {
    id: 'papuaselatan',
    name: 'Papua Selatan',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Merauke',
      'Boven Digoel',
      'Mappi',
      'Asmat'
    ]
  },
  {
    id: 'papuatengah',
    name: 'Papua Tengah',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Nabire',
      'Mimika (Timika)',
      'Paniai (Enarotali)',
      'Dogiyai',
      'Deyai',
      'Intan Jaya',
      'Puncak (Ilaga)',
      'Puncak Jaya (Mulia)'
    ]
  },
  {
    id: 'papuapegunungan',
    name: 'Papua Pegunungan',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Jayawijaya (Wamena)',
      'Pegunungan Bintang (Oksibil)',
      'Yahukimo (Dekai)',
      'Tolikara (Karubaga)',
      'Mamberamo Tengah (Kobakma)',
      'Yalimo (Elelim)',
      'Lanny Jaya (Tiom)',
      'Nduga (Kenyam)'
    ]
  },
  {
    id: 'papuabaratdaya',
    name: 'Papua Barat Daya',
    region: 'Maluku & Papua',
    cities: [
      'Semua Kota/Kabupaten',
      'Sorong',
      'Raja Ampat (Waisai)',
      'Sorong Selatan (Teminabuan)',
      'Maybrat (Kumurkek)',
      'Tambrauw (Fef)'
    ]
  }
];

// ==========================================
// 4. PRESET LOKASI CEPAT (QUICK LOCATION PRESETS)
// ==========================================
export const POPULAR_LOCATION_PRESETS: NewsLocation[] = [
  { scope: 'GLOBAL', label: '🌎 Seluruh Dunia' },
  { scope: 'INDONESIA', label: '🇮🇩 Indonesia (Nasional)', country: 'Indonesia' },
  { scope: 'PROVINSI_KOTA', label: '📍 Medan, Sumut', country: 'Indonesia', province: 'Sumatera Utara', city: 'Medan' },
  { scope: 'PROVINSI_KOTA', label: '📍 Sumatera Utara', country: 'Indonesia', province: 'Sumatera Utara' },
  { scope: 'PROVINSI_KOTA', label: '📍 DKI Jakarta', country: 'Indonesia', province: 'DKI Jakarta', city: 'Jakarta' },
  { scope: 'PROVINSI_KOTA', label: '📍 Jawa Barat (Bandung)', country: 'Indonesia', province: 'Jawa Barat', city: 'Bandung' },
  { scope: 'PROVINSI_KOTA', label: '📍 Jawa Timur (Surabaya)', country: 'Indonesia', province: 'Jawa Timur', city: 'Surabaya' },
  { scope: 'PROVINSI_KOTA', label: '📍 Nusantara (IKN Kaltim)', country: 'Indonesia', province: 'Kalimantan Timur', city: 'Nusantara (IKN)' },
  { scope: 'INTERNATIONAL', label: '🇯🇵 Tokyo, Jepang', country: 'Jepang', city: 'Tokyo', region: 'Asia Timur' },
  { scope: 'INTERNATIONAL', label: '🇸🇬 Singapura', country: 'Singapura', city: 'Singapore', region: 'Asia Tenggara' },
  { scope: 'INTERNATIONAL', label: '🇺🇸 Amerika Serikat', country: 'Amerika Serikat', region: 'Amerika Utara' },
];

// ==========================================
// 5. HELPER: MEMBENTUK QUERY PENCARIAN BERDASARKAN LOKASI & INTENT
// ==========================================
export function buildEnhancedSearchQuery(
  rawKeyword: string,
  location: NewsLocation,
  category: string
): string {
  const cleanKeyword = rawKeyword.trim();
  
  // Kasus A: Seluruh Dunia (Global)
  if (location.scope === 'GLOBAL') {
    if (!cleanKeyword) {
      if (category === 'TEKNOLOGI') return 'latest global technology and artificial intelligence news';
      if (category === 'BENCANA') return 'latest global natural disaster and extreme weather news';
      if (category === 'PENDIDIKAN') return 'latest global education and academic research news';
      if (category === 'OLAHRAGA' || category === 'KEJUARAAN') return 'latest global sports championships and tournament news';
      if (category === 'EKONOMI') return 'latest global economy markets business news';
      return 'latest global breaking news worldwide';
    }
    return cleanKeyword;
  }

  // Kasus B: Indonesia (Nasional)
  if (location.scope === 'INDONESIA') {
    if (!cleanKeyword) {
      if (category === 'PENDIDIKAN') return 'Berita pendidikan sekolah guru siswa kemendikbud Indonesia terkini';
      if (category === 'PEKERJAAN') return 'Lowongan kerja loker rekrutmen karir terbaru Indonesia';
      if (category === 'BENCANA') return 'Berita bencana alam gempa banjir cuaca BMKG Indonesia';
      return 'Berita nasional Indonesia terkini';
    }
    // Jika keyword belum mengandung Indonesia, tambahkan konteks nasional
    if (!cleanKeyword.toLowerCase().includes('indonesia')) {
      return `${cleanKeyword} Indonesia`;
    }
    return cleanKeyword;
  }

  // Kasus C: Provinsi / Kota di Indonesia
  if (location.scope === 'PROVINSI_KOTA') {
    const locParts: string[] = [];
    if (location.district) locParts.push(location.district);
    if (location.city && location.city !== 'Semua Kota/Kabupaten') locParts.push(location.city);
    if (location.province && location.province !== 'Semua Provinsi') locParts.push(location.province);
    locParts.push('Indonesia');
    const locStr = locParts.join(', ');

    if (!cleanKeyword) {
      if (category === 'PEKERJAAN') return `Lowongan kerja loker terbaru di ${locStr}`;
      if (category === 'BENCANA') return `Berita bencana banjir cuaca terkini di ${locStr}`;
      if (category === 'PENDIDIKAN') return `Berita pendidikan sekolah di ${locStr}`;
      return `Berita terkini di ${locStr}`;
    }

    // Cek apakah query sudah memuat nama kota/provinsi
    const lowerKeyword = cleanKeyword.toLowerCase();
    const cityMentioned = location.city && location.city !== 'Semua Kota/Kabupaten' && lowerKeyword.includes(location.city.toLowerCase());
    const provMentioned = location.province && lowerKeyword.includes(location.province.toLowerCase());

    if (!cityMentioned && !provMentioned) {
      return `${cleanKeyword} di ${locStr}`;
    }
    return cleanKeyword;
  }

  // Kasus D: Internasional (Negara / Kota Luar Negeri)
  if (location.scope === 'INTERNATIONAL') {
    const locParts: string[] = [];
    if (location.city && location.city !== 'Semua Kota') locParts.push(location.city);
    if (location.country && location.country !== 'Semua Negara') locParts.push(location.country);
    const locStr = locParts.join(', ');

    if (!cleanKeyword) {
      if (category === 'PENDIDIKAN') return `latest education news in ${locStr}`;
      if (category === 'PEKERJAAN') return `latest job openings and employment news in ${locStr}`;
      if (category === 'BENCANA') return `latest disaster weather earthquake news in ${locStr}`;
      return `latest news in ${locStr}`;
    }

    const lowerKeyword = cleanKeyword.toLowerCase();
    const countryMentioned = location.country && lowerKeyword.includes(location.country.toLowerCase());
    const cityMentioned = location.city && lowerKeyword.includes(location.city.toLowerCase());

    if (!countryMentioned && !cityMentioned) {
      return `${cleanKeyword} in ${locStr}`;
    }
    return cleanKeyword;
  }

  // Kasus E: Custom Lokasi Bebas
  if (location.scope === 'CUSTOM' && location.customText) {
    const custom = location.customText.trim();
    if (!cleanKeyword) {
      return `Berita terkini di ${custom}`;
    }
    if (!cleanKeyword.toLowerCase().includes(custom.toLowerCase())) {
      return `${cleanKeyword} ${custom}`;
    }
    return cleanKeyword;
  }

  return cleanKeyword || 'berita terkini';
}

// ==========================================
// 6. HELPER: PARSE LOKASI OTOMATIS DARI INPUT PENCARIAN
// ==========================================
export function parseLocationFromQuery(query: string): Partial<NewsLocation> | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // 1. Cek Indonesia Cities & Regencies
  for (const prov of INDONESIA_PROVINCES_38) {
    for (const city of prov.cities) {
      if (city === 'Semua Kota/Kabupaten') continue;
      const cleanCity = city.toLowerCase().replace(/\s*\(.*?\)\s*/g, ''); // Hapus alias dalam kurung
      if (q.includes(cleanCity)) {
        return {
          scope: 'PROVINSI_KOTA',
          country: 'Indonesia',
          province: prov.name,
          city: city,
          label: `📍 ${city}, ${prov.name}`
        };
      }
    }

    // Cek Provinsi
    const cleanProv = prov.name.toLowerCase();
    if (q.includes(cleanProv) || (prov.id === 'sumut' && q.includes('sumut')) || (prov.id === 'jabar' && q.includes('jabar')) || (prov.id === 'jateng' && q.includes('jateng')) || (prov.id === 'jatim' && q.includes('jatim')) || (prov.id === 'dki' && q.includes('jakarta'))) {
      return {
        scope: 'PROVINSI_KOTA',
        country: 'Indonesia',
        province: prov.name,
        city: 'Semua Kota/Kabupaten',
        label: `📍 ${prov.name}`
      };
    }
  }

  // 2. Cek International Countries & Cities
  for (const country of INTERNATIONAL_COUNTRIES) {
    for (const city of country.cities) {
      if (q.includes(city.toLowerCase())) {
        return {
          scope: 'INTERNATIONAL',
          country: country.name,
          city: city,
          region: country.region,
          label: `${country.flag} ${city}, ${country.name}`
        };
      }
    }

    if (q.includes(country.name.toLowerCase()) || q.includes(country.englishName.toLowerCase())) {
      return {
        scope: 'INTERNATIONAL',
        country: country.name,
        region: country.region,
        label: `${country.flag} ${country.name}`
      };
    }
  }

  // 3. Cek Global Regions
  for (const reg of GLOBAL_REGIONS) {
    if (q.includes(reg.name.toLowerCase()) || q.includes(reg.englishName.toLowerCase())) {
      return {
        scope: reg.id === 'world' ? 'GLOBAL' : 'INTERNATIONAL',
        region: reg.name,
        label: `${reg.icon} ${reg.name}`
      };
    }
  }

  // 4. Cek Kata Kunci Nasional Indonesia
  if (q.includes('indonesia') || q.includes('nasional')) {
    return {
      scope: 'INDONESIA',
      country: 'Indonesia',
      label: '🇮🇩 Indonesia (Nasional)'
    };
  }

  // 5. Cek Kata Kunci Global / Dunia
  if (q.includes('dunia') || q.includes('global') || q.includes('internasional') || q.includes('worldwide')) {
    return {
      scope: 'GLOBAL',
      label: '🌎 Seluruh Dunia'
    };
  }

  return null;
}
