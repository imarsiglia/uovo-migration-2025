import {useGetPhotosCondition} from '@api/hooks/HooksReportServices';
import {
  CONDITION_PHOTO_SIDE_LABELS,
  CONDITION_PHOTO_SIDE_SUBTYPE,
  ConditionPhotoSideSubtype,
} from '@api/types/Condition';
import {ImageOptionSheet} from '@components/commons/bottomsheets/ImageOptionSheet';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import useConditionStore from '@store/condition';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import type {Image as ImageType} from 'react-native-image-crop-picker';

const groupImagesBySide = (images: any[]) => {
  const base = {top: [], bottom: [], left: [], right: [] as any[]};
  if (!images || images.length === 0) {
    return base;
  }

  return images.reduce(
    (acc, img) => {
      switch (img.subtype) {
        case 'top':
          acc.top.push(img);
          break;
        case 'bottom':
          acc.bottom.push(img);
          break;
        case 'left':
          acc.left.push(img);
          break;
        case 'right':
          acc.right.push(img);
          break;
        default:
          break;
      }
      return acc;
    },
    {...base},
  );
};

export const ConditionSides = () => {
  const refCallSheet = useRef<any>(null);
  const [selectedType, setSelectedType] =
    useState<ConditionPhotoSideSubtype | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const {
    conditionType,
    conditionPhotoType,
    setConditionPhotoSubtype,
    conditionId,
    setReportIdImage,
    conditionClientId,
  } = useConditionStore();
  const {goBack, navigate, isFocused} = useCustomNavigation();

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

  const {
    data: images = [],
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetPhotosCondition(queryKeyPayload);

  const groupedImages = useMemo(() => groupImagesBySide(images), [images]);

  const isLoading = queryLoading || localLoading;

  // helpers para abrir/cerrar el bottom sheet (soporta vieja y nueva versión)
  const openImageSheet = useCallback(() => {
    const sheet: any = refCallSheet.current;
    if (!sheet) {
      return;
    }
    if (typeof sheet.open === 'function') {
      sheet.open();
    } else if (
      sheet.ref?.current &&
      typeof sheet.ref.current.open === 'function'
    ) {
      sheet.ref.current.open();
    }
  }, []);

  const closeImageSheet = useCallback(() => {
    const sheet: any = refCallSheet.current;
    if (!sheet) {
      return;
    }
    if (typeof sheet.close === 'function') {
      sheet.close();
    } else if (
      sheet.ref?.current &&
      typeof sheet.ref.current.close === 'function'
    ) {
      sheet.ref.current.close();
    }
  }, []);

  const handleRefreshGallery = useCallback(() => {
    // Ignoramos parámetros y simplemente refetch del query
    refetch();
  }, [refetch]);

  // ---------- Navegar a Galería ----------
  const goToGallery = useCallback(
    (type: ConditionPhotoSideSubtype) => {
      setConditionPhotoSubtype(type);
      navigate(RoutesNavigation.GalleryCondition, {
        type,
      });
    },
    [navigate, images],
  );

  const generateImagePathIOS = useCallback(
    (photo?: ImageType) => {
      if (groupedImages[selectedType!]?.some((x: any) => x.is_overview)) {
        navigate(RoutesNavigation.PhotoDetailCondition, {
          photo: photo?.data!,
          refresh: true,
          updateRefreshGallery: false,
        });
      } else {
        const image = {uri: photo?.path, base64: photo?.data, data: ''};
        navigate(RoutesNavigation.ZoomScreen, {
          photo: image,
        });
      }
    },
    [selectedType, groupedImages, conditionPhotoType, navigate],
  );

  // ---------- Tomar foto ----------
  const initCamera = useCallback(() => {
    if (!selectedType) {
      return;
    }
    if (Platform.OS === 'ios') {
      closeImageSheet();
      const hasOverview = images.some(
        (x: any) => x.subtype === selectedType && x.is_overview,
      );
      if (hasOverview) {
        navigate(RoutesNavigation.PhotoCaptureZoom);
      } else {
        navigate(RoutesNavigation.PhotoCapture);
      }
    } else {
      // @ts-ignore
      onLaunchCamera(closeSheet, generateImagePathIOS);
    }
  }, [selectedType, images, generateImagePathIOS]);

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, []);

  // ---------- Seleccionar desde galería ----------
  const initGallery = useCallback(async () => {
    // @ts-ignore
    onSelectImage(closeSheet, generateImagePathIOS);
  }, [generateImagePathIOS]);

  // ---------- Abrir sheet para nuevo tipo ----------
  const takeNewPhoto = useCallback((type: ConditionPhotoSideSubtype) => {
    setReportIdImage(undefined);
    setConditionPhotoSubtype(type);
    setSelectedType(type);
    openImageSheet();
  }, []);

  const getImageSide = useCallback(
    (subtype: ConditionPhotoSideSubtype) => {
      return (
        groupedImages[subtype].find((x: any) => x.is_overview)?.thumbnail ??
        groupedImages[subtype][groupedImages.left.length - 1].thumbnail
      );
    },
    [groupedImages],
  );

  const getImageComponent = useCallback(
    (subtype: ConditionPhotoSideSubtype) => {
      return (
        <View style={{width: '48%'}}>
          <TouchableOpacity
            style={styles.viewPhoto}
            onPress={() => goToGallery(subtype)}>
            {groupedImages[subtype].length === 0 && (
              <Icon name="images" type="solid" color="white" size={70} />
            )}

            {groupedImages[subtype].length > 0 && (
              <ImageBackground
                resizeMode="cover"
                style={{width: '100%', height: '100%'}}
                source={{
                  uri: `data:image/jpeg;base64,${
                    groupedImages[subtype].find((x: any) => x.is_overview)
                      ?.thumbnail ??
                    groupedImages[subtype][groupedImages[subtype].length - 1]
                      .thumbnail
                  }`,
                }}
              />
            )}
            {/* <View style={{position: 'absolute', top: 0, right: 0}}>
                    <OfflineValidation
                      idJob={props.jobDetail.id}
                      offline={[
                        DELETE_CONDITION_IMAGE_OVERVIEW_OFFLINE_VALIDATION[
                          props.conditionType
                        ],
                        DELETE_CREPORT_IMAGE_DETAIL_OFFLINE_VALIDATION,
                        REPORT_CONDITION_IMAGE_OFFLINE_VALIDATION[
                          props.conditionType
                        ],
                        REPORT_CONDITION_IMAGE_DETAIL_OFFLINE_VALIDATION[
                          props.conditionType
                        ],
                      ]}
                      reportType={'left'}
                      conditionType={props.conditionType}
                      idInventory={props.idInventory}
                      reportSubType={'left'}
                    />
                  </View> */}
          </TouchableOpacity>
          <Text style={styles.titleType}>
            {CONDITION_PHOTO_SIDE_LABELS[subtype]}
          </Text>
          <Text style={styles.subtitleType}>
            {groupedImages[subtype].length} pictures
          </Text>
        </View>
      );
    },
    [groupedImages, goToGallery],
  );

  return (
    <View style={[styles.container]}>
      {isLoading && (
        <View style={GLOBAL_STYLES.backgroundLoading}>
          <ActivityIndicator size="large" color={'#487EFD'} />
        </View>
      )}

      <View style={[{backgroundColor: 'white'}]}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <TouchableOpacity onPress={goBack}>
            <View style={styles.backBtn}>
              <Icon
                name="chevron-left"
                color="#959595"
                type="light"
                size={15}
              />
              <Text style={styles.backBtnText}>Back</Text>
            </View>
          </TouchableOpacity>

          <View style={{flexDirection: 'row'}} />
        </View>

        <View
          style={[
            styles.lateralPadding,
            {flexDirection: 'row', alignItems: 'center', gap: 5},
          ]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Sides
          </Text>
          {/* <OfflineValidation
              idJob={props.jobDetail.id}
              offline={[
                DELETE_CONDITION_IMAGE_OVERVIEW_OFFLINE_VALIDATION[
                  props.conditionType
                ],
                DELETE_CREPORT_IMAGE_DETAIL_OFFLINE_VALIDATION,
                REPORT_CONDITION_IMAGE_OFFLINE_VALIDATION[props.conditionType],
                REPORT_CONDITION_IMAGE_DETAIL_OFFLINE_VALIDATION[
                  props.conditionType
                ],
              ]}
              reportType={'sides'}
              conditionType={props.conditionType}
              idInventory={props.idInventory}
            /> */}
        </View>
      </View>

      <MinRoundedView />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isFetching && isFocused()}
            onRefresh={refetch}
          />
        }>
        <View
          style={[
            {
              paddingTop: 20,
            },
            styles.lateralPadding,
          ]}>
          <View style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
            {getImageComponent(CONDITION_PHOTO_SIDE_SUBTYPE.Top)}
            {getImageComponent(CONDITION_PHOTO_SIDE_SUBTYPE.Bottom)}
          </View>

          <View
            style={[
              GLOBAL_STYLES.row,
              {justifyContent: 'space-between', paddingTop: 10},
            ]}>
            {getImageComponent(CONDITION_PHOTO_SIDE_SUBTYPE.Left)}
            {getImageComponent(CONDITION_PHOTO_SIDE_SUBTYPE.Right)}
          </View>

          {/* BOTONES TOMAR FOTO */}
          <View
            style={[
              GLOBAL_STYLES.row,
              {
                justifyContent: 'space-between',
                marginTop: 60,
                marginBottom: 10,
              },
            ]}>
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.row,
                styles.lateralPadding,
                styles.btnTakePhoto,
              ]}
              onPress={() => takeNewPhoto('top')}>
              <Text style={styles.textTakePhoto} allowFontScaling={false}>
                Top
              </Text>
              <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                <View style={styles.countTakePhoto}>
                  <Text style={styles.numberCount} allowFontScaling={false}>
                    {groupedImages.top.length}
                  </Text>
                </View>
                <View style={styles.viewCamera}>
                  <Icon name="camera" type="solid" color="white" size={20} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                GLOBAL_STYLES.row,
                styles.lateralPadding,
                styles.btnTakePhoto,
              ]}
              onPress={() => takeNewPhoto('bottom')}>
              <Text style={styles.textTakePhoto} allowFontScaling={false}>
                Bottom
              </Text>
              <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                <View style={styles.countTakePhoto}>
                  <Text style={styles.numberCount} allowFontScaling={false}>
                    {groupedImages.bottom.length}
                  </Text>
                </View>
                <View style={styles.viewCamera}>
                  <Icon name="camera" type="solid" color="white" size={20} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.row,
                styles.lateralPadding,
                styles.btnTakePhoto,
              ]}
              onPress={() => takeNewPhoto('left')}>
              <Text style={styles.textTakePhoto} allowFontScaling={false}>
                Left
              </Text>
              <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                <View style={styles.countTakePhoto}>
                  <Text style={styles.numberCount} allowFontScaling={false}>
                    {groupedImages.left.length}
                  </Text>
                </View>
                <View style={styles.viewCamera}>
                  <Icon name="camera" type="solid" color="white" size={20} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                GLOBAL_STYLES.row,
                styles.lateralPadding,
                styles.btnTakePhoto,
              ]}
              onPress={() => takeNewPhoto('right')}>
              <Text
                style={[styles.textTakePhoto, {paddingRight: 17}]}
                allowFontScaling={false}>
                Right
              </Text>
              <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                <View style={styles.countTakePhoto}>
                  <Text style={styles.numberCount} allowFontScaling={false}>
                    {groupedImages.right.length}
                  </Text>
                </View>
                <View style={styles.viewCamera}>
                  <Icon name="camera" type="solid" color="white" size={20} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ImageOptionSheet
        ref={refCallSheet}
        initCamera={initCamera}
        initGallery={initGallery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flex: 1,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
  },
  topsheet: {
    color: '#3a3a3a',
  },
  titleType: {
    fontWeight: '400',
    fontSize: 14,
    paddingTop: 5,
  },
  subtitleType: {
    fontWeight: '200',
    fontSize: 12,
  },
  btnTakePhoto: {
    width: '48%',
    borderRadius: 25,
    height: 40,
    backgroundColor: '#00D3ED',
    justifyContent: 'space-between',
  },
  textTakePhoto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  countTakePhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#3C424A',
    marginRight: 5,
  },
  numberCount: {
    color: 'white',
    fontSize: 18,
  },
  viewCamera: {
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: '#3C424A',
    height: 30,
    padding: 5,
    paddingLeft: 8,
  },
  containerCountCamera: {
    paddingLeft: 5,
  },
  viewPhoto: {
    width: '100%',
    height: 150,
    backgroundColor: '#fffabc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
