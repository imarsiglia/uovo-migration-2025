// screens/TaskPhotoCarouselScreen.tsx
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
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {ImageType} from './BaseImageScreen';
import {ProgressivePhoto} from './ProgressivePhoto';

export type TaskPhotoCarouselType = {
  photos: TaskPhotoType[];
  type?: ImageType;
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
  const {width} = useWindowDimensions();
  const {goBack} = useCustomNavigation();
  const qc = useQueryClient();

  const {
    photos,
    initialIndex = 0,
    contentFit = 'contain',
    groupRev,
  } = props.route.params;

  const listRef = useRef<FlatList<TaskPhotoType>>(null);
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0)),
  );
  const [scrollEnabled, setScrollEnabled] = useState(true); // 👈

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

  // Prefetch vecino
  useEffect(() => {
    const prefetch = (p?: TaskPhotoType) => {
      if (!p) return;
      const q = p.id
        ? fullPhotoQueryById({id: p.id!, groupRev})
        : localPhotoQueryByClientId({
            clientId: p.clientId!,
            base64: p.photo!,
            groupRev,
          });
      qc.prefetchQuery({
        queryKey: q.key,
        queryFn: q.fn,
        staleTime: q.staleTime,
        gcTime: q.gcTime,
      }).catch(() => {});
    };
    prefetch(photos[index + 1]);
    prefetch(photos[index - 1]);
  }, [index, photos, groupRev, qc]);

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
          groupRev={groupRev}
          onZoomActiveChange={(active) => setScrollEnabled(!active)} // 👈
        />
      </Wrapper>
    ),
    [index, width, contentFit, groupRev],
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
        scrollEnabled={scrollEnabled} // 👈 desactiva mientras hay zoom
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
