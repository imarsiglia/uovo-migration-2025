import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {NOTE_AREA} from '@components/condition/notes/helpers';
import NoteIssueSelector from '@components/condition/notes/NoteIssueSelector';
import {CustomSpeedDialoAction} from '@components/floating/HomeFloatingAction';
import {CommonActions} from '@react-navigation/native';
import {SpeedDial} from '@rneui/themed';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import React, {PureComponent} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import ImagePicker from 'react-native-image-crop-picker';
import ImageZoom from 'react-native-image-pan-zoom';
import Toast from 'react-native-simple-toast';

const {height: dimensionsHeight, width: dimensionsWidth} =
  Dimensions.get('window');
const {width} = {...Dimensions.get('window')};

const stateUpdate = {
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
    color: '#00D3ED',
  },
  {
    text: 'Save photo',
    icon: <Icon name="sign-in" size={15} color="white" />,
    name: 'save',
    position: 3,
    color: '#00D3ED',
  },
  {
    text: 'Clear all',
    icon: <Icon name="trash" size={15} color="white" />,
    name: 'clear',
    position: 4,
    color: '#00D3ED',
  },
];

const actionsCancel = [
  {
    text: 'Cancel',
    icon: <Icon name="ban" size={15} color="white" />,
    name: 'cancel',
    position: 1,
    color: '#00D3ED',
  },
];
const actionsSet = [
  {
    text: 'Set',
    icon: <Icon name="check" size={15} color="white" />,
    name: 'set',
    position: 1,
    color: '#00D3ED',
  },
  {
    text: 'Cancel',
    icon: <Icon name="ban" size={15} color="white" />,
    name: 'cancelSet',
    position: 2,
    color: '#00D3ED',
  },
];

var STATE = {
  notes: [],
  helperVisible: true,
  notesVisible: true,
  setModeActive: false,
  areaDraggable: false,
  editNoteActive: false,
  activeNoteId: null,
  reportId: null,
  loading: false,
  height: Dimensions.get('window').height,
  fabOpen: false,
};

var globalPositionX = 0,
  globalPositionY = 0,
  zoomScale = 1;
var originalImageWidth = 0,
  originalImageHeight = 0;
var lastGlobalPositionX = 0,
  lastGlobalPositionY = 0;

var refreshGallery = false;

var width_ratio = 0.0;
var imgAspRatio = 0.0;
var realImgheight = 0.0;
var height_ratio = 0.0;
var ratio = 0.0;
var newHeight = 0.0;

var selectedNote = null;

class ZoomScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.initVariables();
    this.state = this._getState(props);
    this.mainImageTransforms = null;
    refreshGallery = false;
  }

  initVariables = () => {
    STATE = {
      notes: [],
      helperVisible: true,
      notesVisible: true,
      setModeActive: false,
      areaDraggable: false,
      editNoteActive: false,
      activeNoteId: null,
      reportId: null,
      loading: false,
      height: Dimensions.get('window').height,
      fabOpen: false,
    };

    globalPositionX = 0;
    globalPositionY = 0;
    zoomScale = 1;
    originalImageWidth = 0;
    originalImageHeight = 0;
    lastGlobalPositionX = 0;
    lastGlobalPositionY = 0;

    width_ratio = 0.0;
    imgAspRatio = 0.0;
    realImgheight = 0.0;
    height_ratio = 0.0;
    ratio = 0.0;
    newHeight = 0.0;
  };

  refCallSheet = React.createRef();

  componentDidMount() {
    const {
      route: {params},
      navigation,
    } = this.props;

    this.zoom.reset();
    this.zoom.panResponderReleaseResolve();

    originalImageWidth = params?.photo?.width;
    originalImageHeight = params?.photo?.height;

    if (this.props.route.params?.data?.mainImageTransforms) {
      const {mainImageTransforms} = this.props.route.params.data;
      this.mainImageTransforms = mainImageTransforms;
      const location = {
        x: mainImageTransforms?.positionX || 0,
        y: mainImageTransforms?.positionY || 0,
        scale: mainImageTransforms?.scale || 1,
        duration: 0,
      };
      this.zoom.centerOn(location);
    }

    setTimeout(() => {
      Keyboard.dismiss();
    }, 500);

    if (params && params.edit) {
      this.postConstruct();
    } else {
      this.initNewHeight();
    }
  }

  componentDidUpdate() {
    this._updatePhotoZoom();
  }

  componentWillUnmount() {
    this.zoom.reset();
    this.zoom.panResponderReleaseResolve();
    if (refreshGallery) {
      this.props.route.params.refreshGallery();
    }
  }

  onCloseFab = () => {
    this.setState({fabOpen: false});
  };

  onOpenFab = () => {
    this.setState({fabOpen: true});
  };

  _getState = (props) => {
    if (props?.route?.params?.edit) {
      const {
        route: {
          params: {data, reportId},
        },
      } = props;
      const base64 = data?.photo?.base64;

      const base64Image = `data:image/jpeg;base64,${base64}`;
      return {
        ...STATE,
        ...data,
        reportId,
        photoSource: {
          uri: base64Image,
        },
      };
    }

    const {
      route: {
        params: {
          photo: {uri},
        },
      },
    } = this.props;

    return {
      ...STATE,
      photoSource: {uri},
    };
  };

  _updatePhotoZoom = () => {
    const {
      route: {params},
      navigation,
    } = this.props;

    if (params?.note) {
      const note = this.state.notes?.find((n) => n.id === params?.note?.id);
      if (!note?.photoZoom) {
        const notes = this.state.notes?.reduce((acc, curr) => {
          if (curr?.id === params?.note?.id) {
            return [...acc, {...note, photoZoom: params?.photo}];
          }

          return [...acc, curr];
        }, []);

        navigation.dispatch(CommonActions.setParams({note: null}));

        this.setState({notes});
      }
    }
  };

  _onPhotoPress = (event) => {
    const {setModeActive, areaDraggable} = this.state;
    if (setModeActive && !areaDraggable) {
      const active = this.state?.notes?.find((n) => n.editing);
      if (!active) {
        //initial click position used to calculate the area
        const position = {
          top: event?.locationY,
          left: event?.locationX,
          positionX: globalPositionX,
          positionY: globalPositionY,
        };
        var id;
        if (this.state.notes?.length == 0) {
          id = 1;
        } else {
          id = this.state.notes[this.state.notes?.length - 1]?.id + 1;
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
        this.setState({
          notes: [...this.state.notes, note],
          areaDraggable: true,
          activeNoteId: id,
        });
      }
    }
  };

  _adjustNoteTranslation = ({note, translation}) => {
    const notes = this.state.notes?.reduce((acc, curr) => {
      if (curr.id === note?.id) {
        return [...acc, {...curr, translation}];
      }

      return [...acc, curr];
    }, []);
    this.setState({notes});
  };

  _onDragEnd = ({note, translation}) => {
    const notes = this.state.notes?.reduce((acc, curr) => {
      if (curr.id === note?.id) {
        return [...acc, {...curr, stickyNoteTranslation: translation}];
      }
      return [...acc, curr];
    }, []);
    this.setState({notes});
  };

  _onCancel = (noteId) => {
    const notes = this.state.notes.filter((n) => n.id !== noteId);
    this.setState({notes});
  };

  _onSave = (note) => {
    const notes = this.state.notes?.reduce((acc, curr) => {
      if (curr?.id === note?.id) {
        return [...acc, note];
      }
      return [...acc, curr];
    }, []);
    this.setState({notes});
  };

  updateRefreshGallery = (refresh) => {
    refreshGallery = refresh;
  };

  _captureZoom = (note) => {
    selectedNote = note;
    // console.log(this.refCallSheet);
    this.refCallSheet.current.ref.current.open();
  };

  _onExpand = (photo) => {
    this.props.navigation.navigate('PhotoView', {photo});
  };

  _onEdit = (note) => {
    const notes = this.state.notes?.map((n) =>
      n.id === note?.id ? {...note, editing: true} : n,
    );
    this.setState({notes});
  };

  _getActions = () => {
    const {setModeActive, areaDraggable} = this.state;
    if (setModeActive && areaDraggable) {
      return actionsSet;
    } else if (setModeActive && !areaDraggable) {
      return actionsCancel;
    } else {
      return actionsDefault;
    }
  };

  _getPhoto = () => {
    if (this.props?.route?.params?.edit) {
      const {
        route: {
          params: {data},
        },
      } = this.props;
      return data?.photo;
    }
    const {
      route: {
        params: {photo},
      },
    } = this.props;
    return photo;
  };

  _handleFAB = async (buttonName) => {
    const {notes: stateNotes, activeNoteId, reportId} = this.state;
    const {
      route: {params},
    } = this.props;

    if (buttonName === 'save') {
      refreshGallery = false;
      this.zoom.reset();

      setTimeout(() => {
        this.zoom.panResponderReleaseResolve();
      }, 100);

      setTimeout(async () => {
        this.setState({loading: true});
        const photo = this._getPhoto();
        const {notes, screen} = this.state;
        const body = {
          data: {
            photo,
            notes,
            mainImageTransforms: this.mainImageTransforms,
            screen: {
              width: width,
              height: this.state.height,
            },
          },
          idJob: this.props.jobDetail.id,
          idJobInventory: !this.props.unmanaged
            ? this.props.reportInventory
            : null,
          idImg: this.props.reportIdImage,
          reportId: this.props.reportId,
          reportType: this.props.reportType,
          reportSubType: this.props.route.params.subType
            ? this.props.route.params.subType
            : null,
        };

        var mJson = {
          id_sticky_note: null,
          is_overview: true,
          subtype: this.props.route.params.subType
            ? this.props.route.params.subType
            : null,
          thumbnail: '',
          title: this.props.reportType + ' Overview',
          type: this.props.reportType,
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

        const isConnected = await isInternet();
        this.functSave(isConnected, mJson, photo.base64, body);
        // if (isConnected) {

        // }else{

        // }
        return;
      }, 400);
    }

    if (buttonName === 'cancelSet') {
      const notes = stateNotes.slice(0, -1);
      this.setState({notes, ...stateUpdate[buttonName]});
    } else if (buttonName === 'set') {
      const notes = stateNotes?.reduce((acc, curr) => {
        if (activeNoteId === curr.id) {
          curr.position.scale = zoomScale;
          curr.updating = false;
          return [...acc, {...curr, areaSet: true}];
        }
        return [...acc, curr];
      }, []);

      this.setState({
        setModeActive: false,
        areaDraggable: false,
        notes,
        activeNoteId: null,
      });
    } else {
      this.setState({...stateUpdate[buttonName]});
    }
  };

  functSave = async (isConnected, mJson, photo, bodyRequest) => {
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
  };

  suppSaveFunction = async (stringListSave) => {
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
  };

  _updateNoteArea = ({note, ...rest}) => {
    const notes = this.state.notes.reduce((acc, curr) => {
      if (curr.id === note.id) {
        return [...acc, {...note, ...rest}];
      }
      return [...acc, curr];
    }, []);
    this.setState({notes});
  };

  _updateNotePosition = ({note, measure}) => {
    const {screen} = this.state;
    const notes = this.state.notes.reduce((acc, curr) => {
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
            screenHeight: this.state.height,
            areaSet: true,
            updating: false,
          },
        ];
      }
      return [...acc, curr];
    }, []);
    this.setState({notes});
  };

  getPercentFromNumber = (percent, numberFrom) => {
    return (numberFrom / 100) * percent;
  };

  getPercentDiffNumberFromNumber = (number, numberFrom) => {
    return (number / numberFrom) * 100;
  };

  initNewHeight = () => {
    const {
      route: {params},
      navigation,
    } = this.props;

    ratio = width / params?.photo?.width;
    newHeight = dimensionsHeight;
    this.setState({height: dimensionsHeight});
  };

  postConstruct = () => {
    const {
      route: {params},
      navigation,
    } = this.props;

    var deviceDimensions = {
      width: params?.data?.screen?.width,
      height: params?.data?.screen?.height,
    };

    ratio = width / params?.data?.screen?.width;
    newHeight = params?.data?.screen?.height * ratio;

    this.setState({height: newHeight});

    width_ratio = width / deviceDimensions.width;
    imgAspRatio = width / newHeight;
    realImgheight = deviceDimensions.width / imgAspRatio;
    height_ratio = newHeight / realImgheight;
    //var fixY = dimensions.height - realImgheight;
    var fixY = 0;
    var newNotes = [];

    this.state.notes.forEach((element) => {
      var elWidth = element.width;
      var elHeight = element.height;

      var elOrigWidth = element.originalWidth;
      var elOrigHeight = element.originalHeight;

      var elTop = element.translation.top - fixY;
      var elLeft = element.translation.left;

      var elPosTop = element.position.top;
      var elPosLeft = element.position.left;

      var x1 = elLeft * width_ratio;
      var y1 = elTop * height_ratio;
      var xPos1 = elPosLeft * width_ratio;
      var yPos1 = elPosTop * height_ratio;

      var nwidth = elWidth * width_ratio;
      var nheight = elHeight * height_ratio;

      var nOrigwidth = elOrigWidth * width_ratio;
      var nOrigheight = elOrigHeight * height_ratio;

      //element.position.scale = element.position.scale + ((nwidth - elWidth) / elWidth);

      element.width = nwidth;
      element.height = nheight;
      element.originalWidth = nOrigwidth;
      element.originalHeight = nOrigheight;
      element.translation.left = x1;
      element.translation.top = y1;
      element.position.left = xPos1;
      element.position.top = yPos1;

      var diffTop = element.diffTop * width_ratio;
      var diffLeft = element.diffLeft * width_ratio;

      element.diffTop = diffTop;
      element.diffLeft = diffLeft;

      element.screenWidth = width;
      element.screenHeight = newHeight;

      newNotes.push({...element});
    });

    this.setState({notes: newNotes});
  };

  // TODO debounce/trottle
  _updateMainImageTransform = (position) => {
    console.log('position.scale: ', position.scale);
    zoomScale = position.scale;

    const offset = {
      x: 0,
      y: 0,
    };

    var cropWidth = this.zoom?.props?.cropWidth;
    var cropHeight = this.zoom?.props?.cropHeight;
    //var cropHeight = this.state.height;

    const fittedSize = {width: 0, height: 0};
    if (originalImageWidth > originalImageHeight) {
      const ratio = width / originalImageWidth;
      fittedSize.width = width;
      fittedSize.height = originalImageHeight * ratio;
      /*const ratio = width / originalImageHeight;
      fittedSize.width = originalImageWidth * ratio;
      fittedSize.height = width;*/
    } else if (originalImageWidth < originalImageHeight) {
      const ratio = width / originalImageWidth;
      fittedSize.width = width;
      fittedSize.height = originalImageHeight * ratio;
    } else if (originalImageWidth === originalImageHeight) {
      fittedSize.width = width;
      fittedSize.height = width;
    }

    const scaledCropWidth = cropWidth / position.scale;
    const scaledCropHeight = cropHeight / position.scale;

    const percentCropperAreaW = this.getPercentDiffNumberFromNumber(
      scaledCropWidth,
      fittedSize.width,
    );
    const percentRestW = 100 - percentCropperAreaW;
    const hiddenAreaW = this.getPercentFromNumber(
      percentRestW,
      fittedSize.width,
    );

    const x = hiddenAreaW / 2 - position.positionX;
    offset.x = x <= 0 ? 0 : x;

    const percentCropperAreaH = this.getPercentDiffNumberFromNumber(
      scaledCropHeight,
      fittedSize.height,
    );

    const percentRestH = 100 - percentCropperAreaH;
    const hiddenAreaH = this.getPercentFromNumber(
      percentRestH,
      fittedSize.height,
    );

    var diffPositionY = (dimensionsHeight - fittedSize.height) / 2;
    const y = hiddenAreaH / 2 - position.positionY + diffPositionY;

    offset.y = y <= 0 ? 0 : y;
    globalPositionX = offset.x;
    globalPositionY = offset.y;

    const notes = this.state?.notes?.map((note) => {
      var deltaX =
        (globalPositionX - lastGlobalPositionX) * note?.position?.scale;
      var deltaY =
        (globalPositionY - lastGlobalPositionY) * note?.position?.scale;

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

    lastGlobalPositionX = globalPositionX;
    lastGlobalPositionY = globalPositionY;
    this.setState({notes});
    //}
  };

  _onEditPosition = (note) => {
    const notes = this.state.notes?.reduce((acc, curr) => {
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
    this.setState({
      notes,
      setModeActive: true,
      areaDraggable: true,
      activeNoteId: note?.id,
    });
  };

  _onDeleteNote = (note) => {
    const notes = this.state.notes?.filter((n) => n?.id !== note?.id);
    this.setState({notes});
  };

  initCamera = () => {
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
  };

  initGallery = async () => {
    // let granted = true;
    // if (Platform.OS == 'android') {
    //   granted = await requestReadMediaPermission();
    // }
    // if (granted) {
    //   try {
    //     ImagePicker.openPicker(CAMERA_OPTION_COMPRESS)
    //       .then((image) => {
    //         this.manageImage(image);
    //       })
    //       .catch((e) =>
    //         Toast.show('Pictures not selected', Toast.LONG, [
    //           'UIAlertController',
    //         ]),
    //       );
    //   } catch (e) {
    //     Toast.show('Accept permissions to continue', Toast.LONG, [
    //       'UIAlertController',
    //     ]);
    //   }
    // }
  };

  onCancelSheet = () => {
    this.refCallSheet.current.ref.current.close();
    this.props.editModalFunction();
  };

  manageImage = async (response) => {
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
  };

  render() {
    const {
      notes,
      voiceReady,
      photoSource,
      screen,
      height: deviceHeight,
    } = this.state;

    return (
      <View style={styles.container}>
        {this.state.loading && (
          <View style={GLOBAL_STYLES.backgroundLoading}>
            <ActivityIndicator size="large" color={'#487EFD'} />
          </View>
        )}
        <ImageZoom
          ref={(ref) => (this.zoom = ref)}
          cropWidth={dimensionsWidth}
          cropHeight={dimensionsHeight}
          imageWidth={dimensionsWidth}
          imageHeight={dimensionsHeight}
          minScale={1}
          maxScale={5}
          useNativeDriver={true}
          enableDoubleClickZoom={false}
          onClick={this._onPhotoPress}
          onMove={this._updateMainImageTransform}>
          <Image
            resizeMode="contain"
            source={photoSource}
            style={{
              width: dimensionsWidth,
              height: this.state.height,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </ImageZoom>
        {notes.map((note) => (
          <NoteIssueSelector
            voiceReady={voiceReady}
            note={note}
            key={note.id}
            onCancel={this._onCancel}
            onFinishAreaEdit={this._updateNotePosition}
            onStickyNoteDragged={this._onDragEnd}
            onSave={this._onSave}
            onExpand={this._onExpand}
            onRetake={this._captureZoom}
            onEdit={this._onEdit}
            onZoomButtonPress={() => this._captureZoom(note)}
            onEditPosition={this._onEditPosition}
            onDeleteNote={this._onDeleteNote}
          />
        ))}
        {this.state.helperVisible && (
          <TouchableOpacity
            style={styles.helper}
            onPress={() => this.setState({helperVisible: false})}>
            <Text allowFontScaling={false} style={styles.helperText}>
              You can drag the image to navigate it.
            </Text>
            <Text style={styles.helperText}>Pinch to zoom.</Text>
          </TouchableOpacity>
        )}
        {/* <FloatingAction
          color="#00D3ED"
          floatingIcon={<Icon color="white" size={25} name="th" />}
          actions={this._getActions()}
          onPressItem={this._handleFAB}
        /> */}

        <PressableOpacity
          onPress={() => this._handleFAB('add')}
          style={{position: 'absolute', bottom: 20, right: 20}}>
          <Label>Add</Label>
        </PressableOpacity>

        <PressableOpacity
          onPress={() => this._handleFAB('set')}
          style={{position: 'absolute', bottom: 40, right: 20}}>
          <Label>Set</Label>
        </PressableOpacity>

        {/* <SpeedDial
          isOpen={this.state.fabOpen}
          icon={<Icon color="white" size={25} name="th" type="light" />}
          openIcon={<Icon color="white" size={25} name="th" type="light" />}
          onOpen={this.onOpenFab}
          onClose={this.onCloseFab}
          color={COLORS.tertearyDark}
          overlayColor="#00000040"
          style={{
            paddingBottom: 15,
          }}>
          {this._getActions().map((option) => (
            <CustomSpeedDialoAction
              title={option.text}
              icon={option.icon}
              onPress={() => this._handleFAB(option.name)}
            />
          ))}
        </SpeedDial> */}

        {/* {Platform.OS == 'ios' && <KeyboardSpacer />} */}

        {/* <ImageOptionSheetZoomScreen
          ref={this.refCallSheet}
          initCamera={this.initCamera}
          initGallery={this.initGallery}
          onCancel={this.onCancelSheet}></ImageOptionSheetZoomScreen> */}
      </View>
    );
  }
}

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
