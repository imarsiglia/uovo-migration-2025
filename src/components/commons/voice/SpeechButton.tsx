// components/SpeechButton.tsx
import React, {useEffect, useState} from 'react';
import {TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import Voice from '@react-native-voice/voice';
import {requestMicrophonePermission} from '@utils/permissions';

type Props = {
  onResult: (text: string) => void;
  label?: string;
};

export const SpeechButton = ({onResult, label = 'Hablar'}: Props) => {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const result = e.value?.[0];
      if (result) {
        onResult(result);
      }
    };

    Voice.onSpeechError = (e) => {
      console.warn('Error:', e.error);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handlePress = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;
    try {
      setListening(true);
      await Voice.start('es-ES');
    } catch (e) {
      console.error('Voice start error:', e);
      setListening(false);
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
