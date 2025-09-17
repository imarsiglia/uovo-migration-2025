import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
// import {useFocusEffect} from '@react-navigation/native';
import Modal from 'react-native-modal';
import RNPickerSelect from 'react-native-picker-select';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import useTopSheetStore from '@store/topsheet';
import {useAuth} from '@store/auth';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {AutocompleteContext} from '@components/commons/form/AutocompleteContext';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import CheckBoxContext from '@components/commons/form/CheckBoxContext';
import {useFormContext, useWatch} from 'react-hook-form';
import {
  useGetArtists,
  useGetArtTypes,
  useGetPackingDetails,
  useGetPlacesConditionReport,
} from '@api/hooks/HooksGeneralServices';
import {moveOtherToEnd} from '@utils/functions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {FRAME_FIXTURE_LIST, HANGING_SYSTEM_LIST} from '@api/contants/constants';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {
  AutocompleteDropdown,
  AutocompleteDropdownItem,
} from 'react-native-autocomplete-dropdown';
import {useGetJobInventory} from '@api/hooks/HooksInventoryServices';
import {
  useGetConditionReportbyInventory,
  useSaveConditionReport,
} from '@api/hooks/HooksReportServices';
import {ConditionReportSchemaType} from '@generalTypes/schemas';
import {CustomAutocomplete} from '@components/commons/autocomplete/CustomAutocomplete';
import {JobInventoryType} from '@api/types/Inventory';
// import OfflineValidation from '../components/offline/OfflineValidation';

var offlineInventory = {};
let idTimeOut: any = null;
let initial = true;

type Props = NativeStackScreenProps<RootStackParamList, 'ConditionReport'>;

export const ConditionReportScreen = (props: Props) => {
  const examinationDate = new Date();

  // filters and select
  const [filterItem, setFilterItem] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [filterTypes, setFilterTypes] = useState('');
  const [selectedItem, setSelectedItem] = useState<JobInventoryType | null>(
    null,
  );
  //today date
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const sessionUser = useAuth((d) => d.user);

  // received params
  const fromReports = props.route.params.fromReports;

  const {mutateAsync: saveConditionAsync} = useSaveConditionReport();
  const {data: packingDetailList} = useGetPackingDetails();
  const {data: placeOfExamList} = useGetPlacesConditionReport();
  const {data: items} = useGetJobInventory(
    {
      idJob: jobDetail?.id!,
      filter: filterItem,
      limit: 10,
      start: 0,
    },
    // @ts-ignore
    {
      enabled: !!jobDetail?.id && filterItem.trim().length > 0,
    },
  );

  const {data: artists} = useGetArtists({
    filter: filterArtist,
  });

  const {data: types} = useGetArtTypes({
    filter: filterTypes,
  });

  const {data: conditionReportJson} = useGetConditionReportbyInventory({
    idJobInventory: selectedItem?.id!,
  });

  //Autocompletes inputs
  const autocompleteRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  const artist = {};
  const type = {};

  //Take dictation
  const refVoiceCondArt = useRef(null);

  const [totalPhotos, setTotalPhotos] = useState([
    {
      type: 'back',
      total: 0,
    },
    {
      type: 'front',
      total: 0,
    },
    {
      type: 'sides',
      total: 0,
    },
    {
      type: 'details',
      total: 0,
    },
  ]);

  const [partial, setPartial] = useState(null);
  const [statesList, setStatesList] = useState([
    {label: 'Partial', value: true},
    {label: 'Final', value: false},
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [fadeAnimDialog, setFadeAnimDialog] = useState(new Animated.Value(0));
  const [fadeAnimShowDialog, setFadeAnimShowDialog] = useState(
    new Animated.Value(0),
  );

  //autosave
  const [currentJsonData, setCurrentJsonData] = useState(null);

  const cancelCondition = () => {
    setShowDialog(false);
  };

  const openModal = () => {
    Keyboard.dismiss();
    if (refVoiceCondArt.current) {
      refVoiceCondArt.current._stopRecognizing();
    }

    if (selectedItem?.id) {
      setShowDialog(true);
    } else {
      Alert.alert('Please, select an item');
    }
  };

  const hideDialog = () => {
    Animated.timing(fadeAnimDialog, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnimShowDialog, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setShowDialog(false);
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (props.reportId) {
  //       getTotalPhotos();
  //     }
  //   }, [props.reportId]),
  // );

  useEffect(() => {
    initial = true;
    // props.dispatch(ActionsConditionReport.copyConditionType('conditionreport'));
    initAll();

    // var otherOptionPd = props.packingDetails.find(
    //   x => x.name.toUpperCase() == 'OTHER',
    // );
    // var tempPackingDetailList = props.packingDetails.filter(
    //   x => x.name.toUpperCase() != 'OTHER',
    // );
    // tempPackingDetailList.push(otherOptionPd);
    // setPackingDetailList(tempPackingDetailList);
  }, []);

  useEffect(() => {
    // return () => {
    //   props.dispatch(ActionsConditionReport.clearAllReport());
    // };
  }, []);

  useEffect(() => {
    return () => {
      if (currentJsonData) {
        if (fromReports) {
          // props.route.params.refresh();
        } else {
          // props.route.params.updateItem(currentJsonData);
        }
        setCurrentJsonData(null);
      }
    };
  }, []);

  const initAll = async () => {
    // await initOfflineInventory();
  };

  const initOfflineInventory = async () => {
    // var stringOfflineInventory = await getFromStorageOffline(
    //   RESUME_INVENTORY_KEY_STORAGE + jobDetail.id,
    // );
    // if (stringOfflineInventory) {
    //   offlineInventory = JSON.parse(stringOfflineInventory);
    // }
    // setTimeout(async () => {
    //   if (props.route.params.condition) {
    //     await initCondition();
    //   } else if (props.route.params.item) {
    //     await initCondition(props.route.params.item.id);
    //   }
    //   initial = false;
    // }, 300);
  };

  const initCondition = async (idInventory: any) => {
    // setLoading(true);
    // const isConnected = await isInternet();
    // if (isConnected) {
    //   const response = await fetchData.Get(
    //     'resources/conditionreport/list?idJobInventory=' +
    //     (idInventory
    //       ? idInventory
    //       : props.route.params.condition.id_job_inventory),
    //   );
    //   if (response.ok) {
    //     if (response.data.message == 'SUCCESS') {
    //       var json = response.data.body;
    //       if (props.route.params.item) {
    //         props.route.params.updateItem(json.obj_data);
    //       }
    //       if (json.data.length > 0) {
    //         var idString = idInventory
    //           ? idInventory
    //           : props.route.params.condition.id_job_inventory;
    //         await saveToStorageOffline(
    //           CONDITION_REPORT_KEY_STORAGE +
    //           jobDetail.id +
    //           '_' +
    //           idString,
    //           JSON.stringify(json),
    //         );
    //         var stringIdsInventory = await getFromStorageOffline(
    //           IDS_INVENTORY_KEY_STORAGE + jobDetail.id,
    //         );
    //         var jsonIdInventory = {
    //           type: 'conditionreport',
    //           idInventory: idString,
    //           reportId: json.data[json.data.length - 1].id,
    //         };
    //         if (stringIdsInventory) {
    //           var jsonIdsInventory = JSON.parse(stringIdsInventory);
    //           if (
    //             !jsonIdsInventory.some(
    //               x => x.idInventory == idString && x.type == 'conditionreport',
    //             )
    //           ) {
    //             jsonIdsInventory.push(jsonIdInventory);
    //           }
    //           await saveToStorageOffline(
    //             IDS_INVENTORY_KEY_STORAGE + jobDetail.id,
    //             JSON.stringify(jsonIdsInventory),
    //           );
    //         } else {
    //           var jsonIdsInventory = [jsonIdInventory];
    //           await saveToStorageOffline(
    //             IDS_INVENTORY_KEY_STORAGE + jobDetail.id,
    //             JSON.stringify(jsonIdsInventory),
    //           );
    //         }
    //         var stringConditionsReport = await getFromStorageOffline(
    //           CONDITIONS_REPORT_KEY_STORAGE + jobDetail.id,
    //         );
    //         if (stringConditionsReport) {
    //           var jsonConditionsReport = JSON.parse(stringConditionsReport);
    //           jsonConditionsReport.forEach(element => {
    //             if (element.id_job_inventory == idString) {
    //               element.offline = true;
    //             }
    //           });
    //           await saveToStorageOffline(
    //             CONDITIONS_REPORT_KEY_STORAGE + jobDetail.id,
    //             JSON.stringify(jsonConditionsReport),
    //           );
    //         }
    //       }
    //       fillItemCondition(json);
    //       setLoading(false);
    //     } else {
    //       setLoading(false);
    //       Toast.show('Error while retreiving condition report', Toast.LONG, [
    //         'UIAlertController',
    //       ]);
    //     }
    //   } else {
    //     setLoading(false);
    //     Toast.show('Error while retreiving condition report', Toast.LONG, [
    //       'UIAlertController',
    //     ]);
    //   }
    // } else {
    //   var idString = idInventory
    //     ? idInventory
    //     : props.route.params.condition.id_job_inventory;
    //   var stringCondition = await getFromStorageOffline(
    //     CONDITION_REPORT_KEY_STORAGE + jobDetail.id + '_' + idString,
    //   );
    //   if (stringCondition) {
    //     var jsonCondition = JSON.parse(stringCondition);
    //     fillItemCondition(jsonCondition);
    //   } else {
    //     var itemSelected = offlineInventory.data.filter(
    //       x =>
    //         x.id ==
    //         (idInventory
    //           ? idInventory
    //           : props.route.params.condition.id_job_inventory),
    //     )[0];
    //     if (!itemSelected) {
    //       itemSelected = offlineInventory.data.filter(
    //         x =>
    //           x.id ==
    //           (idInventory
    //             ? idInventory
    //             : props.route.params.condition.id_job_inventory),
    //       )[0];
    //     }
    //     if (itemSelected) {
    //       var itemJson = {};
    //       itemJson = {
    //         data: [],
    //         obj_data: itemSelected,
    //       };
    //       //setItem(props.route.params.item);
    //       fillItemCondition(itemJson);
    //     } else {
    //       Toast.show('Item not found', Toast.LONG, ['UIAlertController']);
    //     }
    //   }
    //   setLoading(false);
    // }
  };

  const fillItemCondition = async (json) => {
    // setItem(json.obj_data);
    // setItems([]);
    // if(itemRef.current){
    //   itemRef.current.setInputText(`${json.obj_data.clientinv} ${json.obj_data.clientinv_display}`)
    // }
    // // itemRef.current.setItem({id: json.obj_data?.id, title: `${json.obj_data.clientinv} ${json.obj_data.clientinv_display}`})
    // if (json.data.length > 0) {
    //   var subJson = json.data[json.data.length - 1];
    //   props.dispatch(ActionsConditionReport.copyReportId(subJson.id));
    //   setPacked({
    //     height: subJson.packed_height ? subJson.packed_height : '',
    //     length: subJson.packed_length ? subJson.packed_length : '',
    //     width: subJson.packed_width ? subJson.packed_width : '',
    //   });
    //   setUnpacked({
    //     height: subJson.un_packed_height ? subJson.un_packed_height : '',
    //     length: subJson.un_packed_length ? subJson.un_packed_length : '',
    //     width: subJson.un_packed_width ? subJson.un_packed_width : '',
    //   });
    //   setFramed({
    //     height: subJson.frame_height ? subJson.frame_height : '',
    //     length: subJson.frame_length ? subJson.frame_length : '',
    //     width: subJson.frame_width ? subJson.frame_width : '',
    //   });
    //   setWeight(subJson.weight ? subJson.weight : '');
    //   setWeightUnpacked(subJson.unpacked_weight ? subJson.unpacked_weight : '');
    //   setTitle(subJson.title);
    //   setConditionOfArtwork(
    //     subJson.condition_artwork ? subJson.condition_artwork : '',
    //   );
    //   //setHangingSystem(subJson.hanging_system);
    //   setPlaceOfExamen(subJson.place_of_exam ? subJson.place_of_exam : '');
    //   setSelectedHangingSystemList(
    //     subJson.condition_report_hanging_system_list.map(
    //       x => x.condition_report_hanging_system_pk.text_value,
    //     ),
    //   );
    //   setSelectedFrameFixtureList(
    //     subJson.condition_report_frame_fixture_list.map(
    //       x => x.condition_report_frame_fixture_pk.text_value,
    //     ),
    //   );
    //   setSelectedPackingDetailList(
    //     subJson.condition_report_packing_detail_list.map(
    //       x => x.condition_report_packing_detail_pk.text_value,
    //     ),
    //   );
    //   setEdition(subJson.edition ? subJson.edition : '');
    //   setSignature(subJson.signature ? subJson.signature : '');
    //   setLabeled(subJson.labeled ? subJson.labeled : '');
    //   setYear(subJson.year ? subJson.year : '');
    //   if (subJson.art_type_name && subJson.art_type_name != 'null') {
    //     setType({ id: -1, name: subJson.art_type_name });
    //     typeRef.current.setItem({ id: -1, title: subJson.art_type_name })
    //   } else {
    //     setType({});
    //     typeRef.current.setItem(null)
    //   }
    //   setTypes([]);
    //   if (subJson.artist_name && subJson.artist_name != 'null') {
    //     setArtist({ id: -1, name: subJson.artist_name });
    //     artistRef.current.setItem({ id: -1, title: subJson.artist_name })
    //   } else {
    //     setArtist({});
    //     artistRef.current.setItem(null)
    //   }
    //   setArtists([]);
    //   setMedium(
    //     subJson.medium_name ? subJson.medium_name : '',
    //   );
    //   setOtherText(subJson.other_text ? subJson.other_text : '');
    //   getTotalPhotos(subJson.id);
    // } else {
    //   props.dispatch(ActionsConditionReport.copyReportId(null));
    //   setTitle(
    //     json.obj_data.clientinv_display ? json.obj_data.clientinv_display : '',
    //   );
    //   setPacked({
    //     height: json.obj_data.packed_height ? json.obj_data.packed_height : '',
    //     length: json.obj_data.packed_length ? json.obj_data.packed_length : '',
    //     width: json.obj_data.packed_width ? json.obj_data.packed_width : '',
    //   });
    //   setUnpacked({
    //     height: json.obj_data.unpacked_height
    //       ? json.obj_data.unpacked_height
    //       : '',
    //     length: json.obj_data.unpacked_length
    //       ? json.obj_data.unpacked_length
    //       : '',
    //     width: json.obj_data.unpacked_width ? json.obj_data.unpacked_width : '',
    //   });
    //   setFramed({
    //     height: json.obj_data.frame_height ? json.obj_data.frame_height : '',
    //     length: json.obj_data.frame_length ? json.obj_data.frame_length : '',
    //     width: json.obj_data.frame_width ? json.obj_data.frame_width : '',
    //   });
    //   setWeight(json.obj_data.weight ? json.obj_data.weight : '');
    //   setWeightUnpacked(
    //     json.obj_data.unpacked_weight ? json.obj_data.unpacked_weight : '',
    //   );
    //   setConditionOfArtwork('');
    //   setPlaceOfExamen('');
    //   setSelectedHangingSystemList([]);
    //   setSelectedFrameFixtureList([]);
    //   setEdition(json.obj_data.edition ? json.obj_data.edition : '');
    //   setSignature(json.obj_data.signature ? json.obj_data.signature : '');
    //   setLabeled(json.obj_data.labeled ? json.obj_data.labeled : '');
    //   setYear(json.obj_data.year ? json.obj_data.year : '');
    //   if (json.obj_data.art_type && json.obj_data.art_type != 'null') {
    //     setType({ id: json.obj_data.art_type_id, name: json.obj_data.art_type });
    //     typeRef.current.setItem({ id: json.obj_data.art_type_id, title: json.obj_data.art_type })
    //   } else {
    //     setType({});
    //     typeRef.current.setItem(null)
    //   }
    //   setTypes([]);
    //   if (json.obj_data.artist && json.obj_data.artist != 'null') {
    //     setArtist({ id: json.obj_data.artist_id, name: json.obj_data.artist });
    //     artistRef.current.setItem({ id: json.obj_data.artist_id, title: json.obj_data.artist })
    //   } else {
    //     setArtist({});
    //     artistRef.current.setItem(null)
    //   }
    //   setArtists([]);
    //   setMedium(
    //     json.obj_data.medium ? json.obj_data.medium : '',
    //   );
    //   setSelectedPackingDetailList([]);
    //   setOtherText('');
    //   setTotalPhotos([
    //     {
    //       type: 'back',
    //       total: 0,
    //     },
    //     {
    //       type: 'front',
    //       total: 0,
    //     },
    //     {
    //       type: 'sides',
    //       total: 0,
    //     },
    //     {
    //       type: 'details',
    //       total: 0,
    //     },
    //   ]);
    // }
  };

  const getTotalPhotos = async (id) => {
    // if (id || (props.reportId != null && props.reportId != '')) {
    //   const isConnected = await isInternet();
    //   if (isConnected) {
    //     const response = await fetchData.Get(
    //       'resources/conditionreport/totalPhotos?id=' +
    //       (id ? id : props.reportId),
    //     );
    //     if (response.ok) {
    //       if (response.data.message == 'SUCCESS') {
    //         setTotalPhotos(response.data.body);
    //       }
    //     } else {
    //       Toast.show('Error while retreiving total photos', Toast.LONG, [
    //         'UIAlertController',
    //       ]);
    //     }
    //   } else {
    //     setTotalPhotos([
    //       {
    //         type: 'back',
    //         total: 0,
    //       },
    //       {
    //         type: 'front',
    //         total: 0,
    //       },
    //       {
    //         type: 'sides',
    //         total: 0,
    //       },
    //       {
    //         type: 'details',
    //         total: 0,
    //       },
    //     ]);
    //   }
    // }
  };

  const navigate = (screen, body) => {
    // if (currentJsonData) {
    //   if (props.route.params.fromReports) {
    //     props.route.params.refresh();
    //   } else {
    //     props.route.params.updateItem(currentJsonData);
    //   }
    //   setCurrentJsonData(null)
    // }
    // props.navigation.navigate(screen, body);
  };

  const onPartialSave = () => {
    // if (item.id) {
    //   saveCondition(true);
    // }
  };

  const onFinalSave = () => {
    // Keyboard.dismiss();
    // var testDecimal = /^\d+((\.|\,)\d{1,5})?$/;
    // if (refVoiceCondArt.current) {
    //   refVoiceCondArt.current._stopRecognizing();
    // }
    // if (refVoiceHangSys.current) {
    //   refVoiceHangSys.current._stopRecognizing();
    // }
    // if (partial == null) {
    //   Toast.show('Please, select an option', Toast.LONG, ['UIAlertController']);
    //   return;
    // }
    // if (
    //   (!testDecimal.test(packed.height.trim()) && packed.height.trim() != '') ||
    //   (!testDecimal.test(packed.length.trim()) && packed.length.trim() != '') ||
    //   (!testDecimal.test(packed.width.trim()) && packed.width.trim() != '') ||
    //   (!testDecimal.test(unpacked.height.trim()) &&
    //     unpacked.height.trim() != '') ||
    //   (!testDecimal.test(unpacked.length.trim()) &&
    //     unpacked.length.trim() != '') ||
    //   (!testDecimal.test(unpacked.width.trim()) &&
    //     unpacked.width.trim() != '') ||
    //   (!testDecimal.test(framed.height.trim()) && framed.height.trim() != '') ||
    //   (!testDecimal.test(framed.length.trim()) && framed.length.trim() != '') ||
    //   (!testDecimal.test(framed.width.trim()) && framed.width.trim() != '') ||
    //   (!testDecimal.test(weight.trim()) && weight.trim() != '') ||
    //   (!testDecimal.test(unpacked_weight.trim()) &&
    //     unpacked_weight.trim() != '')
    // ) {
    //   Alert.alert(
    //     'Incorrect dimensions',
    //     'Please verify that values of dimensions ​​are correct.',
    //   );
    //   return;
    // }
    // saveCondition();
  };

  const checkItem = useCallback(
    (value: string) => {
      setFilterItem(value.trim());
      if (autocompleteRefs[0].current) {
        autocompleteRefs[0].current.open();
      }
    },
    [setFilterItem, autocompleteRefs[0].current],
  );

  const checkArtist = useCallback(
    (value: string) => {
      setFilterArtist(value.trim());
      if (autocompleteRefs[1].current) {
        autocompleteRefs[1].current.open();
      }
    },
    [setFilterArtist, autocompleteRefs[1].current],
  );

  const checkType = useCallback(
    (value: string) => {
      setFilterTypes(value.trim());
      if (autocompleteRefs[2].current) {
        autocompleteRefs[2].current.open();
      }
    },
    [setFilterTypes, autocompleteRefs[2].current],
  );

  const saveCondition = async (preSave) => {
    // setShowDialog(false);
    // var packedTemp = packed;
    // var unpackedTemp = unpacked;
    // var frameTemp = framed;
    // var weightTemp = weight;
    // var unpacked_weightTemp = unpacked_weight;
    // packedTemp.height =
    //   packedTemp.height?.trim() == ''
    //     ? '0'
    //     : packedTemp.height?.trim().replace(',', '.');
    // packedTemp.length =
    //   packedTemp.length?.trim() == ''
    //     ? '0'
    //     : packedTemp.length?.trim().replace(',', '.');
    // packedTemp.width =
    //   packedTemp.width?.trim() == ''
    //     ? '0'
    //     : packedTemp.width?.trim().replace(',', '.');
    // unpackedTemp.height =
    //   unpackedTemp.height?.trim() == ''
    //     ? '0'
    //     : unpackedTemp.height?.trim().replace(',', '.');
    // unpackedTemp.length =
    //   unpackedTemp.length?.trim() == ''
    //     ? '0'
    //     : unpackedTemp.length?.trim().replace(',', '.');
    // unpackedTemp.width =
    //   unpackedTemp.width?.trim() == ''
    //     ? '0'
    //     : unpackedTemp.width?.trim().replace(',', '.');
    // frameTemp.height =
    //   frameTemp.height?.trim() == ''
    //     ? '0'
    //     : frameTemp.height?.trim().replace(',', '.');
    // frameTemp.length =
    //   frameTemp.length?.trim() == ''
    //     ? '0'
    //     : frameTemp.length?.trim().replace(',', '.');
    // frameTemp.width =
    //   frameTemp.width?.trim() == ''
    //     ? '0'
    //     : frameTemp.width?.trim().replace(',', '.');
    // weightTemp =
    //   weightTemp?.trim() == '' ? '0' : weightTemp?.trim().replace(',', '.');
    // unpacked_weightTemp =
    //   unpacked_weightTemp?.trim() == ''
    //     ? '0'
    //     : unpacked_weightTemp?.trim().replace(',', '.');
    // if (
    //   !preSave ||
    //   (props.route.params.condition == null &&
    //     (props.reportId == null || props.reportId == ''))
    // ) {
    //   setLoading(true);
    // }
    // var artistName = artist?.name ? artist?.name : null;
    // var artistId = artist ? artist.id : null;
    // var mediumName = medium? medium : null;
    // var mediumId = null;
    // var typeName = type?.name ? type?.name : null;
    // var typeId = type ? type.id : null;
    // var yearVar = year ? year?.trim() : null;
    // var editionVar = edition ? edition?.trim() : null;
    // var signatureVar = signature ? signature?.trim() : null;
    // var labeledVar = labeled ? labeled?.trim() : null;
    // var titleVar = title ? title?.trim() : null;
    // var placeOfExamVar = placeOfExamen ? placeOfExamen?.trim() : null;
    // var conditionOfArtworkVar = conditionOfArtwork
    //   ? conditionOfArtwork?.trim()
    //   : null;
    // var urlRequest = 'resources/conditionreport/register';
    // var bodyRequest = {
    //   idInventory: item.id,
    //   //"additional_info": item.additional_info ? item.additional_info.trim() : null,
    //   packed_height: packedTemp.height ? packedTemp.height?.trim() : null,
    //   packed_length: packedTemp.length ? packedTemp.length?.trim() : null,
    //   packed_width: packedTemp.width ? packedTemp.width?.trim() : null,
    //   un_packed_height: unpackedTemp.height
    //     ? unpackedTemp.height?.trim()
    //     : null,
    //   un_packed_length: unpackedTemp.length
    //     ? unpackedTemp.length?.trim()
    //     : null,
    //   un_packed_width: unpackedTemp.width ? unpackedTemp.width?.trim() : null,
    //   frame_height: selectedFrameFixtureList.some(
    //     x => x.toUpperCase() == 'FRAMED',
    //   )
    //     ? frameTemp.height
    //       ? frameTemp.height?.trim()
    //       : null
    //     : '',
    //   frame_length: selectedFrameFixtureList.some(
    //     x => x.toUpperCase() == 'FRAMED',
    //   )
    //     ? frameTemp.length
    //       ? frameTemp.length?.trim()
    //       : null
    //     : '',
    //   frame_width: selectedFrameFixtureList.some(
    //     x => x.toUpperCase() == 'FRAMED',
    //   )
    //     ? frameTemp.width
    //       ? frameTemp.width?.trim()
    //       : null
    //     : '',
    //   weight: weightTemp ? weightTemp?.trim() : null,
    //   unpacked_weight: unpacked_weightTemp ? unpacked_weightTemp?.trim() : null,
    //   artistName: artistName,
    //   mediumName: mediumName,
    //   artTypeName: typeName,
    //   year: yearVar,
    //   edition: editionVar,
    //   signature: signatureVar,
    //   labeled: labeledVar,
    //   title: titleVar,
    //   placeOfExam: placeOfExamVar,
    //   conditionArtWork: conditionOfArtworkVar,
    //   frameFixture: selectedFrameFixtureList,
    //   hangingSystem: selectedHangingSystemList,
    //   packingDetail: selectedPackingDetailList,
    //   otherText: selectedPackingDetailList.some(x => x.toUpperCase() == 'OTHER')
    //     ? otherText?.trim()
    //     : '',
    //   id:
    //     props.route.params.condition ||
    //       (props.reportId != null && props.reportId != '')
    //       ? props.reportId
    //       : null,
    //   idJob: jobDetail.id,
    //   partial: preSave ? true : partial,
    // };
    // var jsonObjData = {
    //   ...item,
    //   packed_height: packedTemp.height ? packedTemp.height?.trim() : null,
    //   packed_length: packedTemp.length ? packedTemp.length?.trim() : null,
    //   packed_width: packedTemp.width ? packedTemp.width?.trim() : null,
    //   unpacked_height: unpackedTemp.height ? unpackedTemp.height?.trim() : null,
    //   unpacked_length: unpackedTemp.length ? unpackedTemp.length?.trim() : null,
    //   unpacked_width: unpackedTemp.width ? unpackedTemp.width?.trim() : null,
    //   frame_height: frameTemp.height ? frameTemp.height?.trim() : null,
    //   frame_length: frameTemp.length ? frameTemp.length?.trim() : null,
    //   frame_width: frameTemp.width ? frameTemp.width?.trim() : null,
    //   weight: weightTemp ? weightTemp?.trim() : null,
    //   unpacked_weight: unpacked_weightTemp ? unpacked_weightTemp?.trim() : null,
    //   artist: artistName,
    //   artist_id: artistId,
    //   medium: mediumName,
    //   medium_id: mediumId,
    //   art_type: typeName,
    //   art_type_id: typeId,
    //   year: yearVar,
    //   edition: editionVar,
    //   signature: signatureVar,
    //   labeled: labeledVar,
    //   clientinv_display: titleVar,
    // };
    // var tempFrameFixtureList = [];
    // var counterFF = 0;
    // selectedFrameFixtureList.forEach(element => {
    //   tempFrameFixtureList.push({
    //     condition_report_frame_fixture_pk: {
    //       id_condition_report: counterFF,
    //       text_value: element,
    //     },
    //   });
    //   counterFF++;
    // });
    // var tempHangingSystemList = [];
    // var counterGS = 0;
    // selectedHangingSystemList.forEach(element => {
    //   tempHangingSystemList.push({
    //     condition_report_hanging_system_pk: {
    //       id_condition_report: counterGS,
    //       text_value: element,
    //     },
    //   });
    //   counterGS++;
    // });
    // var tempPackingDetailList = [];
    // var counterPD = 0;
    // selectedPackingDetailList.forEach(element => {
    //   tempPackingDetailList.push({
    //     condition_report_packing_detail_pk: {
    //       id_condition_report: counterPD,
    //       text_value: element,
    //     },
    //   });
    //   counterPD++;
    // });
    // var jsonCondition = {
    //   data: [
    //     {
    //       art_type_name: typeName,
    //       artist_name: artistName,
    //       condition_artwork: conditionOfArtworkVar,
    //       condition_report_frame_fixture_list: tempFrameFixtureList,
    //       condition_report_hanging_system_list: tempHangingSystemList,
    //       condition_report_packing_detail_list: tempPackingDetailList,
    //       date_report: '2021-02-01T16:10:18',
    //       edition: editionVar,
    //       id: props.reportId,
    //       id_job: jobDetail.id,
    //       id_job_inventory: item.id,
    //       id_user: props.userInfo,
    //       labeled: labeledVar,
    //       medium_name: mediumName,
    //       other_text: selectedPackingDetailList.some(
    //         x => x.toUpperCase() == 'OTHER',
    //       )
    //         ? otherText
    //           ? otherText?.trim()
    //           : null
    //         : null,
    //       packed_height: packedTemp.height ? packedTemp.height?.trim() : null,
    //       packed_length: packedTemp.length ? packedTemp.length?.trim() : null,
    //       packed_width: packedTemp.width ? packedTemp.width?.trim() : null,
    //       place_of_exam: placeOfExamVar,
    //       signature: signatureVar,
    //       title: titleVar,
    //       un_packed_height: unpackedTemp.height
    //         ? unpackedTemp.height?.trim()
    //         : null,
    //       un_packed_length: unpackedTemp.length
    //         ? unpackedTemp.length?.trim()
    //         : null,
    //       un_packed_width: unpackedTemp.width
    //         ? unpackedTemp.width?.trim()
    //         : null,
    //       weight: weightTemp ? weightTemp?.trim() : null,
    //       unpacked_weight: unpacked_weightTemp
    //         ? unpacked_weightTemp?.trim()
    //         : null,
    //       year: yearVar,
    //       frame_height: selectedFrameFixtureList.some(
    //         x => x.toUpperCase() == 'FRAMED',
    //       )
    //         ? frameTemp.height
    //           ? frameTemp.height?.trim()
    //           : null
    //         : '',
    //       frame_length: selectedFrameFixtureList.some(
    //         x => x.toUpperCase() == 'FRAMED',
    //       )
    //         ? frameTemp.length
    //           ? frameTemp.length?.trim()
    //           : null
    //         : '',
    //       frame_width: selectedFrameFixtureList.some(
    //         x => x.toUpperCase() == 'FRAMED',
    //       )
    //         ? frameTemp.width
    //           ? frameTemp.width?.trim()
    //           : null
    //         : '',
    //       partial: partial,
    //     },
    //   ],
    //   obj_data: jsonObjData,
    //   total: 1,
    // };
    // await saveToStorageOffline(
    //   CONDITION_REPORT_KEY_STORAGE + jobDetail.id + '_' + item.id,
    //   JSON.stringify(jsonCondition),
    // );
    // const isConnected = await isInternet();
    // if (isConnected) {
    //   const response = await fetchData.Post(urlRequest, bodyRequest);
    //   if (response.ok) {
    //     if (response.data.message == 'SUCCESS') {
    //       if (
    //         preSave &&
    //         props.route.params.condition == null &&
    //         (props.reportId == null || props.reportId == '')
    //       ) {
    //         props.dispatch(
    //           ActionsConditionReport.copyReportId(response.data.body.reportId),
    //         );
    //       }
    //       setCurrentJsonData(jsonObjData);
    //       // if (props.route.params.fromReports) {
    //       //   props.route.params.refresh();
    //       // } else {
    //       //   props.route.params.updateItem(jsonObjData);
    //       // }
    //       if (!preSave) {
    //         Toast.show('Condition report saved successfully', Toast.LONG, [
    //           'UIAlertController',
    //         ]);
    //         props.navigation.goBack();
    //       }
    //       setLoading(false);
    //     } else {
    //       setLoading(false);
    //       if (!preSave) {
    //         Toast.show('Error while saving condition report', Toast.LONG, [
    //           'UIAlertController',
    //         ]);
    //       }
    //     }
    //   } else {
    //     setLoading(false);
    //     if (!preSave) {
    //       Toast.show('Error while saving condition report', Toast.LONG, [
    //         'UIAlertController',
    //       ]);
    //     }
    //   }
    // } else {
    //   var keyName =
    //     REQUEST_CONDITION_REPORT_KEY_STORAGE +
    //     jobDetail.id +
    //     '_' +
    //     item.id;
    //   var jsonRequest = {
    //     url: urlRequest,
    //     body: bodyRequest,
    //     time: new Date().getTime(),
    //     name: keyName,
    //     idInventory: item.id,
    //     type: 'conditionreport',
    //     job: jobDetail.id,
    //   };
    //   await saveToStorageOffline(keyName, JSON.stringify(jsonRequest));
    //   setCurrentJsonData(jsonObjData);
    //   // if (props.route.params.fromReports) {
    //   //   props.route.params.refresh();
    //   // } else {
    //   //   props.route.params.updateItem(jsonObjData);
    //   // }
    //   var stringConditions = await getFromStorageOffline(
    //     CONDITIONS_REPORT_KEY_STORAGE + jobDetail.id,
    //   );
    //   var newItem = false;
    //   var conditionsSave = [];
    //   if (stringConditions) {
    //     conditionsSave = JSON.parse(stringConditions);
    //     var tempIndex = conditionsSave.findIndex(
    //       x => x.id_job_inventory == item.id,
    //     );
    //     if (tempIndex != -1) {
    //       conditionsSave[tempIndex] = {
    //         ...conditionsSave[tempIndex],
    //         name: title?.trim(),
    //         offline: true,
    //         partial: partial,
    //       };
    //       await saveToStorageOffline(
    //         CONDITIONS_REPORT_KEY_STORAGE + jobDetail.id,
    //         JSON.stringify(conditionsSave),
    //       );
    //     } else {
    //       newItem = true;
    //     }
    //   } else {
    //     newItem = true;
    //   }
    //   if (newItem) {
    //     conditionsSave.push({
    //       client_ref: item.clientref,
    //       id_inventory: item.clientinv,
    //       id_job_inventory: item.id,
    //       name: title?.trim(),
    //       report_count: 1,
    //       offline: true,
    //       partial: partial,
    //     });
    //     await saveToStorageOffline(
    //       CONDITIONS_REPORT_KEY_STORAGE + jobDetail.id,
    //       JSON.stringify(conditionsSave),
    //     );
    //   }
    //   if (!preSave) {
    //     props.navigation.goBack();
    //   }
    //   setLoading(false);
    // }
  };

  const selectItem = (item) => {
    // if (item) {
    //   initCondition(item?.id);
    // }
  };

  const filter = async (query) => {
    // if (query.length < 1) {
    //   setItems([]);
    //   return;
    // }
    // const isConnected = await isInternet();
    // if (isConnected) {
    //   const response = await fetchData.Get(
    //     'resources/job/inventory?idjob=' +
    //     jobDetail.id +
    //     '&start=0&limit=10&totalize=1&filter=' +
    //     query,
    //   );
    //   if (response.ok) {
    //     if (response.data.message == 'SUCCESS') {
    //       setItems(response.data.body.data);
    //     }
    //   }
    // } else {
    //   var queryUpper = query.toUpperCase().trim();
    //   var filteredList = offlineInventory.data.filter(
    //     x =>
    //       x.clientinv.toUpperCase().trim().includes(queryUpper) ||
    //       x.clientinv_display.toUpperCase().trim().includes(queryUpper),
    //   );
    //   setItems(filteredList);
    // }
  };

  const autoCompleteArtist = async (query) => {
    // if (query.length < 3) {
    //   setArtists([]);
    //   return;
    // }
    // const isConnected = await isInternet();
    // if (isConnected) {
    //   const response = await fetchData.Get(
    //     'resources/conditionreport/load/artist?query=' + query,
    //   );
    //   if (response.ok) {
    //     if (response.data.message == 'SUCCESS') {
    //       setArtists(response.data.body.data);
    //     }
    //   }
    // } else {
    //   setArtists([]);
    // }
  };

  const selectArtist = (item) => {
    // setArtists([]);
    // if (item) {
    //   setArtist({ id: item?.id, name: item?.title });
    // }
  };

  const selectType = (item) => {
    // setTypes([]);
    // if (item) {
    //   setType({ id: item?.id, name: item?.title });
    // }
  };

  //Medium

  // const comp = (a, b) =>
  //   (a ? a.toLowerCase().trim() : null) === (b ? b.toLowerCase().trim() : null);

  const checkFrameFixture = (item) => {
    // var tempArray = [...selectedFrameFixtureList];
    // if (tempArray.some(x => x == item)) {
    //   var index = tempArray.findIndex(x => x == item);
    //   tempArray.splice(index, 1);
    //   setSelectedFrameFixtureList(tempArray);
    // } else {
    //   tempArray.push(item);
    //   setSelectedFrameFixtureList(tempArray);
    // }
  };

  const checkHangingSystem = (item) => {
    // var tempArray = [...selectedHangingSystemList];
    // if (tempArray.some(x => x == item)) {
    //   var index = tempArray.findIndex(x => x == item);
    //   tempArray.splice(index, 1);
    //   setSelectedHangingSystemList(tempArray);
    // } else {
    //   tempArray.push(item);
    //   setSelectedHangingSystemList(tempArray);
    // }
  };

  const checkPackingDetail = (item) => {
    // var tempArray = [...selectedPackingDetailList];
    // if (tempArray.some(x => x.toUpperCase() == item.toUpperCase())) {
    //   var index = tempArray.findIndex(
    //     x => x.toUpperCase() == item.toUpperCase(),
    //   );
    //   tempArray.splice(index, 1);
    //   setSelectedPackingDetailList(tempArray);
    // } else {
    //   tempArray.push(item);
    //   setSelectedPackingDetailList(tempArray);
    // }
  };

  const goToGallery = (type) => {
    // Keyboard.dismiss();
    // if (item.id) {
    //   props.dispatch(ActionsConditionReport.copyReportType(type));
    //   props.dispatch(ActionsConditionReport.copyReportInventory(item.id));
    //   // navigate("Gallery", { type, type, idInventory: item.id })
    //   navigate('Gallery', { type: type, idInventory: item.id });
    // } else {
    //   Alert.alert('You must select an item');
    // }
  };

  const goToSides = () => {
    // Keyboard.dismiss();
    // if (item.id) {
    //   props.dispatch(ActionsConditionReport.copyReportType('sides'));
    //   props.dispatch(ActionsConditionReport.copyReportInventory(item.id));
    //   navigate('ConditionSides', { type: 'sides', idInventory: item.id });
    // } else {
    //   Alert.alert('You must select an item');
    // }
  };

  useEffect(() => {
    // if (!initial) {
    //   clearTimeout(idTimeOut);
    //   idTimeOut = setTimeout(
    //     () => {
    //       onPartialSave();
    //     },
    //     props.route.params.condition == null &&
    //       (props.reportId == null || props.reportId == '')
    //       ? 500
    //       : 3000,
    //   );
    // }
    // return () => {
    //   clearTimeout(idTimeOut);
    // };
  }, [artist, type]);

  const closeAll = (exceptIndex: number) => {
    autocompleteRefs.forEach((r, i) => {
      if (i !== exceptIndex && r.current?.close) r.current.close();
    });
  };

  const PackingDetailListOrdered = useMemo(() => {
    if (packingDetailList) {
      return moveOtherToEnd(packingDetailList).map((x) => ({
        id: x.id,
        title: x.name,
      }));
    } else {
      return [];
    }
  }, [packingDetailList]);

  const onSelectItem = useCallback(
    (item: AutocompleteDropdownItem | null) => {
      if (items && item) {
        const mItem = items.find((x) => x.id === Number(item.id));
        if (mItem) {
          setSelectedItem(mItem);
        }
      }
    },
    [items, setSelectedItem],
  );

  const onInitSubmit = useCallback(
    (props: ConditionReportSchemaType) => {
      saveConditionAsync({
        id: null,
        idJob: jobDetail?.id!,
        idInventory: '123',
        partial: true,

        artistName: props.artistName?.title,
        artTypeName: props.artTypeName?.title,

        placeOfExam: props.placeOfExam,
        conditionArtWork: props.conditionArtWork,
        edition: props.edition,
        frame_height: props.frame_height,
        frame_length: props.frame_length,
        frame_width: props.frame_width,
        labeled: props.labeled,
        mediumName: props.mediumName,
        otherText: props.packing_details_other,
        signature: props.signature,
        title: props.title,
        year: props.year,

        packed_height: props.packed_height,
        packed_length: props.packed_length,
        packed_width: props.packed_width,
        un_packed_height: props.un_packed_height,
        un_packed_length: props.un_packed_length,
        un_packed_width: props.un_packed_width,
        unpacked_weight: props.unpacked_weight,
        weight: props.weight,

        frameFixture: props.frameFixture,
        hangingSystem: props.hangingSystem,
        packingDetail: props.packingDetail,
      });
    },
    [saveConditionAsync],
  );

  return (
    <View style={[styles.container]}>
      {/* {isLoading && <GeneralLoading />} */}

      {showDialog && (
        <>
          <TouchableOpacity
            onPress={() => hideDialog()}
            style={GLOBAL_STYLES.backgroundOpacity}></TouchableOpacity>
        </>
      )}

      <View style={[{backgroundColor: 'white'}]}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <View style={styles.backBtn}>
              <Icon
                name="chevron-left"
                color="#959595"
                type="light"
                size={15}
              />
              <Text style={styles.backBtnText}>Item detail</Text>
            </View>
          </TouchableOpacity>

          <View style={{flexDirection: 'row'}}></View>
        </View>

        <View style={[styles.lateralPadding, styles.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Condition Report
          </Text>
        </View>
      </View>

      <MinRoundedView />
      <BasicFormProvider>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled">
          <View
            style={[
              {
                paddingTop: 20,
              },
              styles.lateralPadding,
            ]}>
            {fromReports && (
              <CustomAutocomplete
                key={'item'}
                onOpenSuggestionsList={(isOpen) => isOpen && closeAll(0)}
                dataSet={
                  items?.map((x) => ({
                    id: x.id.toString(),
                    title: `${x.clientinv} ${x.clientinv_display}`,
                  }))!
                }
                textInputProps={{
                  placeholder: 'Search an item',
                }}
                controller={(controller) => {
                  autocompleteRefs[0].current = controller;
                }}
                onChangeText={checkItem}
                onSelectItem={(item) => onSelectItem(item)}
                initialValue={
                  selectedItem?.id
                    ? {
                        id: selectedItem.id.toString(),
                        title: selectedItem.clientinv,
                      }
                    : undefined
                }
                suggestionsListMaxHeight={250}
                flatListProps={{
                  nestedScrollEnabled: true, // ayuda en Android
                }}
                containerStyle={[
                  GLOBAL_STYLES.input,
                  Platform.select({ios: {zIndex: 999 + 0}, android: {}}),
                ]}
              />
              // <AutocompleteContext
              //   key={'item'}
              //   name="item"
              //   onOpenSuggestionsList={(isOpen) => isOpen && closeAll(0)}
              //   dataSet={
              //     items?.map((x) => ({
              //       id: x.id.toString(),
              //       title: x.clientinv,
              //     }))!
              //   }
              //   textInputProps={{
              //     placeholder: 'Search an item',
              //   }}
              //   controllerRef={(controller) => {
              //     autocompleteRefs[0].current = controller;
              //   }}
              //   onChangeText={checkItem}
              //   initialValue={
              //     selectedItem?.id
              //       ? {
              //           id: selectedItem.id.toString(),
              //           title: selectedItem.clientinv,
              //         }
              //       : undefined
              //   }
              //   suggestionsListMaxHeight={250}
              //   flatListProps={{
              //     nestedScrollEnabled: true, // ayuda en Android
              //   }}
              //   containerStyle={[
              //     GLOBAL_STYLES.input,
              //     Platform.select({ios: {zIndex: 999 + 0}, android: {}}),
              //   ]}
              // />
            )}

            <View style={{marginTop: 15, marginBottom: 15}}>
              <View style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
                <View style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
                  <Text style={[GLOBAL_STYLES.bold, styles.textColor]}>
                    Client Name
                  </Text>
                </View>
                <View style={[GLOBAL_STYLES.fifty]}>
                  <Text style={[styles.textColor]}>
                    {jobDetail?.client_name}
                  </Text>
                </View>
              </View>

              <View style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
                <View style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
                  <Text style={[GLOBAL_STYLES.bold, styles.textColor]}>
                    Client Ref
                  </Text>
                </View>
                <View style={[GLOBAL_STYLES.fifty]}>
                  <Text style={[styles.textColor]}>
                    {selectedItem?.clientref ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
                <View style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
                  <Text style={[GLOBAL_STYLES.bold, styles.textColor]}>
                    UOVO WO Number
                  </Text>
                </View>
                <View style={[GLOBAL_STYLES.fifty]}>
                  <Text style={[styles.textColor]}>
                    {jobDetail?.netsuite_order}
                  </Text>
                </View>
              </View>

              <View style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
                <View style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
                  <Text style={[GLOBAL_STYLES.bold, styles.textColor]}>
                    UOVO Object ID #
                  </Text>
                </View>
                <View style={[GLOBAL_STYLES.fifty]}>
                  <Text style={[styles.textColor]}>
                    {selectedItem?.clientinv ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
                <View style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
                  <Text style={[GLOBAL_STYLES.bold, styles.textColor]}>
                    Examiner name
                  </Text>
                </View>
                <View style={[GLOBAL_STYLES.fifty]}>
                  <Text style={[styles.textColor]}>
                    {sessionUser?.user_name} {sessionUser?.user_last_name}
                  </Text>
                </View>
              </View>

              <View style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
                <View style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
                  <Text style={[GLOBAL_STYLES.bold, styles.textColor]}>
                    Date of examination
                  </Text>
                </View>
                <View style={[GLOBAL_STYLES.fifty]}>
                  <Text style={[styles.textColor]}>
                    {examinationDate.toDateString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.blankSpace}></View>

            <Wrapper style={{gap: 10}}>
              <Wrapper>
                <Text style={GLOBAL_STYLES.inputTitle}>Place of exam</Text>
                <BottomSheetSelectInputContext
                  label="Search"
                  currentId="place_of_exam"
                  options={
                    placeOfExamList?.map((x) => ({id: x, name: x})) ?? []
                  }
                  placeholder="Select an option"
                  snapPoints={['95%']}
                  containerStyle={GLOBAL_STYLES.input}
                />
              </Wrapper>

              <Wrapper>
                <Text style={GLOBAL_STYLES.inputTitle}>Artist</Text>
                <AutocompleteContext
                  key={'artist'}
                  name="artist"
                  onOpenSuggestionsList={(isOpen) => isOpen && closeAll(1)}
                  dataSet={
                    artists?.map((x) => ({
                      id: x.id.toString(),
                      title: x.name,
                    }))!
                  }
                  textInputProps={{
                    placeholder: 'Search an artist',
                  }}
                  controllerRef={(controller) => {
                    autocompleteRefs[1].current = controller;
                  }}
                  onChangeText={checkArtist}
                  initialValue={
                    artist?.id
                      ? {
                          id: artist.id.toString(),
                          title: artist.name,
                        }
                      : undefined
                  }
                  suggestionsListMaxHeight={250}
                  flatListProps={{
                    nestedScrollEnabled: true, // ayuda en Android
                  }}
                  containerStyle={[
                    GLOBAL_STYLES.input,
                    Platform.select({ios: {zIndex: 999 + 0}, android: {}}),
                  ]}
                />
              </Wrapper>

              <InputTextContext
                currentId="title"
                label="Title"
                autoCapitalize="sentences"
              />

              <Wrapper>
                <Text style={GLOBAL_STYLES.inputTitle}>Type</Text>
                <AutocompleteContext
                  key={'type'}
                  name="artTypeName"
                  onOpenSuggestionsList={(isOpen) => isOpen && closeAll(2)}
                  dataSet={
                    types?.map((x) => ({
                      id: x.id.toString(),
                      title: x.name,
                    }))!
                  }
                  textInputProps={{
                    placeholder: 'Search a type',
                  }}
                  controllerRef={(controller) => {
                    autocompleteRefs[2].current = controller;
                  }}
                  onChangeText={checkType}
                  initialValue={
                    type?.id
                      ? {
                          id: type.id.toString(),
                          title: type.name,
                        }
                      : undefined
                  }
                  suggestionsListMaxHeight={250}
                  flatListProps={{
                    nestedScrollEnabled: true, // ayuda en Android
                  }}
                  containerStyle={[
                    GLOBAL_STYLES.input,
                    Platform.select({ios: {zIndex: 999 + 1}, android: {}}),
                  ]}
                />
              </Wrapper>

              <InputTextContext
                currentId="medium"
                label="Medium"
                autoCapitalize="sentences"
                numberOfLines={1}
                multiline={false}
                maxLength={300}
              />

              <InputTextContext currentId="year" label="Year" maxLength={20} />

              <InputTextContext
                currentId="edition"
                label="Edition"
                maxLength={20}
              />

              <InputTextContext
                currentId="signature"
                label="Signature"
                maxLength={50}
              />

              <InputTextContext
                currentId="labeled"
                label="Labeled"
                maxLength={50}
              />
            </Wrapper>

            <View style={styles.blankSpace}></View>
            <View style={[GLOBAL_STYLES.row, {alignItems: 'center'}]}>
              <Text style={[styles.title]}>Dimensions</Text>
            </View>

            <Text style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Packed
            </Text>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Height (In)</Text>
              <InputTextContext
                currentId="packed_height"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Length (In)</Text>
              <InputTextContext
                currentId="packed_length"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Width (In)</Text>
              <InputTextContext
                currentId="packed_width"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>

            <Text style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Artwork
            </Text>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Height (In)</Text>
              <InputTextContext
                currentId="unpacked_height"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Length (In)</Text>
              <InputTextContext
                currentId="unpacked_length"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Width (In)</Text>
              <InputTextContext
                currentId="unpacked_width"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>

            <View style={styles.blankSpace}></View>
            <View style={[GLOBAL_STYLES.row, {alignItems: 'center'}]}>
              <Text style={[styles.title]}>Weight</Text>
            </View>

            <Text style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Unpacked
            </Text>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Weight (Lb)</Text>
              <InputTextContext
                currentId="weight_unpacked"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>

            <Text style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Packed
            </Text>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Text style={[styles.subtitle]}>Weight (Lb)</Text>
              <InputTextContext
                currentId="weight_packed"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </View>

            <View style={styles.blankSpace}></View>
            <Text style={[styles.title]}>Frame and Fixture</Text>

            <CheckBoxContext
              options={FRAME_FIXTURE_LIST?.map((x) => ({id: x, title: x}))}
              currentId="frameFixture"
              columns={2}
            />

            <FramedContext name="frameFixture" />

            <View style={styles.blankSpace}></View>
            <Text style={[styles.title]}>Hanging System</Text>

            <CheckBoxContext
              options={HANGING_SYSTEM_LIST?.map((x) => ({id: x, title: x}))}
              currentId="hangingSystem"
              columns={2}
            />

            <View style={styles.blankSpace}></View>
            <Text style={[styles.title]}>
              {/* Packing details {props.idCondition} {props.idJobInventory} */}
              Packing details
            </Text>

            <CheckBoxContext
              options={PackingDetailListOrdered}
              currentId="packingDetail"
              columns={2}
            />

            <OtherPackingDetailContext name="packingDetail" />

            <View style={styles.blankSpace}></View>
            <Text style={[styles.title]}>Condition of artwork</Text>
            <InputTextContext
              currentId="condition_of_artwork"
              style={styles.inputTextArea}
              multiline={true}
              maxLength={50000}
            />
            <View style={[GLOBAL_STYLES.row, styles.containerOptionsCondition]}>
              {
                <View>
                  {/* <VoiceRecorder
                      ref={refVoiceCondArt}
                      onSpeechResults={e => setConditionOfArtwork(e)}
                    /> */}
                </View>
              }

              {
                //Grammar check
                <View></View>
              }
            </View>

            <View
              style={[
                GLOBAL_STYLES.row,
                {
                  justifyContent: 'space-between',
                  marginTop: 30,
                  marginBottom: 10,
                },
              ]}>
              <TouchableOpacity
                style={[
                  GLOBAL_STYLES.row,
                  styles.btnTakePhoto,
                  {
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => goToGallery('front')}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text style={styles.textTakePhoto}>Front</Text>
                  {/* <OfflineValidation
                      idJob={jobDetail.id}
                      offline={[
                        DELETE_CREPORT_IMAGE_OVERVIEW_OFFLINE_VALIDATION,
                        DELETE_CREPORT_IMAGE_DETAIL_OFFLINE_VALIDATION,
                        REPORT_CONDITION_IMAGE_OFFLINE_VALIDATION[
                        'conditionreport'
                        ],
                        REPORT_CONDITION_IMAGE_DETAIL_OFFLINE_VALIDATION[
                        'conditionreport'
                        ],
                      ]}
                      idInventory={item?.id}
                      reportType={'front'}
                      conditionType={'conditionreport'}
                    /> */}
                </View>

                <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <View style={styles.countTakePhoto}>
                    <Text style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'front')[0].total}
                    </Text>
                  </View>
                  <View style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
                onPress={() => goToGallery('back')}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text style={styles.textTakePhoto}>Back</Text>
                  {/* <OfflineValidation
                      idJob={jobDetail.id}
                      offline={[
                        DELETE_CREPORT_IMAGE_OVERVIEW_OFFLINE_VALIDATION,
                        DELETE_CREPORT_IMAGE_DETAIL_OFFLINE_VALIDATION,
                        REPORT_CONDITION_IMAGE_OFFLINE_VALIDATION[
                        'conditionreport'
                        ],
                        REPORT_CONDITION_IMAGE_DETAIL_OFFLINE_VALIDATION[
                        'conditionreport'
                        ],
                      ]}
                      idInventory={item?.id}
                      reportType={'back'}
                      conditionType={'conditionreport'}
                    /> */}
                </View>

                <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <View style={styles.countTakePhoto}>
                    <Text style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'back')[0].total}
                    </Text>
                  </View>
                  <View style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
              <TouchableOpacity
                style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
                onPress={() => goToSides()}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text style={styles.textTakePhoto}>Sides</Text>
                  {/* <OfflineValidation
                      idJob={jobDetail.id}
                      offline={[
                        DELETE_CREPORT_IMAGE_OVERVIEW_OFFLINE_VALIDATION,
                        DELETE_CREPORT_IMAGE_DETAIL_OFFLINE_VALIDATION,
                        REPORT_CONDITION_IMAGE_OFFLINE_VALIDATION,
                        REPORT_CONDITION_IMAGE_DETAIL_OFFLINE_VALIDATION[
                        'conditionreport'
                        ],
                      ]}
                      idInventory={item?.id}
                      reportType={'sides'}
                      conditionType={'conditionreport'}
                    /> */}
                </View>

                <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <View style={styles.countTakePhoto}>
                    <Text style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'sides')[0].total}
                    </Text>
                  </View>
                  <View style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
                onPress={() => goToGallery('details')}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text style={styles.textTakePhoto}>Details</Text>
                  {/* <OfflineValidation
                      idJob={jobDetail.id}
                      offline={[
                        DELETE_CREPORT_IMAGE_DETAIL_OFFLINE_VALIDATION,
                        REPORT_CONDITION_IMAGE_DETAIL_OFFLINE_VALIDATION[
                        'conditionreport'
                        ],
                      ]}
                      idInventory={item?.id}
                      reportType={'details'}
                      conditionType={'conditionreport'}
                    /> */}
                </View>
                <View style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <View style={styles.countTakePhoto}>
                    <Text style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'details')[0].total}
                    </Text>
                  </View>
                  <View style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{marginTop: 40, marginBottom: 200}}>
              <ButtonSubmit
                onSubmit={onInitSubmit}
                label="Save as"
                icon={<Icon name="save" type="solid" size={16} color="white" />}
              />
            </View>
          </View>
        </ScrollView>
      </BasicFormProvider>

      <Modal
        isVisible={showDialog}
        onRequestClose={() => {
          cancelCondition();
        }}>
        <View style={styles.containerModalClockin}>
          <View style={[styles.modalClockin]}>
            <View
              style={[
                GLOBAL_STYLES.row,
                styles.containerBodyModalClockin,
                {marginTop: 10, paddingHorizontal: 10},
              ]}>
              <View>
                <Text style={[GLOBAL_STYLES.bold]}>CR Status</Text>
              </View>

              <View style={[GLOBAL_STYLES.fiftyFive]}>
                <RNPickerSelect
                  items={statesList}
                  onValueChange={(value) => setPartial(value)}
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 10,
                      right: 5,
                    },
                  }}
                  value={partial}
                  placeholder={{
                    label: 'Select an option',
                    value: null,
                  }}
                  fixAndroidTouchableBug={Platform.OS == 'android'}
                  useNativeAndroidPickerStyle={false}
                  textInputProps={{}}
                  Icon={() => {
                    return (
                      <Icon
                        name="angle-down"
                        size={16}
                        color="#959595"
                        style={{}}
                      />
                    );
                  }}
                />
              </View>
            </View>
            <View
              style={[
                GLOBAL_STYLES.row,
                {
                  justifyContent: 'space-evenly',
                  marginTop: 30,
                  marginBottom: -15,
                },
              ]}>
              <TouchableOpacity
                style={styles.btnModal}
                onPress={() => cancelCondition()}>
                <Text style={styles.btnModalStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnModal}
                onPress={() => onFinalSave()}>
                <Text style={styles.btnModalStyle}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.triangle,
              {
                alignSelf: 'center',
                transform: [{rotate: '180deg'}],
                marginTop: -2,
              },
            ]}></View>
        </View>
      </Modal>
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
  lateralPaddingModal: {
    paddingLeft: 70,
    paddingRight: 70,
  },
  centerAlignment: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  btnOptTop: {
    backgroundColor: '#1155cc',
    justifyContent: 'center',
    height: 27,
    width: 27,
    padding: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topsheet: {
    color: '#3a3a3a',
  },
  title: {
    color: '#3C424A',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#959595',
    marginBottom: 5,
    fontSize: 13,
  },
  subtitleFramed: {
    color: '#959595',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 13,
    textAlign: 'center',
  },
  subtitleBold: {
    color: '#3C424A',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 15,
  },
  inputText: {
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    opacity: 0.7,
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  inputAdditionalInfo: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    opacity: 0.7,
    paddingLeft: 10,
    paddingRight: 10,
    height: 58,
  },
  inputTextAreaOtherText: {
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    opacity: 0.7,
    paddingLeft: 10,
    paddingRight: 10,
    height: 80,
    textAlignVertical: 'top',
    marginTop: 10,
  },
  inputTextArea: {
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    opacity: 0.7,
    paddingLeft: 10,
    paddingRight: 10,
    height: 120,
    textAlignVertical: 'top',
  },
  inputDate: {
    backgroundColor: 'white',
    width: '100%',
    height: 40,
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputStyleDate: {
    color: '#3C424A',
    opacity: 0.7,
  },
  containerPicker: {
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    opacity: 0.7,
    paddingLeft: 0,
    paddingRight: 10,
    height: 40,
  },
  inputPicker: {
    height: 40,
    width: '100%',
    backgroundColor: 'transparent',
    color: '#3C424A',
    opacity: 0.8,
    fontSize: 12,
  },
  arrowPicker: {
    zIndex: -1,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  blankSpace: {
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F7F5F4',
  },
  containerSwitch: {
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  switchLeft: {
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  switchLeftSelected: {
    backgroundColor: '#1155CC',
  },
  switchLeftUnselected: {
    backgroundColor: 'white',
    borderColor: '#d0d0d0',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  switchRight: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    paddingLeft: 10,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  switchRightSelected: {
    backgroundColor: '#1155CC',
  },
  switchRightUnselected: {
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
  },
  textSwitch: {
    fontSize: 13,
  },
  textSwitchSelected: {
    color: 'white',
  },
  textSwitchUnselected: {
    color: '#d0d0d0',
  },
  minPaddingLeft: {
    paddingLeft: 10,
  },
  paddingLeft: {
    paddingLeft: 20,
  },
  minMarginBottom: {
    marginBottom: 5,
  },
  inputDimensions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    width: 85,
    height: 43,
    textAlign: 'center',
    color: '#3C424A',
    fontSize: 12,
  },
  containerMeasure: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  containerOptionsCondition: {
    justifyContent: 'space-between',
    paddingTop: 5,
    alignItems: 'center',
  },
  btnTakePhoto: {
    width: '48%',
    borderRadius: 25,
    height: 40,
    backgroundColor: '#00D3ED',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  textTakePhoto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  countTakePhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#3C424A',
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
    marginLeft: 6,
  },
  containerCountCamera: {
    paddingLeft: 5,
    alignItems: 'center',
  },
  btnSaveInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1155CC',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  btnModal: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#1155CC',
    height: 30,
    alignItems: 'center',
    borderRadius: 50,
  },
  textSaveInfo: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  btnModalStyle: {
    color: 'white',
    fontSize: 14,
  },
  textColor: {
    color: '#959595',
  },
  grammarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  grammar: {
    color: '#1155CC',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  inputSearch: {
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.3,
    backgroundColor: 'white',
    paddingLeft: 10,
    height: 40,
    justifyContent: 'center',
    color: 'black',
  },
  autocompleteText: {
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 12,
    color: '#3C424A',
    textTransform: 'capitalize',
  },
  autocompleteList: {
    marginLeft: 0,
    marginRight: 0,
    borderColor: '#d0d0d0',
    maxHeight: 250,
    paddingHorizontal: 5,
  },
  itemAutocomplete: {
    height: 30,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#F0F0F060',
  },
  dictationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  dictation: {
    color: '#1155CC',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalClockin: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomWidth: 0,
  },
  containerModalClockin: {
    //zIndex: 10000,
    //position: "absolute",
    //bottom: 55,
    //left: 0,
    //right: 0,
    paddingLeft: 15,
    paddingRight: 15,
  },
  containerHeaderModalClockin: {
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  containerBodyModalClockin: {
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  titleLaborCode: {
    alignSelf: 'center',
    color: '#BCBCBC',
    fontSize: 15,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    borderLeftColor: 'transparent',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 0.3,
    borderColor: '#959595',
    borderRadius: 8,
    // color: 'black',
    paddingRight: 15, // to ensure the text is never behind the icon
    width: '100%',
    height: 40,
    color: '#3C424A',
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 0.3,
    borderColor: '#959595',
    borderRadius: 8,
    // color: 'black',
    paddingRight: 15, // to ensure the text is never behind the icon
    width: '100%',
    height: 40,
    color: '#3C424A',
    backgroundColor: 'white',
  },
});

type DependantContextProps = {
  name: string;
};
const FramedContext = ({name}: DependantContextProps) => {
  const value = useWatch({name});
  const {setValue} = useFormContext();

  const isVisible = useMemo(() => {
    return value?.some(
      (x: {id: string; title: string}) => x.id.toUpperCase() === 'FRAMED',
    );
  }, [value]);

  useEffect(() => {
    if (!isVisible) {
      setValue('framed_height', undefined);
      setValue('framed_length', undefined);
      setValue('framed_width', undefined);
    }
  }, [isVisible]);

  return (
    isVisible && (
      <View style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
        <View style={[styles.minPaddingLeft, styles.containerMeasure]}>
          <Text style={[styles.subtitleFramed]}>H</Text>
          <InputTextContext
            currentId="framed_height"
            maxLength={10}
            keyboardType="numeric"
            placeholder="N/A"
            placeholderTextColor="#d0d0d0"
            style={styles.inputDimensions}
          />
        </View>
        <View style={[styles.minPaddingLeft, styles.containerMeasure]}>
          <Text style={[styles.subtitleFramed]}>L</Text>
          <InputTextContext
            currentId="framed_length"
            maxLength={10}
            keyboardType="numeric"
            placeholder="N/A"
            placeholderTextColor="#d0d0d0"
            style={styles.inputDimensions}
          />
        </View>
        <View style={[styles.minPaddingLeft, styles.containerMeasure]}>
          <Text style={[styles.subtitleFramed]}>W</Text>
          <InputTextContext
            currentId="framed_width"
            maxLength={10}
            keyboardType="numeric"
            placeholder="N/A"
            placeholderTextColor="#d0d0d0"
            style={styles.inputDimensions}
          />
        </View>
      </View>
    )
  );
};

const OtherPackingDetailContext = ({name}: DependantContextProps) => {
  const value = useWatch({name});
  const {setValue} = useFormContext();

  const isVisible = useMemo(() => {
    return value?.some(
      (x: {id: string; title: string}) => x.title.toUpperCase() === 'OTHER',
    );
  }, [value]);

  useEffect(() => {
    if (!isVisible) {
      setValue('packing_details_other', undefined);
    }
  }, [isVisible]);

  return (
    isVisible && (
      <InputTextContext
        currentId="packing_details_other"
        style={styles.inputTextAreaOtherText}
        multiline={true}
      />
    )
  );
};
