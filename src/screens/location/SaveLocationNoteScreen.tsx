import {QUERY_KEYS} from '@api/contants/constants';
import {useSaveLocationNotes} from '@api/hooks/HooksJobServices';
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
import {
  ReportIssueSchema,
  ReportIssueSchemaType,
  SaveLocationNoteSchema,
  SaveLocationNoteSchemaType,
} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {showToastMessage} from '@utils/toast';
import {useRef} from 'react';
import {ActivityIndicator, Keyboard, StyleSheet} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveLocationNotes'>;

export const SaveLocationNoteScreen = (props: Props) => {
  const {goBack, navigate} = useCustomNavigation();
  const {
    params: {idJob, type},
  } = props.route;

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.LOCATION_NOTES, {idJob, type}],
  ]);
  const {mutateAsync, isPending} = useSaveLocationNotes();

  const refVoice = useRef<SpeechFormInputRef>(null);

  const saveReport = async (props: SaveLocationNoteSchemaType) => {
    Keyboard.dismiss();
    refVoice?.current?.stop();
    mutateAsync({
      ...props,
      idJob,
      type,
    })
      .then(() => {
        showToastMessage('Your notes have been saved');
        refetchAll();
        goBack();
      })
      .catch(() => {
        showToastMessage('Error while saving notes', undefined, {
          backgroundColor: 'red',
        });
      });
  };

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[styles.container]}>
        {isPending && (
          <Wrapper style={GLOBAL_STYLES.backgroundLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </Wrapper>
        )}

        <Wrapper style={GLOBAL_STYLES.bgwhite}>
          <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
            <BackButton title="Top sheet" onPress={goBack} />
          </Wrapper>

          <Wrapper style={[styles.lateralPadding, GLOBAL_STYLES.row]}>
            <Label
              style={[
                GLOBAL_STYLES.title,
                GLOBAL_STYLES.bold,
                styles.topsheet,
              ]}>
              Add location note
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider schema={SaveLocationNoteSchema}>
          <KeyboardAwareScrollView
            bottomOffset={220}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}
            keyboardShouldPersistTaps="handled">
            <InputTextContext
              currentId="description"
              multiline={true}
              label="Body"
              style={styles.inputTextArea}
              isErrorHidden={true}
              placeholder="Note"
            />

            <Wrapper style={{top: 0}}>
              <SpeechFormContext ref={refVoice} name="description" />
            </Wrapper>
          </KeyboardAwareScrollView>

          <KeyboardStickyView style={styles.containerBottom}>
            <ButtonSubmit
              label="Save note"
              icon={<Icons.Save fontSize={21} color="white" />}
              onSubmit={saveReport}
              style={{marginBottom: 10}}
              onInvalid={() =>
                showToastMessage('Please, provide a description')
              }
            />
            <Wrapper
              style={[GLOBAL_STYLES.row, {justifyContent: 'center', gap: 3}]}>
              <Wrapper style={styles.divInfo}>
                <Icons.Info fontSize={9} color={'white'} />
              </Wrapper>
              <Label style={styles.textInfo}>
                Your name and the date will be attached to the note
              </Label>
            </Wrapper>
          </KeyboardStickyView>
        </BasicFormProvider>
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
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
    marginTop: 10,
  },
  divInfo: {
    backgroundColor: COLORS.gray,
    borderRadius: 50,
    justifyContent: 'center',
    width: 18,
    height: 18,
    alignItems: 'center',
  },
  textInfo: {
    fontSize: 11,
    color: COLORS.inputTextColor,
    opacity: 0.66,
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
  },
});
