import {QUERY_KEYS} from '@api/contants/constants';
import {useHelpDeskService} from '@api/hooks/HooksGeneralServices';
import {useSaveNote} from '@api/hooks/HooksTaskServices';
import {Icons} from '@assets/icons/icons';
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
import {CustomPressable} from '@components/commons/pressable/CustomPressable';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {useRoute} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Image, Keyboard, StyleSheet} from 'react-native';
import type {Image as ImageType} from 'react-native-image-crop-picker';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useCustomNavigation} from 'src/hooks/useCustomNavigation';
import {
  HelpDeskSchema,
  HelpDeskSchemaType,
  SaveNoteSchemaType,
} from 'src/types/schemas';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveNote'>;

export const SaveNoteScreen = (props: Props) => {
  const {item} = props.route.params;
  const {goBack, goBackAndUpdate} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail);

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob}],
    [QUERY_KEYS.NOTES, {idJob}],
  ]);

  const refVoice = useRef<SpeechFormInputRef>(null);

  const {mutateAsync} = useSaveNote();

  const saveNote = useCallback(
    (props: SaveNoteSchemaType) => {
      loadingWrapperPromise(
        mutateAsync({
          idJob,
          id: item.id ?? null,
          title: props.title,
          description: props.description,
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
    },
    [mutateAsync],
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
            title: item.title,
            description: item.description,
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
                placeholder="Body example note, this can be multi-line, with many characteres"
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
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
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
  topsheet: {
    color: COLORS.titleColor,
  },
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
