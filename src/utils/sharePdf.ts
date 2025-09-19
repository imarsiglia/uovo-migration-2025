import Share from 'react-native-share';
import {showErrorToastMessage} from './toast';

export type SharePdfResult = 'shared' | 'cancelled' | 'not_found' | 'error';

/**
 * Comparte un PDF local (filePath) con un nombre sugerido (fileName).
 * - filePath: ruta absoluta al archivo (puede incluir o no 'file://')
 * - fileName: nombre sugerido para el archivo al compartir (ej. 'document.pdf')
 *
 * Retorna: 'shared' | 'cancelled' | 'not_found' | 'error'
 */
export default async function sharePdf(
  filePath: string,
  fileName: string = 'document.pdf',
): Promise<SharePdfResult> {
  if (!filePath) return 'not_found';

  // Normalizar ruta: react-native-share espera file:// URL; aseguramos prefijo.
  let normalized = filePath;
  if (!normalized.startsWith('file://')) {
    // En Android conviene poner file://
    // En iOS también funciona con file:// así que lo añadimos para uniformidad
    normalized = `file://${normalized}`;
  }

  // Intentar comprobar existencia si RNFS está instalado (opcional)
  try {
    // require dinámico para no forzar dependencia
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNFS = require('react-native-fs');
    if (RNFS && RNFS.exists) {
      // RNFS.exists espera path sin file:// en la mayoría de casos
      const pathForCheck = normalized.startsWith('file://')
        ? normalized.replace('file://', '')
        : normalized;
      // exists puede lanzar, lo capturamos
      // eslint-disable-next-line no-await-in-loop
      const exists = await RNFS.exists(pathForCheck);
      if (!exists) return 'not_found';
    }
  } catch (e) {
    // Si no existe react-native-fs, no pasa nada: seguimos sin comprobación.
    // console.debug('RNFS not available or error while checking file existence', e);
  }

  const shareOptions = {
    title: fileName,
    filename: fileName,
    url: normalized,
    type: 'application/pdf',
    failOnCancel: false,
  };

  try {
    const res = await Share.open(shareOptions);
    // react-native-share puede devolver objetos distintos según plataforma
    // si se canceló normalmente no lanza error, pero `res` puede incluir `dismissedAction`
    // Para simplificar devolvemos 'cancelled' si no hay un resultado esperado.
    if (!res) return 'cancelled';
    // algunos platforms/devices retornan { success: true } u objetos, se considera compartido
    return 'shared';
  } catch (err: any) {
    // react-native-share lanza error cuando user cancela o falla
    // Si el usuario cancela, err.message/err.code a veces contiene 'User did not share'
    const message =
      err && (err.message || err.error) ? String(err.message || err.error) : '';
    if (
      message.toLowerCase().includes('cancel') ||
      message.toLowerCase().includes('user did not share')
    ) {
      return 'cancelled';
    }
    showErrorToastMessage('Could not share pdf');
    return 'error';
  }
}
