import {BackButton} from '@components/commons/buttons/BackButton';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {memo, useMemo, useState, useCallback} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ImageViewing from 'react-native-image-viewing';
import { COLORS } from '@styles/colors';

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

type Props = NativeStackScreenProps<RootStackParamList, 'BaseImageScreen'>;

const BaseImageScreen = (props: Props) => {
  const {
    images,
    type = 'jpeg',
    initialIndex = 0,
    onIndexChange,
    showIndicators = true,
  } = props.route.params;

  const {goBack} = useCustomNavigation();
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)),
  );

  const imageUris = useMemo(
    () =>
      images.map((s) => ({
        uri: ensureDataUri(s, type),
      })),
    [images, type],
  );

  const handleIndexChange = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange],
  );

  const HeaderComponent = useCallback(
    () => (
      <Wrapper style={[styles.headerContainer, {paddingTop: insets.top}]}>
        <BackButton onPress={goBack} />
      </Wrapper>
    ),
    [goBack, insets.top],
  );

  const FooterComponent = useCallback(
    ({imageIndex}: {imageIndex: number}) => {
      if (!showIndicators || imageUris.length <= 1) return null;

      return (
        <Wrapper
          style={[styles.footerContainer, {paddingBottom: insets.bottom + 20}]}>
          <Wrapper style={styles.counterPill}>
            <Label style={styles.counterText}>
              {imageIndex + 1} / {imageUris.length}
            </Label>
          </Wrapper>
          <Indicator count={imageUris.length} active={imageIndex} />
        </Wrapper>
      );
    },
    [imageUris.length, showIndicators, insets.bottom],
  );

  return (
    <Wrapper style={[styles.container, {width}]}> 
      <ImageViewing
        images={imageUris}
        imageIndex={currentIndex}
        visible={true}
        onRequestClose={goBack}
        onImageIndexChange={handleIndexChange}
        HeaderComponent={HeaderComponent}
        FooterComponent={FooterComponent}
        backgroundColor={COLORS.placeholderInput}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
        presentationStyle="fullScreen"
        animationType="none"
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    width: '100%',
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
  footerContainer: {
    alignItems: 'center',
    gap: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerContainerFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 999,
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
});

export default BaseImageScreen;
