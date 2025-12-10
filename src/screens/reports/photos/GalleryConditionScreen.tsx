import { QUERY_KEYS } from '@api/contants/constants';
import {
  useGetPhotosCondition,
  useRemovePhotoCondition,
} from '@api/hooks/HooksReportServices';
import {
  CONDITION_PHOTO_SIDE_LABELS,
  CONDITION_PHOTO_SIDE_TYPE,
  ConditionPhotoType,
} from '@api/types/Condition';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import { BackButton } from '@components/commons/buttons/BackButton';
import { PressableOpacity } from '@components/commons/buttons/PressableOpacity';
import { GeneralLoading } from '@components/commons/loading/GeneralLoading';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import OfflineValidation from '@components/offline/OfflineValidation';
import { offlineDeleteConditionPhoto } from '@features/conditionReport/offline';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import { useOnline } from '@hooks/useOnline';
import { usePhotoSyncIndicator } from '@hooks/usePhotoSyncIndicator';
import { useRefreshIndicator } from '@hooks/useRefreshIndicator';
import { useRemoveFromArrayCache } from '@hooks/useToolsReactQueryCache';
import { RootStackParamList, RoutesNavigation } from '@navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadingWrapperPromise } from '@store/actions';
import useConditionStore from '@store/condition';
import { useModalDialogStore } from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { onLaunchCamera, onSelectImage } from '@utils/image';
import { showErrorToastMessage, showToastMessage } from '@utils/toast';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, ImageBackground, Platform, StyleSheet } from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import type { Image as ImageType } from 'react-native-image-crop-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'GalleryCondition'>;
export const GalleryCondition = (props: Props) => {
  const {goBack, navigate, isFocused} = useCustomNavigation();
  const refCallSheet = useRef<RBSheetRef>(null);
  const {online} = useOnline();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);

  const {
    conditionType,
    conditionPhotoType,
    conditionId,
    setReportIdImage,
    conditionClientId,
    inventoryId,
  } = useConditionStore();

  const {hasPending: hasOffline} = usePhotoSyncIndicator({
    idJob,
    conditionType,
    idJobInventory: inventoryId,
    type: conditionPhotoType,
  });

  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {mutateAsync: deleteAsync} = useRemovePhotoCondition();

  const queryKeyPayload = {
    conditionType: conditionType!,
    sideType: conditionPhotoType!,
    ...(conditionId
      ? {
          reportId: conditionId,
        }
      : conditionClientId
      ? {
          parentClientId: conditionClientId,
        }
      : {}),
  };

  const queryKey = [QUERY_KEYS.PHOTOS_CONDITION, queryKeyPayload];

  const removePhotoFromCache =
    useRemoveFromArrayCache<ConditionPhotoType>(queryKey);

  const subtype = props.route.params?.type;

  const {
    data: remotePhotos = [],
    isLoading,
    isSuccess,
    isFetching,
    refetch,
  } = useGetPhotosCondition(queryKeyPayload);

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TOTAL_PHOTOS_CONDITION_REPORT, {id: conditionId}],
    [QUERY_KEYS.TOTAL_PHOTOS_CONDITION_CHECK, {id: conditionId}],
  ]);

  const photos = useMemo(() => {
    if (subtype) {
      return remotePhotos.filter((x) => x.subtype === subtype);
    } else {
      return remotePhotos;
    }
  }, [subtype, remotePhotos]);

  console.log(photos);

  useEffect(() => {
    if (isSuccess && !(photos?.length > 0)) {
      setTimeout(() => {
        takeNewPhoto();
      }, 300);
    }
  }, [isSuccess, photos]);

  const takeNewPhoto = useCallback(() => {
    setReportIdImage(undefined);
    if (refCallSheet.current) {
      refCallSheet.current.open();
    }
  }, []);

  const checkOverview = useCallback((item: ConditionPhotoType) => {
    if (item.is_overview) {
      navigate(RoutesNavigation.ZoomScreen, {
        data: {
          photo: {base64: item.thumbnail},
        },
        item: item,
        edit: true,
      });
    } else {
      navigate(RoutesNavigation.PhotoDetailCondition, {
        item: item,
        photo: item.thumbnail!,
      });
    }
  }, []);

  const generateImagePathIOS = useCallback(
    (photo?: ImageType) => {
      if (
        photos?.some((x) => x.is_overview) ||
        conditionPhotoType == CONDITION_PHOTO_SIDE_TYPE.Details
      ) {
        navigate(RoutesNavigation.PhotoDetailCondition, {
          photo: photo?.data!,
          refresh: true,
          updateRefreshGallery: false,
        });
      } else {
        const image = {
          ...photo,
          uri: photo?.path,
          base64: photo?.data,
          data: '',
        };
        navigate(RoutesNavigation.ZoomScreen, {
          photo: image,
          // refreshGallery: (() => {}).bind(this),
        });
        // navigate('ZoomScreen', {
        //   photo,
        //   refreshGallery: getImages.bind(this),
        //   subType: props.route.params.subType
        //     ? props.route.params.subType
        //     : null,
        // });
      }
    },
    [photos, conditionPhotoType, navigate],
  );

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, []);

  const initCamera = useCallback(() => {
    if (Platform.OS == 'ios') {
      closeSheet();
      if (
        photos.some((x) => x.is_overview) ||
        conditionPhotoType == 'details'
      ) {
        navigate(
          RoutesNavigation.PhotoCaptureZoom,
          //  {
          // note: null,
          // refresh: true,
          // refreshGallery: getImages.bind(this),
          // subType: props.route.params.type,
          // }
        );
      } else {
        navigate(
          RoutesNavigation.PhotoCapture,
          //  {
          // subType: props.route.params.subType,
          // refreshGallery: getImages.bind(this),
          // }
        );
      }
    } else {
      // @ts-ignore
      onLaunchCamera(closeSheet, generateImagePathIOS);
    }
  }, [generateImagePathIOS]);

  const initGallery = useCallback(() => {
    // @ts-ignore
    onSelectImage(closeSheet, generateImagePathIOS);
  }, [closeSheet, generateImagePathIOS]);

  const initRemove = useCallback(
    (item: ConditionPhotoType, index: number) => {
      showDialog({
        modalVisible: true,
        message: (
          <Wrapper
            style={[GLOBAL_STYLES.bodyModalClockOut, {paddingHorizontal: 0}]}>
            <Label style={GLOBAL_STYLES.titleModalClockOut}>Delete?</Label>
            <ImageBackground
              resizeMode="cover"
              style={{width: 100, height: 100, marginBottom: 20}}
              source={{
                uri: 'data:image/jpeg;base64,' + item.thumbnail,
              }}
            />
            <Wrapper style={GLOBAL_STYLES.row}>
              <Label
                style={[
                  GLOBAL_STYLES.subtitleModalClockOut,
                  GLOBAL_STYLES.bold,
                ]}>
                Title:
              </Label>
              <Label style={GLOBAL_STYLES.subtitleModalClockOut}>
                {item.title}
              </Label>
            </Wrapper>

            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Are you sure you want to delete the current photo?
            </Label>

            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Once finished you will not be able to make changes.
            </Label>
          </Wrapper>
        ),
        type: 'warning',
        cancelable: true,
        confirmBtnLabel: 'Confirm',
        onConfirm: () => {
          if (online) {
            loadingWrapperPromise(
              deleteAsync({
                conditionType: conditionType!,
                isOverview: item.is_overview,
                id: item?.id,
              })
                .then((isSucess) => {
                  if (isSucess) {
                    showToastMessage('Photo deleted successfully');
                    refetch();
                    refetchAll();
                  } else {
                    showErrorToastMessage('Error while deleting photo');
                  }
                })
                .catch(() => {}),
            );
          } else {
            if (item.is_overview) {
              offlineDeleteConditionPhoto({
                conditionType: conditionType!,
                isOverview: item.is_overview,
                id: item?.id,
                clientId: item.clientId,
                idJob,
              });
            } else {
              offlineDeleteConditionPhoto({
                conditionType: conditionType!,
                isOverview: item.is_overview,
                id: item?.id,
                clientId: item.clientId,
                idJob,
              });
            }
            removePhotoFromCache({id: item.id, clientId: item.clientId});

            showToastMessage('Photo deleted (queued)');
          }
        },
      });
    },
    [showDialog, deleteAsync, online, idJob],
  );

  const renderPhoto = useCallback(
    (item: ConditionPhotoType, index: number) => {
      return (
        <PressableOpacity
          style={[
            styles.image,
            {
              borderWidth: item.is_overview ? 3 : 0,
              borderColor: COLORS.primary,
            },
          ]}
          onPress={() => checkOverview(item)}
          onLongPress={() => initRemove(item, index)}>
          <ImageBackground
            resizeMode="cover"
            style={{
              width: '100%',
              height: '100%',
              borderWidth: item.is_overview ? 3 : 0,
              borderColor: 'white',
            }}
            source={{uri: 'data:image/jpeg;base64,' + item.thumbnail}}
          />
        </PressableOpacity>
      );
    },
    [checkOverview, initRemove],
  );

  return (
    <Wrapper style={[styles.container]}>
      {isLoading && <GeneralLoading />}

      <Wrapper style={[{backgroundColor: 'white'}]}>
        <BackButton onPress={goBack} title="Back" />

        <Wrapper style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.title]}
            allowFontScaling={false}>
            {CONDITION_PHOTO_SIDE_LABELS[subtype ?? conditionPhotoType!]}
          </Label>
          <OfflineValidation offline={hasOffline} />
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      <FlatList
        onRefresh={refetch}
        refreshing={isFetching && isFocused()}
        numColumns={3}
        columnWrapperStyle={styles.flatlistRow}
        contentContainerStyle={styles.listContent}
        data={photos}
        renderItem={({item, index}) => renderPhoto(item, index)}
        keyExtractor={(x) => x?.id?.toString() ?? x?.clientId}
      />

      <Wrapper style={styles.containerBottom}>
        <PressableOpacity style={styles.btnCamera} onPress={takeNewPhoto}>
          <Icon name="camera" type="solid" size={28} color={COLORS.terteary} />
        </PressableOpacity>
      </Wrapper>

      <ImageOptionSheet
        ref={refCallSheet}
        initCamera={initCamera}
        initGallery={initGallery}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: COLORS.titleColor,
  },
  containerBottom: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  btnCamera: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    width: 60,
    backgroundColor: 'transparent',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  flatlistRow: {
    justifyContent: 'flex-start',
    marginBottom: 3,
    gap: 4,
  },
  image: {
    minWidth: '33.33%', // 👈 3 columnas iguales
    aspectRatio: 1,
    // height: 120,
  },
  listContent: {
    paddingTop: 5,
    gap: 1,
  },
});
