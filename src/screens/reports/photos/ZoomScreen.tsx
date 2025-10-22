import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {NOTE_AREA} from '@components/condition/notes/helpers';
import NoteIssueSelector from '@components/condition/notes/NoteIssueSelector';
import {CustomSpeedDialoAction} from '@components/floating/HomeFloatingAction';
import {CommonActions} from '@react-navigation/native';
import {SpeedDial} from '@rneui/themed';
import useConditionStore from '@store/condition';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {onSelectImage} from '@utils/image';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import ImageZoom from 'react-native-image-pan-zoom';
import type {Image as ImageType} from 'react-native-image-crop-picker';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {Label} from '@components/commons/text/Label';
import {StickyNoteType} from '@api/types/Condition';
import {useOnline} from '@hooks/useOnline';
import {
  useGetPhotoConditionOverview,
  useSaveZoomScreen,
} from '@api/hooks/HooksReportServices';
import {loadingWrapperPromise} from '@store/actions';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {QUERY_KEYS} from '@api/contants/constants';

const {height: dimensionsHeight, width: dimensionsWidth} =
  Dimensions.get('window');
const {width} = {...Dimensions.get('window')};

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

// ======= Functional de ZoomScreenClass =======
const ZoomScreen = (props: any) => {
  const zoomRef = useRef<any>(null);
  const refCallSheet = useRef<RBSheetRef>(null);
  const mainImageTransformsRef = useRef<any>(null);
  const {online} = useOnline();

  const {item} = props.route.params;

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
  } = useConditionStore();

  const {navigate, goBack} = useCustomNavigation();

  const {
    data: conditionOverview,
    isLoading,
    isFetching,
  } = useGetPhotoConditionOverview({
    id: item?.id,
    conditionType: conditionType!,
  });

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
  ]);

  // ======= estado base equivalente a _getState(props) =======
  const getInitialState = useCallback(
    (p: any) => {
      if (p?.route?.params?.edit && conditionOverview?.idJob) {
        const base64 = conditionOverview.data.photo.base64;
        const base64Image = `data:image/jpeg;base64,${base64}`;
        return {
          // @ts-ignore
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

      const {
        route: {
          params: {
            photo: {uri},
          },
        },
      } = props;

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
    [props, conditionOverview?.idJob],
  );

  const [state, setState] = useState<any>(() => getInitialState(props));

  console.log('STATE__STATE__STATE__STATE');
  console.log(state);

  useEffect(() => {
    if (conditionOverview?.idJob) {
      console.log('set state');
      console.log(getInitialState(props))
      setState(getInitialState(props));
    }
  }, [props, conditionOverview?.idJob]);

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
    // Estado base (no necesitamos mutar STATE global aquí, mantenemos el state local)
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
    const {
      route: {params},
      navigation,
    } = props;

    initVariables();

    // reset zoom
    zoomRef.current?.reset?.();
    zoomRef.current?.panResponderReleaseResolve?.();

    // tamaños originales
    originalImageWidthRef.current = params?.photo?.width;
    originalImageHeightRef.current = params?.photo?.height;

    // transforms previos
    if (props.route.params?.data?.mainImageTransforms) {
      const {mainImageTransforms} = props.route.params.data;
      mainImageTransformsRef.current = mainImageTransforms;
      const location = {
        x: mainImageTransforms?.positionX || 0,
        y: mainImageTransforms?.positionY || 0,
        scale: mainImageTransforms?.scale || 1,
        duration: 0,
      };
      zoomRef.current?.centerOn?.(location);
    }

    // esconder teclado
    setTimeout(() => {
      Keyboard.dismiss();
    }, 500);

    if (params && params.edit) {
      postConstruct();
    } else {
      initNewHeight();
    }

    // ======= componentWillUnmount =======
    return () => {
      zoomRef.current?.reset?.();
      zoomRef.current?.panResponderReleaseResolve?.();
      if (refreshGalleryRef.current) {
        props.route.params?.refreshGallery?.();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= componentDidUpdate (note -> photoZoom) =======
  useEffect(() => {
    _updatePhotoZoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route?.params?.note, state.notes]);

  useEffect(() => {
    return () => {
      setEditModalFunction(undefined);
      setCopyNote(undefined);
    };
  }, []);

  const _updatePhotoZoom = useCallback(() => {
    const {
      route: {params},
      navigation,
    } = props;

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
  }, [props, state.notes]);

  // ======= initNewHeight =======
  const initNewHeight = useCallback(() => {
    const {
      route: {params},
      navigation,
    } = props;

    ratioRef.current = width / params?.photo?.width;
    newHeightRef.current = dimensionsHeight;
    setM({height: dimensionsHeight});
  }, [props, setM]);

  // ======= postConstruct =======
  const postConstruct = useCallback(() => {
    const {
      route: {params},
      navigation,
    } = props;

    var deviceDimensions = {
      width: params?.data?.screen?.width,
      height: params?.data?.screen?.height,
    };

    ratioRef.current = width / params?.data?.screen?.width;
    newHeightRef.current = params?.data?.screen?.height * ratioRef.current;

    setM({height: newHeightRef.current});

    width_ratioRef.current = width / deviceDimensions.width;
    imgAspRatioRef.current = width / newHeightRef.current;
    realImgheightRef.current = deviceDimensions.width / imgAspRatioRef.current;
    height_ratioRef.current = newHeightRef.current / realImgheightRef.current;
    var fixY = 0;
    var newNotes: any[] = [];

    state.notes.forEach((element: any) => {
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

      //element.position.scale = element.position.scale + ((nwidth - elWidth) / elWidth);

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

      element.screenWidth = width;
      element.screenHeight = newHeightRef.current;

      newNotes.push({...element});
    });

    setM({notes: newNotes});
  }, [props, setM, state.notes]);

  // ======= handlers =======
  const _onPhotoPress = useCallback(
    (event: any) => {
      const {setModeActive, areaDraggable} = state;
      if (setModeActive && !areaDraggable) {
        const active = state?.notes?.find((n: any) => n.editing);
        if (!active) {
          //initial click position used to calculate the area
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
    if (props?.route?.params?.edit) {
      const {
        route: {
          params: {data},
        },
      } = props;
      return data?.photo;
    }
    const {
      route: {
        params: {photo},
      },
    } = props;
    return photo;
  }, [props]);

  const _handleFAB = useCallback(
    async (buttonName: string) => {
      setM({fabOpen: false});
      const {notes: stateNotes, activeNoteId, reportId} = state;
      const {
        route: {params},
      } = props;

      if (buttonName === 'save') {
        refreshGalleryRef.current = false;
        zoomRef.current?.reset?.();

        setTimeout(() => {
          zoomRef.current?.panResponderReleaseResolve?.();
        }, 100);

        setTimeout(async () => {
          setM({loading: true});
          const photo = _getPhoto();
          const {notes, screen} = state;
          const body = {
            conditionType: conditionType,
            data: {
              photo,
              notes,
              mainImageTransforms: mainImageTransformsRef.current,
              screen: {
                width: width,
                height: state.height,
              },
            },
            idJob: idJob,
            idJobInventory: !props.unmanaged ? inventoryId : null,
            idImg: reportIdImage ?? null,
            reportId: conditionId ?? null,
            reportType: conditionPhotoType ?? null,
            reportSubType: props.route.params.subType
              ? props.route.params.subType
              : null,
          };

          var mJson = {
            id_sticky_note: null,
            is_overview: true,
            subtype: props.route.params.subType
              ? props.route.params.subType
              : null,
            thumbnail: '',
            title: conditionPhotoType + ' Overview',
            type: conditionPhotoType,
            detail: {
              ...body,
              data: {
                ...body.data,
                photo: {
                  ...body.data.photo,
                  base64: '',
                },
              },
            },
          };

          if (online) {
            functSave(online, mJson, photo.base64, body);
          }
          // if (isConnected) {

          // }else{

          // }
          return;
        }, 400);
        return;
      }

      if (buttonName === 'cancelSet') {
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
    [_getPhoto, props, setM, state, online],
  );

  const functSave = useCallback(
    async (isConnected: boolean, mJson: any, photo: any, bodyRequest: any) => {
      if (isConnected) {
        loadingWrapperPromise(
          saveZoomScreen({
            conditionType: conditionType,
            ...bodyRequest,
          })
            .then((response) => {
              if (response) {
                refetchAll();
                goBack();
              }
            })
            .catch((e) => {
              console.log('error guardando report');
              console.log(e);
            }),
        );
      }
      // const {navigation} = this.props;
      // var date = new Date();
      // var urlRequest = 'resources/' + this.props.conditionType + '/reportImage';
      // if (isConnected) {
      //   const response = await fetchData.Post(urlRequest, bodyRequest);
      //   if (response.ok) {
      //     if (response.data.message == 'SUCCESS') {
      //       const {reportId, idImg} = response.data.body;
      //       var lastIdImg = this.props.reportIdImage;
      //       if (this.props.reportId == null || this.props.reportId == '') {
      //         this.props.dispatch(ActionsConditionReport.copyReportId(reportId));
      //       }
      //       this.props.dispatch(ActionsConditionReport.copyReportIdImage(idImg));
      //       var stringGallery = await getFromStorageOffline(
      //         GALLERY_KEY_STORAGE +
      //           this.props.jobDetail.id +
      //           '_' +
      //           this.props.conditionType +
      //           this.props.reportType +
      //           this.props.reportInventory,
      //       );
      //       var jsonGallery = [];
      //       var exist = false;
      //       if (stringGallery) {
      //         jsonGallery = JSON.parse(stringGallery);
      //         var foundIndex = jsonGallery.findIndex((x) => x.id == idImg);
      //         if (foundIndex != -1) {
      //           exist = true;
      //           jsonGallery[foundIndex] = {
      //             ...jsonGallery[foundIndex],
      //             ...mJson,
      //             timestamp: jsonGallery[foundIndex].timestamp
      //               ? jsonGallery[foundIndex].timestamp
      //               : date.getTime(),
      //           };
      //           await saveToStorageOffline(
      //             GALLERY_DETAIL_KEY_STORAGE +
      //               this.props.jobDetail.id +
      //               '_' +
      //               (jsonGallery[foundIndex].timestamp ?? date.getTime()),
      //             photo,
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
      //           GALLERY_DETAIL_KEY_STORAGE +
      //             this.props.jobDetail.id +
      //             '_' +
      //             date.getTime(),
      //           photo,
      //         );
      //       }
      //       await saveToStorageOffline(
      //         GALLERY_KEY_STORAGE +
      //           this.props.jobDetail.id +
      //           '_' +
      //           this.props.conditionType +
      //           this.props.reportType +
      //           this.props.reportInventory,
      //         JSON.stringify(jsonGallery),
      //       );
      //       //hasta aqui
      //       this.setState({loading: false});
      //       Toast.show('Photo saved successfully', Toast.LONG, [
      //         'UIAlertController',
      //       ]);
      //       this.props.route.params.refreshGallery(reportId);
      //       if (Platform.OS == 'android') {
      //         navigation.goBack();
      //         return;
      //       }
      //       if (lastIdImg == null) {
      //         navigation.pop(2);
      //       } else {
      //         navigation.goBack();
      //       }
      //     } else {
      //       // console.log(response);
      //       this.setState({loading: false});
      //       Toast.show('An error occurred while saving photo', Toast.LONG, [
      //         'UIAlertController',
      //       ]);
      //     }
      //   } else {
      //     // console.log(response);
      //     this.setState({loading: false});
      //     Toast.show('An error occurred while saving photo', Toast.LONG, [
      //       'UIAlertController',
      //     ]);
      //   }
      // } else {
      //   var savedList = [];
      //   var stringList = await getFromStorageOffline(
      //     GALLERY_KEY_STORAGE +
      //       this.props.jobDetail.id +
      //       '_' +
      //       this.props.conditionType +
      //       this.props.reportType +
      //       this.props.reportInventory,
      //   );
      //   if (stringList) {
      //     var jsonList = JSON.parse(stringList);
      //     savedList = [...jsonList];
      //   }
      //   if (this.props.route.params.edit) {
      //     var foundIndex = savedList.findIndex(
      //       (x) => x.timestamp == this.props.route.params.item.timestamp,
      //     );
      //     if (foundIndex != -1) {
      //       exist = true;
      //       savedList[foundIndex] = {
      //         ...savedList[foundIndex],
      //         ...mJson,
      //         timestamp: savedList[foundIndex].timestamp
      //           ? savedList[foundIndex].timestamp
      //           : date.getTime(),
      //       };
      //       await saveToStorageOffline(
      //         GALLERY_DETAIL_KEY_STORAGE +
      //           this.props.jobDetail.id +
      //           '_' +
      //           (savedList[foundIndex].timestamp ?? date.getTime()),
      //         photo,
      //       );
      //     }
      //     var keyName =
      //       REQUEST_CONDITION_REPORT_PHOTO_KEY_STORAGE +
      //       this.props.jobDetail.id +
      //       '_' +
      //       savedList[this.props.route.params.itemIndex].timestamp;
      //     var offlineRequest = {
      //       url: urlRequest,
      //       body: bodyRequest,
      //       time: new Date().getTime(),
      //       name: keyName,
      //       idInventory: this.props.reportInventory,
      //       type: this.props.conditionType,
      //       job: this.props.jobDetail.id,
      //       conditionType: this.props.conditionType,
      //       reportType: this.props.reportType,
      //       idInventory: this.props.reportInventory,
      //       reportSubType: this.props.route.params.subType
      //         ? this.props.route.params.subType
      //         : null,
      //     };
      //     offlineRequest.body.data.photo.base64 = '';
      //     //await saveToStorageOffline("@image" + savedList[props.route.params.itemIndex].timestamp, encodedImage);
      //     await saveToStorageOffline(keyName, JSON.stringify(offlineRequest));
      //     // await saveToStorageOffline("@gallerydetail" + savedList[this.props.route.params.itemIndex].timestamp, photo);
      //   } else {
      //     var jsonTemp = {
      //       ...mJson,
      //       id: null,
      //       processed: true,
      //       offline: true,
      //       timestamp: date.getTime(),
      //     };
      //     savedList.push(jsonTemp);
      //     var keyName =
      //       REQUEST_CONDITION_REPORT_PHOTO_KEY_STORAGE +
      //       this.props.jobDetail.id +
      //       '_' +
      //       date.getTime();
      //     var offlineRequest = {
      //       url: urlRequest,
      //       body: bodyRequest,
      //       time: new Date().getTime(),
      //       name: keyName,
      //       idInventory: this.props.reportInventory,
      //       type: this.props.conditionType,
      //       job: this.props.jobDetail.id,
      //       conditionType: this.props.conditionType,
      //       reportType: this.props.reportType,
      //       idInventory: this.props.reportInventory,
      //       reportSubType: this.props.route.params.subType
      //         ? this.props.route.params.subType
      //         : null,
      //     };
      //     offlineRequest.body.data.photo.base64 = '';
      //     //await saveToStorageOffline("@image" + date.getTime(), encodedImage);
      //     await saveToStorageOffline(keyName, JSON.stringify(offlineRequest));
      //     await saveToStorageOffline(
      //       GALLERY_DETAIL_KEY_STORAGE +
      //         this.props.jobDetail.id +
      //         '_' +
      //         date.getTime(),
      //       photo,
      //     );
      //   }
      //   savedList.forEach((element) => {
      //     if (element.data) {
      //       element.detail.data.photo.base64 = '';
      //       element.thumbnail = '';
      //     }
      //   });
      //   var stringListSave = JSON.stringify(savedList);
      //   setTimeout(() => {
      //     this.suppSaveFunction(stringListSave);
      //   }, 400);
      // }
    },
    [],
  );

  const suppSaveFunction = useCallback(async (stringListSave: string) => {
    // const {navigation} = this.props;
    // await saveToStorageOffline(
    //   GALLERY_KEY_STORAGE +
    //     this.props.jobDetail.id +
    //     '_' +
    //     this.props.conditionType +
    //     this.props.reportType +
    //     this.props.reportInventory,
    //   stringListSave,
    // );
    // /*if (this.props.reportId == null || this.props.reportId == "") {
    // this.props.dispatch(ActionsConditionReport.copyReportId(reportId));
    // }*/
    // this.props.dispatch(ActionsConditionReport.copyReportIdImage(null));
    // Toast.show('Photo saved successfully', Toast.LONG, ['UIAlertController']);
    // setTimeout(() => {
    //   this.setState({loading: false});
    //   this.props.route.params.refreshGallery(2);
    //   if (Platform.OS == 'android') {
    //     navigation.goBack();
    //     return;
    //   }
    //   if (!this.props.route.params.edit) {
    //     navigation.pop(2);
    //   } else {
    //     navigation.goBack();
    //   }
    // }, 500);
  }, []);

  const _updateNotePosition = useCallback(
    ({note, measure}: any) => {
      const notes = state.notes.reduce((acc: any[], curr: any) => {
        if (curr.id === note.id) {
          //curr.position.scale = zoomScale;
          return [
            ...acc,
            {
              ...note,
              ...measure,
              diffLeft: note.position.left - measure.translation.left,
              diffTop: note.position.top - measure.translation.top,
              originalWidth: measure.width,
              originalHeight: measure.height,
              screenWidth: width,
              screenHeight: state.height,
              areaSet: true,
              updating: false,
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

  const initCamera = useCallback(() => {
    // if (Platform.OS == 'ios') {
    //   this.refCallSheet.current.ref.current.close();
    //   this.props.navigation?.navigate('PhotoCaptureZoom', {
    //     note: selectedNote,
    //     updateRefreshGallery: this.updateRefreshGallery.bind(this),
    //     subType: this.props.route.params.subType,
    //   });
    // } else {
    //   ImagePicker.openCamera(CAMERA_OPTION_COMPRESS)
    //     .then((image) => {
    //       this.manageImage(image);
    //     })
    //     .catch((e) =>
    //       Toast.show('Picture not capture', Toast.LONG, ['UIAlertController']),
    //     );
    // }
  }, []);

  const openSheet = useCallback(() => {
    refCallSheet.current?.open();
  }, []);

  const closeSheet = useCallback(() => {
    refCallSheet.current?.close();
  }, []);

  const manageImage = useCallback(
    (image: ImageType) => {
      // this.setState({loading: true});
      // if (response.didCancel) {
      //   // console.log('User cancelled image picker');
      // } else if (response.error) {
      //   // console.log('ImagePicker Error: ', response.error);
      // } else if (response.customButton) {
      //   // console.log('User tapped custom button: ', response.customButton);
      // } else {
      //   this.refCallSheet.current.ref.current.close();
      //   var photo = {...response};
      //   const compressedBase64 = await compressImageDefault(response.data);
      //   photo.base64 = compressedBase64;
      //   photo.data = '';
      //   photo.uri = photo.path;
      //   this.props.navigation?.navigate('PhotoDetail', {
      //     photo,
      //     note: selectedNote,
      //     refresh: false,
      //     updateRefreshGallery: this.updateRefreshGallery.bind(this),
      //     refreshGallery: false,
      //     subType: this.props.route.params.subType
      //       ? this.props.route.params.subType
      //       : null,
      //   });
      // }
      // this.setState({loading: false});
      navigate(RoutesNavigation.PhotoDetailCondition, {
        photo: image.data!,
        subType: props.conditionPhotoType,
        refresh: false,
      });
    },
    [props.navigation, props.route?.params?.subType],
  );

  const initGallery = useCallback(() => {
    // @ts-ignore
    onSelectImage(closeSheet, manageImage);
  }, [closeSheet, manageImage]);

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
        const ratio = width / originalImageWidthRef.current;
        fittedSize.width = width;
        fittedSize.height = originalImageHeightRef.current * ratio;
      } else if (
        originalImageWidthRef.current < originalImageHeightRef.current
      ) {
        const ratio = width / originalImageWidthRef.current;
        fittedSize.width = width;
        fittedSize.height = originalImageHeightRef.current * ratio;
      } else if (
        originalImageWidthRef.current === originalImageHeightRef.current
      ) {
        fittedSize.width = width;
        fittedSize.height = width;
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

  console.log('state.photoSource');
  console.log(state.photoSource);

  return (
    <Wrapper style={styles.container}>
      {/* {state.loading && (
        <Wrapper style={GLOBAL_STYLES.backgroundLoading}>
          <ActivityIndicator size="large" color={'#487EFD'} />
        </Wrapper>
      )} */}
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
