import { MMKV } from 'react-native-mmkv';

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
}

// Instancia única de MMKV
const mmkv = new MMKV();

// =====================
// Funciones genéricas
// =====================

/**
 * Guarda un valor en MMKV
 * - Si el valor es un objeto, se serializa a JSON
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    mmkv.set(key, value);
  } else {
    mmkv.set(key, JSON.stringify(value));
  }
}

/**
 * Obtiene un valor de MMKV
 * - Si el valor es JSON válido, lo parsea automáticamente
 */
export function getFromStorage<T>(key: string): T | null {
  const value = mmkv.getString(key);

  if (value == null) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    // Si no es JSON, devolver el valor tal cual (string) forzado al tipo
    return value as unknown as T;
  }
}

/**
 * Elimina un valor por clave
 */
export function removeFromStorage(key: string): void {
  mmkv.delete(key);
}

/**
 * Verifica si existe una clave en el storage
 */
export function hasKey(key: string): boolean {
  return mmkv.contains(key);
}

/**
 * Limpia TODO el storage
 */
export function clearStorage(): void {
  mmkv.clearAll();
}

/**
 * Devuelve todas las claves almacenadas
 */
export function getAllKeys(): string[] {
  return mmkv.getAllKeys();
}