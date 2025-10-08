import 'react-native-get-random-values';
import {QUERY_KEYS} from '@api/contants/constants';
import {useSaveNote} from '@api/hooks/HooksTaskServices';
import {Icons} from '@assets/icons/icons';
import {BackButton} from '@components/commons/buttons/BackButton';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {
  SpeechFormContext,
  SpeechFormInputRef,
} from '@components/commons/form/SpeechFormContext';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {offlineCreateNote, offlineUpdateNote} from '@features/notes/offline';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useQueryClient} from '@tanstack/react-query';
import {showErrorToastMessage} from '@utils/toast';
import React, {useCallback, useMemo, useRef} from 'react';
import {StyleSheet} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useCustomNavigation} from 'src/hooks/useCustomNavigation';
import {HelpDeskSchema, SaveNoteSchemaType} from 'src/types/schemas';
import {v4 as uuid} from 'uuid';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveNote'>;

type NoteListItem = {
  id?: number;
  clientId?: string;
  idJob: number;
  title: string;
  description: string;
  update_time?: string;
  _pending?: boolean;
  _deleted?: boolean;
};

export const SaveNoteScreen = (props: Props) => {
  const item = props.route.params?.item;
  const {goBack} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);

  const {online} = useOnline();
  const qc = useQueryClient();

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob}],
    [QUERY_KEYS.NOTES, {idJob}],
  ]);

  const refVoice = useRef<SpeechFormInputRef>(null);

  const {mutateAsync} = useSaveNote();

  const notesQueryKey = useMemo(() => [QUERY_KEYS.NOTES, {idJob}], [idJob]);

  /** Upsert note optimistically into the list cache */
  const upsertInCache = useCallback(
    (patch: NoteListItem) => {
      qc.setQueryData<NoteListItem[] | undefined>(notesQueryKey, (old) => {
        const arr = old ? [...old] : [];
        const idx = arr.findIndex((n) =>
          patch.id
            ? n.id === patch.id
            : patch.clientId
            ? n.clientId === patch.clientId
            : false,
        );
        const nowIso = new Date().toISOString();
        const next: NoteListItem = {
          id: patch.id,
          clientId: patch.clientId,
          idJob: patch.idJob,
          title: patch.title ?? '',
          description: patch.description ?? '',
          update_time: nowIso,
          _pending: patch._pending ?? true,
          _deleted: patch._deleted ?? false,
        };
        if (idx >= 0) arr[idx] = {...arr[idx], ...next, update_time: nowIso};
        else arr.unshift(next);
        return arr;
      });
    },
    [qc, notesQueryKey],
  );

  const saveNote = useCallback(
    (form: SaveNoteSchemaType) => {
      if (online) {
        loadingWrapperPromise(
          mutateAsync({
            idJob,
            id: item?.id ?? null,
            title: form.title,
            description: form.description,
          })
            .then((d) => {
              if (d) {
                refetchAll();
                goBack();
              } else {
                showErrorToastMessage('Error while saving note');
              }
            })
            .catch(() => {
              showErrorToastMessage('Error while saving note');
            }),
        );
      } else {
        // OFFLINE: enqueue + optimistic cache
        try {
          const title = form.title;
          const description = form.description;
          if (item?.clientId || item?.id) {
            // update an existing offline/server note
            offlineUpdateNote({
              idJob,
              clientId: item?.clientId,
              id: item?.id,
              title,
              description,
            });
            upsertInCache({
              id: item?.id,
              clientId: item?.clientId,
              idJob,
              title,
              description,
              _pending: true,
            });
          } else {
            // create a new offline draft with auto clientId
            const clientId = uuid();
            offlineCreateNote({idJob, clientId, title, description});
            upsertInCache({
              clientId,
              idJob,
              title,
              description,
              _pending: true,
            });
          }
          goBack();
        } catch (e) {
          console.log(e);
        }
      }
    },
    [online, mutateAsync, idJob, item, upsertInCache, refetchAll, goBack],
  );

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[styles.container]}>
        <Wrapper style={GLOBAL_STYLES.bgwhite}>
          <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
            <BackButton title="Back" onPress={goBack} />
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
            <Label
              style={[
                GLOBAL_STYLES.title,
                GLOBAL_STYLES.bold,
                styles.topsheet,
              ]}>
              Take notes
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider
          schema={HelpDeskSchema}
          defaultValue={{
            title: item?.title,
            description: item?.description,
          }}>
          <KeyboardAwareScrollView
            bottomOffset={220}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}
            keyboardShouldPersistTaps="handled">
            <InputTextContext label="Title*" currentId="title" />
            <Wrapper>
              <InputTextContext
                label="Body*"
                currentId="description"
                multiline={true}
                style={styles.inputTextArea}
                isErrorHidden={true}
                placeholder="Body example note, this can be multi-line, with many characters"
              />
              <SpeechFormContext ref={refVoice} name="description" />
            </Wrapper>
          </KeyboardAwareScrollView>

          <KeyboardStickyView style={styles.containerBottom}>
            <ButtonSubmit
              label="Save notes"
              icon={<Icons.Save fontSize={21} color="white" />}
              onSubmit={saveNote}
              style={{marginBottom: 10}}
            />
          </KeyboardStickyView>
        </BasicFormProvider>
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, height: '100%', backgroundColor: COLORS.bgWhite},
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
  topsheet: {color: COLORS.titleColor},
  inputTextArea: {
    textAlignVertical: 'top',
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    opacity: 0.7,
    paddingLeft: 10,
    paddingRight: 10,
    height: 80,
  },
  containerBottom: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  scrollview: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 150,
    gap: 10,
  },
});
