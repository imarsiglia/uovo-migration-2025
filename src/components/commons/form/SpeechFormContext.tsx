// components/SpeechFormContext.tsx
import {Icons} from '@assets/icons/icons';
import Voice from '@react-native-voice/voice';
import {COLORS} from '@styles/colors';
import {requestMicrophonePermission} from '@utils/permissions';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {Alert, StyleSheet} from 'react-native';
import {PressableOpacity} from '../buttons/PressableOpacity';
import {Label} from '../text/Label';

export type SpeechFormInputRef = {
  stop: () => Promise<void>;
};

type Props = {
  name: string;
};

export const SpeechFormContext = forwardRef<SpeechFormInputRef, Props>(
  ({name}, ref) => {
    const manuallyStoppedRef = useRef(false);
    const [listening, setListening] = useState(false);
    const {setValue, trigger, clearErrors} = useFormContext();
    

    useImperativeHandle(ref, () => ({
      stop: async () => {
        try {
          manuallyStoppedRef.current = true;
          await Voice.stop();
          setListening(false);
        } catch (err) {
          console.warn('Error al detener reconocimiento:', err);
        }
      },
    }));

    useEffect(() => {
      // Texto en vivo mientras se habla
      Voice.onSpeechPartialResults = (e) => {
        const partial = e.value?.[0];
        if (partial) {
          setValue(name, partial); // solo reemplaza en tiempo real
        }
      };

      // Texto final al dejar de hablar
      Voice.onSpeechResults = (e) => {
        trigger([name]);
        if (manuallyStoppedRef.current) {
          manuallyStoppedRef.current = false; // 🔄 reseteamos para la próxima vez
          return; // 🙅 Ignoramos el resultado
        }

        const finalText = e.value?.[0];
        if (finalText) {
          setValue(name, finalText.trim()); // guarda el texto final
        }
      };

      Voice.onSpeechError = (e) => {
        console.warn('Speech error:', e.error);
        setListening(false);
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners)
      };
    }, [name, setValue]);

    const handlePress = async () => {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      if (!listening) {
        try {
          await Voice.start('es-ES');
          setListening(true);
        } catch (e) {
          console.error('Voice start error:', e);
          setListening(false);
        }
      } else {
        try {
          await Voice.stop();
          setListening(false);
        } catch (e) {
          console.error('Voice stop error:', e);
          setListening(false);
        }
      }
    };

    return (
      <PressableOpacity style={styles.dictationButton} onPress={handlePress}>
        <Icons.Microphone fontSize={14} color={COLORS.primary} />
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

SpeechFormContext.displayName = 'SpeechFormContext';
