export interface ProvinceData {
  id: string;
  name: string;
  cities: string[];
}

export interface CountryData {
  id: string;
  name: string;
  provinces: ProvinceData[];
}

export const COUNTRIES: CountryData[] = [
  {
    id: 'id',
    name: 'Indonesia',
    provinces: [
      {
        id: 'sumut',
        name: 'Sumatera Utara',
        cities: [
          'Semua Kota/Kabupaten',
          'Medan',
          'Deli Serdang',
          'Binjai',
          'Karo',
          'Pematangsiantar',
          'Tebing Tinggi',
          'Asahan',
          'Toba',
          'Simalungun',
          'Langkat',
          'Serdang Bedagai',
          'Batu Bara',
          'Labuhanbatu',
          'Tapanuli Utara',
          'Tapanuli Tengah',
          'Sibolga',
          'Padangsidimpuan',
          'Gunungsitoli',
          'Nias'
        ]
      },
      {
        id: 'aceh',
        name: 'Aceh',
        cities: [
          'Semua Kota/Kabupaten',
          'Banda Aceh',
          'Lhokseumawe',
          'Langsa',
          'Sabang',
          'Aceh Besar',
          'Aceh Utara',
          'Bireuen'
        ]
      },
      {
        id: 'sumbar',
        name: 'Sumatera Barat',
        cities: [
          'Semua Kota/Kabupaten',
          'Padang',
          'Bukittinggi',
          'Payakumbuh',
          'Solok',
          'Pariaman',
          'Agam'
        ]
      },
      {
        id: 'riau',
        name: 'Riau',
        cities: [
          'Semua Kota/Kabupaten',
          'Pekanbaru',
          'Dumai',
          'Kampar',
          'Bengkalis',
          'Siak'
        ]
      },
      {
        id: 'dki',
        name: 'DKI Jakarta',
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
        cities: [
          'Semua Kota/Kabupaten',
          'Bandung',
          'Bogor',
          'Depok',
          'Bekasi',
          'Cimahi',
          'Cirebon',
          'Sukabumi',
          'Tasikmalaya',
          'Karawang'
        ]
      },
      {
        id: 'jateng',
        name: 'Jawa Tengah',
        cities: [
          'Semua Kota/Kabupaten',
          'Semarang',
          'Surakarta (Solo)',
          'Magelang',
          'Salatiga',
          'Pekalongan',
          'Tegal',
          'Banyumas'
        ]
      },
      {
        id: 'diy',
        name: 'D.I. Yogyakarta',
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
        cities: [
          'Semua Kota/Kabupaten',
          'Surabaya',
          'Malang',
          'Sidoarjo',
          'Gresik',
          'Kediri',
          'Madiun',
          'Banyuwangi',
          'Jember'
        ]
      },
      {
        id: 'bali',
        name: 'Bali',
        cities: [
          'Semua Kota/Kabupaten',
          'Denpasar',
          'Badung',
          'Gianyar',
          'Buleleng',
          'Tabanan'
        ]
      },
      {
        id: 'sulsel',
        name: 'Sulawesi Selatan',
        cities: [
          'Semua Kota/Kabupaten',
          'Makassar',
          'Gowa',
          'Maros',
          'Parepare',
          'Palopo'
        ]
      },
      {
        id: 'kaltim',
        name: 'Kalimantan Timur (IKN)',
        cities: [
          'Semua Kota/Kabupaten',
          'Nusantara (IKN)',
          'Samarinda',
          'Balikpapan',
          'Kutai Kartanegara',
          'Bontang'
        ]
      }
    ]
  },
  {
    id: 'intl',
    name: 'Internasional',
    provinces: [
      {
        id: 'global',
        name: 'Global / Dunia',
        cities: ['Semua Wilayah', 'Asia Tenggara', 'Asia Pasifik', 'Timur Tengah', 'Eropa', 'Amerika']
      }
    ]
  }
];

export const EDUCATION_LEVELS = [
  'Semua Pendidikan',
  'SMK / SMA Sederajat',
  'Diploma (D3/D4)',
  'Sarjana (S1)',
  'Pascasarjana (S2/S3)',
  'Fresh Graduate / Magang'
];

export const JOB_FIELDS = [
  'Semua Bidang',
  'Teknisi & Rekayasa',
  'Teknologi Informasi & Software',
  'Multimedia, Desain & Kreatif',
  'Administrasi & Perkantoran',
  'Akuntansi & Keuangan',
  'Pemasaran & Digital Marketing',
  'Otomotif & Permesinan',
  'Pendidikan & Pelatihan',
  'Perhotelan & Tata Boga',
  'Kesehatan & Farmasi',
  'Logistik & Pergudangan'
];
