import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
// import {useFocusEffect} from '@react-navigation/native';
import {
  CONDITION_STATES_LIST,
  FRAME_FIXTURE_LIST,
  HANGING_SYSTEM_LIST,
  QUERY_KEYS,
} from '@api/contants/constants';
import {
  useGetArtists,
  useGetArtTypes,
  useGetPackingDetails,
  useGetPlacesConditionReport,
} from '@api/hooks/HooksGeneralServices';
import {useGetJobInventory} from '@api/hooks/HooksInventoryServices';
import {
  useGetConditionReportbyInventory,
  useSaveConditionReport,
} from '@api/hooks/HooksReportServices';
import {JobInventoryType} from '@api/types/Inventory';
import {CustomAutocomplete} from '@components/commons/autocomplete/CustomAutocomplete';
import {BackButton} from '@components/commons/buttons/BackButton';
import {AutocompleteContext} from '@components/commons/form/AutocompleteContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import CheckBoxContext from '@components/commons/form/CheckBoxContext';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {BottomSheetSelectInput} from '@components/commons/inputs/BottomSheetSelectInput';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import CustomDropdown, {
  BottomSheetRef,
} from '@components/commons/menu/CustomDropdown';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {
  ConditionReportSchema,
  ConditionReportSchemaType,
} from '@generalTypes/schemas';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import useTopSheetStore from '@store/topsheet';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {moveOtherToEnd} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useFormContext, useWatch} from 'react-hook-form';
import {
  AutocompleteDropdownItem,
  IAutocompleteDropdownRef,
} from 'react-native-autocomplete-dropdown';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {Label} from '@components/commons/text/Label';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {COLORS} from '@styles/colors';
import {ScrollView} from 'react-native-gesture-handler';
// import OfflineValidation from '../components/offline/OfflineValidation';

var offlineInventory = {};
let idTimeOut: any = null;
let initial = true;

type Props = NativeStackScreenProps<RootStackParamList, 'ConditionReport'>;

export const ConditionReportScreen = (props: Props) => {
  const examinationDate = new Date();

  const bottomRef = useRef<BottomSheetRef>(null);

  // filters and select
  const [filterItem, setFilterItem] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [filterTypes, setFilterTypes] = useState('');
  const [selectedItem, setSelectedItem] = useState<JobInventoryType | null>(
    null,
  );
  const [temporalForm, setTemporalForm] =
    useState<ConditionReportSchemaType | null>(null);
  const [partial, setPartial] = useState<string | null>(null);

  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const sessionUser = useAuth((d) => d.user);
  const {goBack} = useCustomNavigation();

  // received params
  const fromReports = props.route.params.fromReports;
  const receivedReport = props.route.params.report;

  const {mutateAsync: saveConditionAsync} = useSaveConditionReport();
  const {data: packingDetailList} = useGetPackingDetails();
  const {data: placeOfExamList} = useGetPlacesConditionReport();
  const {data: items, isLoading: isLoadingItems} = useGetJobInventory(
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

  const {data: artists, isLoading: isLoadingArtist} = useGetArtists({
    filter: filterArtist,
  });

  const {data: types, isLoading: isLoadingTypes} = useGetArtTypes({
    filter: filterTypes,
  });

  const {
    data: conditionReportJson,
    isLoading: isLoadingConditionReport,
    refetch,
  } = useGetConditionReportbyInventory({
    idJobInventory: receivedReport?.id_job_inventory ?? selectedItem?.id!,
  });

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.RESUME_CONDITION_REPORT, {idJob: jobDetail?.id}],
    [QUERY_KEYS.TASK_COUNT, {idJob: jobDetail?.id}],
  ]);

  //Autocompletes inputs
  const autocompleteRefs = [
    useRef<IAutocompleteDropdownRef>(null),
    useRef<IAutocompleteDropdownRef>(null),
    useRef<IAutocompleteDropdownRef>(null),
  ];

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

  //autosave
  const [currentJsonData, setCurrentJsonData] = useState(null);

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

  const onPartialSave = () => {
    // if (item.id) {
    //   saveCondition(true);
    // }
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
  }, []);

  const closeAll = (exceptIndex: number) => {
    autocompleteRefs.forEach((r, i) => {
      if (i !== exceptIndex && r.current?.close) r.current.close();
    });
  };

  const packingDetailListOrdered = useMemo(() => {
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

  const initialConditionReport = useMemo(() => {
    if (conditionReportJson?.data?.length! > 0) {
      return conditionReportJson!.data[conditionReportJson!.data.length - 1];
    } else {
      return null;
    }
  }, [conditionReportJson]);

  // reset autocompletes
  useEffect(() => {
    if (autocompleteRefs) {
      // artists
      // autocompleteRefs[1].current?.setItem(
      //   // @ts-ignore
      //   initialConditionReport?.artist_name
      //     ? {
      //         id: initialConditionReport.artist_name,
      //         title: initialConditionReport.artist_name,
      //       }
      //     : undefined,
      // );
      // autocompleteRefs[1].current?.setInputText(
      //   initialConditionReport?.artist_name ?? '',
      // );
      // art types
      // autocompleteRefs[2].current?.setItem(
      //   // @ts-ignore
      //   initialConditionReport?.art_type_name
      //     ? {
      //         id: initialConditionReport?.art_type_name,
      //         title: initialConditionReport?.art_type_name,
      //       }
      //     : undefined,
      // );
      // autocompleteRefs[2].current?.setInputText(
      //   initialConditionReport?.art_type_name ?? '',
      // );
    }
  }, [initialConditionReport]);

  const confirmSave = useCallback(() => {
    if (partial && temporalForm) {
      loadingWrapperPromise(
        saveConditionAsync({
          id: initialConditionReport?.id ?? null,
          idJob: jobDetail?.id!,
          idInventory: currentItem?.id!,
          partial: partial === 'true',
          artistName: temporalForm.artistName?.title,
          artTypeName: temporalForm.artTypeName?.title,

          placeOfExam: temporalForm.placeOfExam,
          conditionArtWork: temporalForm.conditionArtWork,
          edition: temporalForm.edition,
          frame_height: temporalForm.frame_height,
          frame_length: temporalForm.frame_length,
          frame_width: temporalForm.frame_width,
          labeled: temporalForm.labeled,
          mediumName: temporalForm.mediumName,
          otherText: temporalForm.packing_details_other,
          signature: temporalForm.signature,
          title: temporalForm.title,
          year: temporalForm.year,

          packed_height: temporalForm.packed_height,
          packed_length: temporalForm.packed_length,
          packed_width: temporalForm.packed_width,
          un_packed_height: temporalForm.un_packed_height,
          un_packed_length: temporalForm.un_packed_length,
          un_packed_width: temporalForm.un_packed_width,
          unpacked_weight: temporalForm.unpacked_weight,
          weight: temporalForm.weight,

          frameFixture: temporalForm.frameFixture?.map((x) => x.title),
          hangingSystem: temporalForm.hangingSystem?.map((x) => x.title),
          packingDetail: temporalForm.packingDetail?.map((x) => x.title),
        })
          .then((d) => {
            if (d) {
              showToastMessage('Condition report saved successfully');
              refetchAll();
              refetch();
              goBack();
            } else {
              showErrorToastMessage('Error while saving condition report');
            }
          })
          .catch(() => {
            showErrorToastMessage('Error while saving condition report');
          }),
      );
    } else {
      showToastMessage('Please, select a valid option');
    }
  }, [
    initialConditionReport,
    jobDetail,
    temporalForm,
    partial,
    saveConditionAsync,
  ]);

  const onInitSubmit = useCallback(
    (props: ConditionReportSchemaType) => {
      if (bottomRef.current?.press) {
        setPartial(null);
        bottomRef.current?.press();
        setTemporalForm(props);
      }
    },
    [
      confirmSave,
      setPartial,
      saveConditionAsync,
      bottomRef.current,
      setTemporalForm,
    ],
  );

  const currentItem = useMemo(() => {
    if (selectedItem || receivedReport) {
      return {
        id: receivedReport?.id_job_inventory ?? selectedItem?.id,
        clientRef: receivedReport?.client_ref ?? selectedItem?.clientref,
        clientInv: receivedReport?.id_inventory ?? selectedItem?.clientinv,
      };
    } else {
      return null;
    }
  }, [selectedItem, receivedReport]);

  useEffect(() => {
    if (autocompleteRefs[1]) {
      autocompleteRefs[1].current?.toggle();
    }
  }, [isLoadingArtist]);

  console.log('artists');
  console.log(artists);

  return (
    <Wrapper style={[styles.container]}>
      {isLoadingConditionReport && <GeneralLoading />}

      <Wrapper style={[{backgroundColor: 'white'}]}>
        <BackButton onPress={goBack} title="Item detail" />

        <Wrapper style={[styles.lateralPadding, styles.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Condition Report
          </Label>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        keyboardDismissMode="on-drag"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {
            paddingTop: 20,
          },
          styles.lateralPadding,
        ]}>
        {!receivedReport?.id_job_inventory && (
          <CustomAutocomplete
            loading={isLoadingItems}
            key={'item'}
            // onOpenSuggestionsList={(isOpen) => isOpen && closeAll(0)}
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
            showClear={false}
            useFilter={false}
          />
        )}

        <Wrapper style={{marginTop: 15}}>
          <Wrapper style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
            <Wrapper style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
              <Label style={[GLOBAL_STYLES.bold, styles.textColor]}>
                Client Name
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.fifty]}>
              <Label style={[styles.textColor]}>{jobDetail?.client_name}</Label>
            </Wrapper>
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
            <Wrapper style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
              <Label style={[GLOBAL_STYLES.bold, styles.textColor]}>
                Client Ref
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.fifty]}>
              <Label style={[styles.textColor]}>
                {currentItem?.clientRef ?? 'N/A'}
              </Label>
            </Wrapper>
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
            <Wrapper style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
              <Label style={[GLOBAL_STYLES.bold, styles.textColor]}>
                UOVO WO Number
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.fifty]}>
              <Label style={[styles.textColor]}>
                {jobDetail?.netsuite_order}
              </Label>
            </Wrapper>
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
            <Wrapper style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
              <Label style={[GLOBAL_STYLES.bold, styles.textColor]}>
                UOVO Object ID #
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.fifty]}>
              <Label style={[styles.textColor]}>
                {currentItem?.clientInv ?? 'N/A'}
              </Label>
            </Wrapper>
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
            <Wrapper style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
              <Label style={[GLOBAL_STYLES.bold, styles.textColor]}>
                Examiner name
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.fifty]}>
              <Label style={[styles.textColor]}>
                {sessionUser?.user_name} {sessionUser?.user_last_name}
              </Label>
            </Wrapper>
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.row, styles.minMarginBottom]}>
            <Wrapper style={[GLOBAL_STYLES.fifty, styles.paddingLeft]}>
              <Label style={[GLOBAL_STYLES.bold, styles.textColor]}>
                Date of examination
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.fifty]}>
              <Label style={[styles.textColor]}>
                {examinationDate.toDateString()}
              </Label>
            </Wrapper>
          </Wrapper>
        </Wrapper>

        {conditionReportJson?.obj_data && (
          <BasicFormProvider
            resetDefaultValue
            schema={ConditionReportSchema}
            defaultValue={{
              placeOfExam: initialConditionReport?.place_of_exam,
              artistName: {
                id: initialConditionReport?.artist_name,
                title: initialConditionReport?.artist_name,
              },
              title: initialConditionReport?.title,
              mediumName: initialConditionReport?.medium_name,
              year: initialConditionReport?.year,
              edition: initialConditionReport?.edition,
              signature: initialConditionReport?.signature,
              labeled: initialConditionReport?.labeled,

              packed_height: initialConditionReport?.packed_height,
              packed_length: initialConditionReport?.packed_length,
              packed_width: initialConditionReport?.packed_width,
              un_packed_height: initialConditionReport?.un_packed_height,
              un_packed_length: initialConditionReport?.un_packed_length,
              un_packed_width: initialConditionReport?.un_packed_width,

              frame_height: initialConditionReport?.frame_height,
              frame_length: initialConditionReport?.frame_length,
              frame_width: initialConditionReport?.frame_width,

              frameFixture:
                initialConditionReport?.condition_report_frame_fixture_list?.map(
                  (x) => ({
                    id: x.condition_report_frame_fixture_pk.text_value,
                    title: x.condition_report_frame_fixture_pk.text_value,
                  }),
                ),
              hangingSystem:
                initialConditionReport?.condition_report_hanging_system_list?.map(
                  (x) => ({
                    id: x.condition_report_hanging_system_pk.text_value,
                    title: x.condition_report_hanging_system_pk.text_value,
                  }),
                ),
              packingDetail:
                initialConditionReport?.condition_report_packing_detail_list?.map(
                  (x) => ({
                    id: x.condition_report_packing_detail_pk.text_value,
                    title: x.condition_report_packing_detail_pk.text_value,
                  }),
                ),
              conditionArtWork: initialConditionReport?.condition_artwork,
            }}>
            <Wrapper style={styles.blankSpace}></Wrapper>

            <Wrapper style={{gap: 10}}>
              <Wrapper>
                <Label style={GLOBAL_STYLES.inputTitle}>Place of exam</Label>
                <BottomSheetSelectInputContext
                  label="Search"
                  currentId="placeOfExam"
                  options={
                    placeOfExamList?.map((x) => ({id: x, name: x})) ?? []
                  }
                  placeholder="Select an option"
                  snapPoints={['95%']}
                  containerStyle={GLOBAL_STYLES.input}
                />
              </Wrapper>

              <Wrapper>
                <Label style={GLOBAL_STYLES.inputTitle}>Artist</Label>
                <AutocompleteContext
                  loading={isLoadingArtist}
                  key={`artist_${currentItem?.id}_${initialConditionReport?.artist_name}`}
                  name="artistName"
                  // onOpenSuggestionsList={(isOpen) => isOpen && closeAll(1)}
                  dataSet={
                    artists?.map((x) => ({
                      id: x.name,
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
                  suggestionsListMaxHeight={250}
                  flatListProps={{
                    nestedScrollEnabled: true, // ayuda en Android
                  }}
                  containerStyle={[
                    GLOBAL_STYLES.input,
                    Platform.select({ios: {zIndex: 999 + 1}, android: {}}),
                  ]}
                  showClear={false}
                  initialValue={
                    initialConditionReport?.artist_name
                      ? {
                          id: initialConditionReport?.artist_name,
                          title: initialConditionReport?.artist_name,
                        }
                      : undefined
                  }
                />
              </Wrapper>

              <InputTextContext
                currentId="title"
                label="Title"
                autoCapitalize="sentences"
              />

              <Wrapper>
                <Label style={GLOBAL_STYLES.inputTitle}>Type</Label>
                <AutocompleteContext
                  loading={isLoadingTypes}
                  key={`type_${currentItem?.id}_${initialConditionReport?.art_type_name}`}
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
                  suggestionsListMaxHeight={250}
                  flatListProps={{
                    nestedScrollEnabled: true, // ayuda en Android
                  }}
                  containerStyle={[
                    GLOBAL_STYLES.input,
                    Platform.select({ios: {zIndex: 999 + 2}, android: {}}),
                  ]}
                  showClear={false}
                  initialValue={
                    initialConditionReport?.art_type_name
                      ? {
                          id: initialConditionReport?.art_type_name,
                          title: initialConditionReport?.art_type_name,
                        }
                      : undefined
                  }
                />
              </Wrapper>

              <InputTextContext
                currentId="mediumName"
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

            <Wrapper style={styles.blankSpace}></Wrapper>
            <Wrapper style={[GLOBAL_STYLES.row, {alignItems: 'center'}]}>
              <Label style={[styles.title]}>Dimensions</Label>
            </Wrapper>

            <Label style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Packed
            </Label>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Height (In)</Label>
              <InputTextContext
                currentId="packed_height"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Length (In)</Label>
              <InputTextContext
                currentId="packed_length"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Width (In)</Label>
              <InputTextContext
                currentId="packed_width"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>

            <Label style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Artwork
            </Label>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Height (In)</Label>
              <InputTextContext
                currentId="un_packed_height"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Length (In)</Label>
              <InputTextContext
                currentId="un_packed_length"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Width (In)</Label>
              <InputTextContext
                currentId="un_packed_width"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>

            <Wrapper style={styles.blankSpace}></Wrapper>
            <Wrapper style={[GLOBAL_STYLES.row, {alignItems: 'center'}]}>
              <Label style={[styles.title]}>Weight</Label>
            </Wrapper>

            <Label style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Unpacked
            </Label>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Weight (Lb)</Label>
              <InputTextContext
                currentId="unpacked_weight"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>

            <Label style={[styles.subtitleBold, styles.minPaddingLeft]}>
              Packed
            </Label>
            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                styles.minPaddingLeft,
                styles.containerMeasure,
              ]}>
              <Label style={[styles.subtitle]}>Weight (Lb)</Label>
              <InputTextContext
                currentId="weight"
                maxLength={10}
                keyboardType="numeric"
                placeholder="N/A"
                placeholderTextColor="#d0d0d0"
                style={styles.inputDimensions}
              />
            </Wrapper>

            <Wrapper style={styles.blankSpace}></Wrapper>
            <Label style={[styles.title]}>Frame and Fixture</Label>

            <CheckBoxContext
              options={FRAME_FIXTURE_LIST?.map((x) => ({id: x, title: x}))}
              currentId="frameFixture"
              columns={2}
            />

            <FramedContext name="frameFixture" />

            <Wrapper style={styles.blankSpace}></Wrapper>
            <Label style={[styles.title]}>Hanging System</Label>

            <CheckBoxContext
              options={HANGING_SYSTEM_LIST?.map((x) => ({id: x, title: x}))}
              currentId="hangingSystem"
              columns={2}
            />

            <Wrapper style={styles.blankSpace}></Wrapper>
            <Label style={[styles.title]}>
              {/* Packing details {props.idCondition} {props.idJobInventory} */}
              Packing details
            </Label>

            <CheckBoxContext
              options={packingDetailListOrdered?.map((x) => ({
                id: x.title,
                title: x.title,
              }))}
              currentId="packingDetail"
              columns={2}
            />

            <OtherPackingDetailContext name="packingDetail" />

            <Wrapper style={styles.blankSpace}></Wrapper>
            <Label style={[styles.title]}>Condition of artwork</Label>
            <InputTextContext
              currentId="conditionArtWork"
              style={styles.inputTextArea}
              multiline={true}
              maxLength={50000}
            />
            <Wrapper
              style={[GLOBAL_STYLES.row, styles.containerOptionsCondition]}>
              {
                <Wrapper>
                  {/* <VoiceRecorder
                      ref={refVoiceCondArt}
                      onSpeechResults={e => setConditionOfArtwork(e)}
                    /> */}
                </Wrapper>
              }

              {
                //Grammar check
                <Wrapper></Wrapper>
              }
            </Wrapper>

            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                {
                  justifyContent: 'space-between',
                  marginTop: 30,
                  marginBottom: 10,
                },
              ]}>
              <PressableOpacity
                style={[
                  GLOBAL_STYLES.row,
                  styles.btnTakePhoto,
                  {
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => goToGallery('front')}>
                <Wrapper
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Label style={styles.textTakePhoto}>Front</Label>
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
                </Wrapper>

                <Wrapper
                  style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <Wrapper style={styles.countTakePhoto}>
                    <Label style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'front')[0].total}
                    </Label>
                  </Wrapper>
                  <Wrapper style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </Wrapper>
                </Wrapper>
              </PressableOpacity>

              <PressableOpacity
                style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
                onPress={() => goToGallery('back')}>
                <Wrapper
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Label style={styles.textTakePhoto}>Back</Label>
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
                </Wrapper>

                <Wrapper
                  style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <Wrapper style={styles.countTakePhoto}>
                    <Label style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'back')[0].total}
                    </Label>
                  </Wrapper>
                  <Wrapper style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </Wrapper>
                </Wrapper>
              </PressableOpacity>
            </Wrapper>

            <Wrapper
              style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
              <PressableOpacity
                style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
                onPress={() => goToSides()}>
                <Wrapper
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Label style={styles.textTakePhoto}>Sides</Label>
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
                </Wrapper>

                <Wrapper
                  style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <Wrapper style={styles.countTakePhoto}>
                    <Label style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'sides')[0].total}
                    </Label>
                  </Wrapper>
                  <Wrapper style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </Wrapper>
                </Wrapper>
              </PressableOpacity>

              <PressableOpacity
                style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
                onPress={() => goToGallery('details')}>
                <Wrapper
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Label style={styles.textTakePhoto}>Details</Label>
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
                </Wrapper>
                <Wrapper
                  style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
                  <Wrapper style={styles.countTakePhoto}>
                    <Label style={styles.numberCount} allowFontScaling={false}>
                      {totalPhotos.filter((x) => x.type == 'details')[0].total}
                    </Label>
                  </Wrapper>
                  <Wrapper style={styles.viewCamera}>
                    <Icon name="camera" type="solid" color="white" size={25} />
                  </Wrapper>
                </Wrapper>
              </PressableOpacity>
            </Wrapper>

            <Wrapper style={{marginTop: 40, marginBottom: 100}}>
              <CustomDropdown ref={bottomRef} button={<></>}>
                {({close}) => (
                  <Wrapper style={[styles.modalClockin]}>
                    <Wrapper
                      style={[
                        GLOBAL_STYLES.row,
                        styles.containerBodyModalClockin,
                      ]}>
                      <Wrapper>
                        <Label style={[GLOBAL_STYLES.bold]}>CR Status</Label>
                      </Wrapper>

                      <Wrapper style={[GLOBAL_STYLES.fiftyFive]}>
                        <BottomSheetSelectInput
                          onChange={(item) => setPartial(item as string)}
                          options={CONDITION_STATES_LIST}
                          placeholder="Select an option"
                          searchable={false}
                          snapPoints={['50%']}
                          label="Select an option"
                          value={partial}
                        />
                      </Wrapper>
                    </Wrapper>
                    <Wrapper
                      style={[
                        GLOBAL_STYLES.row,
                        {
                          justifyContent: 'space-evenly',
                          marginTop: 30,
                        },
                      ]}>
                      <PressableOpacity
                        style={styles.btnModal}
                        onPress={() => {
                          close();
                          setPartial(null);
                        }}>
                        <Label style={styles.btnModalStyle}>Cancel</Label>
                      </PressableOpacity>
                      <PressableOpacity
                        style={styles.btnModal}
                        onPress={() => {
                          close();
                          confirmSave();
                        }}>
                        <Label style={styles.btnModalStyle}>Confirm</Label>
                      </PressableOpacity>
                    </Wrapper>
                  </Wrapper>
                )}
              </CustomDropdown>
              <ButtonSubmit
                onSubmit={onInitSubmit}
                label="Save as"
                icon={<Icon name="save" type="solid" size={16} color="white" />}
                showValidationError
              />
            </Wrapper>
          </BasicFormProvider>
        )}
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  blankSpace: {
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F7F5F4',
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
  btnModal: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: COLORS.primary,
    height: 30,
    alignItems: 'center',
    borderRadius: 50,
  },
  btnModalStyle: {
    color: 'white',
    fontSize: 14,
  },
  textColor: {
    color: '#959595',
  },
  modalClockin: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 10,
  },
  containerBodyModalClockin: {
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingHorizontal: 10,
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
      setValue('frame_height', undefined);
      setValue('frame_length', undefined);
      setValue('frame_width', undefined);
    }
  }, [isVisible]);

  return (
    isVisible && (
      <Wrapper style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
        <Wrapper style={[styles.minPaddingLeft, styles.containerMeasure]}>
          <Label style={[styles.subtitleFramed]}>H</Label>
          <InputTextContext
            currentId="frame_height"
            maxLength={10}
            keyboardType="numeric"
            placeholder="N/A"
            placeholderTextColor="#d0d0d0"
            style={styles.inputDimensions}
          />
        </Wrapper>
        <Wrapper style={[styles.minPaddingLeft, styles.containerMeasure]}>
          <Label style={[styles.subtitleFramed]}>L</Label>
          <InputTextContext
            currentId="frame_length"
            maxLength={10}
            keyboardType="numeric"
            placeholder="N/A"
            placeholderTextColor="#d0d0d0"
            style={styles.inputDimensions}
          />
        </Wrapper>
        <Wrapper style={[styles.minPaddingLeft, styles.containerMeasure]}>
          <Label style={[styles.subtitleFramed]}>W</Label>
          <InputTextContext
            currentId="frame_width"
            maxLength={10}
            keyboardType="numeric"
            placeholder="N/A"
            placeholderTextColor="#d0d0d0"
            style={styles.inputDimensions}
          />
        </Wrapper>
      </Wrapper>
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
