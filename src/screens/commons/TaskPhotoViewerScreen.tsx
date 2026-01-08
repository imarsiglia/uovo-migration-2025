import { useFullPhotoUri } from '@api/hooks/HooksTaskServices';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';

const ensureDataUri = (s: string, type: ImageType) =>
  s?.startsWith('data:image/') ? s : `data:image/${type};base64,${s}`;

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
  'TaskPhotoViewerScreen'
>;

/**
 * Hook que carga una imagen progresivamente
 */
const useProgressiveImage = (
  photo: TaskPhotoType,
  groupRev: string,
  type: ImageType = 'jpeg',
) => {
  const lowResUri = useMemo(
    () => ensureDataUri(photo.photo!, type),
    [photo.photo, type],
  );

  const {data: hiBase64, isLoading} = useFullPhotoUri(
    photo,
    {update_time: groupRev},
    true, // siempre visible para cargar
  );

  const hiResUri = useMemo(() => {
    if (!hiBase64) return null;
    return `data:image/jpeg;base64,${hiBase64}`;
  }, [hiBase64]);

  return {
    lowResUri,
    hiResUri,
    isLoadingHiRes: isLoading,
  };
};

/**
 * Componente que maneja la carga progresiva de una imagen específica
 */
const PhotoLoader = ({
  photo,
  groupRev,
  type,
  onPhotoReady,
}: {
  photo: TaskPhotoType;
  groupRev: string;
  type: ImageType;
  onPhotoReady: (photoId: string, uri: string) => void;
}) => {
  const {hiResUri, lowResUri} = useProgressiveImage(photo, groupRev, type);
  const photoId = photo.id || photo.clientId || '';

  useEffect(() => {
    // Primero envía el low-res inmediatamente
    if (lowResUri) {
      // @ts-ignore
      onPhotoReady(photoId, lowResUri);
    }
  }, [lowResUri, photoId, onPhotoReady]);

  useEffect(() => {
    // Cuando esté disponible el high-res, actualiza
    if (hiResUri) {
      // @ts-ignore
      onPhotoReady(photoId, hiResUri);
    }
  }, [hiResUri, photoId, onPhotoReady]);

  return null;
};

const TaskPhotoViewerScreen = (props: Props) => {
  const {width} = useWindowDimensions();
  const {goBack} = useCustomNavigation();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const {
    photos,
    type = 'jpeg',
    initialIndex = 0,
    groupRev,
  } = props.route.params;

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0)),
  );

  // Estado para trackear las URIs de cada foto
  const [photoUris, setPhotoUris] = useState<Record<string, string>>(() => {
    // Inicializa con los preview base64
    const initial: Record<string, string> = {};
    photos.forEach((photo) => {
      const id = photo.id || photo.clientId || '';
      initial[id] = ensureDataUri(photo.photo!, type);
    });
    return initial;
  });

  // Callback para actualizar URIs cuando estén listas
  const handlePhotoReady = useCallback((photoId: string, uri: string) => {
    setPhotoUris((prev) => ({
      ...prev,
      [photoId]: uri,
    }));
  }, []);

  // Convertir photos a formato ImageViewing
  const imageUris = useMemo(() => {
    return photos.map((photo) => {
      const id = photo.id || photo.clientId || '';
      return {
        uri: photoUris[id] || ensureDataUri(photo.photo!, type),
      };
    });
  }, [photos, photoUris, type]);

  // Prefetch de imágenes vecinas
  useEffect(() => {
    const prefetch = (p?: TaskPhotoType) => {
      if (!p) return;
      const q = p.id
        ? fullPhotoQueryById({id: p.id!})
        : localPhotoQueryByClientId({
            clientId: p.clientId!,
            base64: p.photo!,
          });
      qc.prefetchQuery({
        queryKey: q.key,
        queryFn: q.fn,
        staleTime: q.staleTime,
        gcTime: q.gcTime,
      }).catch(() => {});
    };
    prefetch(photos[currentIndex + 1]);
    prefetch(photos[currentIndex - 1]);
  }, [currentIndex, photos, groupRev, qc]);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const HeaderComponent = useCallback(
    () => (
      <Wrapper
        style={[styles.header, {paddingTop: insets.top}]}
        pointerEvents="box-none">
        <BackButton onPress={goBack} />
        <Wrapper style={styles.counterPill}>
          <Label style={styles.counterText}>
            {currentIndex + 1}/{photos.length}
          </Label>
        </Wrapper>
      </Wrapper>
    ),
    [goBack, currentIndex, photos.length, insets.top],
  );

  // Determina qué fotos cargar (actual + vecinas)
  const photosToLoad = useMemo(() => {
    const toLoad: TaskPhotoType[] = [];
    // Imagen actual
    if (photos[currentIndex]) toLoad.push(photos[currentIndex]);
    // Vecinas
    if (photos[currentIndex - 1]) toLoad.push(photos[currentIndex - 1]);
    if (photos[currentIndex + 1]) toLoad.push(photos[currentIndex + 1]);
    return toLoad;
  }, [photos, currentIndex]);

  return (
    <Wrapper style={[styles.container, {width}]}>
      {/* Loaders invisibles que cargan las imágenes progresivamente */}
      {photosToLoad.map((photo) => (
        <PhotoLoader
          key={photo.id || photo.clientId}
          photo={photo}
          groupRev={groupRev}
          type={type}
          onPhotoReady={handlePhotoReady}
        />
      ))}

      <ImageViewing
        images={imageUris}
        imageIndex={currentIndex}
        visible={true}
        onRequestClose={goBack}
        onImageIndexChange={handleIndexChange}
        HeaderComponent={HeaderComponent}
        backgroundColor="black"
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        animationType="none"
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    width: '100%',
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

export default TaskPhotoViewerScreen;