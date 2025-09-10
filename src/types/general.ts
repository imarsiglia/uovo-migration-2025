export const SPEECH_EVENTS = {
  RESULTS: 'onSpeechResults',
  START: 'onSpeechStart',
  PARTIAL: 'onSpeechPartialResults',
  END: 'onSpeechEnd',
  ERROR: 'onSpeechError',
  TEST: 'onTestEvent',
} as const;

export type SpeechVoiceType = (typeof SPEECH_EVENTS)[keyof typeof SPEECH_EVENTS];

export type AgendaItem = {
  id: string;
  title: string;
  time?: string; // opcional
};

export type FAIconType = 'solid' | 'light' | 'regular' | 'brands' | undefined

export type BooleanNumberType = 0 | 1;