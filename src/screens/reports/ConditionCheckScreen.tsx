import {QUERY_KEYS} from '@api/contants/constants';
import {
  useGetArtists,
  useGetArtTypes,
  useGetPlacesConditionReport,
} from '@api/hooks/HooksGeneralServices';
import {useGetJobInventory} from '@api/hooks/HooksInventoryServices';
import {
  useGetConditionCheckbyInventory,
  useGetResumeConditionCheck,
  useGetTotalPhotosConditionCheck,
  useSaveConditionCheck,
} from '@api/hooks/HooksReportServices';
import {
  ConditionReportByInventory,
  reportServices,
} from '@api/services/reportServices';
import {
  CONDITION_PHOTO_SIDE_TYPE,
  CONDITION_TYPES,
  ConditionPhotoSideType,
  ConditionPhotoType,
} from '@api/types/Condition';
import {
  ConditionReportType,
  JobInventoryType,
  ReportResumeType,
} from '@api/types/Inventory';
import {Paginated} from '@api/types/Response';
import {CustomAutocomplete} from '@components/commons/autocomplete/CustomAutocomplete';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {BackButton} from '@components/commons/buttons/BackButton';
import {ButtonPhotosCount} from '@components/commons/buttons/ButtonPhotosCount';
import {RoundedButtonProps} from '@components/commons/buttons/RoundedButton';
import {AutocompleteContext} from '@components/commons/form/AutocompleteContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
import {
  ButtonSubmit,
  findFirstError,
} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {SpeechFormContext} from '@components/commons/form/SpeechFormContext';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {offlineUpdateConditionCheck} from '@features/conditionCheck/offline';
import {
  ConditionCheckSchema,
  ConditionCheckSchemaType,
} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {useUpsertObjectCache} from '@hooks/useToolsReactQueryCache';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import useConditionStore from '@store/condition';
import useInventoryStore from '@store/inventory';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useQueryClient} from '@tanstack/react-query';
import {generateUUID, getFormattedDate, nextFrame} from '@utils/functions';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import isEqual from 'lodash.isequal';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {Keyboard, Platform, ScrollView, StyleSheet} from 'react-native';
import {AutocompleteDropdownItem} from 'react-native-autocomplete-dropdown';
import Icon from 'react-native-fontawesome-pro';
import type {Image as ImageType} from 'react-native-image-crop-picker';
// import OfflineValidation from '../components/offline/OfflineValidation';

var offlineInventory = {};

let autosaveInitial = false;
const delay = 1500;

type Props = NativeStackScreenProps<RootStackParamList, 'ConditionCheck'>;

export const ConditionCheckScreen = (props: Props) => {
  const queryClient = useQueryClient();
  const refCallSheet = useRef<RBSheetRef>(null);
  const examinationDate = new Date();
  const [renderForm, setRenderForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {navigate} = useCustomNavigation();

  // filters and select
  const [filterItem, setFilterItem] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [filterTypes, setFilterTypes] = useState('');
  const [selectedItem, setSelectedItem] = useState<JobInventoryType | null>(
    null,
  );
  const {
    conditionId,
    setConditionType,
    setInventoryId,
    setConditionId,
    setReportIdImage,
    setConditionPhotoType,
    setConditionClientId,
    conditionClientId,
  } = useConditionStore();

  const {topSheetFilter, inventoryFilter, orderFilter, orderType} =
    useInventoryStore();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const sessionUser = useAuth((d) => d.user);
  const {goBack} = useCustomNavigation();

  // received params
  const fromReports = props.route.params.fromReports;
  const receivedReport = props.route.params.report;
  const receivedItem = props.route.params.item;

  const currentInventoryItem = useMemo(() => {
    return receivedItem?.id ? receivedItem : selectedItem;
  }, [selectedItem, receivedItem]);

  const {mutateAsync: saveConditionAsync} = useSaveConditionCheck();

  const {data: placeOfExamList} = useGetPlacesConditionReport();
  const {data: items} = useGetJobInventory({
    idJob: jobDetail?.id!,
  });

  const {data: conditionCheckList} = useGetResumeConditionCheck({
    idJob: jobDetail!.id,
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
  } = useGetConditionCheckbyInventory({
    idJobInventory:
      receivedReport?.id_job_inventory ?? currentInventoryItem?.id!,
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

  const queryKey = [
    QUERY_KEYS.CONDITION_CHECK_BY_INVENTORY,
    {
      idJobInventory:
        receivedReport?.id_job_inventory ?? currentInventoryItem?.id,
    },
  ];

  const upsertConditionReportReport =
    useUpsertObjectCache<ConditionReportByInventory>(queryKey);

  //Autocompletes inputs
  const autocompleteRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  //Take dictation
  const refVoiceCondArt = useRef(null);

  useEffect(() => {
    setConditionType(CONDITION_TYPES.ConditionCheck);
    // initAll();
    return () => {
      console.log('CONDITION CHECK SCREEN UNMOUNT');
      setConditionType(undefined);
      setConditionId(undefined);
      setConditionClientId(undefined);
      setConditionPhotoType(undefined);
      setInventoryId(undefined);
      setReportIdImage(undefined);
    };
  }, []);

  // const initAll = async () => {
  //   await initOfflineInventory();
  // };

  const currentItem = useMemo(() => {
    if (receivedReport || currentInventoryItem) {
      return {
        id: receivedReport?.id_job_inventory ?? currentInventoryItem?.id,
        clientRef:
          receivedReport?.client_ref ?? currentInventoryItem?.clientref,
        clientInv:
          receivedReport?.id_inventory ?? currentInventoryItem?.clientinv,
      };
    } else {
      return null;
    }
  }, [receivedReport, currentInventoryItem]);

  useEffect(() => {
    setInventoryId(currentItem?.id);
  }, [currentItem?.id, setInventoryId]);

  const queryKeyReport = [
    QUERY_KEYS.RESUME_CONDITION_CHECK,
    {idJob: jobDetail?.id},
  ];

  const upsertReport =
    useUpsertObjectCache<Paginated<ReportResumeType[]>>(queryKeyReport);

  const {refetchAll} = useRefreshIndicator([
    queryKeyReport,
    [QUERY_KEYS.TASK_COUNT, {idJob: jobDetail?.id}],
    [QUERY_KEYS.INVENTORY_ITEM_DETAIL, {id: currentItem?.id!}],
  ]);

  const checkItem = useCallback(
    (value: string) => {
      setFilterItem(value.trim());
      if (autocompleteRefs[0].current) {
        autocompleteRefs[0].current.open();
      }
    },
    [setFilterItem],
  );

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

  const checkOverview = useCallback((item: ConditionPhotoType) => {
    // console.log("item")
    // console.log({item})
    navigate(RoutesNavigation.PhotoDetailCondition, {
      item: item,
      photo: item.thumbnail!,
    });
  }, []);

  const goToDetails = () => {
    Keyboard.dismiss();
    setConditionPhotoType(CONDITION_PHOTO_SIDE_TYPE.Details);
    navigate(RoutesNavigation.GalleryCondition);
  };

  const closeAll = (exceptIndex: number) => {
    autocompleteRefs.forEach((r, i) => {
      if (i !== exceptIndex && r.current?.close) r.current.close();
    });
  };

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
          id_job_inventory: currentInventoryItem?.id,
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

  useEffect(() => {
    setConditionClientId(initialConditionReport?.clientId);
  }, [initialConditionReport?.clientId]);

  const {data: photosTotal} = useGetTotalPhotosConditionCheck({
    id: initialConditionReport?.id!,
  });

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
        default:
          break;
      }
      return acc;
    }, init);
  }, [photosTotal]);

  useEffect(() => {
    if (initialConditionReport?.id) {
      setConditionId(initialConditionReport.id);
    }
  }, [initialConditionReport?.id]);

  const saveReportOffline = useCallback(
    (form: ConditionCheckSchemaType) => {
      if (
        !initialConditionReport?.id_job_inventory &&
        !currentInventoryItem?.id
      ) {
        return Promise.resolve('');
      }
      const clientId = initialConditionReport?.clientId ?? generateUUID();
      setConditionClientId(clientId);

      const data = conditionReportJson?.data ?? [];
      const mData = data?.slice(0, -1) ?? [];

      upsertConditionReportReport({
        data: [
          ...mData,
          {
            date_report: getFormattedDate(new Date()),
            edition: form.edition!,
            id: initialConditionReport?.id!,
            id_job: jobDetail?.id!,
            id_job_inventory:
              initialConditionReport?.id_job_inventory ??
              currentInventoryItem?.id!,
            id_user: 0,
            labeled: form.labeled!,
            medium_name: form.mediumName!,
            other_text: form.packing_details_other!,
            packed_height: form.packed_height!,
            packed_length: form.packed_length!,
            packed_width: form.packed_width!,
            partial: '',
            place_of_exam: form.placeOfExam!,
            signature: form.signature!,
            title: form.title!,
            un_packed_height: form.un_packed_height!,
            un_packed_length: form.un_packed_length!,
            un_packed_width: form.un_packed_width!,
            unpacked_weight: '0',
            // TODO
            unmanaged_name: '',
            year: form.year!,
            art_type_name: form.artTypeName?.title,
            artist_name: form.artistName?.title,
            condition_artwork: form.overalConditionArtwork,
            clientId: clientId,
          },
        ],
        total: conditionReportJson?.total,
        obj_data: conditionReportJson?.obj_data,
      });

      const list = conditionCheckList?.data ?? [];
      const existingIndex = list.findIndex(
        (x) => x.id_job_inventory == currentItem?.id,
      );
      const existingItem = existingIndex >= 0 ? list[existingIndex] : undefined;
      const newItem = {
        client_ref: currentItem?.clientRef!,
        id_inventory:
          existingItem?.id_inventory ?? Number(currentInventoryItem?.clientinv),
        id_job_inventory: existingItem?.id_job_inventory ?? currentItem?.id!,
        name: existingItem?.name ?? currentInventoryItem?.clientinv_display!,
        report_count: existingItem?.report_count ?? 1,
        partial: null,
        // TODO
        unmanaged: false,
        unmanaged_name: '',
      };
      const newData =
        existingIndex >= 0
          ? list.map((it, idx) => (idx === existingIndex ? newItem : it))
          : [...list, newItem];

      const newTotal =
        (conditionCheckList?.total ?? 0) + (existingIndex >= 0 ? 0 : 1);

      upsertReport({
        data: newData,
        total: newTotal,
      });

      return offlineUpdateConditionCheck({
        id: initialConditionReport?.id ?? null,
        clientId,
        idJob: jobDetail?.id!,
        idInventory: currentItem?.id!,
        artistName: form.artistName?.title,
        artTypeName: form.artTypeName?.title,

        placeOfExam: form.placeOfExam,
        overalConditionArtwork: form.overalConditionArtwork,
        edition: form.edition,
        labeled: form.labeled,
        mediumName: form.mediumName,
        signature: form.signature,
        title: form.title,
        year: form.year,

        packed_height: form.packed_height,
        packed_length: form.packed_length,
        packed_width: form.packed_width,
        un_packed_height: form.un_packed_height,
        un_packed_length: form.un_packed_length,
        un_packed_width: form.un_packed_width,
      });
    },
    [
      currentItem?.id,
      currentItem?.clientInv,
      currentItem?.clientRef,
      jobDetail?.id,
      initialConditionReport?.id,
      initialConditionReport?.clientId,
      initialConditionReport?.id_job_inventory,
      conditionReportJson,
      conditionCheckList,
      currentInventoryItem?.id,
      currentInventoryItem?.clientinv,
      currentInventoryItem?.clientinv_display,
    ],
  );

  const saveAsync = useCallback(
    (form: ConditionCheckSchemaType) => {
      return saveConditionAsync({
        id: initialConditionReport?.id ?? null,
        idJob: jobDetail?.id!,
        idInventory: currentItem?.id!,
        artistName: form.artistName?.title,
        artTypeName: form.artTypeName?.title,

        placeOfExam: form.placeOfExam,
        overalConditionArtwork: form.overalConditionArtwork,
        edition: form.edition,
        labeled: form.labeled,
        mediumName: form.mediumName,
        signature: form.signature,
        title: form.title,
        year: form.year,

        packed_height: form.packed_height,
        packed_length: form.packed_length,
        packed_width: form.packed_width,
        un_packed_height: form.un_packed_height,
        un_packed_length: form.un_packed_length,
        un_packed_width: form.un_packed_width,
      });
    },
    [
      saveConditionAsync,
      currentItem?.id,
      jobDetail?.id,
      initialConditionReport?.id,
    ],
  );

  const onSubmit = useCallback(
    (props: ConditionCheckSchemaType) => {
      Keyboard.dismiss();
      if (props) {
        if (online) {
          loadingWrapperPromise(async () => {
            try {
              await nextFrame();
              const d = await saveAsync(props);
              if (d) {
                showToastMessage('Condition check saved successfully');
                await refetchAll();
                await refetch();
                await hardRefreshMany();
                await nextFrame();
                goBack();
              } else {
                showErrorToastMessage('Error while saving condition check');
              }
            } catch (e) {
              showErrorToastMessage('Error while saving condition check');
            }
          });
        } else {
          loadingWrapperPromise(saveReportOffline(props)).then(() => {
            goBack();
          });
        }
      } else {
        showToastMessage('Please, select a valid option');
      }
    },
    [
      online,
      saveAsync,
      saveReportOffline,
      refetchAll,
      refetch,
      hardRefreshMany,
      goBack,
    ],
  );

  const AutoSaveConditionCheck = () => {
    const formData = useWatch<ConditionCheckSchemaType>();
    const {formState} = useFormContext<ConditionCheckSchemaType>();
    // @ts-ignore
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const firstRun = useRef(true);
    const lastSavedRef = useRef<ConditionCheckSchemaType | null>(null);
    const [saving, setSaving] = useState(false);
    const isMountedRef = useRef(true);

    // 👇 nuevo: el autosave solo se activa después de unos segundos
    const [autosaveReady, setAutosaveReady] = useState(false);

    useEffect(() => {
      const readyTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          setAutosaveReady(true);
        }
      }, 4000); // Esperamos 4s después de entrar a la pantalla

      return () => {
        isMountedRef.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        clearTimeout(readyTimeout);
      };
    }, []);

    useEffect(() => {
      // 💡 Si aún no está habilitado el autosave, no hacemos nada
      if (!autosaveReady) {
        return;
      }

      // Primera pasada después de estar listo -> no autosavear todavía
      if (firstRun.current) {
        firstRun.current = false;
        return;
      }

      if (!currentItem?.id) return;

      // 💡 Solo si el usuario realmente tocó algo del formulario
      if (!formState.isDirty) {
        return;
      }

      // Si lo que hay es igual a lo último guardado, no hacemos nada
      if (lastSavedRef.current && isEqual(lastSavedRef.current, formData)) {
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      timerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        if (lastSavedRef.current && isEqual(lastSavedRef.current, formData)) {
          return;
        }

        try {
          setSaving(true);
          if (online) {
            saveAsync(formData as ConditionCheckSchemaType).then((res) => {
              if (res) {
                if (autosaveInitial) {
                  lastSavedRef.current = formData
                    ? JSON.parse(JSON.stringify(formData))
                    : null;
                  refetchAll();
                  hardRefreshMany();
                  refetch();
                } else {
                  autosaveInitial = true;
                }
              }
            });
          } else {
            saveReportOffline(formData as ConditionCheckSchemaType);
          }
        } catch (err) {
        } finally {
          if (isMountedRef.current) setSaving(false);
        }
      }, delay);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [
      formData,
      formState.isDirty,
      autosaveReady,
      currentItem?.id,
      saveAsync,
      refetchAll,
      hardRefreshMany,
      online,
      saveReportOffline,
    ]);

    return null;
  };

  useEffect(() => {
    autosaveInitial = false;
    setRenderForm(false);
    if (currentItem?.id) {
      setTimeout(() => {
        setRenderForm(true);
      }, 100);
    }
  }, [currentItem?.id]);

  const generateImagePathIOS = useCallback((photo?: ImageType) => {
    navigate(RoutesNavigation.PhotoDetailCondition, {
      photo: photo?.data!,
    });
  }, []);

  // ---------- Seleccionar desde galería ----------
  const initGallery = useCallback(async () => {
    // @ts-ignore
    onSelectImage(closeSheet, generateImagePathIOS);
  }, [generateImagePathIOS]);

  const initCamera = useCallback(() => {
    if (Platform.OS == 'ios') {
      closeSheet();
      navigate(RoutesNavigation.PhotoCaptureZoom);
    } else {
      // @ts-ignore
      onLaunchCamera(closeSheet, (photo) => generateImagePathIOS(photo, true));
    }
  }, [generateImagePathIOS]);

  const takeNewPhoto = useCallback(() => {
    setReportIdImage(undefined);
    if (refCallSheet.current) {
      refCallSheet.current.open();
    }
  }, []);

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, []);

  const goToGallery = useCallback(
    async (type: ConditionPhotoSideType) => {
      setConditionPhotoType(type);
      Keyboard.dismiss();
      if (
        !initialConditionReport?.id_job_inventory &&
        !currentInventoryItem?.id
      ) {
        return;
      }

      setIsLoading(true);

      const queryKeyPayload = {
        conditionType: CONDITION_TYPES.ConditionCheck!,
        sideType: type!,
        ...(conditionId
          ? {reportId: conditionId}
          : conditionClientId
          ? {parentClientId: conditionClientId}
          : {}),
      };

      const queryKey = [QUERY_KEYS.PHOTOS_CONDITION, queryKeyPayload];

      try {
        let res: ConditionPhotoType[] | undefined;
        if (!online) {
          res = queryClient.getQueryData<ConditionPhotoType[]>(queryKey) ?? [];
        } else {
          res = await reportServices.getPhotosCondition(queryKeyPayload);
          queryClient.setQueryData(queryKey, res);
        }

        setIsLoading(false);

        if (res && res.length > 0) {
          checkOverview(res[res.length - 1]);
        } else {
          takeNewPhoto();
        }
      } catch (e) {
        console.log('goToGallery error:', e);
        setIsLoading(false);
        const cached =
          queryClient.getQueryData<ConditionPhotoType[]>([
            QUERY_KEYS.PHOTOS_CONDITION,
            queryKeyPayload,
          ]) ?? [];

        if (cached.length > 0) {
          checkOverview(cached[cached.length - 1]);
        } else {
          takeNewPhoto();
        }
      }
    },
    [
      initialConditionReport?.id_job_inventory,
      conditionId,
      conditionClientId,
      online,
      queryClient,
      setConditionPhotoType,
      checkOverview,
      takeNewPhoto,
      currentInventoryItem?.id,
    ],
  );

  return (
    <Wrapper style={[styles.container]}>
      {(isLoadingConditionReport || isLoading) && <GeneralLoading />}

      <Wrapper style={[{backgroundColor: 'white'}]}>
        <BackButton onPress={goBack} title="Item detail" />

        <Wrapper style={[styles.lateralPadding, styles.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}
            allowFontScaling={false}>
            Condition Check
          </Label>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        keyboardDismissMode="on-drag"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="always"
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
            onChangeText={checkItem}
            onSelectItem={(item) => onSelectItem(item)}
            initialValue={
              currentInventoryItem?.id
                ? {
                    id: currentInventoryItem.id.toString(),
                    title: currentInventoryItem.clientinv,
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

        <BasicFormProvider
          key={`condition_check_${initialConditionReport?.title}`}
          // resetDefaultValue
          schema={ConditionCheckSchema}
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

            overalConditionArtwork:
              initialConditionReport?.overal_condition_artwork,
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
                    placeholderInput="Select an option"
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
              <Label style={[styles.title]}>Overall condition of artwork</Label>
              <InputTextContext
                currentId="overalConditionArtwork"
                style={styles.inputTextArea}
                multiline={true}
                maxLength={50000}
              />
              <Wrapper
                style={[GLOBAL_STYLES.row, styles.containerOptionsCondition]}>
                {
                  <Wrapper>
                    <SpeechFormContext
                      ref={refVoiceCondArt}
                      name="overalConditionArtwork"
                    />
                  </Wrapper>
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
                <PreSubmitButton
                  title="Front"
                  total={totalPhotos.front}
                  onSubmit={() => goToGallery('front')}
                />
                <PreSubmitButton
                  title="Back"
                  total={totalPhotos.back}
                  onSubmit={() => goToGallery('back')}
                />
              </Wrapper>

              <Wrapper
                style={[GLOBAL_STYLES.row, {justifyContent: 'space-between'}]}>
                <PreSubmitButton
                  title="Details"
                  total={totalPhotos.details}
                  onSubmit={goToDetails}
                />
              </Wrapper>

              <Wrapper style={{marginTop: 40, marginBottom: 100}}>
                <ButtonSubmit
                  onSubmit={onSubmit}
                  label="Save as"
                  icon={
                    <Icon name="save" type="solid" size={16} color="white" />
                  }
                  showValidationError
                />
              </Wrapper>
            </>
          )}
          <AutoSaveConditionCheck />
        </BasicFormProvider>
      </ScrollView>

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
    // opacity: 0.7,
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

type PreSubmitButtonProps = RoundedButtonProps & {
  onSubmit: (data: any) => void;
  onInvalid?: () => void;
  /** Si es true, muestra el primer error del formulario en un toast */
  showValidationError?: boolean;
  title: string;
  total: number;
  offline?: boolean;
};
export const PreSubmitButton = ({
  onSubmit,
  onInvalid,
  showValidationError = true,
  ...restProps
}: PreSubmitButtonProps) => {
  const {handleSubmit} = useFormContext();

  return (
    <ButtonPhotosCount
      {...restProps}
      onPress={handleSubmit(onSubmit, (errors) => {
        // Ejecuta callback personalizado si existe
        if (onInvalid) {
          onInvalid();
        }

        if (showValidationError) {
          const first = findFirstError(errors);
          const msg = first?.message ?? 'Please, complete required fields';

          showErrorToastMessage(msg);
        } else if (!onInvalid) {
          showErrorToastMessage('Please, complete required fields');
        }
      })}
    />
  );
};
