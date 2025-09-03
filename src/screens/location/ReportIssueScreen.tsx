import {useReportIssue} from '@api/hooks/HooksJobServices';
import {Icons} from '@assets/icons/icons';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
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
import {ImageType} from '@generalTypes/images';
import {ReportIssueSchema, ReportIssueSchemaType} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  StyleSheet,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportIssue'>;

const PROBLEM_CODES = [
  {name: 'Road problem', id: '1'},
  {name: 'Wrong address', id: '2'},
  {name: 'Does not answer the phone', id: '3'},
  {name: 'Weather', id: '4'},
  {name: 'Wrong contact info', id: '5'},
  {name: 'Impossible access', id: '6'},
  {name: 'postponed by the customer', id: '7'},
  {name: 'Another', id: '8'},
];

export const ReportIssueScreen = (props: Props) => {
  const {goBack, navigate} = useCustomNavigation();
  const {
    params: {idJob, type, editedImage},
  } = props.route;
  const [photo, setPhoto] = useState<ImageType | null>(null);

  const {mutateAsync, isPending} = useReportIssue();

  const refCallSheet = useRef<RBSheetRef>(null);
  const refVoice = useRef<SpeechFormInputRef>(null);

  useEffect(() => {
    if (editedImage !== undefined) {
      setPhoto(editedImage);
    }
  }, [editedImage]);

  const saveReport = async (props: ReportIssueSchemaType) => {
    Keyboard.dismiss();
    refVoice?.current?.stop();
    mutateAsync({
      ...props,
      idJob,
      destination: 'SHIPPER',
      attachment: photo?.data,
    })
      .then(() => {
        showToastMessage('Your report has been submitted');
        goBack();
      })
      .catch(() => {
        showToastMessage('Error while saving report', undefined, {
          backgroundColor: 'red',
        });
      });
  };

  const initEdit = useCallback((photo?: ImageType) => {
    navigate(RoutesNavigation.EditImage, {photo});
  }, []);

  const removeImage = useCallback(() => {
    setPhoto(null);
  }, [setPhoto]);

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, [refCallSheet?.current]);

  const initCamera = useCallback(() => {
    onLaunchCamera(closeSheet, initEdit);
  }, []);

  const initGallery = useCallback(() => {
    onSelectImage(closeSheet, initEdit);
  }, []);

  const initOptions = useCallback(() => {
    if (refVoice.current) {
      refVoice.current.stop();
    }
    Keyboard.dismiss();
    if (refCallSheet.current) {
      refCallSheet.current.open();
    }
  }, [refVoice?.current, refCallSheet?.current]);

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
              Report an issue
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider
          schema={ReportIssueSchema}
          defaultValue={{
            idProblemType: type,
          }}>
          <KeyboardAwareScrollView
            bottomOffset={220}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}
            keyboardShouldPersistTaps="handled">
            <BottomSheetSelectInputContext
              currentId="idProblemType"
              options={PROBLEM_CODES}
              searchable={false}
              snapPoints={['95%']}
              label="Select an issue type"
            />
            <InputTextContext
              currentId="description"
              multiline={true}
              style={styles.inputTextArea}
              isErrorHidden={true}
              placeholder="Additional remarks (Optional)"
            />

            <Wrapper style={{top: 0}}>
              <SpeechFormContext ref={refVoice} name="description" />
            </Wrapper>

            {photo?.data && (
              <Wrapper style={styles.containerEditImage}>
                <PressableOpacity onPress={() => initEdit(photo)}>
                  <Image
                    resizeMode="contain"
                    style={styles.imageEdit}
                    source={{uri: `data:image/jpeg;base64,${photo.data}`}}
                  />
                </PressableOpacity>
                <PressableOpacity
                  style={[GLOBAL_STYLES.row, styles.btnRemovePhoto]}
                  onPress={() => removeImage()}>
                  <Icons.Close fontSize={20} color={COLORS.white} />
                </PressableOpacity>
              </Wrapper>
            )}

            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                {
                  marginTop: 10,
                  marginBottom: 20,
                  justifyContent: 'space-between',
                },
              ]}>
              <CustomPressable
                style={[GLOBAL_STYLES.row, styles.btnAttachPhoto]}
                onPress={() => initOptions()}>
                <Icons.Camera color={'white'} fontSize={16} />
                <Label style={{color: 'white'}}>
                  {photo != null ? 'Change photo' : 'Attach photo'}
                </Label>
              </CustomPressable>
            </Wrapper>
          </KeyboardAwareScrollView>

          <KeyboardStickyView style={styles.containerBottom}>
            <ButtonSubmit
              label="Save report"
              icon={<Icons.Save fontSize={21} color="white" />}
              onSubmit={saveReport}
              style={{marginBottom: 10}}
              onInvalid={() =>
                showToastMessage('Please, select a valid problem type')
              }
            />

            <Wrapper
              style={[GLOBAL_STYLES.row, {justifyContent: 'center', gap: 3}]}>
              <Wrapper style={styles.divInfo}>
                <Icons.Info fontSize={9} color={'white'} />
              </Wrapper>
              <Label style={styles.textInfo}>
                The date and the time will be attached to the report
              </Label>
            </Wrapper>
          </KeyboardStickyView>
        </BasicFormProvider>

        <ImageOptionSheet
          ref={refCallSheet}
          initCamera={initCamera}
          initGallery={initGallery}
        />
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
  containerEditImage: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: 150,
  },
  imageEdit: {
    width: 150,
    height: 100,
    borderWidth: 0.6,
    borderRadius: 1,
    borderColor: COLORS.placeholderInput,
    alignSelf: 'center',
  },
  btnAttachPhoto: {
    borderRadius: 50,
    alignSelf: 'flex-start',
    height: 26,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: COLORS.terteary,
    gap: 5,
  },
  btnRemovePhoto: {
    borderRadius: 100,
    height: 25,
    width: 25,
    backgroundColor: COLORS.terteary,
    justifyContent: 'center',
    position: 'absolute',
    right: -14,
    top: -14,
    opacity: 0.7,
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
