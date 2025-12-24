import {
  fullPhotoQueryById,
  localPhotoQueryByClientId,
} from '@api/queries/fullPhotoQuery';
import type {TaskPhotoType} from '@api/types/Task';
import {BackButton} from '@components/commons/buttons/BackButton';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import type {RootStackParamList} from '@navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  ViewToken,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ProgressivePhoto} from './ProgressivePhoto';

export type TaskPhotoCarouselType = {
  photos: TaskPhotoType[];
  type?: 'jpeg' | 'png' | 'webp' | 'gif';
  height?: number;
  initialIndex?: number;
  contentFit?: 'cover' | 'contain';
  onIndexChange?: (index: number) => void;
  showIndicators?: boolean;
  groupRev: string;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'TaskPhotoCarouselScreen'
>;

const TaskPhotoCarouselScreen = (props: Props) => {
  const {width, height} = useWindowDimensions();
  const {goBack} = useCustomNavigation();
  const qc = useQueryClient();

  const {
    photos = [],
    initialIndex = 0,
    contentFit = 'contain',
    groupRev,
  } = props.route.params || {};

  const listRef = useRef<FlatList<TaskPhotoType>>(null);
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, photos.length - 1)),
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollEnabledRef = useRef(true);

  // Filtrar fotos válidas
  const validPhotos = photos.filter((p) => p.photo || p.id || p.clientId);

  const keyExtractor = useCallback(
    (item: TaskPhotoType, index: number) =>
      `carousel-${item.id ?? item.clientId ?? index}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  // Prefetch de imágenes vecinas
  useEffect(() => {
    if (validPhotos.length === 0) return;

    const prefetchPhoto = async (photo?: TaskPhotoType) => {
      if (!photo) return;

      try {
        const query = photo.id
          ? fullPhotoQueryById({
              id: photo.id,
              groupRev: props.route.params.groupRev,
            })
          : localPhotoQueryByClientId({
              clientId: photo.clientId!,
              base64: photo.photo!,
              groupRev: props.route.params.groupRev,
            });

        await qc.prefetchQuery({
          queryKey: query.key,
          queryFn: query.fn,
          staleTime: query.staleTime,
          gcTime: query.gcTime,
        });
      } catch (error) {
        console.log('Prefetch error:', error);
      }
    };

    // Prefetch foto siguiente y anterior
    const nextPhoto = validPhotos[currentIndex + 1];
    const prevPhoto = validPhotos[currentIndex - 1];

    prefetchPhoto(nextPhoto);
    prefetchPhoto(prevPhoto);
  }, [currentIndex, validPhotos, groupRev, qc]);

  // Manejar cambio de foto visible
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Manejar estado de zoom
  const handleZoomChange = useCallback((isZoomed: boolean) => {
    // Actualizar inmediatamente sin debounce para bloquear gestos horizontales
    if (scrollEnabledRef.current !== !isZoomed) {
      scrollEnabledRef.current = !isZoomed;
      setScrollEnabled(!isZoomed);
    }
  }, []);

  const renderItem = useCallback(
    ({item, index}: {item: TaskPhotoType; index: number}) => {
      const isVisible = Math.abs(index - currentIndex) <= 1;
      return (
        <View style={[styles.slide, {width, height}]}>
          <ProgressivePhoto
            photo={item}
            visible={isVisible}
            contentFit={contentFit}
            groupRev={groupRev}
            onZoomActiveChange={handleZoomChange}
            zoomEnabled={index === currentIndex}
          />
        </View>
      );
    },
    [currentIndex, width, height, contentFit, groupRev, handleZoomChange],
  );

  // Scroll inicial
  useEffect(() => {
    if (validPhotos.length === 0) return;

    const safe = Math.max(
      0,
      Math.min(initialIndex ?? 0, validPhotos.length - 1),
    );

    setCurrentIndex(safe);

    const timer = setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({
          index: safe,
          animated: false,
          viewPosition: 0.5, // 🔥 Centrar la imagen
        });
      } catch (error) {
        console.log('Scroll to index error:', error);
        // Fallback: scroll con offset
        listRef.current?.scrollToOffset({
          offset: safe * width,
          animated: false,
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initialIndex, validPhotos.length, width]);

  if (validPhotos.length === 0) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <Wrapper style={styles.container}>
          <Wrapper style={styles.header}>
            <BackButton onPress={goBack} />
          </Wrapper>
          <View style={styles.emptyContainer}>
            <Label style={styles.emptyText}>No hay fotos disponibles</Label>
          </View>
        </Wrapper>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <Wrapper style={styles.container}>
        <Wrapper style={styles.header}>
          <BackButton onPress={goBack} />
          <Wrapper style={styles.counterPill}>
            <Label style={styles.counterText}>
              {currentIndex + 1}/{validPhotos.length}
            </Label>
          </Wrapper>
        </Wrapper>

        <FlatList
          // key={groupRev}
          ref={listRef}
          data={validPhotos}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          bounces={false}
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={Platform.OS === 'android'}
          scrollEventThrottle={16}
        />
      </Wrapper>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  counterPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TaskPhotoCarouselScreen;
