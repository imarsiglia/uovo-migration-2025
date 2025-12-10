import {BackButton} from '@components/commons/buttons/BackButton';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type RefObject,
} from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

export type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';

export type Base64ImageCarouselProps = {
  images: string[];
  type?: ImageType;
  height?: number;
  initialIndex?: number;
  contentFit?: 'cover' | 'contain';
  onIndexChange?: (index: number) => void;
  showIndicators?: boolean;
};

const ensureDataUri = (s: string, type: ImageType) =>
  s.startsWith('data:image/') ? s : `data:image/${type};base64,${s}`;

const Indicator = memo(({count, active}: {count: number; active: number}) => {
  return (
    <Wrapper style={styles.indicatorContainer}>
      {Array.from({length: count}, (_, i) => (
        <Wrapper
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </Wrapper>
  );
});

type ZoomableImageProps = {
  uri: string;
  contentFit: 'cover' | 'contain';
  onZoomActiveChange?: (active: boolean) => void;
};

const ZoomableImage = ({
  uri,
  contentFit,
  onZoomActiveChange,
}: ZoomableImageProps) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  const [panEnabled, setPanEnabled] = useState(false);
  const isMountedRef = useRef(true);

  // ✅ Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Cancela cualquier animación en curso
      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);

      // Reset valores
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedScale.value = 1;
      savedTX.value = 0;
      savedTY.value = 0;
    };
  }, []);

  const updateZoomActive = useCallback(
    (active: boolean) => {
      if (!isMountedRef.current) return;
      setPanEnabled(active);
      onZoomActiveChange?.(active);
    },
    [onZoomActiveChange],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: scale.value},
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  // ✅ CLAVE: Separar los gestos y NO usar simultaneousWithExternalGesture
  const pinch = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      savedScale.value = scale.value;
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
      runOnJS(updateZoomActive)(true);
    })
    .onUpdate((e) => {
      'worklet';
      const next = savedScale.value * e.scale;
      const clamped = next < 1 ? 1 : next > 3 ? 3 : next;
      scale.value = clamped;

      if (clamped === 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    })
    .onEnd(() => {
      'worklet';
      const currentScale = scale.value;

      if (currentScale < 1.02) {
        scale.value = withTiming(1, {duration: 120});
        translateX.value = withTiming(0, {duration: 120});
        translateY.value = withTiming(0, {duration: 120});
        runOnJS(updateZoomActive)(false);
      } else {
        runOnJS(updateZoomActive)(true);
      }
    })
    .onFinalize(() => {
      'worklet';
      // Asegura que si el gesto se cancela, reseteamos
      if (scale.value < 1.02) {
        runOnJS(updateZoomActive)(false);
      }
    });

  const pan = Gesture.Pan()
    .enabled(panEnabled)
    .onStart(() => {
      'worklet';
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      translateX.value = savedTX.value + e.translationX;
      translateY.value = savedTY.value + e.translationY;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd((_event, success) => {
      'worklet';
      if (!success) return;

      const goingIn = scale.value <= 1.01;
      const target = goingIn ? 2 : 1;

      if (target === 1) {
        scale.value = withTiming(1, {duration: 160});
        translateX.value = withTiming(0, {duration: 160});
        translateY.value = withTiming(0, {duration: 160});
        runOnJS(updateZoomActive)(false);
      } else {
        scale.value = withTiming(target, {duration: 160});
        runOnJS(updateZoomActive)(true);
      }
    });

  // ✅ Usa Race en lugar de Simultaneous para evitar conflictos
  const composedGesture = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinch, pan),
  );

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.Image
        source={{uri}}
        resizeMode={contentFit}
        style={styles.imageWithTransform(animatedStyle)}
        {...(Platform.OS === 'android' ? {fadeDuration: 0} : {})}
      />
    </GestureDetector>
  );
};

type Props = NativeStackScreenProps<RootStackParamList, 'BaseImageScreen'>;

const BaseImageScreen = (props: Props) => {
  const {
    images,
    type = 'jpeg',
    height,
    initialIndex = 0,
    contentFit = 'contain',
    onIndexChange,
    showIndicators = true,
  } = props.route.params;

  const {goBack} = useCustomNavigation();

  const listRef = useRef<FlatList<string>>(null);
  const {width} = useWindowDimensions();
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)),
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const dataUris = useMemo(
    () => images.map((s) => ensureDataUri(s, type)),
    [images, type],
  );

  // ✅ Cleanup al desmontar
  useEffect(() => {
    return () => {
      setScrollEnabled(true);
      setIndex(0);
    };
  }, []);

  const getItemLayout = useCallback(
    (_: unknown, i: number) => ({
      length: width,
      offset: width * i,
      index: i,
    }),
    [width],
  );

  const keyExtractor = useCallback((_: string, i: number) => i.toString(), []);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offX / width);
      if (newIndex !== index) {
        setIndex(newIndex);
        onIndexChange?.(newIndex);
      }
    },
    [index, onIndexChange, width],
  );

  const handleZoomActiveChange = useCallback((active: boolean) => {
    setScrollEnabled(!active);
  }, []);

  const renderItem = useCallback(
    ({item, index: itemIndex}: {item: string; index: number}) => (
      <Wrapper style={[styles.slide, {width, height}]}>
        {Math.abs(itemIndex - index) <= 1 ? ( // Solo renderiza gestos en items visibles
          <ZoomableImage
            uri={item}
            contentFit={contentFit}
            onZoomActiveChange={handleZoomActiveChange}
          />
        ) : (
          <Animated.Image
            source={{uri: item}}
            resizeMode={contentFit}
            style={{width: '100%', height: '100%'}}
          />
        )}
      </Wrapper>
    ),
    [contentFit, width, height, handleZoomActiveChange, index],
  );

  const onRefReady = useCallback(
    (ref: FlatList<string> | null) => {
      if (ref) {
        listRef.current = ref;
        if (initialIndex > 0 && initialIndex < dataUris.length) {
          setTimeout(() => {
            try {
              ref.scrollToIndex({index: initialIndex, animated: false});
            } catch {}
          }, 100); // ✅ Aumentado a 100ms para dar tiempo de montaje
        }
      }
    },
    [initialIndex, dataUris.length],
  );

  return (
    <Wrapper style={[styles.container, {width}]}>
      <Wrapper style={styles.containerHeader}>
        <BackButton onPress={goBack} />
      </Wrapper>
      <FlatList
        ref={onRefReady}
        data={dataUris}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        scrollEnabled={scrollEnabled}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={16}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'} // ✅ Solo en Android
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={onMomentumEnd}
      />

      {showIndicators && dataUris.length > 1 && (
        <Wrapper style={styles.overlayIndicators}>
          <Indicator count={dataUris.length} active={index} />
          <Wrapper style={styles.counterPill}>
            <Label style={styles.counterText}>
              {index + 1}/{dataUris.length}
            </Label>
          </Wrapper>
        </Wrapper>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 1,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageWithTransform: (animatedStyle: any): any => [
    {
      width: '100%',
      height: '100%',
    },
    animatedStyle,
  ],
  overlayIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
    backgroundColor: '#ffffff',
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 1,
    backgroundColor: '#ffffff',
  },
  counterPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  containerHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    zIndex: 11,
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
});

export default BaseImageScreen;
