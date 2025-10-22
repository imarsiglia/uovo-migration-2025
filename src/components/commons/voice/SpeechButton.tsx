import {
  addEventListener,
  setRecognitionLanguage,
  startListening,
  stopListening,
  isRecognitionAvailable,
} from '@ascendtis/react-native-voice-to-text';
import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';
import {requestMicrophonePermission} from '@utils/permissions';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {StyleSheet} from 'react-native';
import {PressableOpacity} from '../buttons/PressableOpacity';
import {Label} from '../text/Label';
import {VOICE_EVENTS} from '@api/contants/constants';

export type SpeechFormInputRef = {
  stop: () => Promise<void>;
  isRecognitionAvailable: () => Promise<boolean>;
};

type Props = {
  onResult: (text: string) => void;
  locale?: string; // por si quieres parametrizar el idioma (default: 'en-US')
};

export const SpeechButton = forwardRef<SpeechFormInputRef, Props>(
  ({locale = 'en-US', onResult}, ref) => {
    const manuallyStoppedRef = useRef(false);
    const [listening, setListening] = useState(false);

    // Utilidad para extraer texto desde distintos formatos del evento
    const extractText = (e: any): string => {
      return (
        e?.value ??
        e?.results?.transcriptions?.[0]?.text ??
        e?.partial ??
        e?.text ??
        ''
      );
    };

    useImperativeHandle(ref, () => ({
      stop: async () => {
        try {
          manuallyStoppedRef.current = true;
          await stopListening();
          setListening(false);
        } catch (err) {
          console.warn('Error al detener reconocimiento:', err);
        }
      },
      isRecognitionAvailable: async () => {
        return isRecognitionAvailable();
      },
    }));

    useEffect(() => {
      // Parciales (texto en vivo mientras se habla)
      const partialSub = addEventListener(
        VOICE_EVENTS.PARTIAL_RESULTS,
        (e: any) => {
          const partial = extractText(e);
          if (partial) onResult(partial);
        },
      );

      // Resultados finales
      const resultsSub = addEventListener('onSpeechResults', (e: any) => {
        // Si lo detuvimos manualmente, ignoramos este resultado final
        if (manuallyStoppedRef.current) {
          manuallyStoppedRef.current = false;
          return;
        }

        const finalText = extractText(e);
        if (finalText) onResult(finalText.trim());
      });

      // Estado de inicio/fin para el spinner y label
      const startSub = addEventListener('onSpeechStart', () =>
        setListening(true),
      );
      const endSub = addEventListener('onSpeechEnd', () => setListening(false));

      // Errores
      const errorSub = addEventListener('onSpeechError', (e: any) => {
        console.warn('Speech error:', e);
        setListening(false);
      });

      return () => {
        // Limpieza recomendada: elimina listeners y destruye instancia nativa
        partialSub.remove();
        resultsSub.remove();
        startSub.remove();
        endSub.remove();
        errorSub.remove();
        // destroy();
      };
    }, [onResult]);

    const handlePress = async () => {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      try {
        if (!listening) {
          // await setRecognitionLanguage(locale);
          await startListening();
          // setListening(true) lo hará el evento START
        } else {
          manuallyStoppedRef.current = true;
          await stopListening();
          // setListening(false) lo hará el evento END
        }
      } catch (e) {
        console.error('VoiceToText error:', e);
        setListening(false);
      }
    };

    return (
      <PressableOpacity style={styles.dictationButton} onPress={handlePress}>
        <Icons.Microphone fontSize={16} color={COLORS.primary} />
        <Label style={styles.dictation}>
          {listening ? 'Stop Dictation' : 'Take Dictation'}
        </Label>
      </PressableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  dictationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  dictation: {
    color: COLORS.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

SpeechButton.displayName = 'SpeechButton';
