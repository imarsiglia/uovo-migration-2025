import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Platform, ScrollView, StyleSheet} from 'react-native';
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
  useGetTotalPhotosConditionReport,
  useSaveConditionReport,
} from '@api/hooks/HooksReportServices';
import {ConditionReportType, JobInventoryType} from '@api/types/Inventory';
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
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import useTopSheetStore from '@store/topsheet';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {generateUUID, moveOtherToEnd} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useFormContext, useWatch} from 'react-hook-form';
import {AutocompleteDropdownItem} from 'react-native-autocomplete-dropdown';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {Label} from '@components/commons/text/Label';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {COLORS} from '@styles/colors';
import useInventoryStore from '@store/inventory';
import isEqual from 'lodash.isequal';
import {offlineUpdateConditionReport} from '@features/conditionReport/offline';
import {useOnline} from '@hooks/useOnline';
import useConditionStore from '@store/condition';
import {
  CONDITION_PHOTO_SIDE_TYPE,
  CONDITION_TYPES,
  ConditionPhotoSideType,
} from '@api/types/Condition';
// import OfflineValidation from '../components/offline/OfflineValidation';

let autosaveInitial = false;
const delay = 3000;

type Props = NativeStackScreenProps<RootStackParamList, 'ConditionReport'>;

export const ConditionReportScreen = (props: Props) => {
  const examinationDate = new Date();
  const bottomRef = useRef<BottomSheetRef>(null);
  const [renderForm, setRenderForm] = useState(false);

  // filters and select
  // const [filterItem, setFilterItem] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [filterTypes, setFilterTypes] = useState('');
  const [selectedItem, setSelectedItem] = useState<JobInventoryType | null>(
    null,
  );
  const [temporalForm, setTemporalForm] =
    useState<ConditionReportSchemaType | null>(null);
  const [partial, setPartial] = useState<string | null>(null);

  const {topSheetFilter, inventoryFilter, orderFilter, orderType} =
    useInventoryStore();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const sessionUser = useAuth((d) => d.user);
  const {goBack, navigate} = useCustomNavigation();

  // received params
  const fromReports = props.route.params.fromReports;
  const receivedReport = props.route.params.report;
  const receivedItem = props.route.params.item;

  const {mutateAsync: saveConditionAsync} = useSaveConditionReport();
  const {data: packingDetailList} = useGetPackingDetails();
  const {data: placeOfExamList} = useGetPlacesConditionReport();
  const {data: items} = useGetJobInventory({
    idJob: jobDetail?.id!,
  });

  const {data: artists} = useGetArtists({
    filter: filterArtist,
  });

  const {data: types} = useGetArtTypes({
    filter: filterTypes,
  });

  const {
    data: conditionReportJson,
    isLoading: isLoadingConditionReport,
    refetch,
    isFetched,
  } = useGetConditionReportbyInventory({
    idJobInventory:
      receivedReport?.id_job_inventory ?? receivedItem?.id ?? selectedItem?.id!,
  });

  const {online} = useOnline();

  const {hardRefreshMany} = useRefreshIndicator([
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: jobDetail!.id,
        filter: topSheetFilter,
        orderFilter,
        orderType,
      },
    ],
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: jobDetail!.id,
        filter: inventoryFilter,
        orderFilter,
        orderType,
      },
    ],
  ]);

  //Autocompletes inputs
  const autocompleteRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  //Take dictation
  const refVoiceCondArt = useRef(null);

  useEffect(() => {}, [isFetched]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (props.reportId) {
  //       getTotalPhotos();
  //     }
  //   }, [props.reportId]),
  // );

  const {
    setConditionPhotoType,
    setConditionType,
    setConditionId,
    setInventoryId,
    setConditionPhotoSubtype
  } = useConditionStore();

  useEffect(() => {
    setConditionType(CONDITION_TYPES.ConditionReport);
  }, []);

  const currentInventoryItem = useMemo(() => {
    return receivedItem ?? selectedItem;
  }, [selectedItem, receivedItem]);

  const currentItem = useMemo(() => {
    if (selectedItem || receivedReport || receivedItem) {
      return {
        id:
          receivedReport?.id_job_inventory ??
          receivedItem?.id ??
          selectedItem?.id,
        clientRef:
          receivedReport?.client_ref ??
          receivedItem?.clientref ??
          selectedItem?.clientref,
        clientInv:
          receivedReport?.id_inventory ??
          receivedItem?.clientinv ??
          selectedItem?.clientinv,
      };
    } else {
      return null;
    }
  }, [selectedItem, receivedReport, receivedItem]);

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.RESUME_CONDITION_REPORT, {idJob: jobDetail?.id}],
    [QUERY_KEYS.TASK_COUNT, {idJob: jobDetail?.id}],
    [QUERY_KEYS.INVENTORY_ITEM_DETAIL, {id: currentItem?.id!}],
  ]);

  // const checkItem = useCallback(
  //   (value: string) => {
  //     setFilterItem(value.trim());
  //     if (autocompleteRefs[0].current) {
  //       autocompleteRefs[0].current.open();
  //     }
  //   },
  //   [setFilterItem],
  // );

  useEffect(() => {
    setInventoryId(currentItem?.id);
  }, [currentItem?.id]);

  const checkArtist = useCallback(
    (value: string) => {
      setFilterArtist(value.trim());
      // if (autocompleteRefs[1].current) {
      //   autocompleteRefs[1].current.open();
      // }
    },
    [setFilterArtist],
  );

  const checkType = useCallback(
    (value: string) => {
      setFilterTypes(value.trim());
      // if (autocompleteRefs[2].current) {
      //   autocompleteRefs[2].current.open();
      // }
    },
    [setFilterTypes],
  );

  const goToGallery = useCallback(
    (type: ConditionPhotoSideType) => {
      setConditionPhotoSubtype(undefined);
      setConditionPhotoType(type);
      navigate(RoutesNavigation.GalleryCondition);
    },
    [setConditionPhotoType, navigate],
  );

  const goToSides = () => {
    setConditionPhotoType("sides");
    navigate(RoutesNavigation.ConditionSides);
    // Keyboard.dismiss();
    // if (item.id) {
    //   props.dispatch(ActionsConditionReport.copyReportType('sides'));
    //   props.dispatch(ActionsConditionReport.copyReportInventory(item.id));
    //   navigate('ConditionSides', { type: 'sides', idInventory: item.id });
    // } else {
    //   Alert.alert('You must select an item');
    // }
  };

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

  const initialConditionReport: ConditionReportType | null = useMemo(() => {
    if (conditionReportJson?.data?.length! > 0) {
      return conditionReportJson!.data[conditionReportJson!.data.length - 1];
    } else {
      if (currentInventoryItem?.id) {
        return {
          medium_name: currentInventoryItem.medium,
          artist_name: currentInventoryItem.artist,
          title: currentInventoryItem.clientinv_display,
          year: currentInventoryItem.year,
          edition: currentInventoryItem.edition,
          packed_height: currentInventoryItem.packed_height,
          packed_length: currentInventoryItem.packed_length,
          packed_width: currentInventoryItem.packed_width,
          un_packed_height: currentInventoryItem.unpacked_height,
          un_packed_length: currentInventoryItem.unpacked_length,
          un_packed_width: currentInventoryItem.unpacked_width,
        } as ConditionReportType;
      } else {
        return null;
      }
    }
  }, [conditionReportJson, currentInventoryItem]);

  const {data: photosTotal} = useGetTotalPhotosConditionReport({
    id: initialConditionReport?.id!,
  });

  useEffect(() => {
    setConditionId(initialConditionReport?.id!);
  }, [initialConditionReport?.id!]);

  const totalPhotos = useMemo(() => {
    const init = {
      front: 0,
      back: 0,
      details: 0,
      sides: 0,
    };

    if (!Array.isArray(photosTotal) || photosTotal.length === 0) return init;

    return photosTotal.reduce((acc, cur) => {
      switch (cur.type) {
        case CONDITION_PHOTO_SIDE_TYPE.Front:
          acc.front = cur.total ?? 0;
          break;
        case CONDITION_PHOTO_SIDE_TYPE.Back:
          acc.back = cur.total ?? 0;
          break;
        case CONDITION_PHOTO_SIDE_TYPE.Details:
          acc.details = cur.total ?? 0;
          break;
        case CONDITION_PHOTO_SIDE_TYPE.Sides:
          acc.sides = cur.total ?? 0;
          break;
        default:
          break;
      }
      return acc;
    }, init);
  }, [photosTotal]);

  const saveAsync = useCallback(
    (form: ConditionReportSchemaType, partial?: string) => {
      return saveConditionAsync({
        id: initialConditionReport?.id ?? null,
        idJob: jobDetail?.id!,
        idInventory: currentItem?.id!,
        partial: partial === 'true',
        artistName: form.artistName?.title,
        artTypeName: form.artTypeName?.title,

        placeOfExam: form.placeOfExam,
        conditionArtWork: form.conditionArtWork,
        edition: form.edition,
        frame_height: form.frame_height,
        frame_length: form.frame_length,
        frame_width: form.frame_width,
        labeled: form.labeled,
        mediumName: form.mediumName,
        otherText: form.packing_details_other,
        signature: form.signature,
        title: form.title,
        year: form.year,

        packed_height: form.packed_height,
        packed_length: form.packed_length,
        packed_width: form.packed_width,
        un_packed_height: form.un_packed_height,
        un_packed_length: form.un_packed_length,
        un_packed_width: form.un_packed_width,
        unpacked_weight: form.unpacked_weight,
        weight: form.weight,

        frameFixture: form.frameFixture?.map((x) => x.title),
        hangingSystem: form.hangingSystem?.map((x) => x.title),
        packingDetail: form.packingDetail?.map((x) => x.title),
      });
    },
    [
      saveConditionAsync,
      currentItem?.id,
      jobDetail?.id,
      initialConditionReport?.id,
    ],
  );

  const saveReportOffline = useCallback(
    (form: ConditionReportSchemaType, partial?: string) => {
      const clientId = initialConditionReport?.clientId ?? generateUUID();
      return offlineUpdateConditionReport({
        id: initialConditionReport?.id ?? null,
        clientId,
        idJob: jobDetail?.id!,
        idInventory: currentItem?.id!,
        partial: partial === 'true',
        artistName: form.artistName?.title,
        artTypeName: form.artTypeName?.title,

        placeOfExam: form.placeOfExam,
        conditionArtWork: form.conditionArtWork,
        edition: form.edition,
        frame_height: form.frame_height,
        frame_length: form.frame_length,
        frame_width: form.frame_width,
        labeled: form.labeled,
        mediumName: form.mediumName,
        otherText: form.packing_details_other,
        signature: form.signature,
        title: form.title,
        year: form.year,

        packed_height: form.packed_height,
        packed_length: form.packed_length,
        packed_width: form.packed_width,
        un_packed_height: form.un_packed_height,
        un_packed_length: form.un_packed_length,
        un_packed_width: form.un_packed_width,
        unpacked_weight: form.unpacked_weight,
        weight: form.weight,

        frameFixture: form.frameFixture?.map((x) => x.title),
        hangingSystem: form.hangingSystem?.map((x) => x.title),
        packingDetail: form.packingDetail?.map((x) => x.title),
      });
    },
    [
      partial,
      currentItem?.id,
      jobDetail?.id,
      initialConditionReport?.id,
      offlineUpdateConditionReport,
    ],
  );

  const confirmSave = useCallback(() => {
    if (partial && temporalForm) {
      if (online) {
        loadingWrapperPromise(
          saveAsync(temporalForm, partial)
            .then((d) => {
              if (d) {
                showToastMessage('Condition report saved successfully');
                refetchAll();
                refetch();
                hardRefreshMany();
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
        saveReportOffline(temporalForm, partial);
      }
    } else {
      showToastMessage('Please, select a valid option');
    }
  }, [temporalForm, partial, saveAsync, online]);

  const onInitSubmit = useCallback(
    (props: ConditionReportSchemaType) => {
      if (bottomRef.current?.press) {
        // abrir modal partial / final
        setPartial(null);
        bottomRef.current?.press();
        setTemporalForm(props);
      }
    },
    [setPartial, setTemporalForm],
  );

  const AutoSaveConditionReport = () => {
    const formData = useWatch<ConditionReportSchemaType>(); // valores del formulario
    // @ts-ignore
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const firstRun = useRef(true);
    const lastSavedRef = useRef<ConditionReportSchemaType | null>(null);
    const [saving, setSaving] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    useEffect(() => {
      // evito ejecutar al montar (cuando useWatch dispara por default con los valores iniciales)
      if (firstRun.current) {
        firstRun.current = false;
        // opcional: actualizar lastSavedRef con los datos iniciales si quieres evitar guardarlos inmediatamente
        // lastSavedRef.current = formData ? { ...formData } : null;
        return;
      }

      // no autosave si no hay item seleccionado
      if (!currentItem?.id) return;

      // si no hay cambios respecto al último guardado, no programo nada
      if (lastSavedRef.current && isEqual(lastSavedRef.current, formData)) {
        return;
      }

      // limpio timeout anterior
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // programo el autosave
      timerRef.current = setTimeout(async () => {
        // otra comprobación por seguridad
        if (!isMountedRef.current) return;
        // otra vez: si no hay cambios, no guardamos
        if (lastSavedRef.current && isEqual(lastSavedRef.current, formData)) {
          return;
        }

        try {
          setSaving(true);
          // Esperamos la promesa y guardamos. saveAsync viene de tu scope superior.
          const res = await saveAsync(
            formData as ConditionReportSchemaType,
            'true',
          );
          if (res) {
            if (autosaveInitial) {
              // sólo actualizamos lastSavedRef si save fue exitoso
              lastSavedRef.current = formData
                ? JSON.parse(JSON.stringify(formData))
                : null;
              // refrescamos datos y otros efectos
              refetchAll();
              hardRefreshMany();
              refetch();
            } else {
              autosaveInitial = true;
            }
          }
        } catch (err) {
        } finally {
          if (isMountedRef.current) setSaving(false);
        }
      }, delay);

      return () => {
        // limpieza cada vez que formData cambia antes del timeout
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [formData, currentItem?.id, saveAsync, refetchAll, hardRefreshMany]);

    return null;
  };

  // cada vez que selecciona un item nuevo se detiene el autosave
  useEffect(() => {
    autosaveInitial = false;
    setRenderForm(false);
    if (currentItem?.id) {
      setTimeout(() => {
        setRenderForm(true);
      }, 100);
    }
  }, [currentItem?.id]);

  return (
    <Wrapper style={[styles.container]}>
      {isLoadingConditionReport && <GeneralLoading />}

      <Wrapper style={[{backgroundColor: 'white'}]}>
        <BackButton onPress={goBack} title="Item detail" />

        <Wrapper style={[styles.lateralPadding, styles.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}
            allowFontScaling={false}>
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
        {!receivedReport?.id_job_inventory && !receivedItem?.id && (
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
            useFilter={true}
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

        <BasicFormProvider
          key={`condition_report_${conditionReportJson?.obj_data?.id}`}
          // resetDefaultValue
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
          {renderForm && (
            <>
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
                    key={`artist_${currentItem?.id}_${initialConditionReport?.artist_name}`}
                    name="artistName"
                    onOpenSuggestionsList={(isOpen) => isOpen && closeAll(1)}
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
                    initialValue={
                      initialConditionReport?.artist_name
                        ? {
                            id: initialConditionReport?.artist_name,
                            title: initialConditionReport?.artist_name,
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
                    initialValue={
                      initialConditionReport?.art_type_name
                        ? {
                            id: initialConditionReport?.art_type_name,
                            title: initialConditionReport?.art_type_name,
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
                    showClear={false}
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

                <InputTextContext
                  currentId="year"
                  label="Year"
                  maxLength={20}
                />

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
                <ButtonPhotosCount
                  title="Front"
                  total={totalPhotos.front}
                  onPress={() => goToGallery(CONDITION_PHOTO_SIDE_TYPE.Front)}
                />

                <ButtonPhotosCount
                  title="Back"
                  total={totalPhotos.back}
                  onPress={() => goToGallery(CONDITION_PHOTO_SIDE_TYPE.Back)}
                />
              </Wrapper>

              <Wrapper
                style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
                <ButtonPhotosCount
                  title="Sides"
                  total={totalPhotos.sides}
                  onPress={goToSides}
                />

                <ButtonPhotosCount
                  title="Details"
                  total={totalPhotos.details}
                  onPress={() => goToGallery(CONDITION_PHOTO_SIDE_TYPE.Details)}
                />
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
                  icon={
                    <Icon name="save" type="solid" size={16} color="white" />
                  }
                  showValidationError
                />
              </Wrapper>
            </>
          )}
          <AutoSaveConditionReport />
        </BasicFormProvider>
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
    backgroundColor: COLORS.terteary,
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

type ButtonPhotosCountProps = {
  title: string;
  total: number;
  onPress: () => void;
};

const ButtonPhotosCount = ({title, onPress, total}: ButtonPhotosCountProps) => (
  <PressableOpacity
    style={[GLOBAL_STYLES.row, styles.btnTakePhoto]}
    onPress={onPress}>
    <Wrapper
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}>
      <Label style={styles.textTakePhoto}>{title}</Label>
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
    <Wrapper style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
      <Wrapper style={styles.countTakePhoto}>
        <Label style={styles.numberCount} allowFontScaling={false}>
          {total}
        </Label>
      </Wrapper>
      <Wrapper style={styles.viewCamera}>
        <Icon name="camera" type="solid" color="white" size={25} />
      </Wrapper>
    </Wrapper>
  </PressableOpacity>
);
