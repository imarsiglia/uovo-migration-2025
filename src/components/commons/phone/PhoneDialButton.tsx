// components/PhoneDialButton.tsx
import React, {useCallback} from 'react';
import {TouchableOpacity, Text, Platform, StyleSheet} from 'react-native';
import {Linking} from 'react-native';

// IMPORT OPCIONAL para validación robusta
// yarn add libphonenumber-js
import {CountryCode, parsePhoneNumberFromString} from 'libphonenumber-js';
import {showErrorToastMessage} from '@utils/toast';
import {COLORS} from '@styles/colors';

type Props = {
  phone: string; // número tal como el usuario lo escribió
  defaultCountry?: CountryCode; // e.g. 'AR', 'US' — opcional para parseo
  children?: React.ReactNode;
  style?: any;
  textStyle?: any;
};

/**
 * Abre el dialer nativo con el número. No envía SMS.
 */
export const openNativeDialer = async (
  rawPhone: string,
  defaultCountry: CountryCode,
) => {
  const input = (rawPhone || '').trim();
  if (!input) {
    showErrorToastMessage('Invalid number\nEmpty phone number');
    return;
  }

  // 1) intentar parseo con libphonenumber-js (si está instalado)
  let telNumber: string | null = null;
  try {
    const pn = parsePhoneNumberFromString(input, defaultCountry);
    if (pn && pn.isValid()) {
      telNumber = pn.number; // E.164, ej. +541112345678
    }
  } catch (e) {
    // continúa al fallback
    telNumber = null;
  }

  // 2) fallback simple: extraer dígitos y posible + al inicio
  if (!telNumber) {
    const cleaned = input.replace(/[^\d+]/g, '');
    const digits = (cleaned.match(/\d/g) || []).length;
    if (digits < 7) {
      showErrorToastMessage('The phone number seems to be invalid.');
      return;
    }
    telNumber = cleaned;
  }

  // 3) construir URL: iOS -> telprompt (mejor UX), Android -> tel
  const telPromptUrl = `telprompt:${encodeURIComponent(telNumber)}`;
  const telUrl = `tel:${encodeURIComponent(telNumber)}`;

  // 4) intentar abrir (primero telprompt en iOS, sino tel)
  try {
    if (Platform.OS === 'ios') {
      // telprompt puede no existir en algunos entornos (simulador), fallback a tel
      const canPrompt = await Linking.canOpenURL(telPromptUrl);
      if (canPrompt) {
        await Linking.openURL(telPromptUrl);
        return;
      }
      const canTel = await Linking.canOpenURL(telUrl);
      if (canTel) {
        await Linking.openURL(telUrl);
        return;
      }
    } else {
      // Android / otros
      const canTel = await Linking.canOpenURL(telUrl);
      if (canTel) {
        await Linking.openURL(telUrl);
        return;
      }
    }

    showErrorToastMessage('No calling app found on this device');
  } catch (err) {
    console.warn('Error opening dialer', err);
    showErrorToastMessage('Error\nCould not open calling app');
  }
};

/**
 * Componente de botón que abre el dialer al presionar.
 */
const PhoneDialButton: React.FC<Props> = ({
  phone,
  children,
  defaultCountry = 'US',
  style,
  textStyle,
}) => {
  const onPress = useCallback(() => {
    openNativeDialer(phone, defaultCountry);
  }, [phone, defaultCountry]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityRole="button">
      {children ? (
        children
      ) : (
        <Text style={[styles.text, textStyle]}>{phone}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  text: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default PhoneDialButton;
