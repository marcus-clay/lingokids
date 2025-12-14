/**
 * AudioCacheService - Persistent Audio Cache with IndexedDB
 *
 * Stores generated TTS audio persistently to avoid regeneration costs.
 * Features:
 * - IndexedDB for persistent storage across sessions
 * - LRU eviction when cache is full
 * - Automatic expiration of old entries
 * - Fast lookup with hash-based keys
 */

const DB_NAME = 'lingokids_audio_cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';
const MAX_CACHE_SIZE_MB = 100; // 100MB max cache
const MAX_AGE_DAYS = 30; // Entries expire after 30 days

interface CachedAudio {
  id: string;
  text: string;
  voice: string;
  provider: string;
  audioData: ArrayBuffer;
  createdAt: number;
  lastAccessedAt: number;
  sizeBytes: number;
}

interface CacheStats {
  totalEntries: number;
  totalSizeMB: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

class AudioCacheService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('AudioCache: Failed to open database', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('AudioCache: Database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store with indexes
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
          store.createIndex('voice', 'voice', { unique: false });
          store.createIndex('provider', 'provider', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generate cache key from text, voice, and provider
   */
  generateKey(text: string, voice: string, provider: string): string {
    // Simple hash function for consistent keys
    const input = `${provider}:${voice}:${text}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `audio_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Get cached audio if available
   */
  async get(text: string, voice: string, provider: string): Promise<ArrayBuffer | null> {
    await this.init();
    if (!this.db) return null;

    const key = this.generateKey(text, voice, provider);

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const cached = request.result as CachedAudio | undefined;

        if (cached) {
          // Check if expired
          const ageMs = Date.now() - cached.createdAt;
          const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

          if (ageMs > maxAgeMs) {
            // Delete expired entry
            store.delete(key);
            resolve(null);
            return;
          }

          // Update last accessed time
          cached.lastAccessedAt = Date.now();
          store.put(cached);

          console.log(`AudioCache: Hit for "${text.substring(0, 30)}..."`);
          resolve(cached.audioData);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('AudioCache: Get failed', request.error);
        resolve(null);
      };
    });
  }

  /**
   * Store audio in cache
   */
  async set(
    text: string,
    voice: string,
    provider: string,
    audioData: ArrayBuffer
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = this.generateKey(text, voice, provider);
    const now = Date.now();

    const entry: CachedAudio = {
      id: key,
      text: text.substring(0, 500), // Store truncated text for debugging
      voice,
      provider,
      audioData,
      createdAt: now,
      lastAccessedAt: now,
      sizeBytes: audioData.byteLength,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Check cache size before adding
      this.getCacheSize().then(async (currentSizeMB) => {
        const newEntrySizeMB = audioData.byteLength / (1024 * 1024);

        if (currentSizeMB + newEntrySizeMB > MAX_CACHE_SIZE_MB) {
          // Evict oldest entries until we have space
          await this.evictOldest(newEntrySizeMB);
        }

        const request = store.put(entry);

        request.onsuccess = () => {
          console.log(`AudioCache: Stored "${text.substring(0, 30)}..." (${(audioData.byteLength / 1024).toFixed(1)}KB)`);
          resolve();
        };

        request.onerror = () => {
          console.error('AudioCache: Store failed', request.error);
          reject(request.error);
        };
      });
    });
  }

  /**
   * Get total cache size in MB
   */
  async getCacheSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CachedAudio[];
        const totalBytes = entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
        resolve(totalBytes / (1024 * 1024));
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * Evict oldest entries to free up space
   */
  private async evictOldest(requiredSpaceMB: number): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('lastAccessedAt');
      const request = index.openCursor();

      let freedSpace = 0;
      const requiredBytes = requiredSpaceMB * 1024 * 1024;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor && freedSpace < requiredBytes) {
          const entry = cursor.value as CachedAudio;
          freedSpace += entry.sizeBytes;
          cursor.delete();
          console.log(`AudioCache: Evicted "${entry.text.substring(0, 30)}..."`);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        resolve();
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    await this.init();
    if (!this.db) {
      return { totalEntries: 0, totalSizeMB: 0, oldestEntry: null, newestEntry: null };
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CachedAudio[];

        if (entries.length === 0) {
          resolve({ totalEntries: 0, totalSizeMB: 0, oldestEntry: null, newestEntry: null });
          return;
        }

        const totalBytes = entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
        const dates = entries.map(e => e.createdAt).sort((a, b) => a - b);

        resolve({
          totalEntries: entries.length,
          totalSizeMB: totalBytes / (1024 * 1024),
          oldestEntry: new Date(dates[0]),
          newestEntry: new Date(dates[dates.length - 1]),
        });
      };

      request.onerror = () => {
        resolve({ totalEntries: 0, totalSizeMB: 0, oldestEntry: null, newestEntry: null });
      };
    });
  }

  /**
   * Clear all cached audio
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('AudioCache: Cleared all entries');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Pre-warm cache with common phrases
   */
  async preloadCommonPhrases(
    phrases: Array<{ text: string; voice: string; provider: string }>,
    generateFn: (text: string, voice: string, provider: string) => Promise<ArrayBuffer | null>
  ): Promise<number> {
    let loaded = 0;

    for (const phrase of phrases) {
      const cached = await this.get(phrase.text, phrase.voice, phrase.provider);
      if (!cached) {
        const audio = await generateFn(phrase.text, phrase.voice, phrase.provider);
        if (audio) {
          await this.set(phrase.text, phrase.voice, phrase.provider, audio);
          loaded++;
        }
      }
    }

    console.log(`AudioCache: Preloaded ${loaded} new phrases`);
    return loaded;
  }
}

// Export singleton instance
export const audioCacheService = new AudioCacheService();
export default audioCacheService;
