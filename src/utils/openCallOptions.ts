// utils/openCallOptions.ts
import {ActionSheetIOS, Alert, Linking, Platform} from 'react-native';

export type CallResult =
  | 'opened'
  | 'invalid'
  | 'not_available'
  | 'error'
  | 'cancelled';

async function tryCanOpen(url: string) {
  try {
    return await Linking.canOpenURL(url);
  } catch {
    return false;
  }
}

/**
 * openCallOptions
 * - iOS: muestra ActionSheet con "Llamar" y "FaceTime" (si FaceTime está disponible)
 * - Android: abre tel: y deja que el sistema muestre el chooser
 *
 * @param rawPhone número como string (usuario)
 * @param opts.defaultCountry opcional (ej. 'AR','US') para parseo con libphonenumber-js si está instalado
 * @returns Promise<CallResult>
 */
export async function openCallOptions(
  rawPhone: string,
  opts?: {defaultCountry?: string},
): Promise<CallResult> {
  const input = (rawPhone || '').trim();
  if (!input) return 'invalid';

  // --- 1) intentar parseo con libphonenumber-js si existe ---
  let normalized: string | null = null; // valor a usar en tel: / facetime:
  if (typeof require !== 'undefined') {
    try {
      // require en runtime para no forzar la dependencia
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {parsePhoneNumberFromString} = require('libphonenumber-js') as any;
      if (parsePhoneNumberFromString) {
        const pn = parsePhoneNumberFromString(input, opts?.defaultCountry);
        if (pn && typeof pn.isValid === 'function' && pn.isValid()) {
          normalized = pn.number; // E.164 form (+...)
        }
      }
    } catch {
      normalized = null;
    }
  }

  // --- 2) fallback simple (acepta + y dígitos) ---
  if (!normalized) {
    const cleaned = input.replace(/[^\d+]/g, '');
    const digits = (cleaned.match(/\d/g) || []).length;
    if (digits < 7) {
      return 'invalid';
    }
    normalized = cleaned;
  }

  // encodeURIComponent para evitar problemas con caracteres especiales
  const encoded = encodeURIComponent(normalized);

  // URLs a usar
  const telPromptUrl = `telprompt:${encoded}`; // iOS preferido
  const telUrl = `tel:${encoded}`;
  const facetimeUrl = `facetime:${encoded}`;

  try {
    if (Platform.OS === 'ios') {
      // Verificar disponibilidad de FaceTime y telprompt/tel
      const canFace = await tryCanOpen(facetimeUrl);
      const canTelPrompt = await tryCanOpen(telPromptUrl);
      const canTel = await tryCanOpen(telUrl);

      // Construir opciones: Llamar (si tel/telprompt disponible), FaceTime (si disponible)
      const options: string[] = [];
      const handlers: (() => Promise<CallResult>)[] = [];

      if (canTelPrompt || canTel) {
        options.push('Llamar');
        handlers.push(async () => {
          const url = canTelPrompt ? telPromptUrl : telUrl;
          try {
            await Linking.openURL(url);
            return 'opened';
          } catch {
            return 'error';
          }
        });
      }

      if (canFace) {
        options.push('FaceTime');
        handlers.push(async () => {
          try {
            await Linking.openURL(facetimeUrl);
            return 'opened';
          } catch {
            return 'error';
          }
        });
      }

      // Si no hay forma de llamar en iOS
      if (options.length === 0) {
        return 'not_available';
      }

      // Añadimos Cancelar al final
      const cancelIndex = options.length;
      options.push('Cancelar');

      return new Promise<CallResult>((resolve) => {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: cancelIndex,
            title: normalized,
          },
          (buttonIndex) => {
            if (buttonIndex === cancelIndex || buttonIndex == null) {
              resolve('cancelled');
              return;
            }
            // Ejecutar handler correspondiente
            handlers[buttonIndex]()
              .then((r) => resolve(r))
              .catch(() => resolve('error'));
          },
        );
      });
    } else {
      // Android: simplemente abrir tel: y dejar que el sistema muestre el chooser si corresponde
      const canTel = await tryCanOpen(telUrl);
      if (!canTel) {
        return 'not_available';
      }
      try {
        await Linking.openURL(telUrl);
        return 'opened';
      } catch {
        return 'error';
      }
    }
  } catch (err) {
    console.warn('openCallOptions error', err);
    return 'error';
  }
}

export default openCallOptions;
