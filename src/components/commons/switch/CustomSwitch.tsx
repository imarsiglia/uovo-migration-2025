import { COLORS } from '@styles/colors';
import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  enabledLabel: string;
  disabledLabel: string;
  isEnabled: boolean;
  onToggle: (val: boolean) => void;
};

export const CustomSwitch: React.FC<Props> = ({
  enabledLabel,
  disabledLabel,
  isEnabled,
  onToggle,
}: Props) => {
  const [switchEnabled, setSwitchEnabled] = useState(isEnabled);
  const [switchWidth, setSwitchWidth] = useState(0); // Ancho dinámico del switch
  const [circleSize, setCircleSize] = useState(0); // Tamaño del círculo

  // Valores animados
  const translateX = useSharedValue(0);
  const disabledTranslateX = useSharedValue(-switchWidth / 2); // Comienza fuera del contenedor (izquierda)
  const circleTranslateX = useSharedValue(2);

  // Actualizar el valor animado según el estado
  function toggleSwitch() {
    setSwitchEnabled(!switchEnabled);

    // Animar el enabledLabel y disabledLabel
    translateX.value = withTiming(switchEnabled ? 0 : switchWidth, {
      duration: 300,
    });
    disabledTranslateX.value = withTiming(
      switchEnabled ? -switchWidth / 2 : 0, // De izquierda al centro y viceversa
      {
        duration: 300,
      }
    );

    // Animar el circulito
    circleTranslateX.value = withTiming(
      switchEnabled ? 2 : switchWidth - circleSize - 2,
      {duration: 300},
    );

    setTimeout(() => {
      onToggle(!isEnabled);
    }, 100);
  }

  // Estilo animado de la "cortina" que se desliza (enabledLabel)
  const animatedCoverStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  // Estilo animado del disabledLabel (de izquierda al centro)
  const animatedDisabledLabelStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: disabledTranslateX.value}],
    };
  });

  // Estilo animado del circulito
  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: circleTranslateX.value}],
    };
  });

  // Obtener el tamaño del contenedor y el círculo
  const onLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setSwitchWidth(width);
  };

  const onCircleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setCircleSize(width);
  };

  return (
    <TouchableWithoutFeedback onPress={toggleSwitch}>
      <View style={styles.switchContainer} onLayout={onLayout}>
        {/* Texto del estado anterior (disabledLabel) con animación */}
        <Animated.View style={[styles.textContainer, animatedDisabledLabelStyle]}>
          <Text style={[styles.switchText, {right: 5}]}>{disabledLabel}</Text>
        </Animated.View>

        {/* Capa superior: "Cortina" que se mueve y cubre el texto de fondo (enabledLabel) */}
        <Animated.View
          style={[styles.textContainer, styles.cover, animatedCoverStyle]}>
          <Text style={styles.switchText}>{enabledLabel}</Text>
        </Animated.View>

        {/* Circulito que se mueve */}
        <Animated.View
          style={[styles.circle, animatedCircleStyle]}
          onLayout={onCircleLayout}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: '100%',
    minHeight: 28,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  switchText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  cover: {
    backgroundColor: '#848484',
    borderRadius: 30,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: '#fff',
    top: 2,
    zIndex: 2,
  },
});
