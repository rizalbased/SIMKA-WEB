
const DB_NAME = 'MediaGalleryDB';
const DB_VERSION = 1;
const STORE_NAME = 'media';

export interface MediaStorageItem {
  id: string;
  title: string;
  type: 'foto' | 'video' | 'poster';
  blob: Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE';
  createdAt: string;
}

class MediaDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject('Gagal membuka database media.');
      };
    });
  }

  async saveMedia(item: MediaStorageItem): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database belum diinisialisasi');
      
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Gagal menyimpan media.');
    });
  }

  async getAllMedia(): Promise<MediaStorageItem[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database belum diinisialisasi');

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as MediaStorageItem[]);
      request.onerror = () => reject('Gagal mengambil daftar media.');
    });
  }

  async deleteMedia(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database belum diinisialisasi');

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Gagal menghapus media.');
    });
  }
}

export const mediaDb = new MediaDB();
