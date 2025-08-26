// lib/react-query-mmkv.ts
import { MMKV } from 'react-native-mmkv';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const mmkv = new MMKV({ id: 'rq-cache' /*, encryptionKey: 'opcional'*/ });

// Adapter con interfaz “AsyncStorage-like”
const asyncLikeStorage = {
  getItem: async (key: string) => mmkv.getString(key) ?? null,
  setItem: async (key: string, value: string) => { mmkv.set(key, value); },
  removeItem: async (key: string) => { mmkv.delete(key); },
};

export const mmkvPersister = createAsyncStoragePersister({
  storage: asyncLikeStorage,
  key: 'RQ_CACHE',
  throttleTime: 1000,
  serialize: JSON.stringify,
  deserialize: (str) => JSON.parse(str),
});
