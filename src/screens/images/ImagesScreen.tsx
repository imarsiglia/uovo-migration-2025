import {ENTITY_TYPES, QUERY_KEYS} from '@api/contants/constants';
import {
  useDeletePictureGroup,
  useGetPictures,
} from '@api/hooks/HooksTaskServices';
import {TaskImageType} from '@api/types/Task';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {PendingIcon} from '@components/commons/icons/PendingIcon';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {
  SwipeableListProvider,
  SwipeableRow,
} from '@components/commons/swipeable/SwipeableRow';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {CustomImage} from '@components/images/CustomImage';
import OfflineValidation from '@components/offline/OfflineValidation';
import {offlineDeleteImage} from '@features/images/offline';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {useHasPendingSync} from '@hooks/useSyncIndicator';
import {useRemoveFromArrayCache} from '@hooks/useToolsReactQueryCache';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useQueryClient} from '@tanstack/react-query';
import {getFormattedDateWithTimezone} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useMemo} from 'react';
import {
  FlatList,
  InteractionManager,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const ImagesScreen = () => {
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const {goBack, navigate} = useCustomNavigation();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {refetchAll} = useRefreshIndicator([[QUERY_KEYS.TASK_COUNT, {idJob}]]);
  const {online} = useOnline();
  const qc = useQueryClient();
  const imagesQueryKey = useMemo(() => [QUERY_KEYS.IMAGES, {idJob}], [idJob]);
  const removeImageFromCache =
    useRemoveFromArrayCache<TaskImageType>(imagesQueryKey);

  const hasImages = useHasPendingSync(ENTITY_TYPES.IMAGE, idJob);

  const {
    data: list,
    isLoading,
    isRefetching,
    refetch,
  } = useGetPictures({idJob});

  useEffect(() => {
    if (online) {
      qc.setQueryData(imagesQueryKey, list);
    }
  }, [online, list]);

  const {deleteAll} = useDeletePictureGroup();

  const yieldFrame = () =>
    new Promise<void>((r) => requestAnimationFrame(() => r()));

  const initRemove = useCallback(
    (image: TaskImageType) => {
      showDialog({
        modalVisible: true,
        title: 'Delete',
        cancelable: true,
        message: (
          <Wrapper
            style={{flexDirection: 'column', gap: 10, alignItems: 'center'}}>
            <Label style={GLOBAL_STYLES.subtitleModalClockOut}>
              Title: {image.title}
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Are you sure you want to delete the current picture?
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Once finished you will not be able to make changes.
            </Label>
          </Wrapper>
        ),
        type: 'warning',
        onConfirm: () => {
          if (online) {
            loadingWrapperPromise(
              deleteAll(image)
                .then((ok) => {
                  if (ok) {
                    refetch();
                    refetchAll();
                    showToastMessage('Image deleted successfully');
                  } else {
                    showErrorToastMessage('Error while deleting image');
                  }
                })
                .catch(() =>
                  showErrorToastMessage('Error while deleting image'),
                ),
            );
            return;
          }

          // OFFLINE: pintar loader → luego correr cola sin congelar
          loadingWrapperPromise(
            runAfterPaint(async () => {
              const uniqueIds = Array.from(
                new Set(
                  (image.photos ?? [])
                    .map((p) => p?.id)
                    .filter((v): v is number => typeof v === 'number'),
                ),
              );

              // 1) Optimista: quita el grupo de la lista ya mismo
              removeImageFromCache({clientId: image.clientId} as any);

              // 2) Encola deletes
              if (uniqueIds.length > 0) {
                // procesar en orden, cediendo la thread cada 2 ops
                for (let i = 0; i < uniqueIds.length; i++) {
                  await offlineDeleteImage({idJob, id: uniqueIds[i]!});
                  if ((i + 1) % 2 === 0) await yieldFrame();
                }
              } else {
                // grupo 100% offline → una sola entrada por clientId
                await offlineDeleteImage({idJob, clientId: image.clientId});
              }

              // 3) listo
              showToastMessage('Image deleted (queued)');
            }),
            {
              onError: () =>
                showErrorToastMessage('Error while deleting image(s)'),
            },
          );
        },
      });
    },
    [
      online,
      idJob,
      deleteAll,
      offlineDeleteImage,
      removeImageFromCache,
      refetch,
      refetchAll,
      showDialog,
    ],
  );

  function runAfterPaint<T>(fn: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const go = () => {
        InteractionManager.runAfterInteractions(async () => {
          try {
            const res = await fn();
            resolve(res);
          } catch (e) {
            reject(e);
          }
        });
      };

      const raf =
        // @ts-ignore
        (global as any)?.requestAnimationFrame ??
        ((cb: (t?: number) => void) => setTimeout(() => cb(Date.now()), 16));

      raf(go);
    });
  }

  const initEdit = (item: TaskImageType, index: number) => {
    navigate(RoutesNavigation.SaveImages, {item, index: index});
  };

  const initCreate = useCallback(() => {
    navigate(RoutesNavigation.SaveImages);
  }, [navigate]);

  const visualizePhotos = useCallback(
    (item: TaskImageType) => {
      navigate(RoutesNavigation.TaskPhotoCarouselScreen, {
        photos: item.photos,
        groupRev: item.update_time,
        initialIndex: 0,
      });
      // navigate(RoutesNavigation.TaskPhotoViewerScreen, {
      //   photos: item.photos,
      //   groupRev: item.update_time,
      //   initialIndex: 0,
      // });

      
    },
    [navigate],
  );

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<TaskImageType>) => {
      if (item._deleted) return null; // skip locally deleted
      return (
        <View style={[styles.containerNotification]}>
          <SwipeableRow
            rightActions={(close) => (
              <>
                <TouchableOpacity
                  style={styles.rightActionsEdit}
                  onPress={() => {
                    close();
                    initEdit(item, index);
                  }}>
                  <Icon name="pen" size={25} color="white" type="solid" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rightActions}
                  onPress={() => {
                    close();
                    initRemove(item);
                  }}>
                  <Icon name="trash-alt" size={25} color="white" type="solid" />
                </TouchableOpacity>
              </>
            )}>
            <PressableOpacity
              onPress={() => visualizePhotos(item)}
              style={styles.viewNotification}>
              <View style={[styles.circleNotification]}>
                <CustomImage
                  resizeMode="cover"
                  style={{width: 50, height: 50, borderRadius: 50}}
                  source={{
                    uri: 'data:image/jpeg;base64,' + item.photos[0]?.photo,
                  }}
                />
              </View>
              <View style={styles.viewDescNotification}>
                <Wrapper style={GLOBAL_STYLES.row}>
                  <Text style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
                    {item.title}
                  </Text>
                  {/* {item._pending && <PendingIcon />} */}
                </Wrapper>

                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.subtitleNotification}>
                  {item.description ? item.description : 'No description'}
                </Text>
                <Text
                  style={[
                    GLOBAL_STYLES.bold,
                    styles.subtitleNotification,
                    {marginTop: 2},
                  ]}>
                  {getFormattedDateWithTimezone(
                    item.update_time ?? new Date().toISOString(),
                    'YYYY-MM-DD hh:mm A',
                  )}
                </Text>
              </View>
            </PressableOpacity>
          </SwipeableRow>
        </View>
      );
    },
    [initEdit, initRemove],
  );

  return (
    <View style={styles.container}>
      {isLoading && <GeneralLoading />}

      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton title="Tasks" onPress={goBack} />
          <View style={GLOBAL_STYLES.row}>
            <TouchableOpacity
              onPress={initCreate}
              style={GLOBAL_STYLES.btnOptTop}>
              <Icon name="plus" color="white" type="solid" size={15} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            GLOBAL_STYLES.lateralPadding,
            GLOBAL_STYLES.row,
            {gap: 5, alignItems: 'center'},
          ]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Pictures
          </Text>
          <OfflineValidation offline={hasImages}/>
        </View>
      </View>

      <MinRoundedView />

      <SwipeableListProvider>
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(it) => it?.clientId}
          refreshing={isRefetching}
          onRefresh={refetch}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollNotifications]}
        />
      </SwipeableListProvider>
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
  scrollNotifications: {
    paddingTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    gap: 10,
  },
  containerNotification: {overflow: 'hidden', borderRadius: 20},
  viewNotification: {
    backgroundColor: '#F7F5F4',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  circleNotification: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
  },
  letterNotification: {
    alignSelf: 'center',
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  viewDescNotification: {paddingLeft: 10, paddingRight: 40},
  titleNotification: {color: '#464646', fontSize: 16},
  subtitleNotification: {
    color: '#3C424A',
    opacity: 0.66,
    fontSize: 12,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  rightActions: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6C6C',
  },
  rightActionsEdit: {
    width: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#96DBDB',
  },
  btnOptTop: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    width: 27,
    padding: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topsheet: {color: '#3a3a3a'},
});
