// ZoomView.tsx
import React from 'react';
import type {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {
  Gesture,
  GestureDetector,
  type PinchGestureHandlerEventPayload,
  type GestureUpdateEvent,
} from 'react-native-gesture-handler';

type ZoomViewProps = {
  children: ReactElement;
  onPinchProgress?: (scale: number) => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
};

const ZoomView: React.FC<ZoomViewProps> = ({
  children,
  onPinchProgress = () => {},
  onPinchStart = () => {},
  onPinchEnd = () => {},
}) => {
  // Definimos el gesto de pinch con la API nueva
  const pinch = React.useMemo(
    () =>
      Gesture.Pinch()
        .onBegin(() => {
          onPinchStart?.();
        })
        .onUpdate((e: GestureUpdateEvent<PinchGestureHandlerEventPayload>) => {
          onPinchProgress?.(e.scale);
        })
        .onEnd(() => {
          onPinchEnd?.();
        }),
    [onPinchEnd, onPinchProgress, onPinchStart],
  );

  // GestureDetector exige un único hijo (elemento)
  return <GestureDetector gesture={pinch}>{children}</GestureDetector>;
};

export default ZoomView;
