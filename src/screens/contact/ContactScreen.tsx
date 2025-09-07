import { useContactUsService } from '@api/hooks/HooksGeneralServices';
import { Icons } from '@assets/icons/icons';
import {
    ImageOptionSheet,
    RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import { PressableOpacity } from '@components/commons/buttons/PressableOpacity';
import { BasicFormProvider } from '@components/commons/form/BasicFormProvider';
import { ButtonSubmit } from '@components/commons/form/ButtonSubmit';
import { InputTextContext } from '@components/commons/form/InputTextContext';
import {
    SpeechFormContext,
    SpeechFormInputRef,
} from '@components/commons/form/SpeechFormContext';
import { CustomPressable } from '@components/commons/pressable/CustomPressable';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import { RoutesNavigation } from '@navigation/types';
import { useRoute } from '@react-navigation/native';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { getDeviceInfoAsString } from '@utils/functions';
import { onLaunchCamera, onSelectImage } from '@utils/image';
import { showToastMessage } from '@utils/toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    StyleSheet
} from 'react-native';
import type { Image as ImageType } from 'react-native-image-crop-picker';
import {
    KeyboardAwareScrollView,
    KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useCustomNavigation } from 'src/hooks/useCustomNavigation';
import { ContactUsSchema, ContactUsSchemaType } from 'src/types/schemas';

export const ContactScreen = () => {
  const {goBack, navigate} = useCustomNavigation();
  const route = useRoute<any>();

  const {mutateAsync, isPending} = useContactUsService();
  const [photo, setPhoto] = useState<ImageType | null>(null);

  const refCallSheet = useRef<RBSheetRef>(null);
  const refVoice = useRef<SpeechFormInputRef>(null);

  const deviceInfo = useMemo(() => {
    return getDeviceInfoAsString();
  }, []);

  useEffect(() => {
    if (route.params?.editedImage !== undefined) {
      setPhoto(route.params.editedImage);
    }
  }, [route.params?.editedImage]);

  const saveReport = useCallback((props: ContactUsSchemaType) => {
    Keyboard.dismiss();
    refVoice?.current?.stop();
    mutateAsync({
      ...props,
      attachment: photo?.data,
      deviceInfo,
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
  }, []);

  const generateImagePathIOS = useCallback((photo?: ImageType) => {
    navigate(RoutesNavigation.EditImage, {photo});
  }, []);

  const initEdit = useCallback((image: ImageType) => {
    generateImagePathIOS(image);
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

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, [refCallSheet?.current]);

  const initCamera = useCallback(() => {
    onLaunchCamera(closeSheet, generateImagePathIOS);
  }, []);

  const initGallery = useCallback(() => {
    onSelectImage(closeSheet, generateImagePathIOS);
  }, []);

  const removeImage = useCallback(() => {
    setPhoto(null);
  }, [setPhoto]);

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
            <PressableOpacity onPress={goBack}>
              <Wrapper style={styles.backBtn}>
                <Icons.AngleDown
                  style={{transform: [{rotate: '90deg'}]}}
                  color={COLORS.gray}
                  fontSize={15}
                />
                <Label style={styles.backBtnText}>Back</Label>
              </Wrapper>
            </PressableOpacity>
          </Wrapper>

          <Wrapper style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
            <Label
              style={[
                GLOBAL_STYLES.title,
                GLOBAL_STYLES.bold,
                styles.topsheet,
              ]}>
              Contact Us
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider schema={ContactUsSchema}>
          <KeyboardAwareScrollView
            bottomOffset={220}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}
            keyboardShouldPersistTaps="handled">
            <InputTextContext label="Name*" currentId="name" />
            <InputTextContext label="Email*" currentId="email" />
            <InputTextContext label="Title*" currentId="title" />
            <InputTextContext
              label="Description*"
              currentId="description"
              multiline={true}
              style={styles.inputTextArea}
              isErrorHidden={true}
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
              label="Submit"
              icon={<Icons.Save fontSize={21} color="white" />}
              onSubmit={saveReport}
              style={{marginBottom: 10}}
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
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {
    color: COLORS.gray,
    fontSize: 18,
    paddingBottom: 1,
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
  iconInfo: {
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
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
