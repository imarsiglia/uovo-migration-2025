import {QUERY_KEYS} from '@api/contants/constants';
import {
  useGetPhotoConditionOverview,
  useSaveZoomScreen,
} from '@api/hooks/HooksReportServices';
import {
  PhotoConditionOverviewApiProps,
  SaveZoomScreenProps,
} from '@api/services/reportServices';
import {
  ConditionPhotoSideType,
  ConditionPhotoType,
  OverviewReportType,
  StickyNoteType,
} from '@api/types/Condition';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {NOTE_AREA} from '@components/condition/notes/helpers';
import NoteIssueSelector from '@components/condition/notes/NoteIssueSelector';
import {CustomSpeedDialoAction} from '@components/floating/HomeFloatingAction';
import {
  offlineCreateZoomScreen,
  offlineUpdateZoomScreen,
} from '@features/conditionReport/offline';
import {upsertIntoObjectCache} from '@features/helpers/offlineHelpers';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {useUpsertArrayCache} from '@hooks/useToolsReactQueryCache';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {CommonActions} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SpeedDial} from '@rneui/themed';
import {loadingWrapperPromise} from '@store/actions';
import useConditionStore from '@store/condition';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {useQueryClient} from '@tanstack/react-query';
import {generateUUID} from '@utils/functions';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Dimensions, Image, Keyboard, Platform, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import type {Image as ImageType} from 'react-native-image-crop-picker';
import ImageZoom from 'react-native-image-pan-zoom';

const {height: dimensionsHeight, width: dimensionsWidth} =
  Dimensions.get('window');

const stateUpdate: any = {
  add: {
    setModeActive: true,
  },
  cancel: {
    setModeActive: false,
  },
  cancelSet: {
    setModeActive: false,
    areaDraggable: false,
  },
  set: {
    areaDraggable: false,
    setModeActive: false,
  },
  clear: {
    notes: [],
  },
};

const actionsDefault = [
  {
    text: 'Add Note',
    icon: <Icon name="sticky-note" size={15} color="white" />,
    name: 'add',
    position: 1,
  },
  {
    text: 'Save photo',
    icon: <Icon name="sign-in" size={15} color="white" />,
    name: 'save',
    position: 3,
  },
  {
    text: 'Clear all',
    icon: <Icon name="trash" size={15} color="white" />,
    name: 'clear',
    position: 4,
  },
];

const actionsCancel = [
  {
    text: 'Cancel',
    icon: <Icon name="ban" size={15} color="white" />,
    name: 'cancel',
    position: 1,
  },
];
const actionsSet = [
  {
    text: 'Set',
    icon: <Icon name="check" size={15} color="white" />,
    name: 'set',
    position: 1,
  },
  {
    text: 'Cancel',
    icon: <Icon name="ban" size={15} color="white" />,
    name: 'cancelSet',
    position: 2,
  },
];

// ======= refs que reemplazan "var" globales del class =======
const globalPositionXRef = {current: 0};
const globalPositionYRef = {current: 0};
const zoomScaleRef = {current: 1};
const originalImageWidthRef = {current: 0};
const originalImageHeightRef = {current: 0};
const lastGlobalPositionXRef = {current: 0};
const lastGlobalPositionYRef = {current: 0};

const refreshGalleryRef = {current: false};

const width_ratioRef = {current: 0.0};
const imgAspRatioRef = {current: 0.0};
const realImgheightRef = {current: 0.0};
const height_ratioRef = {current: 0.0};
const ratioRef = {current: 0.0};
const newHeightRef = {current: 0.0};

type Props = NativeStackScreenProps<RootStackParamList, 'ZoomScreen'>;
const ZoomScreen = (props: Props) => {
  const zoomRef = useRef<any>(null);
  const refCallSheet = useRef<RBSheetRef>(null);
  const mainImageTransformsRef = useRef<any>(null);
  const {online} = useOnline();

  const params = props.route.params;
  const item: ConditionPhotoType | undefined = params.item;
  const uri = params?.photo?.uri;

  const navigation = props.navigation;

  const skipNextUpdateNotePositionRef = useRef(false);

  const queryClient = useQueryClient();

  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const {
    inventoryId,
    conditionId,
    conditionPhotoType,
    conditionType,
    reportIdImage,
    setEditModalFunction,
    setCopyNote,
    setConditionId,
    setInventoryId,
    setReportIdImage,
    conditionPhotoSubtype,
    conditionClientId,
  } = useConditionStore();

  const {navigate, goBack} = useCustomNavigation();

  const overviewQueryProps = useMemo(
    () =>
      ({
        conditionType: conditionType!,
        ...(item?.id || reportIdImage
          ? {id: item?.id ?? reportIdImage}
          : item?.clientId
          ? {clientId: item.clientId}
          : {}),
      } as PhotoConditionOverviewApiProps),
    [conditionType, item?.id, item?.clientId, reportIdImage],
  );

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

  const {
    data: conditionOverview,
    isLoading,
    isFetching,
    refetch,
  } = useGetPhotoConditionOverview(overviewQueryProps);

  const upsertPhoto = useUpsertArrayCache<ConditionPhotoType>(queryKey);

  const {mutateAsync: saveZoomScreen} = useSaveZoomScreen();
  const {refetchAll} = useRefreshIndicator([
    [
      QUERY_KEYS.PHOTOS_CONDITION,
      {
        conditionType: conditionType!,
        sideType: conditionPhotoType!,
        reportId: conditionId!,
      },
    ],
    [QUERY_KEYS.TOTAL_PHOTOS_CONDITION_REPORT, {id: conditionId}],
  ]);

  // ======= estado base equivalente a _getState(props) =======
  const getInitialState = useCallback(
    (p: any) => {
      if (conditionOverview?.idJob) {
        const base64 = conditionOverview.data.photo.base64;
        const base64Image = `data:image/jpeg;base64,${base64}`;
        return {
          notes: [],
          helperVisible: true,
          notesVisible: true,
          setModeActive: false,
          areaDraggable: false,
          editNoteActive: false,
          activeNoteId: null,
          reportId: conditionOverview.reportId,
          loading: false,
          height: dimensionsHeight,
          fabOpen: false,
          photoSource: {
            uri: base64Image,
          },
          ...conditionOverview.data,
        };
      }

      return {
        notes: [],
        helperVisible: true,
        notesVisible: true,
        setModeActive: false,
        areaDraggable: false,
        editNoteActive: false,
        activeNoteId: null,
        reportId: null,
        loading: false,
        height: dimensionsHeight,
        fabOpen: false,
        photoSource: {uri},
      };
    },
    [conditionOverview, uri],
  );

  const [state, setState] = useState<any>(() => getInitialState(props));
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (conditionOverview?.idJob) {
      if (conditionOverview.reportId) {
        setConditionId(conditionOverview.reportId);
      }
      if (conditionOverview.idJobInventory) {
        setInventoryId(conditionOverview.idJobInventory);
      }
      if (conditionOverview.idImg) {
        setReportIdImage(conditionOverview.idImg);
      }
    }
  }, [conditionOverview?.idJob]);

  const setM = useCallback((partial: any) => {
    setState((s: any) => ({...s, ...partial}));
  }, []);

  // ======= helpers que replican los del class =======
  const getPercentFromNumber = useCallback(
    (percent: number, numberFrom: number) => {
      return (numberFrom / 100) * percent;
    },
    [],
  );

  const getPercentDiffNumberFromNumber = useCallback(
    (number: number, numberFrom: number) => {
      return (number / numberFrom) * 100;
    },
    [],
  );

  const initVariables = useCallback(() => {
    globalPositionXRef.current = 0;
    globalPositionYRef.current = 0;
    zoomScaleRef.current = 1;
    originalImageWidthRef.current = 0;
    originalImageHeightRef.current = 0;
    lastGlobalPositionXRef.current = 0;
    lastGlobalPositionYRef.current = 0;

    width_ratioRef.current = 0.0;
    imgAspRatioRef.current = 0.0;
    realImgheightRef.current = 0.0;
    height_ratioRef.current = 0.0;
    ratioRef.current = 0.0;
    newHeightRef.current = 0.0;

    refreshGalleryRef.current = false;
  }, []);

  // ======= componentDidMount =======
  useEffect(() => {
    initVariables();

    // CRÍTICO: Inicializar dimensiones originales desde params
    if (params?.photo?.width && params?.photo?.height) {
      originalImageWidthRef.current = params.photo.width;
      originalImageHeightRef.current = params.photo.height;
    }
    // reset zoom
    zoomRef.current?.reset?.();
    zoomRef.current?.panResponderReleaseResolve?.();

    // ======= componentWillUnmount =======
    return () => {
      zoomRef.current?.reset?.();
      zoomRef.current?.panResponderReleaseResolve?.();
      // if (refreshGalleryRef.current && params?.refreshGallery) {
      //   params.refreshGallery();
      // }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // ======= componentDidUpdate (note -> photoZoom) =======
  useEffect(() => {
    _updatePhotoZoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.note, state.notes]);

  useEffect(() => {
    return () => {
      setEditModalFunction(undefined);
      setCopyNote(undefined);
    };
  }, []);

  const _updatePhotoZoom = useCallback(() => {
    if (params?.note) {
      const note = state.notes?.find((n: any) => n.id === params?.note?.id);
      if (!note?.photoZoom) {
        const notes = state.notes?.reduce((acc: any[], curr: any) => {
          if (curr?.id === params?.note?.id) {
            return [...acc, {...note, photoZoom: params?.photo}];
          }
          return [...acc, curr];
        }, []);

        navigation.dispatch(CommonActions.setParams({note: null}));
        setState((s: any) => ({...s, notes}));
      }
    }
  }, [params, state.notes, navigation]);

  // ======= initNewHeight =======
  const initNewHeight = useCallback(() => {
    ratioRef.current = dimensionsWidth / (params?.photo?.width || 1);
    newHeightRef.current = dimensionsHeight;
    setM({height: dimensionsHeight});
  }, [params, setM]);

  // ======= postConstruct =======
  const postConstruct = useCallback(() => {
    const width = conditionOverview?.data?.screen?.width;
    const height = conditionOverview?.data?.screen?.height;

    var deviceDimensions = {
      width: width,
      height: height,
    };

    ratioRef.current = dimensionsWidth / (deviceDimensions?.width ?? 1);
    newHeightRef.current = (deviceDimensions.height ?? 1) * ratioRef.current;

    width_ratioRef.current = dimensionsWidth / (deviceDimensions.width ?? 1);
    imgAspRatioRef.current = dimensionsWidth / newHeightRef.current;
    realImgheightRef.current =
      (deviceDimensions.width ?? 1) / imgAspRatioRef.current;
    height_ratioRef.current = newHeightRef.current / realImgheightRef.current;
    var fixY = 0;
    var newNotes: any[] = [];

    conditionOverview?.data?.notes?.map((element: any) => {
      // CÓDIGO ORIGINAL: transformar notas de otros dispositivos
      var elWidth = element.width;
      var elHeight = element.height;

      var elOrigWidth = element.originalWidth;
      var elOrigHeight = element.originalHeight;

      var elTop = element.translation.top - fixY;
      var elLeft = element.translation.left;

      var elPosTop = element.position.top;
      var elPosLeft = element.position.left;

      var x1 = elLeft * width_ratioRef.current;
      var y1 = elTop * height_ratioRef.current;
      var xPos1 = elPosLeft * width_ratioRef.current;
      var yPos1 = elPosTop * height_ratioRef.current;

      var nwidth = elWidth * width_ratioRef.current;
      var nheight = elHeight * height_ratioRef.current;

      var nOrigwidth = elOrigWidth * width_ratioRef.current;
      var nOrigheight = elOrigHeight * height_ratioRef.current;

      element.width = nwidth;
      element.height = nheight;
      element.originalWidth = nOrigwidth;
      element.originalHeight = nOrigheight;
      element.translation.left = x1;
      element.translation.top = y1;
      element.position.left = xPos1;
      element.position.top = yPos1;

      var diffTop = element.diffTop * width_ratioRef.current;
      var diffLeft = element.diffLeft * width_ratioRef.current;

      element.diffTop = diffTop;
      element.diffLeft = diffLeft;

      element.screenWidth = dimensionsWidth;
      element.screenHeight = newHeightRef.current;

      newNotes.push({...element});
    });

    setM({notes: newNotes, height: newHeightRef.current});
  }, [conditionOverview, setM]);

  useEffect(() => {
    if (!isLoading) {
      if (conditionOverview?.idJob) {
        setState(getInitialState(props));

        // CRÍTICO: Establecer tamaños originales PRIMERO
        originalImageWidthRef.current = conditionOverview.data.screen.width;
        originalImageHeightRef.current = conditionOverview.data.screen.height;

        // transforms previos
        if (conditionOverview.data?.mainImageTransforms) {
          const mainImageTransforms =
            conditionOverview.data.mainImageTransforms;
          mainImageTransformsRef.current = mainImageTransforms;
          const location = {
            x: mainImageTransforms?.positionX || 0,
            y: mainImageTransforms?.positionY || 0,
            scale: mainImageTransforms?.scale || 1,
            duration: 0,
          };
          zoomRef.current?.centerOn?.(location);
        }

        postConstruct();

        setTimeout(() => {
          Keyboard.dismiss();
        }, 500);
      } else {
        initNewHeight();
        // if (!(params && params.edit)) {
        //   initNewHeight();
        // }
      }
    }
  }, [
    props,
    params,
    conditionOverview?.idJob,
    isLoading,
    isFetching,
    getInitialState,
    postConstruct,
    initNewHeight,
  ]);

  // ======= handlers =======
  const _onPhotoPress = useCallback(
    (event: any) => {
      const {setModeActive, areaDraggable} = state;
      if (setModeActive && !areaDraggable) {
        const active = state?.notes?.find((n: any) => n.editing);
        if (!active) {
          const position = {
            top: event?.locationY,
            left: event?.locationX,
            positionX: globalPositionXRef.current,
            positionY: globalPositionYRef.current,
          };
          var id: any;
          if (state.notes?.length == 0) {
            id = 1;
          } else {
            id = state.notes[state.notes?.length - 1]?.id + 1;
          }
          const note = {
            id,
            label: '',
            details: '',
            photoZoom: null,
            position,
            editing: false,
            areaSet: false,
            area: NOTE_AREA,
            translation: null,
          };
          setState((s: any) => ({
            ...s,
            notes: [...s.notes, note],
            areaDraggable: true,
            activeNoteId: id,
          }));
        }
      }
    },
    [state],
  );

  const _adjustNoteTranslation = useCallback(
    ({note, translation}: any) => {
      const notes = state.notes?.reduce((acc: any[], curr: any) => {
        if (curr.id === note?.id) {
          return [...acc, {...curr, translation}];
        }
        return [...acc, curr];
      }, []);
      setM({notes});
    },
    [setM, state.notes],
  );

  const _onDragEnd = useCallback(
    ({note, translation}: any) => {
      const notes = state.notes?.reduce((acc: any[], curr: any) => {
        if (curr.id === note?.id) {
          return [...acc, {...curr, stickyNoteTranslation: translation}];
        }
        return [...acc, curr];
      }, []);
      setM({notes});
    },
    [setM, state.notes],
  );

  const _onCancel = useCallback(
    (noteId: number) => {
      const notes = state.notes.filter((n: any) => n.id !== noteId);
      setM({notes});
    },
    [setM, state.notes],
  );

  const _onSave = useCallback(
    (note: any) => {
      const notes = state.notes?.reduce((acc: any[], curr: any) => {
        if (curr?.id === note?.id) {
          return [...acc, note];
        }
        return [...acc, curr];
      }, []);
      setM({notes});
    },
    [setM, state.notes],
  );

  const updateRefreshGallery = useCallback((refresh: boolean) => {
    refreshGalleryRef.current = refresh;
  }, []);

  const _captureZoom = useCallback(() => {
    openSheet();
  }, []);

  const _onExpand = useCallback(
    (photo: any) => {
      props.navigation.navigate('PhotoView', {photo});
    },
    [props.navigation],
  );

  const _onEdit = useCallback(
    (note: StickyNoteType) => {
      const notes = state.notes?.map((n: any) =>
        n.id === note?.id ? {...note, editing: true} : n,
      );
      setM({notes});
    },
    [setM, state.notes],
  );

  const _getActions = useCallback(() => {
    const {setModeActive, areaDraggable} = state;
    if (setModeActive && areaDraggable) {
      return actionsSet;
    } else if (setModeActive && !areaDraggable) {
      return actionsCancel;
    } else {
      return actionsDefault;
    }
  }, [state]);

  const _getPhoto = useCallback(() => {
    if (conditionOverview?.data?.photo) {
      return conditionOverview?.data?.photo;
    }
    if (params?.edit) {
      const data = params?.data;
      return data?.photo;
    }
    const photo = params?.photo;
    return photo;
  }, [conditionOverview, params]);

  const getOriginalImageDimensions = useCallback(async () => {
    // Si ya están inicializadas, retornarlas
    if (
      originalImageWidthRef.current > 0 &&
      originalImageHeightRef.current > 0
    ) {
      return {
        width: originalImageWidthRef.current,
        height: originalImageHeightRef.current,
      };
    }

    // Si vienen de params
    if (params?.photo?.width && params?.photo?.height) {
      originalImageWidthRef.current = params.photo.width;
      originalImageHeightRef.current = params.photo.height;
      return {
        width: params.photo.width,
        height: params.photo.height,
      };
    }

    // Si hay que obtenerlas de la imagen
    const photo = state.photoSource;
    if (photo?.uri) {
      return new Promise((resolve) => {
        Image.getSize(
          photo.uri,
          (width, height) => {
            originalImageWidthRef.current = width;
            originalImageHeightRef.current = height;
            resolve({width, height});
          },
          (error) => {
            console.error('Error getting image size:', error);
            // Fallback a dimensiones de pantalla
            resolve({width: dimensionsWidth, height: dimensionsHeight});
          },
        );
      });
    }

    // Fallback
    return {width: dimensionsWidth, height: dimensionsHeight};
  }, [params, state.photoSource]);

  const _handleFAB = useCallback(
    async (buttonName: string) => {
      setM({fabOpen: false});
      const {notes: stateNotes, activeNoteId} = state;

      if (buttonName === 'save') {
        refreshGalleryRef.current = false;

        // NUEVO: Simular un pequeño zoom para forzar el cálculo de dimensiones
        const currentScale = zoomScaleRef.current;
        if (currentScale === 1) {
          // Si no hay zoom, hacer un micro-zoom y regresar
          const microZoomLocation = {
            x: dimensionsWidth / 2,
            y: dimensionsHeight / 2,
            scale: 1.01, // Zoom casi imperceptible
            duration: 0,
          };
          zoomRef.current?.centerOn?.(microZoomLocation);

          // Esperar que se procese el zoom
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Regresar a escala 1
          const resetLocation = {
            x: dimensionsWidth / 2,
            y: dimensionsHeight / 2,
            scale: 1,
            duration: 0,
          };
          zoomRef.current?.centerOn?.(resetLocation);

          // Esperar que se procese el reset
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Ahora sí hacer reset normal
        zoomRef.current?.reset?.();

        setTimeout(() => {
          zoomRef.current?.panResponderReleaseResolve?.();
        }, 100);

        setTimeout(async () => {
          // Usar SIEMPRE el último estado
          const latestState = stateRef.current;

          setM({loading: true});
          const photo = _getPhoto();
          const {notes} = latestState;

          const body: SaveZoomScreenProps = {
            conditionType: conditionType!,
            data: {
              photo,
              notes,
              mainImageTransforms: mainImageTransformsRef.current,
              screen: {
                width: dimensionsWidth,
                height: latestState.height,
              },
            },
            idJob: idJob,
            idJobInventory: !props.unmanaged ? inventoryId : null,
            idImg: reportIdImage ?? null,
            reportId: conditionId ?? null,
            reportType: conditionPhotoType ?? null,
            reportSubType: conditionPhotoSubtype ?? null,
          };

          functSave(online, body);
          return;
        }, 400);
        return;
      }

      if (buttonName === 'cancelSet') {
        // CRÍTICO: NO usar skipNextUpdateNotePositionRef aquí (como en ClassComponent)
        const notes = stateNotes.slice(0, -1);
        setM({notes, ...stateUpdate[buttonName]});
        return;
      } else if (buttonName === 'set') {
        const notes = stateNotes?.reduce((acc: any[], curr: any) => {
          if (activeNoteId === curr.id) {
            curr.position.scale = zoomScaleRef.current;
            curr.updating = false;
            return [...acc, {...curr, areaSet: true}];
          }
          return [...acc, curr];
        }, []);

        setState((s: any) => ({
          ...s,
          setModeActive: false,
          areaDraggable: false,
          notes,
          activeNoteId: null,
        }));
        return;
      } else {
        setM({...stateUpdate[buttonName]});
      }
    },
    [
      _getPhoto,
      props,
      setM,
      state,
      online,
      conditionType,
      reportIdImage,
      idJob,
      inventoryId,
      conditionId,
      conditionPhotoType,
      conditionPhotoSubtype,
    ],
  );

  const functSave = useCallback(
    async (isConnected: boolean, bodyRequest: SaveZoomScreenProps) => {
      if (isConnected) {
        loadingWrapperPromise(
          saveZoomScreen(bodyRequest)
            .then((response) => {
              if (response?.idImg) {
                setTimeout(() => {
                  refetchAll();
                  if (item?.id) {
                    refetch();
                  } else {
                    setReportIdImage(response.idImg);
                  }
                }, 500);
                goBack();
              }
            })
            .catch((e) => {
              console.log('error guardando report');
              console.log(e);
            }),
        );
      } else {
        const clientId = item?.clientId ?? generateUUID();
        if (item?.clientId) {
          offlineUpdateZoomScreen({
            ...bodyRequest,
            clientId,
            id: item?.id ?? reportIdImage,
            parentClientId: conditionClientId!,
          });
        } else {
          offlineCreateZoomScreen({
            ...bodyRequest,
            clientId,
            id: item?.id ?? reportIdImage,
            parentClientId: conditionClientId!,
          });
        }
        upsertPhoto({
          clientId,
          id: item?.id,
          title: `${conditionPhotoType} overview`,
          thumbnail: bodyRequest.data?.photo?.base64,
          type: conditionPhotoType,
          subtype: item?.subtype ?? conditionPhotoSubtype,
          is_overview: true,
          id_sticky_note: null,
        });

        const detailKey: [string, PhotoConditionOverviewApiProps] = [
          QUERY_KEYS.PHOTO_CONDITION_OVERVIEW,
          item?.id
            ? {
                conditionType: conditionType!,
                id: item.id,
              }
            : {
                conditionType: conditionType!,
                clientId,
              },
        ];
        upsertIntoObjectCache<OverviewReportType>(queryClient, detailKey, {
          clientId,
          data: bodyRequest.data,
          idImg: bodyRequest.idImg,
          idJob: bodyRequest.idJob,
          idJobInventory: bodyRequest.idJobInventory,
          reportId: bodyRequest.reportId,
          reportType: bodyRequest.reportType as ConditionPhotoSideType | null,
          reportSubType: bodyRequest.reportSubType,
        });
        goBack();
      }
    },
    [
      item?.id,
      conditionType,
      conditionClientId,
      reportIdImage,
      saveZoomScreen,
      refetchAll,
      refetch,
      setReportIdImage,
      goBack,
      upsertPhoto,
      conditionPhotoType,
      item?.subtype,
      conditionPhotoSubtype,
      queryClient,
    ],
  );

  const _updateNotePosition = useCallback(
    ({note, measure}: any) => {
      if (skipNextUpdateNotePositionRef.current) {
        skipNextUpdateNotePositionRef.current = false;
        return;
      }

      const notes = state.notes.reduce((acc: any[], curr: any) => {
        if (curr.id === note.id) {
          // CRÍTICO: Guardar el scale actual
          curr.position.scale = zoomScaleRef.current;
          return [
            ...acc,
            {
              ...note,
              ...measure,
              diffLeft: note.position.left - measure.translation.left,
              diffTop: note.position.top - measure.translation.top,
              originalWidth: measure.width,
              originalHeight: measure.height,
              screenWidth: dimensionsWidth,
              screenHeight: state.height,
              // NUEVO: Marcar que esta nota ya está en coordenadas del dispositivo actual
              isCurrentDevice: true, // <-- AGREGAR ESTO
              // Guardar dimensiones originales de la imagen para referencia
              originalScreenWidth: originalImageWidthRef.current,
              originalScreenHeight: originalImageHeightRef.current,
              areaSet: true,
              updating: false,
              stickyNoteTranslation: {
                ...(note.stickyNoteTranslation ?? {}),
                absoluteX: measure.translation.left,
                absoluteY: measure.translation.top,
                x: 0,
                y: 0,
                translationX: 0,
                translationY: 0,
              },
            },
          ];
        }
        return [...acc, curr];
      }, []);
      setM({notes});
    },
    [setM, state.height, state.notes],
  );

  const _onEditPosition = useCallback(
    (note: any) => {
      const notes = state.notes?.reduce((acc: any[], curr: any) => {
        if (curr?.id === note?.id) {
          return [
            ...acc,
            {
              ...note,
              updating: true,
              position: {
                ...note?.position,
                ...note?.translation,
              },
            },
          ];
        }
        return [...acc, curr];
      }, []);
      setM({
        notes,
        setModeActive: true,
        areaDraggable: true,
        activeNoteId: note?.id,
      });
    },
    [setM, state.notes],
  );

  const _onDeleteNote = useCallback(
    (note: any) => {
      const notes = state.notes?.filter((n: any) => n?.id !== note?.id);
      setM({notes});
    },
    [setM, state.notes],
  );

  const openSheet = useCallback(() => {
    refCallSheet.current?.open();
  }, []);

  const closeSheet = useCallback(() => {
    refCallSheet.current?.close();
  }, []);

  const manageImage = useCallback(
    (image: ImageType) => {
      navigate(RoutesNavigation.PhotoDetailCondition, {
        photo: image.data!,
      });
    },
    [navigate],
  );

  const initCamera = useCallback(() => {
    if (Platform.OS == 'ios') {
      closeSheet();
      navigate(RoutesNavigation.PhotoCaptureZoom);
    } else {
      // @ts-ignore
      onLaunchCamera(closeSheet, manageImage);
    }
  }, [manageImage]);

  const initGallery = useCallback(() => {
    // @ts-ignore
    onSelectImage(closeSheet, manageImage);
  }, [manageImage]);

  // ======= onMove (igual lógica que class) =======
  const _updateMainImageTransform = useCallback(
    (position: any) => {
      zoomScaleRef.current = position.scale;

      const offset = {
        x: 0,
        y: 0,
      };

      var cropWidth = zoomRef.current?.props?.cropWidth;
      var cropHeight = zoomRef.current?.props?.cropHeight;

      const fittedSize = {width: 0, height: 0};
      if (originalImageWidthRef.current > originalImageHeightRef.current) {
        const ratio = dimensionsWidth / originalImageWidthRef.current;
        fittedSize.width = dimensionsWidth;
        fittedSize.height = originalImageHeightRef.current * ratio;
      } else if (
        originalImageWidthRef.current < originalImageHeightRef.current
      ) {
        const ratio = dimensionsWidth / originalImageWidthRef.current;
        fittedSize.width = dimensionsWidth;
        fittedSize.height = originalImageHeightRef.current * ratio;
      } else if (
        originalImageWidthRef.current === originalImageHeightRef.current
      ) {
        fittedSize.width = dimensionsWidth;
        fittedSize.height = dimensionsWidth;
      }

      const scaledCropWidth = cropWidth / position.scale;
      const scaledCropHeight = cropHeight / position.scale;

      const percentCropperAreaW = getPercentDiffNumberFromNumber(
        scaledCropWidth,
        fittedSize.width,
      );
      const percentRestW = 100 - percentCropperAreaW;
      const hiddenAreaW = getPercentFromNumber(percentRestW, fittedSize.width);

      const x = hiddenAreaW / 2 - position.positionX;
      offset.x = x <= 0 ? 0 : x;

      const percentCropperAreaH = getPercentDiffNumberFromNumber(
        scaledCropHeight,
        fittedSize.height,
      );

      const percentRestH = 100 - percentCropperAreaH;
      const hiddenAreaH = getPercentFromNumber(percentRestH, fittedSize.height);

      var diffPositionY = (dimensionsHeight - fittedSize.height) / 2;
      const y = hiddenAreaH / 2 - position.positionY + diffPositionY;

      offset.y = y <= 0 ? 0 : y;
      globalPositionXRef.current = offset.x;
      globalPositionYRef.current = offset.y;

      mainImageTransformsRef.current = {
        positionX: position.positionX,
        positionY: position.positionY,
        scale: position.scale,
      };

      const notes = state?.notes?.map((note: any) => {
        var deltaX =
          (globalPositionXRef.current - lastGlobalPositionXRef.current) *
          note?.position?.scale;
        var deltaY =
          (globalPositionYRef.current - lastGlobalPositionYRef.current) *
          note?.position?.scale;

        if (!note?.position?.scale) {
          return {
            ...note,
            position: {
              ...note.position,
            },
          };
        }

        var newPositionTop = note?.position?.top - deltaY;
        var newPositionLeft = note?.position?.left - deltaX;

        var finalTop = newPositionTop - note?.diffTop;
        var finalLeft = newPositionLeft - note?.diffLeft;

        finalTop = finalTop * (position.scale / note?.position?.scale);
        finalLeft = finalLeft * (position.scale / note?.position?.scale);

        var finalWidth =
          (note?.originalWidth / note?.position?.scale) * position.scale;
        var finalHeight =
          (note?.originalHeight / note?.position?.scale) * position.scale;

        return {
          ...note,
          position: {
            ...note.position,
            top: newPositionTop,
            left: newPositionLeft,
          },
          width: finalWidth,
          height: finalHeight,
          translation: {
            ...note.translation,
            top: finalTop,
            left: finalLeft,
          },
          stickyNoteTranslation: {
            ...note.stickyNoteTranslation,
            absoluteX: finalLeft,
            absoluteY: finalTop,
            x: 0,
            y: 0,
            translationX: 0,
            translationY: 0,
          },
        };
      });

      lastGlobalPositionXRef.current = globalPositionXRef.current;
      lastGlobalPositionYRef.current = globalPositionYRef.current;
      setM({notes});
    },
    [getPercentDiffNumberFromNumber, getPercentFromNumber, state?.notes],
  );

  return (
    <Wrapper style={styles.container}>
      {isLoading && <GeneralLoading />}
      {/* @ts-ignore */}
      <ImageZoom
        ref={zoomRef}
        cropWidth={dimensionsWidth}
        cropHeight={dimensionsHeight}
        imageWidth={dimensionsWidth}
        imageHeight={dimensionsHeight}
        minScale={1}
        maxScale={5}
        useNativeDriver={true}
        enableDoubleClickZoom={false}
        onClick={_onPhotoPress}
        onMove={_updateMainImageTransform}
        style={{
          width: dimensionsWidth,
          height: state.height,
          position: 'absolute',
          top: 0,
          left: 0,
        }}>
        <Image
          resizeMode="contain"
          source={state.photoSource}
          style={{
            width: dimensionsWidth,
            height: state.height,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </ImageZoom>
      {state.notes.map((note: any) => (
        <NoteIssueSelector
          note={note}
          key={note.id}
          onCancel={_onCancel}
          onFinishAreaEdit={_updateNotePosition}
          onStickyNoteDragged={_onDragEnd}
          onSave={_onSave}
          onExpand={_onExpand}
          onRetake={_captureZoom}
          onEdit={_onEdit}
          onZoomButtonPress={_captureZoom}
          onEditPosition={_onEditPosition}
          onDeleteNote={_onDeleteNote}
        />
      ))}
      {state.helperVisible && (
        <PressableOpacity
          style={styles.helper}
          onPress={() => setM({helperVisible: false})}>
          <Label allowFontScaling={false} style={styles.helperText}>
            You can drag the image to navigate it.
          </Label>
          <Label style={styles.helperText}>Pinch to zoom.</Label>
        </PressableOpacity>
      )}

      <SpeedDial
        isOpen={state.fabOpen}
        icon={<Icon color="white" size={25} name="th" type="light" />}
        openIcon={<Icon color="white" size={25} name="th" type="light" />}
        onOpen={() => setM({fabOpen: true})}
        onClose={() => setM({fabOpen: false})}
        color={COLORS.tertearyDark}
        overlayColor="#00000040"
        style={{
          paddingBottom: 15,
        }}>
        {_getActions().map((option: any) => (
          <CustomSpeedDialoAction
            key={option.name}
            title={option.text}
            icon={option.icon}
            onPress={() => _handleFAB(option.name)}
          />
        ))}
      </SpeedDial>

      {/* {Platform.OS == 'ios' && <KeyboardSpacer />} */}

      <ImageOptionSheet
        ref={refCallSheet}
        initCamera={initCamera}
        initGallery={initGallery}
      />
    </Wrapper>
  );
};

// ======= estilos (idénticos) =======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'grey',
  },
  helper: {
    backgroundColor: '#000000',
    opacity: 0.83,
    borderRadius: 25,
    width: 300,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default ZoomScreen;
