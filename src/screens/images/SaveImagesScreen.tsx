import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-fontawesome-pro';

import {QUERY_KEYS} from '@api/contants/constants';
import {taskServices} from '@api/services/taskServices';
import {TaskImageType, TaskPhotoType} from '@api/types/Task';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {useQueryClient} from '@tanstack/react-query';
import useTopSheetStore from '@store/topsheet';
import {loadingWrapperPromise} from '@store/actions';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {generateUUID} from '@utils/functions';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {PhotoSlot} from '@components/images/PhotoSlot';
import {
  useRegisterPictures,
  useUpdatePictures,
  useDeletePicture, // 👈 importar el hook de delete
} from '@api/hooks/HooksTaskServices';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {ImageType} from '@generalTypes/general';
import {SpeechFormInputRef} from '@components/commons/form/SpeechFormContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {
  SaveTaskImageSchema,
  SaveTaskImageSchemaType,
} from '@generalTypes/schemas';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {onLaunchCamera, onSelectImage} from '@utils/image';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveImages'>;

const MAX_PHOTOS = 8;

export const SaveImagesScreen = (props: Props) => {
  const {goBack, navigate} = useCustomNavigation();
  const qc = useQueryClient();
  const {online} = useOnline();
  const {id: idJob} = useTopSheetStore((s) => s.jobDetail!);

  const item = props.route.params?.item as TaskImageType | undefined; // editar vs crear
  const editedImage = props.route.params?.editedImage as ImageType | undefined; // imagen editada que vuelve del editor

  const imagesQueryKey = useMemo(() => [QUERY_KEYS.IMAGES, {idJob}], [idJob]);

  const refCallSheet = useRef<RBSheetRef>(null);
  const refVoice = useRef<SpeechFormInputRef>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<TaskPhotoType[]>([]);

  // 🔴 NUEVO: ids a eliminar cuando se pulse Save
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const {mutateAsync: registerImages} = useRegisterPictures();
  const {mutateAsync: updateImages} = useUpdatePictures();
  const {mutateAsync: deletePictureAsync} = useDeletePicture(); // 👈 para borrar por id

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob}],
    imagesQueryKey,
  ]);

  // Carga inicial (modo edición): trae full-res (cuando tenga id) o usa el base64 del item
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!item) return;
      try {
        setLoading(true);
        const next: TaskPhotoType[] = [];
        for (let i = 0; i < Math.min(item.photos.length, MAX_PHOTOS); i++) {
          const p = item.photos[i];
          const base64 = p.id
            ? await taskServices.getFullImage({id: p.id!})
            : p.photo;
          next.push({
            ...p,
            photo: base64,
          });
        }
        if (!cancelled) {
          setPhotos(next);
          setRemovedIds([]); // reset lista de borrados al entrar
        }
      } catch (e) {
        console.log('init load full photos error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item]);

  /** ---------- helpers cache (optimistic UI) ---------- */
  const optimisticUpsert = useCallback(
    (draft: Partial<TaskImageType>, mode: 'create' | 'edit') => {
      qc.setQueryData<TaskImageType[] | undefined>(imagesQueryKey, (old) => {
        const arr = old ? [...old] : [];
        const nowIso = new Date().toISOString().split('.')[0];

        if (mode === 'create') {
          const clientId = draft.clientId ?? generateUUID();
          const asPhotos: TaskPhotoType[] =
            (draft.photos as any) ??
            photos.slice(0, MAX_PHOTOS).map((lp) => ({
              id: lp.id!,
              clientId: lp.clientId,
              photo: '',
              path: '',
              _pending: true,
            }));

          const row: TaskImageType = {
            id: undefined,
            clientId,
            id_job: idJob,
            id_user: 0,
            title: draft.title!,
            description: draft.description,
            update_time: nowIso,
            photos: asPhotos,
            _pending: true,
            _deleted: false,
          };
          arr.unshift(row);
          return arr;
        } else {
          const idx = arr.findIndex((x) =>
            draft.id
              ? x.id === draft.id
              : draft.clientId
              ? x.clientId === draft.clientId
              : false,
          );
          const next: TaskImageType = {
            ...(idx >= 0 ? arr[idx] : ({} as any)),
            ...draft,
            update_time: nowIso,
            _pending: true,
            _deleted: false,
          };
          if (idx >= 0) arr[idx] = next;
          else arr.unshift(next);
          return arr;
        }
      });
    },
    [qc, imagesQueryKey, idJob, photos],
  );

  /** ---------- pickers ---------- */
  const closeSheet = useCallback(() => refCallSheet.current?.close(), []);
  const totalMissingPhotos = useMemo(
    () => MAX_PHOTOS - (photos?.length ?? 0),
    [photos],
  );

  const generateImagePathIOS = useCallback((pictures: ImageType[]) => {
    setPhotos((prev) =>
      [
        ...prev,
        ...pictures.map((x) => ({
          photo: x.data!,
        })),
      ].slice(0, MAX_PHOTOS),
    );
  }, []);

  const initOptions = useCallback(() => {
    refVoice.current?.stop();
    Keyboard.dismiss();
    refCallSheet.current?.open();
  }, []);

  const initCamera = useCallback(() => {
    onLaunchCamera(closeSheet, generateImagePathIOS, {
      maxFiles: totalMissingPhotos,
      compressImageQuality: 1,
      multiple: true,
    });
  }, [closeSheet, generateImagePathIOS, totalMissingPhotos]);

  const initGallery = useCallback(() => {
    onSelectImage(closeSheet, generateImagePathIOS, {
      maxFiles: totalMissingPhotos,
      compressImageQuality: 1,
      multiple: true,
    });
  }, [closeSheet, generateImagePathIOS, totalMissingPhotos]);

  const canAddMore = photos.length < MAX_PHOTOS;

  // Si vuelve una imagen editada del editor, actualiza el slot seleccionado
  useEffect(() => {
    if (!editedImage?.data || selectedIndex == null) return;
    setPhotos((prev) => {
      const arr = [...prev];
      const prevRef = arr[selectedIndex];
      arr[selectedIndex] = {
        ...prevRef,
        photo: editedImage.data!,
        clientId: prevRef?.id
          ? prevRef.clientId
          : prevRef.clientId ?? generateUUID(),
      };
      return arr;
    });
    setSelectedIndex(null);
  }, [editedImage, selectedIndex]);

  const editSlot = useCallback(
    async (index: number) => {
      setSelectedIndex(index);
      navigate(RoutesNavigation.EditImage, {
        photo: {data: photos[index].photo},
      });
    },
    [photos, navigate],
  );

  // 🔴 Aquí marcamos para borrar si el slot tiene id
  const removeSlot = useCallback((index: number) => {
    setPhotos((prev) => {
      const toRemove = prev[index];
      if (toRemove?.id) {
        setRemovedIds((ids) =>
          ids.includes(toRemove.id!) ? ids : [...ids, toRemove.id!],
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /** ---------- SAVE ---------- */
  const save = useCallback(
    async ({title, description}: SaveTaskImageSchemaType) => {
      Keyboard.dismiss();
      if (photos.length === 0) {
        showErrorToastMessage('Please, add at least one image');
        return;
      }

      try {
        setLoading(true);

        // Fotos nuevas (sin id)
        const newList = photos.filter((p) => !p.id).map((x) => x.photo!);

        // Fotos editadas existentes (con id)
        const edited = photos
          .filter((p) => p.id) // OJO: aquí ya NO están las que se removieron
          .map((x) => ({id: x.id!.toString(), photo: x.photo!}));

        if (!item) {
          // CREATE
          if (online) {
            await loadingWrapperPromise(
              (async () => {
                const ok = await registerImages({
                  idJob,
                  title: title.trim(),
                  description: description?.trim() ?? '',
                  photos: newList,
                });
                if (!ok) throw new Error('Register images failed');
                showToastMessage('Images saved successfully');
                refetchAll();
                goBack();
              })(),
            );
          } else {
            // OFFLINE create: cache optimista
            const clientId = generateUUID();
            optimisticUpsert(
              {
                clientId,
                title: title.trim(),
                description: description?.trim() ?? '',
                photos: newList.map((b64) => ({
                  id: undefined,
                  clientId: generateUUID(),
                  path: '',
                  photo: b64,
                  _pending: true,
                })),
              },
              'create',
            );
            showToastMessage('Images queued (offline)');
            goBack();
          }
        } else {
          // EDIT
          if (online) {
            await loadingWrapperPromise(
              (async () => {
                // 1) Borra las eliminadas (si hay)
                if (removedIds.length > 0) {
                  const delResults = await Promise.all(
                    removedIds.map((id) =>
                      deletePictureAsync({id})
                        .then(Boolean)
                        .catch(() => false),
                    ),
                  );
                  const delOk = delResults.every(Boolean);
                  if (!delOk) throw new Error('Some deletions failed');
                }

                // 2) Crea nuevas (si hay)
                if (newList.length > 0) {
                  const created = await registerImages({
                    idJob,
                    title: title.trim(),
                    description: description?.trim() ?? '',
                    photos: newList,
                  });
                  if (!created) throw new Error('Register images failed');
                }

                // 3) Actualiza las existentes (si hay)
                if (edited.length > 0) {
                  const updated = await updateImages({
                    idJob: item.id_job,
                    title: title.trim(),
                    description: description?.trim() ?? '',
                    photos: edited,
                  });
                  if (!updated) throw new Error('Update images failed');
                }

                showToastMessage('Images updated successfully');
                refetchAll();
                goBack();
              })(),
            );
          } else {
            // OFFLINE edit: cache optimista
            optimisticUpsert(
              {
                id: item.id,
                title: title.trim(),
                description: description?.trim() ?? '',
                photos: [
                  // 1) Deja las que no se eliminaron, marcando _pending si fueron editadas
                  ...item.photos
                    .filter((pp) => !removedIds.includes(pp.id!))
                    .map((pp) => ({
                      ...pp,
                      _pending: edited.some((e) => e.id === String(pp.id))
                        ? true
                        : pp._pending,
                    })),
                  // 2) Agrega las nuevas
                  ...newList.map((b64) => ({
                    id: undefined,
                    clientId: generateUUID(),
                    path: '',
                    photo: b64,
                    _pending: true,
                  })),
                ],
              },
              'edit',
            );
            showToastMessage('Changes queued (offline)');
            goBack();
          }
        }
      } catch (e) {
        console.log(e);
        showErrorToastMessage('Error while saving images');
      } finally {
        setLoading(false);
      }
    },
    [
      photos,
      item,
      online,
      idJob,
      registerImages,
      updateImages,
      deletePictureAsync,
      removedIds,
      optimisticUpsert,
      refetchAll,
      goBack,
    ],
  );

  /** ---------- UI ---------- */
  const grid = useMemo(() => {
    const arr = [...photos];
    while (arr.length < 4) arr.push(undefined as any); // placeholders
    return [arr.slice(0, 2), arr.slice(2, 4), arr.slice(4, 6), arr.slice(6, 8)];
  }, [photos]);

  return (
    <View style={styles.container}>
      {loading && <GeneralLoading />}

      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton onPress={goBack} />
        </View>

        <View style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Take images
          </Text>
        </View>
      </View>

      <MinRoundedView />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.lateralPadding, {paddingTop: 10}]}>
          {/* GRID 2 x 4 */}
          {grid.map((row, r) => (
            <View
              key={`row-${r}`}
              style={{
                flexDirection: 'row',
                marginVertical: 10,
                justifyContent: 'space-between',
              }}>
              {row.map((slot, c) => {
                const idx = r * 2 + c;
                if (!slot) {
                  return (
                    <PressableOpacity
                      key={`empty-${idx}`}
                      disabled={!canAddMore}
                      onPress={initOptions}
                      style={styles.containerAddImage}>
                      <Icon
                        name="image"
                        size={30}
                        color={COLORS.primary}
                        type="solid"
                      />
                      <Text style={styles.textAddImage}>Add image</Text>
                    </PressableOpacity>
                  );
                }
                return (
                  <PhotoSlot
                    key={`slot-${idx}`}
                    base64={slot.photo!}
                    onEdit={() => {
                      setSelectedIndex(idx);
                      editSlot(idx);
                    }}
                    onRemove={() => removeSlot(idx)} // 👈 aquí “marcamos” si tiene id
                  />
                );
              })}
            </View>
          ))}

          <BasicFormProvider
            schema={SaveTaskImageSchema}
            defaultValue={{
              title: item?.title,
              description: item?.description,
            }}>
            <InputTextContext
              currentId="title"
              label="Title"
              placeholder="Title example for image"
              maxLength={50}
            />

            <InputTextContext
              currentId="description"
              label="Notes"
              placeholder="(Optional)"
              multiline
              style={styles.inputTextArea}
            />

            <View
              style={[
                GLOBAL_STYLES.row,
                {
                  marginTop: 10,
                  marginBottom: 20,
                  justifyContent: 'space-between',
                },
              ]}>
              <PressableOpacity
                style={styles.btnDeletePhoto}
                onPress={() => setPhotos([])}>
                <Icon
                  name="trash"
                  type="solid"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.textDeletePhoto}>Clear images</Text>
              </PressableOpacity>

              <ButtonSubmit
                onSubmit={save}
                showValidationError
                label="Save images"
                style={styles.btnSaveInfo}
                icon={<Icon name="save" type="solid" size={16} color="white" />}
              />
            </View>
          </BasicFormProvider>
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
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {paddingLeft: 20, paddingRight: 20},
  topsheet: {color: '#3C424A'},
  inputTextArea: {
    textAlignVertical: 'top',
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
  },
  containerAddImage: {
    height: 140,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    padding: 20,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  textAddImage: {color: '#d0d0d0', fontWeight: 'bold', fontSize: 22},
  btnSaveInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '48%',
    backgroundColor: COLORS.primary,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  btnDeletePhoto: {
    marginTop: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  textDeletePhoto: {color: COLORS.primary, fontSize: 16, marginLeft: 5},
});
