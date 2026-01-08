import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Keyboard, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

import {QUERY_KEYS} from '@api/contants/constants';
import {
  useDeletePicture,
  useRegisterPictures,
  useUpdatePictures,
} from '@api/hooks/HooksTaskServices';
import {taskServices} from '@api/services/taskServices';
import {TaskImageType, TaskPhotoType} from '@api/types/Task';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {
  SpeechFormContext,
  SpeechFormInputRef,
} from '@components/commons/form/SpeechFormContext';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {PhotoSlot} from '@components/images/PhotoSlot';
import {
  offlineCreateImage,
  offlineDeleteImage,
  offlineUpdateImage,
} from '@features/images/offline';
import {ImageType} from '@generalTypes/general';
import {
  SaveTaskImageSchema,
  SaveTaskImageSchemaType,
} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {useUpsertArrayCache} from '@hooks/useToolsReactQueryCache';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useQueries} from '@tanstack/react-query';
import {generateUUID, isAndroid, nextFrame} from '@utils/functions';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {imageCacheManager} from '@utils/imageCacheManager';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import RNFS from 'react-native-fs';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useCustomInsetBottom} from '@hooks/useCustomInsetBottom';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveImages'>;

const MAX_PHOTOS = 8;
const GRID_PLACEHOLDER_COUNT = 4;

// 🎯 Tipo simplificado - solo guardamos URI, no base64 en memoria
interface OptimizedPhoto extends TaskPhotoType {
  uri?: string; // URI local (original o cache)
  internalId: string; // ID único para tracking
  isNew?: boolean; // Flag para saber si es nueva (no tiene ID del servidor)
  isDirty?: boolean; // Flag para saber si fue editada
}

// 🎯 Hook optimizado - SIN duplicación de cache
const usePhotoManagement = (
  item: TaskImageType | undefined,
  online: boolean,
  idJob: number,
) => {
  const [photos, setPhotos] = useState<OptimizedPhoto[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingHighRes, setLoadingHighRes] = useState(false);
  const isMounted = useRef(true);

  const initialGroupPhotos = useMemo(
    () => (item?.photos ? item.photos.slice(0, MAX_PHOTOS) : []),
    [item],
  );

  const photoQueries = useQueries({
    queries: initialGroupPhotos.map((p) => ({
      queryKey: [
        QUERY_KEYS.LOAD_FULL_IMAGE,
        {id: p.id, rev: item?.update_time},
      ],
      queryFn: () => taskServices.getFullImage({id: p.id!}),
      enabled: !!p.id && !!item && online,
      staleTime: 5 * 60 * 1000,
      retry: 2, // 🔥 Reintentar solo 2 veces
    })),
  });

  // 🚀 Inicialización con validación estricta
  useEffect(() => {
    if (!item || isInitialized) return;

    // console.log('🎯 Initializing photos:', initialGroupPhotos.length);

    const initPhotos = initialGroupPhotos.map((p, index) => {
      // 🔥 Validar base64
      const hasValidBase64 =
        p.photo && typeof p.photo === 'string' && p.photo.length > 100;

      // 🔥 Validar path
      const hasValidPath =
        p.path && typeof p.path === 'string' && p.path.length > 0;

      const photo: OptimizedPhoto = {
        ...p,
        internalId: `init_${p.id ?? p.clientId ?? index}`,
        isNew: false,
        isDirty: false,
        photo: hasValidBase64 ? p.photo : undefined,
        uri: hasValidPath ? p.path : undefined,
      };

      // console.log(`📸 Photo ${index}:`, {
      //   hasBase64: hasValidBase64,
      //   hasPath: hasValidPath,
      //   base64Length: p.photo?.length,
      //   path: p.path,
      // });

      return photo;
    });

    setPhotos(initPhotos);
    setRemovedIds([]);
    setIsInitialized(true);
  }, [item, initialGroupPhotos, isInitialized]);

  // 🚀 Actualizar con high-res de forma segura
  useEffect(() => {
    if (!item || !isInitialized || initialGroupPhotos.length === 0 || !online)
      return;

    const hasNewData = photoQueries.some((q) => q.data && q.isSuccess);
    if (!hasNewData) return;

    setLoadingHighRes(true);

    (async () => {
      if (!isMounted.current) return;

      const updates: {index: number; photo: OptimizedPhoto}[] = [];

      for (let i = 0; i < initialGroupPhotos.length; i++) {
        const base = initialGroupPhotos[i];
        const q = photoQueries[i];

        if (!base?.id || !q?.data) continue;

        const existingIndex = photos.findIndex((p) => p.id === base.id);
        if (existingIndex === -1) continue;

        const existingPhoto = photos[existingIndex];

        // 🔥 Validar que el base64 descargado sea válido
        if (!q.data || typeof q.data !== 'string' || q.data.length < 100) {
          console.warn(`⚠️ Invalid high-res data for photo ${base.id}`);
          continue;
        }

        try {
          const cacheKey = `photo_${base.id}_${item.update_time}_L_${q.data.length}`;
          const uri = await imageCacheManager.saveBase64ToCache(
            q.data,
            cacheKey,
          );

          if (!isMounted.current) return;

          // console.log(`✅ Cached high-res for photo ${base.id}`);

          updates.push({
            index: existingIndex,
            photo: {
              ...existingPhoto,
              uri,
              photo: undefined, // Liberar memoria
            },
          });
        } catch (error) {
          console.error(`❌ Error caching photo ${base.id}:`, error);
          // Mantener el base64 original si falla
        }
      }

      if (!isMounted.current) return;

      if (updates.length > 0) {
        setPhotos((prev) => {
          const next = [...prev];
          updates.forEach(({index, photo}) => {
            next[index] = photo;
          });
          return next;
        });
        // console.log(`🔄 Updated ${updates.length} photos with high-res`);
      }

      setLoadingHighRes(false);
    })();
  }, [
    item,
    isInitialized,
    online,
    photoQueries.map((q) => q.dataUpdatedAt).join(','),
  ]);

  // 🧹 Cleanup al desmontar
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      setTimeout(() => {
        photos.forEach((p) => {
          if (p.uri?.includes('image_cache') && (p.isNew || p.isDirty)) {
            imageCacheManager.deleteFromCache(p.uri).catch(() => {});
          }
        });
      }, 1000);
    };
  }, []);

  return {
    photos,
    setPhotos,
    removedIds,
    setRemovedIds,
    isHydratingFullRes: loadingHighRes,
  };
};

// 🎯 Hook para operaciones de guardado - optimizado
const useSaveOperations = (
  idJob: number,
  online: boolean,
  item: TaskImageType | undefined,
) => {
  const sessionUser = useAuth((d) => d.user);
  const {mutateAsync: registerImages} = useRegisterPictures();
  const {mutateAsync: updateImages} = useUpdatePictures();
  const {mutateAsync: deletePictureAsync} = useDeletePicture();
  const upsertImages = useUpsertArrayCache<TaskImageType>([
    QUERY_KEYS.IMAGES,
    {idJob},
  ]);

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob}],
    [QUERY_KEYS.IMAGES, {idJob}],
  ]);

  // 🔥 Función auxiliar para leer base64 de forma eficiente
  const readPhotosAsBase64 = async (
    photos: OptimizedPhoto[],
  ): Promise<string[]> => {
    return Promise.all(
      photos.map(async (p) => {
        // Si ya tiene base64 en memoria, usarlo
        if (p.photo) return p.photo;

        // Si tiene URI, leerlo
        if (p.uri) {
          return await imageCacheManager.readCacheAsBase64(p.uri);
        }

        return '';
      }),
    ).then((results) =>
      results
        .filter((b): b is string => !!b)
        .map((x) => x.replace(/(\r\n|\n|\r)/gm, '')),
    );
  };

  const handleCreate = useCallback(
    async (
      photos: OptimizedPhoto[],
      title: string,
      description: string,
    ): Promise<void> => {
      const base64List = await readPhotosAsBase64(photos);

      if (online) {
        const ok = await registerImages({
          idJob,
          title,
          description,
          photos: base64List,
        });
        if (!ok) throw new Error('Register images failed');
        showToastMessage('Images saved successfully');
        setTimeout(() => {
          refetchAll();
        }, 500);
      } else {
        const clientId = generateUUID();
        upsertImages({
          clientId,
          id_job: idJob,
          id_user: sessionUser?.user_id,
          title,
          description,
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
          title,
          description,
          photos: base64List,
        });
        showToastMessage('Images queued (offline)');
      }
    },
    [online, idJob, registerImages, refetchAll, upsertImages, sessionUser],
  );

  const handleUpdate = useCallback(
    async (
      photos: OptimizedPhoto[],
      removedIds: number[],
      title: string,
      description: string,
    ): Promise<void> => {
      const newPhotos = photos.filter((p) => p.isNew);
      const editedPhotos = photos.filter((p) => !p.isNew && p.isDirty);
      const unchangedPhotos = photos.filter((p) => !p.isNew && !p.isDirty);

      if (online) {
        // Borrar eliminadas
        if (removedIds.length > 0) {
          await Promise.allSettled(
            removedIds.map((id) => deletePictureAsync({id})),
          );
        }

        // Crear nuevas
        if (newPhotos.length > 0) {
          const base64List = await readPhotosAsBase64(newPhotos);
          await registerImages({
            idJob,
            title,
            description,
            photos: base64List,
          });
        }

        // Actualizar editadas
        if (editedPhotos.length > 0) {
          const base64List = await readPhotosAsBase64(editedPhotos);
          const listWithIds = editedPhotos.map((x, idx) => ({
            id: x.id!.toString(),
            photo: base64List[idx] ?? '',
          }));

          await updateImages({
            idJob: item!.id_job,
            title,
            description,
            photos: listWithIds,
          });
        }

        if (unchangedPhotos.length > 0) {
          const base64List = await readPhotosAsBase64(unchangedPhotos);
          const listWithIds = unchangedPhotos.map((x, idx) => ({
            id: x.id!.toString(),
            photo: base64List[idx] ?? '',
          }));

          await updateImages({
            idJob: item!.id_job,
            title,
            description,
            photos: listWithIds,
          });
        }

        showToastMessage('Images updated successfully');
        setTimeout(() => {
          refetchAll();
        }, 500);
      } else {
        // Modo offline similar
        const clientId = item?.clientId ?? generateUUID();
        const allBase64 = await readPhotosAsBase64(photos);

        upsertImages({
          clientId,
          id_job: idJob,
          id_user: sessionUser?.user_id,
          title,
          description,
          photos: allBase64.map((x, idx) => ({
            id: photos[idx]?.id,
            clientId: photos[idx]?.clientId ?? generateUUID(),
            photo: x,
            path: '',
          })),
          update_time: new Date().toISOString(),
        });

        if (removedIds.length > 0) {
          await Promise.all(
            removedIds.map((id) => offlineDeleteImage({idJob, id})),
          );
        }

        if (newPhotos.length > 0 || editedPhotos.length > 0) {
          await offlineUpdateImage({
            clientId,
            idJob,
            title,
            description,
            photos: allBase64,
          });
        }

        showToastMessage('Changes queued (offline)');
      }
    },
    [
      online,
      idJob,
      item,
      deletePictureAsync,
      registerImages,
      updateImages,
      refetchAll,
      upsertImages,
      sessionUser,
    ],
  );

  return {handleCreate, handleUpdate};
};

export const SaveImagesScreen = (props: Props) => {
  const {goBack, navigate, addListener} = useCustomNavigation();
  const {online} = useOnline();
  const {id: idJob} = useTopSheetStore((s) => s.jobDetail!);
  const insetBottom = useCustomInsetBottom();

  const item = props.route.params?.item;

  const refCallSheet = useRef<RBSheetRef>(null);
  const refVoice = useRef<SpeechFormInputRef>(null);
  const [editingInternalId, setEditingInternalId] = useState<string | null>(
    null,
  );
  const isProcessing = useRef<boolean>(false);

  const {photos, setPhotos, removedIds, setRemovedIds, isHydratingFullRes} =
    usePhotoManagement(item, online, idJob);

  const {handleCreate, handleUpdate} = useSaveOperations(idJob, online, item);

  const totalMissingPhotos = MAX_PHOTOS - photos.length;
  const canAddMore = photos.length < MAX_PHOTOS;

  const closeSheet = useCallback(() => refCallSheet.current?.close(), []);

  useEffect(() => {
    const unsub = addListener('beforeRemove', (e) => {
      if (!isProcessing.current) return;
      e.preventDefault();
      Alert.alert('Please wait', 'We’re processing your request.');
    });

    return unsub;
  }, [addListener]);

  // 🎯 Agregar fotos - NO duplicar en cache si ya viene con path
  const addPhotos = useCallback(
    async (newPhotos: ImageType | ImageType[]) => {
      if (!newPhotos) return;
      const photosArray = Array.isArray(newPhotos) ? newPhotos : [newPhotos];

      for (const img of photosArray) {
        const internalId = `new_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 11)}`;

        setPhotos((prev) =>
          [
            ...prev,
            {
              uri: img.path, // 🔥 Usar path original, no duplicar
              clientId: generateUUID(),
              internalId,
              isNew: true,
              isDirty: false,
              photo: img.data, // Mantener base64 en memoria para fotos nuevas
            } as OptimizedPhoto,
          ].slice(0, MAX_PHOTOS),
        );
        await nextFrame();
      }
    },
    [setPhotos],
  );

  const initOptions = useCallback(() => {
    refVoice.current?.stop();
    Keyboard.dismiss();
    refCallSheet.current?.open();
  }, []);

  const initCamera = useCallback(async () => {
    if (isAndroid()) {
      closeSheet();
      loadingWrapperPromise(async () => {
        await nextFrame();
        const res = await onLaunchCamera(
          () => {},
          () => {},
          {
            compressImageQuality: 0.8,
            includeBase64: true,
            writeTempFile: true,
          },
        );
        await nextFrame();
        await addPhotos(res as ImageType);
      }).catch(() => {});
    } else {
      const res = await onLaunchCamera(
        () => {},
        () => {},
        {
          compressImageQuality: 0.8,
          includeBase64: true,
          writeTempFile: true,
        },
      );
      closeSheet();
      addPhotos(res as ImageType[]);
    }
  }, [closeSheet, addPhotos]);

  const initGallery = useCallback(async () => {
    if (isAndroid()) {
      closeSheet();
      loadingWrapperPromise(async () => {
        await nextFrame();
        const res = await onSelectImage(
          () => {},
          () => {},
          {
            maxFiles: totalMissingPhotos,
            multiple: true,
            compressImageQuality: 0.8,
            includeBase64: true,
            writeTempFile: true,
          },
        );
        await nextFrame();
        await addPhotos(res as ImageType[]);
      }).catch(() => {});
    } else {
      const res = await onSelectImage(
        () => {},
        () => {},
        {
          maxFiles: totalMissingPhotos,
          multiple: true,
          compressImageQuality: 0.8,
          includeBase64: true,
          writeTempFile: true,
        },
      );
      closeSheet();
      addPhotos(res as ImageType[]);
    }
  }, [closeSheet, addPhotos, totalMissingPhotos]);

  // 🎯 Editar - crear archivo temporal SOLO cuando sea necesario
  const editSlot = useCallback(
    async (realIdx: number) => {
      const photo = photos[realIdx];
      if (!photo) {
        showErrorToastMessage('Image not found');
        return;
      }

      setEditingInternalId(photo.internalId);

      // 🔥 Leer base64 de donde esté disponible
      let base64: string | undefined = photo.photo;
      if (!base64 && photo.uri) {
        base64 = await imageCacheManager.readCacheAsBase64(photo.uri);
      }

      if (!base64) {
        showErrorToastMessage('Cannot load image');
        return;
      }

      // 🔥 Crear archivo temporal SOLO para edición
      const tempPath = `${RNFS.TemporaryDirectoryPath}/edit_${Date.now()}.jpg`;
      await RNFS.writeFile(tempPath, base64, 'base64');

      navigate(RoutesNavigation.EditImageUri, {
        photo: {path: tempPath},
      });
    },
    [photos, navigate],
  );

  const removeSlot = useCallback(
    (index: number) => {
      setPhotos((prev) => {
        const toRemove = prev[index];

        if (toRemove?.id) {
          setRemovedIds((ids) => [...new Set([...ids, toRemove.id!])]);
        }

        // 🧹 Eliminar de cache si es nueva o editada
        if (
          toRemove?.uri?.includes('image_cache') &&
          (toRemove.isNew || toRemove.isDirty)
        ) {
          imageCacheManager.deleteFromCache(toRemove.uri).catch(() => {});
        }

        return prev.filter((_, i) => i !== index);
      });
    },
    [setPhotos, setRemovedIds],
  );

  const clearImages = useCallback(() => {
    const idsToRemove = photos.filter((x) => !!x.id).map((x) => x.id!);
    setRemovedIds((prev) => [...new Set([...prev, ...idsToRemove])]);

    // 🧹 Limpiar cache
    photos.forEach((p) => {
      if (p.uri?.includes('image_cache') && (p.isNew || p.isDirty)) {
        imageCacheManager.deleteFromCache(p.uri).catch(() => {});
      }
    });

    setPhotos([]);
  }, [photos, setPhotos, setRemovedIds]);

  const save = useCallback(
    async ({title, description}: SaveTaskImageSchemaType) => {
      Keyboard.dismiss();
      refVoice.current?.stop();

      if (photos.length === 0) {
        showErrorToastMessage('Please, add at least one image');
        return;
      }

      try {
        isProcessing.current = true;
        loadingWrapperPromise(async () => {
          await nextFrame();
          if (item) {
            await handleUpdate(
              photos,
              removedIds,
              title.trim(),
              description?.trim() ?? '',
            );
          } else {
            await handleCreate(photos, title.trim(), description?.trim() ?? '');
          }
          await nextFrame();

          isProcessing.current = false;
          goBack();
        }).catch(() => {
          isProcessing.current = false;
        });
      } catch (e) {
        console.error('Save error:', e);
        showErrorToastMessage('Error while saving images');
      }
    },
    [photos, item, removedIds, handleCreate, handleUpdate, goBack],
  );

  // 🎯 Recibir imagen editada
  useEffect(() => {
    if (!props.route.params?.editedUri || !editingInternalId) return;

    const editedUri = props.route.params.editedUri;
    const editedBase64 = props.route.params.editedBase64;

    const index = photos.findIndex((p) => p.internalId === editingInternalId);
    if (index === -1) return;

    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        uri: editedUri,
        photo: editedBase64,
        isDirty: true, // Marcar como editada
      };
      return updated;
    });

    props.navigation.setParams({
      editedUri: undefined,
      editedBase64: undefined,
    });
  }, [props.route.params?.editedUri, editingInternalId, photos, setPhotos]);

  // Grid memoizado
  const grid = useMemo(() => {
    const arr = [...photos];
    while (arr.length < GRID_PLACEHOLDER_COUNT) arr.push(undefined as any);
    return [arr.slice(0, 2), arr.slice(2, 4), arr.slice(4, 6), arr.slice(6, 8)];
  }, [photos]);

  return (
    <View style={styles.container}>
      {isHydratingFullRes && <GeneralLoading />}

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

      <BasicFormProvider
        schema={SaveTaskImageSchema}
        defaultValue={{
          title: item?.title,
          description: item?.description,
        }}>
        <KeyboardAwareScrollView
          bottomOffset={220}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollview}
          keyboardShouldPersistTaps="handled">
          <View style={styles.lateralPadding}>
            {grid.map((row, r) => (
              <View key={r} style={styles.gridRow}>
                {row.map((slot, c) => {
                  const gridIdx = r * 2 + c;

                  if (!slot) {
                    return (
                      <PressableOpacity
                        key={gridIdx}
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

                  const realIdx = photos.indexOf(slot);

                  return (
                    <PhotoSlot
                      key={slot.internalId}
                      uri={slot.uri}
                      base64={slot.photo}
                      onEdit={() => editSlot(realIdx)}
                      onRemove={() => removeSlot(realIdx)}
                    />
                  );
                })}
              </View>
            ))}

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
          </View>
        </KeyboardAwareScrollView>

        <KeyboardStickyView
          style={[styles.containerBottom, {bottom: -insetBottom}]}>
          <View style={styles.bottomButtons}>
            <PressableOpacity
              style={styles.btnDeletePhoto}
              onPress={clearImages}>
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
        </KeyboardStickyView>
      </BasicFormProvider>

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
  lateralPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topsheet: {
    color: '#3C424A',
  },
  inputTextArea: {
    textAlignVertical: 'top',
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    paddingHorizontal: 10,
    height: 80,
  },
  gridRow: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
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
  textAddImage: {
    color: '#d0d0d0',
    fontWeight: 'bold',
    fontSize: 22,
  },
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
  textDeletePhoto: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 5,
  },
  containerBottom: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  bottomButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  scrollview: {
    paddingTop: 10,
    paddingBottom: 150,
    gap: 10,
  },
});
