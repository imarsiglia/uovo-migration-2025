// screens/TaskPhotoCarouselScreen.tsx
import {
  fullPhotoQueryById,
  localPhotoQueryByClientId,
} from '@api/queries/fullPhotoQuery';
import type { TaskPhotoType } from '@api/types/Task';
import { BackButton } from '@components/commons/buttons/BackButton';
import { Label } from '@components/commons/text/Label';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import type { RootStackParamList } from '@navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { ImageType } from './BaseImageScreen';
import { ProgressivePhoto } from './ProgressivePhoto';

export type TaskPhotoCarouselType = {
  photos: TaskPhotoType[];
  type?: ImageType;
  height?: number;
  initialIndex?: number;
  contentFit?: 'cover' | 'contain';
  onIndexChange?: (index: number) => void;
  showIndicators?: boolean;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'TaskPhotoCarouselScreen'
>;

const TaskPhotoCarouselScreen = (props: Props) => {
  const {width} = useWindowDimensions();
  const {goBack} = useCustomNavigation();
  const qc = useQueryClient();

  const {photos, initialIndex = 0, contentFit = 'contain'} = props.route.params;

  const listRef = useRef<FlatList<TaskPhotoType>>(null);
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0)),
  );

  const getItemLayout = useCallback(
    (_: unknown, i: number) => ({length: width, offset: width * i, index: i}),
    [width],
  );

  const keyExtractor = useCallback(
    (it: TaskPhotoType, i: number) => (it.id ?? i).toString(),
    [],
  );

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offX / width);
      if (newIndex !== index) setIndex(newIndex);
    },
    [index, width],
  );

  // Prefetch del vecino (siguiente y anterior) para high-res
  useEffect(() => {
    const prev = photos[index - 1];
    const next = photos[index + 1];
    const neigh = [prev, next].filter(Boolean) as TaskPhotoType[];

    neigh.forEach((p) => {
      if (p.id != null) {
        const q = fullPhotoQueryById(p.id);
        qc.prefetchQuery({
          queryKey: q.key,
          queryFn: q.fn,
          staleTime: q.staleTime,
        }).catch(() => {});
      } else if (p.clientId) {
        const q = localPhotoQueryByClientId(p.clientId, p.photo!);
        qc.prefetchQuery({
          queryKey: q.key,
          queryFn: q.fn,
          staleTime: q.staleTime,
        }).catch(() => {});
      }
    });
  }, [index, photos, qc]);

  const renderItem = useCallback(
    ({item, index: i}: {item: TaskPhotoType; index: number}) => (
      <Wrapper
        style={[styles.slide, {width}]}
        renderToHardwareTextureAndroid
        shouldRasterizeIOS>
        <ProgressivePhoto
          photo={item}
          visible={i === index}
          contentFit={contentFit}
        />
      </Wrapper>
    ),
    [index, width, contentFit],
  );

  const onRefReady = useCallback(
    (ref: FlatList<TaskPhotoType> | null) => {
      if (ref) {
        listRef.current = ref;
        if (initialIndex > 0 && initialIndex < photos.length) {
          setTimeout(() => {
            try {
              ref.scrollToIndex({index: initialIndex, animated: false});
            } catch {}
          }, 0);
        }
      }
    },
    [initialIndex, photos.length],
  );

  return (
    <Wrapper style={[styles.container, {width}]}>
      <Wrapper style={styles.header}>
        <BackButton onPress={goBack} />
        <Wrapper style={styles.counterPill}>
          <Label style={styles.counterText}>
            {index + 1}/{photos.length}
          </Label>
        </Wrapper>
      </Wrapper>

      <FlatList
        ref={onRefReady}
        data={photos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={16}
        windowSize={3}
        removeClippedSubviews
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={onMomentumEnd}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  slide: {justifyContent: 'center', alignItems: 'center'},
  header: {
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
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
});

export default TaskPhotoCarouselScreen;
