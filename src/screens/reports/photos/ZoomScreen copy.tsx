import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CommonActions, type RouteProp} from '@react-navigation/native';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import ImageZoom, {type IOnMove} from 'react-native-image-pan-zoom';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import Toast from 'react-native-simple-toast';
// import { connect } from 'react-redux'; // ⟵ 🔕 Eliminado (usa zustand)
/// import * as ActionsConditionReport from '../../actions/conditionReport'; // ⟵ 🔕 Redux, ahora comentado
// import {isInternet} from '../../utils/internet';
import NoteIssueSelector from '@components/condition/notes/NoteIssueSelector';
import {NOTE_AREA} from '@components/condition/notes/helpers';
import {ImageOptionSheet} from '@components/commons/bottomsheets/ImageOptionSheet';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import useTopSheetStore from '@store/topsheet';
import {SpeedDial} from '@rneui/themed';
import {COLORS} from '@styles/colors';
import {CustomSpeedDialoAction} from '@components/floating/HomeFloatingAction';

const {height: dimensionsHeight, width: dimensionsWidth} =
  Dimensions.get('window');
const width = dimensionsWidth;

// =========================
// Tipos mínimos necesarios
// =========================
type Position = {
  top: number;
  left: number;
  positionX: number;
  positionY: number;
  scale?: number;
};

type Translation = {
  top: number;
  left: number;
};

type StickyTranslation = {
  absoluteX: number;
  absoluteY: number;
  x: number;
  y: number;
  translationX: number;
  translationY: number;
};

type Note = {
  id: number;
  label: string;
  details: string;
  photoZoom: any | null;
  position: Position;
  editing: boolean;
  areaSet: boolean;
  area: typeof NOTE_AREA;
  translation: Translation | null;
  width?: number;
  height?: number;
  originalWidth?: number;
  originalHeight?: number;
  diffLeft?: number;
  diffTop?: number;
  screenWidth?: number;
  screenHeight?: number;
  updating?: boolean;
  stickyNoteTranslation?: StickyTranslation;
};

type Photo = {
  uri?: string;
  path?: string;
  width?: number;
  height?: number;
  base64?: string;
  data?: string;
};

type ZoomScreenRouteParams = {
  photo?: Photo;
  data?: {
    photo?: {base64?: string};
    mainImageTransforms?: {
      positionX?: number;
      positionY?: number;
      scale?: number;
    };
    screen?: {width: number; height: number};
  };
  note?: {id: number};
  subType?: string | null;
  edit?: boolean;
  item?: {timestamp: number};
  itemIndex?: number;
  refreshGallery: (reportId?: number | string) => void;
};

type Nav = {
  navigate: (name: string, params?: any) => void;
  goBack: () => void;
  pop: (count?: number) => void;
  dispatch: (action: any) => void;
};

type Props = {
  // ✅ Ahora pásalos desde zustand o props del screen
  reportId: string | null;
  reportType: string;
  reportInventory: string | null;
  reportIdImage: string | null;
  conditionType: string;
  unmanaged?: boolean;
  editModalFunction: () => void;

  navigation: Nav;
  route: RouteProp<Record<string, ZoomScreenRouteParams>, string>;
};

// =========================
// Constantes UI / acciones
// =========================
const stateUpdate = {
  add: {setModeActive: true},
  cancel: {setModeActive: false},
  cancelSet: {setModeActive: false, areaDraggable: false},
  set: {areaDraggable: false, setModeActive: false},
  clear: {notes: [] as Note[]},
};

const actionsDefault = [
  {
    text: 'Add Note',
    icon: <Icon name="sticky-note" size={15} color="white" type="light" />,
    name: 'add',
    position: 1,
  },
  {
    text: 'Save photo',
    icon: <Icon name="sign-in" size={15} color="white" type="light" />,
    name: 'save',
    position: 3,
  },
  {
    text: 'Clear all',
    icon: <Icon name="trash" size={15} color="white" type="light" />,
    name: 'clear',
    position: 4,
  },
];

const actionsCancel = [
  {
    text: 'Cancel',
    icon: <Icon name="ban" size={15} color="white" type="light" />,
    name: 'cancel',
    position: 1,
  },
];

const actionsSet = [
  {
    text: 'Set',
    icon: <Icon name="check" size={15} color="white" type="light" />,
    name: 'set',
    position: 1,
  },
  {
    text: 'Cancel',
    icon: <Icon name="ban" size={15} color="white" type="light" />,
    name: 'cancelSet',
    position: 2,
  },
];

// =========================
// Componente
// =========================
const ZoomScreen: React.FC<Props> = (props) => {
  const {navigation, route} = props;

  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);

  // ---------- Estado ----------
  const [notes, setNotes] = useState<Note[]>([]);
  const [helperVisible, setHelperVisible] = useState(true);
  const [setModeActive, setSetModeActive] = useState(false);
  const [areaDraggable, setAreaDraggable] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceHeight, setDeviceHeight] = useState<number>(
    Dimensions.get('window').height,
  );
  const [photoSource, setPhotoSource] = useState<{uri: string} | undefined>(
    undefined,
  );
  const [voiceReady] = useState<boolean | undefined>(undefined);
  const [fabOpen, setFabOpen] = useState(false);

  // ---------- Refs (antes eran variables globales) ----------
  const selectedNoteRef = useRef<Note | null>(null);
  const zoomRef = useRef<any>(null);
  const refCallSheet = useRef<any>(null);
  const refreshGalleryRef = useRef<boolean>(false);

  const mainImageTransformsRef = useRef<{
    positionX?: number;
    positionY?: number;
    scale?: number;
  } | null>(null);
  const lastGlobalPositionX = useRef(0);
  const lastGlobalPositionY = useRef(0);
  const globalPositionX = useRef(0);
  const globalPositionY = useRef(0);
  const zoomScale = useRef(1);
  const originalImageWidth = useRef(0);
  const originalImageHeight = useRef(0);

  // ratios para edición
  const width_ratio = useRef(0);
  const imgAspRatio = useRef(0);
  const realImgheight = useRef(0);
  const height_ratio = useRef(0);
  const ratioRef = useRef(0);
  const newHeightRef = useRef(0);

  // =========================
  // Helpers iniciales
  // =========================
  const getInitialStateFromRoute = useCallback(() => {
    if (route?.params?.edit) {
      const data = route.params.data;
      const base64 = data?.photo?.base64 ?? '';
      const base64Image = `data:image/jpeg;base64,${base64}`;
      return {uri: base64Image};
    } else {
      const uri = route?.params?.photo?.uri ?? '';
      return {uri};
    }
  }, [route]);

  // =========================
  // DidMount
  // =========================
  useEffect(() => {
    // set source y tamaños
    const initialSource = getInitialStateFromRoute();
    setPhotoSource(initialSource);

    originalImageWidth.current =
      route?.params?.photo?.width ?? route?.params?.data?.screen?.width ?? 0;
    originalImageHeight.current =
      route?.params?.photo?.height ?? route?.params?.data?.screen?.height ?? 0;

    // posicionar/cargar transforms previos
    if (route?.params?.data?.mainImageTransforms) {
      const mainImageTransforms = route.params.data.mainImageTransforms;
      mainImageTransformsRef.current = mainImageTransforms;
      const location = {
        x: mainImageTransforms?.positionX || 0,
        y: mainImageTransforms?.positionY || 0,
        scale: mainImageTransforms?.scale || 1,
        duration: 0,
      };
      // centrar imagen sin animación
      setTimeout(() => {
        zoomRef.current?.centerOn?.(location);
      }, 0);
    }

    // reset zoom
    setTimeout(() => {
      zoomRef.current?.reset?.();
      zoomRef.current?.panResponderReleaseResolve?.();
    }, 0);

    // esconder teclado
    setTimeout(() => Keyboard.dismiss(), 500);

    if (route?.params?.edit) {
      postConstruct();
    } else {
      initNewHeight();
    }

    return () => {
      zoomRef.current?.reset?.();
      zoomRef.current?.panResponderReleaseResolve?.();
      if (refreshGalleryRef.current) {
        route.params?.refreshGallery?.(props.reportId ?? undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Efecto: si viene note desde route, adjunta photoZoom
  // =========================
  useEffect(() => {
    if (route?.params?.note) {
      const found = notes.find((n) => n.id === route.params!.note!.id);
      if (!found?.photoZoom) {
        const updated = notes.map((n) =>
          n.id === route.params!.note!.id
            ? {...n, photoZoom: route.params?.photo}
            : n,
        );
        navigation.dispatch(CommonActions.setParams({note: null}));
        setNotes(updated);
      }
    }
  }, [navigation, notes, route]);

  // =========================
  // UI: acciones flotantes
  // =========================
  const getActions = useCallback(() => {
    if (setModeActive && areaDraggable) return actionsSet;
    if (setModeActive && !areaDraggable) return actionsCancel;
    return actionsDefault;
  }, [areaDraggable, setModeActive]);

  // =========================
  // Utilidades de % y ratios
  // =========================
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

  // =========================
  // Altura y scaling inicial
  // =========================
  const initNewHeight = useCallback(() => {
    ratioRef.current = width / (route?.params?.photo?.width ?? width);
    newHeightRef.current = dimensionsHeight;
    setDeviceHeight(dimensionsHeight);
  }, [route]);

  const postConstruct = useCallback(() => {
    const deviceDimensions = {
      width: route?.params?.data?.screen?.width ?? width,
      height: route?.params?.data?.screen?.height ?? dimensionsHeight,
    };

    ratioRef.current = width / deviceDimensions.width;
    newHeightRef.current =
      (route?.params?.data?.screen?.height ?? dimensionsHeight) *
      ratioRef.current;
    setDeviceHeight(newHeightRef.current);

    width_ratio.current = width / deviceDimensions.width;
    imgAspRatio.current = width / newHeightRef.current;
    realImgheight.current = deviceDimensions.width / imgAspRatio.current;
    height_ratio.current = newHeightRef.current / realImgheight.current;

    const fixY = 0;
    const newNotes: Note[] = [];
    notes.forEach((element) => {
      const elWidth = element.width ?? 0;
      const elHeight = element.height ?? 0;
      const elOrigWidth = element.originalWidth ?? 0;
      const elOrigHeight = element.originalHeight ?? 0;

      const elTop = (element.translation?.top ?? 0) - fixY;
      const elLeft = element.translation?.left ?? 0;

      const elPosTop = element.position.top;
      const elPosLeft = element.position.left;

      const x1 = elLeft * width_ratio.current;
      const y1 = elTop * height_ratio.current;
      const xPos1 = elPosLeft * width_ratio.current;
      const yPos1 = elPosTop * height_ratio.current;

      const nwidth = elWidth * width_ratio.current;
      const nheight = elHeight * height_ratio.current;

      const nOrigwidth = elOrigWidth * width_ratio.current;
      const nOrigheight = elOrigHeight * height_ratio.current;

      const diffTop = (element.diffTop ?? 0) * width_ratio.current;
      const diffLeft = (element.diffLeft ?? 0) * width_ratio.current;

      newNotes.push({
        ...element,
        width: nwidth,
        height: nheight,
        originalWidth: nOrigwidth,
        originalHeight: nOrigheight,
        translation: {top: y1, left: x1},
        position: {...element.position, top: yPos1, left: xPos1},
        diffTop,
        diffLeft,
        screenWidth: width,
        screenHeight: newHeightRef.current,
      });
    });

    if (newNotes.length) setNotes(newNotes);
  }, [notes, route]);

  // =========================
  // Click sobre la foto (agregar nota)
  // =========================
  const onPhotoPress = useCallback(
    (event: any) => {
      if (setModeActive && !areaDraggable) {
        const active = notes.find((n) => n.editing);
        if (!active) {
          const position: Position = {
            top: event?.locationY,
            left: event?.locationX,
            positionX: globalPositionX.current,
            positionY: globalPositionY.current,
          };
          const id = notes.length === 0 ? 1 : notes[notes.length - 1].id + 1;
          const note: Note = {
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
          setNotes((prev) => [...prev, note]);
          setAreaDraggable(true);
          setActiveNoteId(id);
        }
      }
    },
    [areaDraggable, notes, setModeActive],
  );

  // =========================
  // Transform principal (pan/zoom)
  // =========================
  const updateMainImageTransform = useCallback(
    (position: IOnMove) => {
      zoomScale.current = position.scale ?? 1;

      const imgW = originalImageWidth.current;
      const imgH = originalImageHeight.current;
      const cropWidth = zoomRef.current?.props?.cropWidth ?? width;
      const cropHeight = zoomRef.current?.props?.cropHeight ?? deviceHeight;

      // Tamaño ajustado de la imagen dentro del crop
      const fittedSize = {width: 0, height: 0};
      if (imgW >= imgH) {
        const r = width / (imgW || 1);
        fittedSize.width = width;
        fittedSize.height = imgH * r;
      } else {
        const r = width / (imgW || 1);
        fittedSize.width = width;
        fittedSize.height = imgH * r;
      }

      const scaledCropWidth = cropWidth / (position.scale ?? 1);
      const scaledCropHeight = cropHeight / (position.scale ?? 1);

      const percentCropperAreaW = (scaledCropWidth / fittedSize.width) * 100;
      const hiddenAreaW =
        ((100 - percentCropperAreaW) / 100) * fittedSize.width;
      const x = hiddenAreaW / 2 - (position.positionX ?? 0);
      const offX = x <= 0 ? 0 : x;

      const percentCropperAreaH = (scaledCropHeight / fittedSize.height) * 100;
      const hiddenAreaH =
        ((100 - percentCropperAreaH) / 100) * fittedSize.height;
      const diffPositionY = (dimensionsHeight - fittedSize.height) / 2;
      const y = hiddenAreaH / 2 - (position.positionY ?? 0) + diffPositionY;
      const offY = y <= 0 ? 0 : y;

      globalPositionX.current = offX;
      globalPositionY.current = offY;

      setNotes((prev) => {
        const next = prev.map((note) => {
          // ⛔️ Igual que en la versión "class": NO tocar notas sin scale (o no fijadas)
          const nScale = note.position.scale;
          if (!nScale || !note.areaSet) {
            return note;
          }

          const deltaX =
            (globalPositionX.current - lastGlobalPositionX.current) * nScale;
          const deltaY =
            (globalPositionY.current - lastGlobalPositionY.current) * nScale;

          const newPositionTop = note.position.top - deltaY;
          const newPositionLeft = note.position.left - deltaX;

          let finalTop = newPositionTop - (note.diffTop ?? 0);
          let finalLeft = newPositionLeft - (note.diffLeft ?? 0);

          finalTop = finalTop * ((position.scale ?? 1) / nScale);
          finalLeft = finalLeft * ((position.scale ?? 1) / nScale);

          const finalWidth =
            ((note.originalWidth ?? 0) / nScale) * (position.scale ?? 1);
          const finalHeight =
            ((note.originalHeight ?? 0) / nScale) * (position.scale ?? 1);

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
              ...(note.translation ?? {top: 0, left: 0}),
              top: finalTop,
              left: finalLeft,
            },
            stickyNoteTranslation: {
              ...(note.stickyNoteTranslation ?? {
                absoluteX: 0,
                absoluteY: 0,
                x: 0,
                y: 0,
                translationX: 0,
                translationY: 0,
              }),
              absoluteX: finalLeft,
              absoluteY: finalTop,
              x: 0,
              y: 0,
              translationX: 0,
              translationY: 0,
            },
          };
        });

        // Actualiza los "last" DESPUÉS de calcular con el estado previo
        lastGlobalPositionX.current = globalPositionX.current;
        lastGlobalPositionY.current = globalPositionY.current;

        return next;
      });
    },
    [deviceHeight],
  );

  // =========================
  // Callbacks de notas
  // =========================
  const adjustNoteTranslation = useCallback(
    ({note, translation}: {note: Note; translation: Translation}) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? {...n, translation} : n)),
      );
    },
    [],
  );

  const onDragEnd = useCallback(
    ({note, translation}: {note: Note; translation: StickyTranslation}) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? {...n, stickyNoteTranslation: translation} : n,
        ),
      );
    },
    [],
  );

  const onCancelNote = useCallback((noteId: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const onSaveNote = useCallback((note: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  }, []);

  const onExpand = useCallback(
    (photo: any) => {
      navigation.navigate('PhotoView', {photo});
    },
    [navigation],
  );

  const onEdit = useCallback((note: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? {...note, editing: true} : n)),
    );
  }, []);

  const onEditPosition = useCallback((note: Note) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? {
              ...note,
              updating: true,
              position: {...note.position, ...(note.translation ?? {})},
            }
          : n,
      ),
    );
    setSetModeActive(true);
    setAreaDraggable(true);
    setActiveNoteId(note.id);
  }, []);

  const onDeleteNote = useCallback((note: Note) => {
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
  }, []);

  const updateNoteArea = useCallback(({note, ...rest}: any) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? {...note, ...rest} : n)),
    );
  }, []);

  const updateNotePosition = useCallback(
    ({note, measure}: any) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id
            ? {
                ...note,
                ...measure,
                diffLeft: note.position.left - measure.translation.left,
                diffTop: note.position.top - measure.translation.top,
                originalWidth: measure.width,
                originalHeight: measure.height,
                screenWidth: width,
                screenHeight: deviceHeight,
                areaSet: true,
                updating: false,
              }
            : n,
        ),
      );
    },
    [deviceHeight],
  );

  // =========================
  // Captura de zoom por nota
  // =========================
  const captureZoom = useCallback((note: Note) => {
    selectedNoteRef.current = note;
    refCallSheet.current?.ref?.current?.open?.();
  }, []);

  const onZoomButtonPress = useCallback(
    (note: Note) => captureZoom(note),
    [captureZoom],
  );

  const onCancelSheet = useCallback(() => {
    refCallSheet.current?.ref?.current?.close?.();
    props.editModalFunction?.();
  }, [props]);

  // =========================
  // Cámara / Galería
  // =========================
  const updateRefreshGallery = useCallback((refresh: boolean) => {
    refreshGalleryRef.current = refresh;
  }, []);

  const manageImage = useCallback(
    async (response: any) => {
      setLoading(true);
      //   try {
      //     refCallSheet.current?.ref?.current?.close?.();
      //     const photo: any = {...response};
      //     const compressedBase64 = await compressImageDefault(response.data);
      //     photo.base64 = compressedBase64;
      //     photo.data = '';
      //     photo.uri = photo.path;
      //     navigation?.navigate('PhotoDetail', {
      //       photo,
      //       note: selectedNoteRef.current,
      //       refresh: false,
      //       updateRefreshGallery,
      //       refreshGallery: false,
      //       subType: route.params?.subType ?? null,
      //     });
      //   } catch {
      //     // noop
      //   } finally {
      //     setLoading(false);
      //   }
    },
    [navigation, route.params?.subType, updateRefreshGallery],
  );

  const initCamera = useCallback(() => {
    // if (Platform.OS === 'ios') {
    //   refCallSheet.current?.ref?.current?.close?.();
    //   navigation?.navigate('PhotoCaptureZoom', {
    //     note: selectedNoteRef.current,
    //     updateRefreshGallery,
    //     subType: route.params?.subType,
    //   });
    // } else {
    //   ImagePicker.openCamera(CAMERA_OPTION_COMPRESS)
    //     .then((image) => manageImage(image))
    //     .catch(() =>
    //       Toast.show('Picture not capture', Toast.LONG, ['UIAlertController']),
    //     );
    // }
  }, [manageImage, navigation, route.params?.subType, updateRefreshGallery]);

  const initGallery = useCallback(async () => {
    // let granted = true;
    // if (Platform.OS === 'android') granted = await requestReadMediaPermission();
    // if (!granted) {
    //   Toast.show('Accept permissions to continue', Toast.LONG, [
    //     'UIAlertController',
    //   ]);
    //   return;
    // }
    // try {
    //   ImagePicker.openPicker(CAMERA_OPTION_COMPRESS)
    //     .then((image) => manageImage(image))
    //     .catch(() =>
    //       Toast.show('Pictures not selected', Toast.LONG, [
    //         'UIAlertController',
    //       ]),
    //     );
    // } catch {
    //   Toast.show('Accept permissions to continue', Toast.LONG, [
    //     'UIAlertController',
    //   ]);
    // }
  }, [manageImage]);

  // =========================
  // Guardado (online/offline)
  // =========================
  const getPhotoPayload = useCallback(() => {
    if (route?.params?.edit) {
      return route.params.data?.photo;
    }
    return route?.params?.photo;
  }, [route]);

  const handleFAB = useCallback(
    async (buttonName: string) => {
      onCloseFab();
      if (buttonName === 'save') {
        refreshGalleryRef.current = false;
        zoomRef.current?.reset?.();
        setTimeout(() => zoomRef.current?.panResponderReleaseResolve?.(), 100);

        setTimeout(async () => {
          setLoading(true);
          const photo = getPhotoPayload();
          const body = {
            data: {
              photo,
              notes,
              mainImageTransforms: mainImageTransformsRef.current,
              screen: {width, height: deviceHeight},
            },
            idJob,
            idJobInventory: !props.unmanaged ? props.reportInventory : null,
            idImg: props.reportIdImage,
            reportId: props.reportId,
            reportType: props.reportType,
            reportSubType: route.params?.subType ?? null,
          };

          const mJson = {
            id_sticky_note: null,
            is_overview: true,
            subtype: route.params?.subType ?? null,
            thumbnail: '',
            title: `${props.reportType} Overview`,
            type: props.reportType,
            detail: {
              ...body,
              data: {...body.data, photo: {...body.data.photo, base64: ''}},
            },
          };

          //   const connected = await isInternet();
          //   await functSave(
          //     connected,
          //     mJson as any,
          //     (photo as any)?.base64,
          //     body,
          //   );
        }, 400);
        return;
      }

      if (buttonName === 'cancelSet') {
        setNotes((prev) => prev.slice(0, -1));
        setSetModeActive(false);
        setAreaDraggable(false);
        return;
      }

      if (buttonName === 'set') {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === activeNoteId
              ? {
                  ...n,
                  position: {
                    ...n.position,
                    scale: zoomScale.current,
                  },
                  updating: false,
                  areaSet: true,
                }
              : n,
          ),
        );
        setSetModeActive(false);
        setAreaDraggable(false);
        setActiveNoteId(null);
        return;
      }

      // add / cancel / clear
      if (buttonName in stateUpdate) {
        // @ts-expect-error dynamic keys
        const next = stateUpdate[buttonName];
        if (next.notes) setNotes(next.notes);
        if (typeof next.setModeActive === 'boolean')
          setSetModeActive(next.setModeActive);
        if (typeof next.areaDraggable === 'boolean')
          setAreaDraggable(next.areaDraggable);
      }
    },
    [
      activeNoteId,
      deviceHeight,
      getPhotoPayload,
      notes,
      idJob,
      props.reportId,
      props.reportIdImage,
      props.reportInventory,
      props.reportType,
      route.params?.subType,
      props.unmanaged,
    ],
  );

  const functSave = useCallback(
    async (
      isConnected: boolean,
      mJson: any,
      photoBase64: string,
      bodyRequest: any,
    ) => {
      //   const urlRequest = `resources/${props.conditionType}/reportImage`;
      //   const date = new Date();
      //   if (isConnected) {
      //     const response = await fetchData.Post(urlRequest, bodyRequest);
      //     if (response.ok && response.data.message === 'SUCCESS') {
      //       const {reportId, idImg} = response.data.body;
      //       const lastIdImg = props.reportIdImage;
      //       // ⛔️ Redux → reemplaza por zustand
      //       // props.dispatch(ActionsConditionReport.copyReportId(reportId));
      //       // props.dispatch(ActionsConditionReport.copyReportIdImage(idImg));
      //       let stringGallery = await getFromStorageOffline(
      //         `${GALLERY_KEY_STORAGE}${props.jobDetail.id}_${props.conditionType}${props.reportType}${props.reportInventory}`,
      //       );
      //       let jsonGallery: any[] = [];
      //       let exist = false;
      //       if (stringGallery) {
      //         jsonGallery = JSON.parse(stringGallery);
      //         const foundIndex = jsonGallery.findIndex((x) => x.id === idImg);
      //         if (foundIndex !== -1) {
      //           exist = true;
      //           jsonGallery[foundIndex] = {
      //             ...jsonGallery[foundIndex],
      //             ...mJson,
      //             timestamp: jsonGallery[foundIndex].timestamp ?? date.getTime(),
      //           };
      //           await saveToStorageOffline(
      //             `${GALLERY_DETAIL_KEY_STORAGE}${props.jobDetail.id}_${
      //               jsonGallery[foundIndex].timestamp ?? date.getTime()
      //             }`,
      //             photoBase64,
      //           );
      //         }
      //       }
      //       if (!exist) {
      //         jsonGallery.push({
      //           ...mJson,
      //           id: idImg,
      //           timestamp: date.getTime(),
      //           processed: true,
      //         });
      //         await saveToStorageOffline(
      //           `${GALLERY_DETAIL_KEY_STORAGE}${
      //             props.jobDetail.id
      //           }_${date.getTime()}`,
      //           photoBase64,
      //         );
      //       }
      //       await saveToStorageOffline(
      //         `${GALLERY_KEY_STORAGE}${props.jobDetail.id}_${props.conditionType}${props.reportType}${props.reportInventory}`,
      //         JSON.stringify(jsonGallery),
      //       );
      //       setLoading(false);
      //       showToastMessage('Photo saved successfully');
      //       route.params?.refreshGallery(reportId);
      //       if (Platform.OS === 'android') {
      //         navigation.goBack();
      //         return;
      //       }
      //       if (lastIdImg == null) navigation.pop(2);
      //       else navigation.goBack();
      //     } else {
      //       setLoading(false);
      //       showErrorToastMessage('An error occurred while saving photo');
      //     }
      //     return;
      //   }
      //   // ------- OFFLINE --------
      //   let savedList: any[] = [];
      //   const stringList = await getFromStorageOffline(
      //     `${GALLERY_KEY_STORAGE}${props.jobDetail.id}_${props.conditionType}${props.reportType}${props.reportInventory}`,
      //   );
      //   if (stringList) savedList = JSON.parse(stringList);
      //   if (route.params?.edit) {
      //     const foundIndex = savedList.findIndex(
      //       (x) => x.timestamp === route.params?.item?.timestamp,
      //     );
      //     if (foundIndex !== -1) {
      //       savedList[foundIndex] = {
      //         ...savedList[foundIndex],
      //         ...mJson,
      //         timestamp: savedList[foundIndex].timestamp ?? date.getTime(),
      //       };
      //       await saveToStorageOffline(
      //         `${GALLERY_DETAIL_KEY_STORAGE}${props.jobDetail.id}_${
      //           savedList[foundIndex].timestamp ?? date.getTime()
      //         }`,
      //         photoBase64,
      //       );
      //     }
      //     const keyName = `${REQUEST_CONDITION_REPORT_PHOTO_KEY_STORAGE}${
      //       props.jobDetail.id
      //     }_${savedList[route.params?.itemIndex ?? 0].timestamp}`;
      //     const offlineRequest = {
      //       url: urlRequest,
      //       body: {
      //         ...bodyRequest,
      //         data: {
      //           ...bodyRequest.data,
      //           photo: {...bodyRequest.data.photo, base64: ''},
      //         },
      //       },
      //       time: new Date().getTime(),
      //       name: keyName,
      //       idInventory: props.reportInventory,
      //       type: props.conditionType,
      //       job: props.jobDetail.id,
      //       conditionType: props.conditionType,
      //       reportType: props.reportType,
      //       reportSubType: route.params?.subType ?? null,
      //     };
      //     await saveToStorageOffline(keyName, JSON.stringify(offlineRequest));
      //   } else {
      //     const jsonTemp = {
      //       ...mJson,
      //       id: null,
      //       processed: true,
      //       offline: true,
      //       timestamp: date.getTime(),
      //     };
      //     savedList.push(jsonTemp);
      //     const keyName = `${REQUEST_CONDITION_REPORT_PHOTO_KEY_STORAGE}${
      //       props.jobDetail.id
      //     }_${date.getTime()}`;
      //     const offlineRequest = {
      //       url: urlRequest,
      //       body: {
      //         ...bodyRequest,
      //         data: {
      //           ...bodyRequest.data,
      //           photo: {...bodyRequest.data.photo, base64: ''},
      //         },
      //       },
      //       time: new Date().getTime(),
      //       name: keyName,
      //       idInventory: props.reportInventory,
      //       type: props.conditionType,
      //       job: props.jobDetail.id,
      //       conditionType: props.conditionType,
      //       reportType: props.reportType,
      //       reportSubType: route.params?.subType ?? null,
      //     };
      //     await saveToStorageOffline(keyName, JSON.stringify(offlineRequest));
      //     await saveToStorageOffline(
      //       `${GALLERY_DETAIL_KEY_STORAGE}${
      //         props.jobDetail.id
      //       }_${date.getTime()}`,
      //       photoBase64,
      //     );
      //   }
      //   savedList.forEach((el) => {
      //     if (el.data) {
      //       el.detail.data.photo.base64 = '';
      //       el.thumbnail = '';
      //     }
      //   });
      //   setTimeout(async () => {
      //     const stringListSave = JSON.stringify(savedList);
      //     await saveToStorageOffline(
      //       `${GALLERY_KEY_STORAGE}${props.jobDetail.id}_${props.conditionType}${props.reportType}${props.reportInventory}`,
      //       stringListSave,
      //     );
      //     // ⛔️ Redux → reemplaza por zustand
      //     // props.dispatch(ActionsConditionReport.copyReportIdImage(null));
      //     showToastMessage('Photo saved successfully');
      //     setTimeout(() => {
      //       setLoading(false);
      //       route.params?.refreshGallery(2);
      //       if (Platform.OS === 'android') {
      //         navigation.goBack();
      //         return;
      //       }
      //       if (!route.params?.edit) navigation.pop(2);
      //       else navigation.goBack();
      //     }, 500);
      //   }, 400);
    },
    [
      navigation,
      props.conditionType,
      idJob,
      props.reportInventory,
      props.reportType,
      props.reportIdImage,
      route.params,
    ],
  );

  const onOpenFab = useCallback(() => {
    setFabOpen(true);
  }, []);

  const onCloseFab = useCallback(() => {
    setFabOpen(false);
  }, []);

  // =========================
  // Render
  // =========================
  const actions = useMemo(() => getActions(), [getActions]);

  return (
    <SafeAreaView style={styles.container}>
      {loading && <GeneralLoading />}

      {/* @ts-ignore */}
      <ImageZoom
        ref={zoomRef}
        cropWidth={dimensionsWidth}
        cropHeight={dimensionsHeight}
        imageWidth={dimensionsWidth}
        imageHeight={dimensionsHeight}
        minScale={1}
        maxScale={5}
        useNativeDriver
        enableDoubleClickZoom={false}
        onClick={onPhotoPress}
        onMove={updateMainImageTransform}>
        {!!photoSource?.uri && (
          <Image
            resizeMode="contain"
            source={photoSource}
            style={{
              width: dimensionsWidth,
              height: deviceHeight,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
      </ImageZoom>

      {notes.map((note) => (
        <NoteIssueSelector
          voiceReady={voiceReady}
          note={note}
          key={note.id}
          onCancel={onCancelNote}
          onFinishAreaEdit={updateNotePosition}
          //@ts-ignore
          onStickyNoteDragged={onDragEnd}
          //@ts-ignore
          onSave={onSaveNote}
          onExpand={onExpand}
          onRetake={captureZoom}
          onEdit={onEdit}
          onZoomButtonPress={() => onZoomButtonPress(note)}
          //@ts-ignore
          onEditPosition={onEditPosition}
          //@ts-ignore
          onDeleteNote={onDeleteNote}
        />
      ))}

      {helperVisible && (
        <TouchableOpacity
          style={styles.helper}
          onPress={() => setHelperVisible(false)}>
          <Text allowFontScaling={false} style={styles.helperText}>
            You can drag the image to navigate it.
          </Text>
          <Text style={styles.helperText}>Pinch to zoom.</Text>
        </TouchableOpacity>
      )}

      {/* <FloatingAction
        color="#00D3ED"
        floatingIcon={<Icon color="white" size={25} name="th" />}
        actions={actions}
        onPressItem={handleFAB}
      /> */}

      <SpeedDial
        isOpen={fabOpen}
        icon={<Icon color="white" size={25} name="th" type="light" />}
        openIcon={<Icon color="white" size={25} name="th" type="light" />}
        onOpen={onOpenFab}
        onClose={onCloseFab}
        color={COLORS.tertearyDark}
        overlayColor="#00000040"
        style={{
          paddingBottom: 15,
        }}>
        {actions.map((option) => (
          <CustomSpeedDialoAction
            title={option.text}
            icon={option.icon}
            onPress={() => handleFAB(option.name)}
          />
        ))}
      </SpeedDial>

      {/* {Platform.OS === 'ios' && <KeyboardSpacer />} */}

      <ImageOptionSheet
        ref={refCallSheet}
        initCamera={initCamera}
        initGallery={initGallery}
        // onCancel={onCancelSheet}
      />
    </SafeAreaView>
  );
};

export default ZoomScreen;

// =========================
// Estilos
// =========================
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
