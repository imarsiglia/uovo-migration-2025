import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-fontawesome-pro';

import {QUERY_KEYS} from '@api/contants/constants';
import {taskServices} from '@api/services/taskServices';
import {TaskImageType, TaskPhotoType} from '@api/types/Task';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
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
import {
  SpeechFormContext,
  SpeechFormInputRef,
} from '@components/commons/form/SpeechFormContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {
  SaveTaskImageSchema,
  SaveTaskImageSchemaType,
} from '@generalTypes/schemas';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {useUpsertArrayCache} from '@hooks/useToolsReactQueryCache';
import {useAuth} from '@store/auth';
import {
  offlineCreateImage,
  offlineDeleteImage,
  offlineUpdateImage,
} from '@features/images/offline';
import {Wrapper} from '@components/commons/wrappers/Wrapper';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveImages'>;

const MAX_PHOTOS = 8;

export const SaveImagesScreen = (props: Props) => {
  const {goBack, navigate} = useCustomNavigation();
  const sessionUser = useAuth((d) => d.user);
  const qc = useQueryClient();
  const {online} = useOnline();
  const {id: idJob} = useTopSheetStore((s) => s.jobDetail!);

  const item = props.route.params?.item;
  const prevIndex = props.route.params?.index;
  const editedImage = props.route.params?.editedImage as ImageType | undefined; // imagen editada que vuelve del editor

  const imagesQueryKey = useMemo(() => [QUERY_KEYS.IMAGES, {idJob}], [idJob]);

  const refCallSheet = useRef<RBSheetRef>(null);
  const refVoice = useRef<SpeechFormInputRef>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<TaskPhotoType[]>([]);

  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const {mutateAsync: registerImages} = useRegisterPictures();
  const {mutateAsync: updateImages} = useUpdatePictures();
  const {mutateAsync: deletePictureAsync} = useDeletePicture(); // 👈 para borrar por id

  const upsertImages = useUpsertArrayCache<TaskImageType>(imagesQueryKey);

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
          if (p.id) {
            const base64 = p.id
              ? await taskServices.getFullImage({id: p.id!})
              : p.photo;
            next.push({
              ...p,
              photo: base64,
            });
          } else {
            next.push({
              ...p,
            });
          }
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
    // @ts-ignore
    onLaunchCamera(closeSheet, generateImagePathIOS, {
      maxFiles: totalMissingPhotos,
      compressImageQuality: 1,
      multiple: true,
    });
  }, [closeSheet, generateImagePathIOS, totalMissingPhotos]);

  const initGallery = useCallback(() => {
    // @ts-ignore
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
        clientId: prevRef.clientId ?? generateUUID(),
      };
      return arr;
    });
    setSelectedIndex(null);
  }, [editedImage]);

  const editSlot = useCallback(
    async (index: number) => {
      setSelectedIndex(index);
      navigate(RoutesNavigation.EditImage, {
        photo: {data: photos[index].photo},
      });
    },
    [photos, navigate],
  );

  // Aquí marcamos para borrar si el slot tiene id
  const removeSlot = useCallback(
    (index: number) => {
      setPhotos((prev) => {
        const toRemove = prev[index];
        if (toRemove?.id) {
          setRemovedIds((ids) =>
            ids.includes(toRemove.id!) ? ids : [...ids, toRemove.id!],
          );
        }
        return prev.filter((_, i) => i !== index);
      });
    },
    [setPhotos, setRemovedIds],
  );

  /** ---------- SAVE ---------- */
  const save = useCallback(
    ({title, description}: SaveTaskImageSchemaType) => {
      Keyboard.dismiss();
      refVoice.current?.stop();

      if (photos.length === 0) {
        showErrorToastMessage('Please, add at least one image');
        return;
      }
      const titleValidated = title.trim();
      const descriptionValidated = description?.trim() ?? '';

      try {
        setLoading(true);
        // Fotos nuevas (sin id)
        const newList = photos.filter((p) => !p.id);
        // Fotos editadas existentes (con id)
        const edited = photos.filter((p) => !!p.id); // OJO: aquí ya NO están las que se removieron

        if (!item) {
          // CREATE
          if (online) {
            loadingWrapperPromise(
              (async () => {
                const ok = await registerImages({
                  idJob,
                  title: titleValidated,
                  description: descriptionValidated,
                  photos: newList?.map((x) => x.photo!),
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
            const base64List = newList?.map((x) => x.photo!);
            upsertImages({
              clientId,
              id_job: idJob,
              id_user: sessionUser?.user_id,
              title: titleValidated,
              description: descriptionValidated,
              photos: base64List.map((x) => ({
                clientId: generateUUID(),
                photo: x,
                path: '',
              })),
              update_time: new Date().toISOString(),
            });
            offlineCreateImage({
              clientId,
              idJob,
              title: titleValidated,
              description: descriptionValidated,
              photos: base64List,
            });
            showToastMessage('Images queued (offline)');
            goBack();
          }
        } else {
          // EDIT
          if (online) {
            loadingWrapperPromise(
              (async () => {
                //Borra las eliminadas (si hay)
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

                //Crea nuevas (si hay)
                if (newList.length > 0) {
                  const base64List = newList?.map((x) => x.photo!);
                  const created = await registerImages({
                    idJob,
                    title: titleValidated,
                    description: descriptionValidated,
                    photos: base64List,
                  }).catch(() => false);
                  if (!created) throw new Error('Register images failed');
                }

                // Actualiza las existentes (si hay)
                if (edited.length > 0) {
                  const listWithIds = edited?.map((x) => ({
                    id: x.id!.toString(),
                    photo: x.photo!,
                  }));
                  const updated = await updateImages({
                    idJob: item.id_job,
                    title: titleValidated,
                    description: descriptionValidated,
                    photos: listWithIds,
                  }).catch(() => false);
                  if (!updated) throw new Error('Update images failed');
                }

                showToastMessage('Images updated successfully');
                refetchAll();
                goBack();
              })(),
            );
          } else {
            loadingWrapperPromise(
              (async () => {
                const clientId = item?.clientId ?? generateUUID();
                const clientIdEdit = item?.clientIdEdit ?? generateUUID();
                const clientIdDelete = item?.clientIdDelete ?? generateUUID();

                upsertImages({
                  clientId,
                  clientIdEdit,
                  clientIdDelete,
                  id_job: idJob,
                  id_user: sessionUser?.user_id,
                  title: titleValidated,
                  description: descriptionValidated,
                  photos: [
                    ...(newList ?? []).map((x) => ({
                      clientId: x.clientId ?? generateUUID(),
                      photo: x.photo,
                      path: '',
                    })),
                    ...(edited ?? []).map((x) => ({
                      id: x.id,
                      clientId: x.clientId ?? generateUUID(),
                      photo: x.photo,
                      path: '',
                    })),
                  ],
                  update_time: new Date().toISOString(),
                });

                // Borrar eliminadas (si hay)
                if (removedIds?.length > 0) {
                  const uniqueIds = Array.from(new Set(removedIds));
                  for (const rid of uniqueIds) {
                    await offlineDeleteImage({
                      idJob,
                      id: rid,
                    });
                  }
                }

                // Crear nuevas (si hay)
                if (newList?.length > 0) {
                  const base64List = newList.map((x) => x.photo!);
                  await offlineUpdateImage({
                    clientId: clientId,
                    idJob,
                    title: titleValidated,
                    description: descriptionValidated,
                    photos: base64List, // ← sólo base64 nuevas
                  });
                }

                // Actualizar existentes (si hay)
                if (edited?.length > 0) {
                  const listWithIds = edited.map((x) => ({
                    id: String(x.id!),
                    photo: x.photo!,
                  }));
                  await offlineUpdateImage({
                    clientId: clientIdEdit,
                    idJob,
                    title: titleValidated,
                    description: descriptionValidated,
                    photos: listWithIds, // ← pares {id, photo}
                  });
                }

                showToastMessage('Changes queued (offline)');
                goBack();
              })(),
            );
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
      offlineDeleteImage,
      upsertImages,
      offlineUpdateImage,
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
          {/* GRID 2 x 2 */}
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

            <Wrapper style={{top: 0}}>
              <SpeechFormContext ref={refVoice} name="description" />
            </Wrapper>

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
