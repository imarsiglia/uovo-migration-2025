import {QUERY_KEYS} from '@api/contants/constants';
import {useDeleteNote, useGetNotes} from '@api/hooks/HooksTaskServices';
import {NoteType} from '@api/types/Task';
import {Icons} from '@assets/icons/icons';
import {BackButton} from '@components/commons/buttons/BackButton';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {
  SwipeableListProvider,
  SwipeableRow,
} from '@components/commons/swipeable/SwipeableRow';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {offlineDeleteNote} from '@features/notes/offline';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useQueryClient} from '@tanstack/react-query';
import {getFormattedDateWithTimezone} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import React, {useCallback, useMemo} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type NoteListItem = NoteType & {
  clientId?: string;
  _pending?: boolean; // locally queued
  _deleted?: boolean; // locally marked deleted
};

export const NotesScreen = () => {
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const {goBack, navigate} = useCustomNavigation();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {refetchAll} = useRefreshIndicator([[QUERY_KEYS.TASK_COUNT, {idJob}]]);
  const {online} = useOnline();
  const qc = useQueryClient();

  const notesQueryKey = useMemo(() => [QUERY_KEYS.NOTES, {idJob}], [idJob]);

  const {data: list, isLoading, isRefetching, refetch} = useGetNotes({idJob});

  const {mutateAsync: deleteNoteAsync} = useDeleteNote();

  /** ---------- cache helpers (optimistic UI) ---------- */
  const removeFromCache = useCallback(
    (ref: {id?: number; clientId?: string}) => {
      qc.setQueryData<NoteListItem[] | undefined>(notesQueryKey, (old) => {
        if (!old) return old;
        return old.filter((n) =>
          ref.id
            ? n.id !== ref.id
            : ref.clientId
            ? n.clientId !== ref.clientId
            : true,
        );
      });
    },
    [qc, notesQueryKey],
  );

  const markDeletedInCache = useCallback(
    (ref: {id?: number; clientId?: string}) => {
      qc.setQueryData<NoteListItem[] | undefined>(notesQueryKey, (old) => {
        if (!old) return old;
        const now = new Date().toISOString();
        return old.map((n) => {
          const match = ref.id
            ? n.id === ref.id
            : ref.clientId
            ? n.clientId === ref.clientId
            : false;
          return match
            ? {...n, _deleted: true, _pending: true, update_time: now}
            : n;
        });
      });
    },
    [qc, notesQueryKey],
  );

  /** ---------- actions ---------- */
  const initRemove = useCallback(
    (note: NoteType) => {
      showDialog({
        modalVisible: true,
        title: 'Delete',
        cancelable: true,
        message: (
          <Wrapper
            style={{flexDirection: 'column', gap: 10, alignItems: 'center'}}>
            <Label style={GLOBAL_STYLES.subtitleModalClockOut}>
              Title: {note.title}
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Are you sure you want to delete the current note?
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Once finished you will not be able to make changes.
            </Label>
          </Wrapper>
        ),
        type: 'warning',
        onConfirm: () => {
          if (online && note.id) {
            loadingWrapperPromise(
              deleteNoteAsync({
                id: note.id,
              })
                .then((d) => {
                  if (d) {
                    refetch();
                    refetchAll();
                    showToastMessage('Note deleted successfully');
                  } else {
                    showErrorToastMessage('Error while deleting note');
                  }
                })
                .catch(() =>
                  showErrorToastMessage('Error while deleting note'),
                ),
            );
          } else {
            // OFFLINE: enqueue + optimistic removal from cache
            offlineDeleteNote({idJob, ...note});
            // Puedes elegir "remover" o "marcar eliminado". Aquí removemos para que desaparezca de la lista.
            removeFromCache({id: note.id, clientId: note.clientId});
            showToastMessage('Note deleted (queued)');
          }
        },
      });
    },
    [online, refetch, refetchAll, idJob, removeFromCache, deleteNoteAsync],
  );

  const initEdit = (item: NoteType) => {
    navigate(RoutesNavigation.SaveNote, {item});
  };

  const initCreate = useCallback(() => {
    navigate(RoutesNavigation.SaveNote);
  }, [navigate]);

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<NoteListItem>) => {
      if ((item as any)._deleted) return null; // skip locally deleted
      const circleColor = index % 2 === 0 ? '#3ABD6C' : '#EEA32D';
      return (
        <View style={[styles.containerNotification]}>
          <SwipeableRow
            rightActions={(close) => (
              <>
                <TouchableOpacity
                  style={styles.rightActionsEdit}
                  onPress={() => {
                    close();
                    initEdit(item);
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
            <View style={styles.viewNotification}>
              <View
                style={[
                  styles.circleNotification,
                  {backgroundColor: circleColor},
                ]}>
                <Text style={styles.letterNotification}>
                  {item.title ? item.title[0] : 'N'}
                </Text>
              </View>
              <View style={styles.viewDescNotification}>
                <Wrapper style={GLOBAL_STYLES.row}>
                  <Text style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
                    {item.title}
                    {/* {(item as any)._pending ? ' (pending)' : ''} */}
                  </Text>
                  {item._pending && (
                    <Icons.HourglassClock
                      style={{marginLeft: 5}}
                      color={COLORS.error}
                      width={15}
                      height={15}
                    />
                  )}
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
            </View>
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
            Notes
          </Text>
        </View>
      </View>

      <MinRoundedView />

      <SwipeableListProvider>
        <FlatList
          data={list as NoteListItem[] | undefined}
          renderItem={renderItem}
          keyExtractor={(it) => (it.id?.toString() ?? (it as any).clientId)!}
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
