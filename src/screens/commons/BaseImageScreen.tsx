import {BackButton} from '@components/commons/buttons/BackButton';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {memo, useCallback, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';

type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';

export type Base64ImageCarouselProps = {
  /** Arreglo de cadenas base64 o data URIs (e.g. "data:image/jpeg;base64,...") */
  images: string[];
  /** Tipo de imagen para prefijo data URI cuando la entrada es base64 "pura" */
  type?: ImageType;
  /** Alto del carrusel; por defecto usa 9:16 del ancho de pantalla */
  height?: number;
  /** Índice inicial a mostrar */
  initialIndex?: number;
  /** cover|contain (cómo ajustar la imagen dentro del contenedor) */
  contentFit?: 'cover' | 'contain';
  /** Callback cuando cambia la página visible */
  onIndexChange?: (index: number) => void;
  /** Muestra indicadores de página (puntos) */
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

  const dataUris = useMemo(
    () => images.map((s) => ensureDataUri(s, type)),
    [images, type],
  );

  //   const itemHeight = height ?? Math.round((width * 9) / 16);

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

  const renderItem = useCallback(
    ({item}: {item: string}) => (
      <Wrapper
        style={[styles.slide, {width}]}
        // Estas dos props suelen ayudar en listas de imágenes pesadas:
        renderToHardwareTextureAndroid
        // @ts-ignore (prop iOS; no afecta en Android)
        shouldRasterizeIOS>
        <Image
          source={{uri: item}}
          resizeMode={contentFit}
          style={styles.image}
          // En Android quita el fade para hacer más ágil la transición
          {...(Platform.OS === 'android' ? ({fadeDuration: 0} as any) : {})}
        />
      </Wrapper>
    ),
    [contentFit, width],
  );

  // Evita crash de initialScrollIndex en listas grandes
  const onRefReady = useCallback(
    (ref: FlatList<string> | null) => {
      if (ref) {
        listRef.current = ref;
        if (initialIndex > 0 && initialIndex < dataUris.length) {
          // scrollToIndex sin animación para posicionar rápido
          setTimeout(() => {
            try {
              ref.scrollToIndex({index: initialIndex, animated: false});
            } catch {}
          }, 0);
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
        // Virtualización y performance
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={16}
        windowSize={3}
        removeClippedSubviews
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
    borderBottomStartRadius: 5
  },
});

export default BaseImageScreen;
