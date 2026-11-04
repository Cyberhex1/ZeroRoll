/**
 * A small promise wrapper over IndexedDB. One database for the app's local data
 * (Story mode saves, progress, the art cache, imported stories and portraits); stores are
 * created on first open and on upgrade.
 */
const DB_NAME = 'zeroroll';
// v2 adds stories imported in the app and generated portraits.
const DB_VERSION = 2;
export const STORES = ['storySaves', 'storyProgress', 'artCache', 'userStories', 'images'] as const;
export type StoreName = (typeof STORES)[number];

let opening: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('This browser has no IndexedDB, so Story mode cannot save.'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      for (const s of STORES) if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open local storage.'));
    req.onblocked = () => reject(new Error('Local storage is blocked by another ZeroRoll tab. Close other tabs and try again.'));
  });
  opening.catch(() => {
    opening = null;
  });
  return opening;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error ?? req.error ?? new Error('Local storage failed.'));
        tx.onabort = () => reject(tx.error ?? new Error('Local storage was aborted (the disk may be full).'));
      })
  );
}

export const idb = {
  get: <T>(store: StoreName, key: string) => run<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>),
  put: <T>(store: StoreName, key: string, value: T) => run(store, 'readwrite', (s) => s.put(value, key)).then(() => undefined),
  delete: (store: StoreName, key: string) => run(store, 'readwrite', (s) => s.delete(key)).then(() => undefined),
  all: <T>(store: StoreName) => run<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>)
};

/** For tests: forget the open connection so a fresh fake database is used. */
export function resetDbForTests(): void {
  opening = null;
}
