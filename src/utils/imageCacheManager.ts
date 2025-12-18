import RNFS from 'react-native-fs';

/**
 * 🎯 Image Cache Manager - Optimizado con auto-limpieza
 *
 * Características:
 * - Límite de tamaño configurable (por defecto 500MB)
 * - Auto-limpieza automática cuando se excede el límite
 * - Evita duplicación innecesaria
 * - Nombres de archivo únicos y descriptivos
 */

const CACHE_DIR = `${RNFS.CachesDirectoryPath}/image_cache`;
const MAX_CACHE_SIZE_MB = 500; // 500MB límite
const MAX_CACHE_SIZE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024;

class ImageCacheManager {
  private initialized = false;
  private cacheSize = 0;

  /**
   * Inicializa el directorio de caché
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const exists = await RNFS.exists(CACHE_DIR);
      if (!exists) {
        await RNFS.mkdir(CACHE_DIR);
      }

      // Calcular tamaño actual del caché
      await this.calculateCacheSize();
      this.initialized = true;

      console.log(
        `[ImageCache] Initialized - Size: ${(
          this.cacheSize /
          1024 /
          1024
        ).toFixed(2)}MB`,
      );
    } catch (error) {
      console.error('[ImageCache] Initialization error:', error);
    }
  }

  /**
   * Calcula el tamaño total del caché
   */
  private async calculateCacheSize(): Promise<void> {
    try {
      const files = await RNFS.readDir(CACHE_DIR);
      this.cacheSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    } catch (error) {
      this.cacheSize = 0;
    }
  }

  /**
   * Guarda un base64 en caché con nombre único
   * @param base64 - String base64 de la imagen
   * @param key - Clave única para identificar la imagen
   * @returns URI del archivo en caché
   */
  async saveBase64ToCache(base64: string, key: string): Promise<string> {
    await this.initialize();

    try {
      // Crear nombre de archivo único basado en el key
      const fileName = `${this.sanitizeKey(key)}.jpg`;
      const filePath = `${CACHE_DIR}/${fileName}`;

      // ✅ SOBRESCRIBIR
      const exists = await RNFS.exists(filePath);
      if (exists) {
        try {
          const prev = await RNFS.stat(filePath);
          this.cacheSize = Math.max(0, this.cacheSize - (prev.size ?? 0));
        } catch {}
        await RNFS.unlink(filePath).catch(() => {});
      }

      // Estimar tamaño del archivo (base64 es ~33% más grande que binario)
      const estimatedSize = (base64.length * 3) / 4;

      // Verificar si necesitamos limpiar caché
      if (this.cacheSize + estimatedSize > MAX_CACHE_SIZE_BYTES) {
        console.log('[ImageCache] Cache limit reached, cleaning...');
        await this.cleanOldestFiles(estimatedSize);
      }

      // Guardar archivo
      await RNFS.writeFile(filePath, base64, 'base64');

      // Actualizar tamaño del caché
      const stat = await RNFS.stat(filePath);
      this.cacheSize += stat.size;

      console.log(
        `[ImageCache] Saved: ${fileName} (${(stat.size / 1024).toFixed(
          2,
        )}KB) - Total: ${(this.cacheSize / 1024 / 1024).toFixed(2)}MB`,
      );

      return `file://${filePath}`;
    } catch (error) {
      console.error('[ImageCache] Save error:', error);
      throw error;
    }
  }

  /**
   * Lee un archivo desde caché o path original como base64
   * @param uri - URI del archivo (puede ser file:// o path absoluto)
   * @returns Base64 string
   */
  async readCacheAsBase64(uri: string): Promise<string> {
    try {
      const cleanPath = uri.replace('file://', '');
      const exists = await RNFS.exists(cleanPath);

      if (!exists) {
        console.warn(`[ImageCache] File not found: ${cleanPath}`);
        return '';
      }

      return await RNFS.readFile(cleanPath, 'base64');
    } catch (error) {
      console.error('[ImageCache] Read error:', error);
      return '';
    }
  }

  /**
   * Lee múltiples archivos en batch (más eficiente)
   */
  async readBatchAsBase64(uris: string[]): Promise<(string | null)[]> {
    return Promise.all(
      uris.map(async (uri) => {
        try {
          return await this.readCacheAsBase64(uri);
        } catch {
          return null;
        }
      }),
    );
  }

  /**
   * Elimina un archivo específico del caché
   */
  async deleteFromCache(uri: string): Promise<void> {
    try {
      const cleanPath = uri.replace('file://', '');
      const exists = await RNFS.exists(cleanPath);

      if (!exists) return;

      const stat = await RNFS.stat(cleanPath);
      await RNFS.unlink(cleanPath);

      // Actualizar tamaño del caché
      this.cacheSize = Math.max(0, this.cacheSize - stat.size);

      console.log(`[ImageCache] Deleted: ${cleanPath}`);
    } catch (error) {
      console.error('[ImageCache] Delete error:', error);
    }
  }

  /**
   * Limpia archivos antiguos hasta liberar el espacio necesario
   * @param bytesNeeded - Bytes que necesitan ser liberados
   */
  private async cleanOldestFiles(bytesNeeded: number): Promise<void> {
    try {
      const files = await RNFS.readDir(CACHE_DIR);

      // Ordenar por fecha de modificación (más antiguos primero)
      const sortedFiles = files.sort((a, b) => {
        // @ts-ignore
        const timeA = new Date(a.mtime).getTime();
        // @ts-ignore
        const timeB = new Date(b.mtime).getTime();
        return timeA - timeB;
      });

      let freedSpace = 0;
      const filesToDelete: string[] = [];

      // Seleccionar archivos a eliminar
      for (const file of sortedFiles) {
        filesToDelete.push(file.path);
        freedSpace += file.size || 0;

        // Si liberamos suficiente espacio + 20% extra, parar
        if (freedSpace >= bytesNeeded * 1.2) {
          break;
        }
      }

      // Eliminar archivos seleccionados
      await Promise.all(
        filesToDelete.map(async (path) => {
          try {
            await RNFS.unlink(path);
            console.log(`[ImageCache] Cleaned: ${path}`);
          } catch (error) {
            console.error(`[ImageCache] Failed to delete: ${path}`, error);
          }
        }),
      );

      // Recalcular tamaño del caché
      await this.calculateCacheSize();

      console.log(
        `[ImageCache] Cleaned ${filesToDelete.length} files, freed ${(
          freedSpace /
          1024 /
          1024
        ).toFixed(2)}MB`,
      );
    } catch (error) {
      console.error('[ImageCache] Clean error:', error);
    }
  }

  /**
   * Limpia TODO el caché (usar con precaución)
   */
  async clearAll(): Promise<void> {
    await this.initialize();

    try {
      const files = await RNFS.readDir(CACHE_DIR);
      await Promise.all(files.map((file) => RNFS.unlink(file.path)));

      this.cacheSize = 0;
      console.log('[ImageCache] All cache cleared');
    } catch (error) {
      console.error('[ImageCache] Clear all error:', error);
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getStats(): Promise<{
    totalSizeMB: number;
    fileCount: number;
    limitMB: number;
  }> {
    await this.initialize();

    try {
      const files = await RNFS.readDir(CACHE_DIR);
      return {
        totalSizeMB: this.cacheSize / 1024 / 1024,
        fileCount: files.length,
        limitMB: MAX_CACHE_SIZE_MB,
      };
    } catch {
      return {
        totalSizeMB: 0,
        fileCount: 0,
        limitMB: MAX_CACHE_SIZE_MB,
      };
    }
  }

  /**
   * Sanitiza una key para usarla como nombre de archivo
   */
  private sanitizeKey(key: string): string {
    return key
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 100); // Limitar longitud
  }

  /**
   * Verifica si un archivo existe en caché
   */
  async existsInCache(key: string): Promise<boolean> {
    await this.initialize();
    const fileName = `${this.sanitizeKey(key)}.jpg`;
    const filePath = `${CACHE_DIR}/${fileName}`;
    return await RNFS.exists(filePath);
  }
}

// Singleton
export const imageCacheManager = new ImageCacheManager();

// 🧹 Función de utilidad para limpiar caché al inicio de la app
export const initImageCacheCleanup = async () => {
  try {
    const stats = await imageCacheManager.getStats();
    console.log(`[ImageCache] Startup stats:`, stats);

    // Si el caché está cerca del límite, hacer limpieza preventiva
    if (stats.totalSizeMB > MAX_CACHE_SIZE_MB * 0.8) {
      console.log('[ImageCache] Performing startup cleanup...');
      const bytesToFree =
        (stats.totalSizeMB - MAX_CACHE_SIZE_MB * 0.5) * 1024 * 1024;
      await imageCacheManager['cleanOldestFiles'](bytesToFree);
    }
  } catch (error) {
    console.error('[ImageCache] Startup cleanup error:', error);
  }
};
