// components/SpeechButton.tsx
import { VOICE_EVENTS } from '@api/contants/constants';
import {
  addEventListener,
  destroy,
  setRecognitionLanguage,
  startListening,
  stopListening,
} from '@ascendtis/react-native-voice-to-text';
import { requestMicrophonePermission } from '@utils/permissions';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type Props = {
  onResult: (text: string) => void;
  label?: string;
  locale?: string; // por si quieres parametrizar (default es 'es-ES')
};

export const SpeechButton = ({
  onResult,
  label = 'Hablar',
  locale = 'es-ES',
}: Props) => {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    // Escucha resultados finales
    const resultsSub = addEventListener(VOICE_EVENTS.RESULTS, (e: any) => {
      const text = e?.value ?? e?.results?.transcriptions?.[0]?.text ?? '';
      if (text) onResult(text);
    });

    // (Opcional) Parciales en tiempo real
    // const partialSub = addEventListener(PARTIAL_RESULTS, (e: any) => {
    //   if (e?.value) onResult(e.value);
    // });

    const startSub = addEventListener(VOICE_EVENTS.START, () => setListening(true));
    const endSub = addEventListener(VOICE_EVENTS.END, () => setListening(false));
    const errorSub = addEventListener(VOICE_EVENTS.ERROR, (e: any) => {
      console.warn('Speech error:', e);
      setListening(false);
    });

    return () => {
      // Limpieza recomendada por la lib
      destroy();
      resultsSub.remove();
      // partialSub?.remove();
      startSub.remove();
      endSub.remove();
      errorSub.remove();
    };
  }, [onResult]);

  const start = useCallback(async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    try {
      // Configura el idioma antes de empezar (p.ej. 'es-ES')
      await setRecognitionLanguage(locale);
      await startListening(); // comienza a escuchar
      // 'listening' pasará a true cuando llegue el evento START
    } catch (e) {
      console.error('startListening error:', e);
      setListening(false);
    }
  }, [locale]);

  const stop = useCallback(async () => {
    try {
      await stopListening();
      // 'listening' pasará a false con el evento END
    } catch (e) {
      console.error('stopListening error:', e);
    }
  }, []);

  const handlePress = async () => {
    if (listening) {
      await stop();
    } else {
      await start();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{padding: 10, backgroundColor: '#007aff', borderRadius: 8}}>
      {listening ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{color: '#fff'}}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
