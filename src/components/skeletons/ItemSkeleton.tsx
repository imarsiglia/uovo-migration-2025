// ItemSkeleton.tsx (o .jsx)
import {useEffect, useRef, useState} from 'react';
import {View, Animated, Easing, StyleSheet, ViewStyle} from 'react-native';

type SkeletonBlockProps = {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  baseColor?: string; // color de fondo del skeleton
  highlightColor?: string; // color del “brillo”
  shimmerWidth?: number; // ancho de la franja de brillo
  duration?: number; // ms para cruzar de lado a lado
  style?: ViewStyle | ViewStyle[];
};

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width,
  height,
  borderRadius = 12,
  baseColor = '#E1E9EE',
  highlightColor = 'rgba(255,255,255,0.35)',
  shimmerWidth = 120,
  duration = 1200,
  style,
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof width === 'number' ? width : 0,
  );
  const translateX = useRef(new Animated.Value(-shimmerWidth)).current;

  useEffect(() => {
    // loop del shimmer: se mueve de izquierda a derecha y reinicia
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: (containerWidth || 200) + shimmerWidth, // si aún no se midió, usa 200 como fallback
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true, // ✅ transform soporta native driver
        }),
        Animated.timing(translateX, {
          toValue: -shimmerWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [translateX, containerWidth, shimmerWidth, duration]);

  return (
    <View
      style={[
        // @ts-ignore
        {
          width,
          height,
          backgroundColor: baseColor,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
      onLayout={(e) => {
        // importante cuando usas width/height en %, obtenemos el ancho real
        setContainerWidth(e.nativeEvent.layout.width);
      }}>
      {/* Franja de “brillo” que cruza el contenedor */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          {
            width: shimmerWidth,
            height: '140%',
            backgroundColor: highlightColor,
            transform: [{translateX}, {rotate: '12deg'}],
          },
        ]}
      />
    </View>
  );
};

const ItemSkeleton: React.FC = () => {
  return (
    <View style={{flex: 1, left: -170}}>
      <View style={{alignSelf: 'center', minHeight: 40}}>
        <SkeletonBlock
          width={930}
          height={40}
          baseColor={'#d1dde5'}
          shimmerWidth={160}
          borderRadius={8}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: '-20%',
    opacity: 1,
    // si quieres un borde suave en los lados del brillo, podrías
    // envolver 2-3 tiras con diferentes opacidades; aquí lo dejamos simple.
  },
});

export default ItemSkeleton;
