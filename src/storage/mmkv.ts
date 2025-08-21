// Pequeño wrapper para que MMKV cumpla la interfaz de StateStorage de zustand
import {MMKV} from 'react-native-mmkv';
import type {StateStorage} from 'zustand/middleware';

// TIP: considera usar un encryptionKey guardado en Keychain/Keystore
export const mmkv = new MMKV({
  id: 'uovo-storage',
  // encryptionKey: "tu_clave_segura_opcional",
});

export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkv.set(name, value);
  },
  removeItem: (name: string) => {
    mmkv.delete(name);
  },
};
