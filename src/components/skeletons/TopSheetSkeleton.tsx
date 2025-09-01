// JobSkeleton.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type SkeletonBoxProps = {
  width: number;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * Colores y animación (opcional)
   */
  baseColor?: string;      // color de fondo (hueso)
  highlightColor?: string; // color de brillo
  duration?: number;       // ms de la pasada del shimmer
};

/**
 * Caja con shimmer sin dependencias
 */
const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
  baseColor = '#e5e7eb',       // gris claro
  highlightColor = 'rgba(255,255,255,0.6)',
  duration = 1200,
}) => {
  const [measuredW, setMeasuredW] = useState<number>(0);
  const shift = useRef(new Animated.Value(0)).current;

  const bandWidth = useMemo(() => Math.max(40, width * 0.35), [width]);

  useEffect(() => {
    if (measuredW === 0) return;
    shift.setValue(-bandWidth); // inicia fuera de la izquierda
    const anim = Animated.loop(
      Animated.timing(shift, {
        toValue: measuredW + bandWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [measuredW, bandWidth, duration, shift]);

  return (
    <View
      pointerEvents="none"
      onLayout={e => setMeasuredW(e.nativeEvent.layout.width)}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}>
      {/* Barra de brillo (sin gradient externo; simulamos con opacidad + skew) */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: bandWidth,
          backgroundColor: highlightColor,
          transform: [
            {translateX: shift},
            {skewX: '-20deg'}, // pequeño ángulo para efecto más real
          ],
          opacity: 0.5,
        }}
      />
    </View>
  );
};

const AVATAR_SIZE = 40;

const TopSheetSkeleton: React.FC = () => {
  return (
    <View style={{marginLeft: 20}}>
      {/* Fila 1: título + chip (120x30) (80x25, br=10) */}
      <View style={[styles.row, {alignItems: 'center'}]}>
        <SkeletonBox width={120} height={30} />
        <SkeletonBox
          width={80}
          height={25}
          borderRadius={10}
          style={{marginLeft: 10}}
        />
      </View>

      {/* Fila 2: 4 avatares solapados + texto 80x20 */}
      <View style={[styles.row, {alignItems: 'center', marginTop: 10}]}>
        <SkeletonBox
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          borderRadius={AVATAR_SIZE / 2}
        />
        <SkeletonBox
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          borderRadius={AVATAR_SIZE / 2}
          style={{marginLeft: -10}}
        />
        <SkeletonBox
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          borderRadius={AVATAR_SIZE / 2}
          style={{marginLeft: -10}}
        />
        <SkeletonBox
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          borderRadius={AVATAR_SIZE / 2}
          style={{marginLeft: -10}}
        />
        <View style={{marginLeft: -20}}>
          <SkeletonBox
            width={80}
            height={20}
            style={{marginTop: 6}}
          />
        </View>
      </View>

      {/* Fila 3: 5 pills 70x25 br=10 */}
      <View style={[styles.row, {alignItems: 'center', marginTop: 20}]}>
        <SkeletonBox width={70} height={25} borderRadius={10} />
        <SkeletonBox
          width={70}
          height={25}
          borderRadius={10}
          style={{marginLeft: 10}}
        />
        <SkeletonBox
          width={70}
          height={25}
          borderRadius={10}
          style={{marginLeft: 10}}
        />
        <SkeletonBox
          width={70}
          height={25}
          borderRadius={10}
          style={{marginLeft: 10}}
        />
        <SkeletonBox
          width={70}
          height={25}
          borderRadius={10}
          style={{marginLeft: 10}}
        />
      </View>
    </View>
  );
};

export default TopSheetSkeleton;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
