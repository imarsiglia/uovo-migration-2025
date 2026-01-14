import {useUpdateUser} from '@api/hooks/HooksAuthentication';
import {
  ImageOptionSheet,
  ImageOptionSheetHandle,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {BackButton} from '@components/commons/buttons/BackButton';
import {NextButton} from '@components/commons/buttons/NextButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {ImageType} from '@generalTypes/general';
import {ProfileSchema, ProfileSchemaType} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Image, Keyboard, ScrollView, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
export const EditProfileScreen = (props: Props) => {
  const {goBack, resetTo, navigate} = useCustomNavigation();

  const refCallSheet = useRef<ImageOptionSheetHandle>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const {user: sessionUser, token, setSession} = useAuth((d) => d);

  const fromProfile = props.route.params?.fromProfile;

  const {mutateAsync} = useUpdateUser();

  useEffect(() => {
    if (
      sessionUser?.user_photo &&
      sessionUser?.user_photo !== 'this is a base64 string'
    ) {
      setPhoto(sessionUser.user_photo);
    }
  }, [fromProfile]);

  const initOptions = useCallback(() => {
    Keyboard.dismiss();
    if (refCallSheet.current) {
      refCallSheet.current.open();
    }
  }, []);

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, []);

  const onChangePhoto = useCallback(
    (photo?: ImageType, shouldBack?: boolean) => {
      if (shouldBack) {
        goBack();
      }
      if (photo?.data) {
        setPhoto(photo?.data);
      }
    },
    [setPhoto],
  );

  const initCamera = useCallback(() => {
    navigate(RoutesNavigation.CameraScreen);
    // @ts-ignore
    onLaunchCamera(closeSheet, (photo) => onChangePhoto(photo, true), undefined, goBack);
  }, [onChangePhoto, closeSheet]);

  const initGallery = useCallback(() => {
    // @ts-ignore
    onSelectImage(closeSheet, onChangePhoto);
  }, [onChangePhoto, closeSheet]);

  const updateProfile = useCallback(
    (props: ProfileSchemaType) => {
      Keyboard.dismiss();
      loadingWrapperPromise(
        mutateAsync({
          ...props,
          photo,
        })
          .then((d) => {
            if (d) {
              showToastMessage('Profile updated correctly');
              setSession(token!, {
                ...sessionUser!,
                user_name: props.firstname,
                user_last_name: props.lastname,
                user_phone: props.phone,
                user_photo: photo,
                user_updated: 1,
              });
              if (fromProfile) {
                goBack();
              } else {
                resetTo(RoutesNavigation.Home);
              }
            } else {
              showErrorToastMessage('Error while updating profile');
            }
          })
          .catch((e) => {
            showErrorToastMessage('Error while updating profile');
          }),
      );
    },
    [fromProfile, photo, mutateAsync, goBack, resetTo],
  );

  if (!sessionUser) {
    return null;
  }

  return (
    <Wrapper style={styles.container}>
      {fromProfile && (
        <Wrapper style={[GLOBAL_STYLES.bgwhite]}>
          <BackButton title="Account" onPress={goBack} />
        </Wrapper>
      )}

      {!fromProfile && (
        <Wrapper
          style={[
            GLOBAL_STYLES.bgwhite,
            {alignSelf: 'flex-end', marginRight: 10},
          ]}>
          <NextButton
            title="Skip"
            onPress={() => resetTo(RoutesNavigation.Home)}
          />
        </Wrapper>
      )}

      <Wrapper style={GLOBAL_STYLES.bgwhite}>
        <Wrapper style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
          <Label style={[GLOBAL_STYLES.title]}>Edit </Label>
          <Label style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold]}>
            profile
          </Label>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {backgroundColor: COLORS.bgWhite, paddingHorizontal: 5},
        ]}>
        <Wrapper style={{alignSelf: 'center'}}>
          <Wrapper
            style={{
              marginTop: 10,
              backgroundColor: 'white',
              alignSelf: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              width: 154,
              height: 154,
              borderRadius: 120,
              borderColor: '#cecece',
              opacity: 1,
            }}>
            {(!photo || photo === '') && (
              <Wrapper
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 120,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Label style={{color: 'white', fontSize: 50}}>
                  {sessionUser.user_name[0]}
                  {sessionUser.user_last_name[0]}
                </Label>
              </Wrapper>
            )}
            {photo != null && photo !== '' && (
              <Image
                resizeMode="cover"
                style={{width: 150, height: 150, borderRadius: 120}}
                source={{uri: 'data:image/jpeg;base64,' + photo}}
              />
            )}
          </Wrapper>

          <PressableOpacity
            onPress={() => initOptions()}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              padding: 10,
              height: 36,
              width: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Wrapper
              style={{
                backgroundColor: COLORS.terteary,
                borderRadius: 25,
                height: 36,
                width: 36,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1,
              }}>
              <Icon name="camera" color="white" type="light" size={18} />
            </Wrapper>
          </PressableOpacity>
        </Wrapper>

        <Label
          style={[
            GLOBAL_STYLES.bold,
            styles.center,
            {color: '#3a3a3a', marginTop: 10, fontSize: 18},
          ]}>
          {sessionUser.user_name} {sessionUser.user_last_name}
        </Label>
        <Label style={[styles.center, {color: '#cecece', lineHeight: 14}]}>
          {sessionUser.user_mail}
        </Label>

        <Wrapper style={{paddingHorizontal: 5}}>
          <BasicFormProvider
            schema={ProfileSchema}
            defaultValue={{
              firstname: sessionUser.user_name,
              lastname: sessionUser.user_last_name,
              phone: sessionUser.user_phone,
            }}>
            <Wrapper style={styles.containerSubtitle}>
              <Icon name="address-card" size={16} color="#aeaeae" />
              <Label style={{marginLeft: 8, color: '#aeaeae', fontSize: 13}}>
                First Name
              </Label>
            </Wrapper>
            <InputTextContext currentId="firstname" textContentType="name" />

            <Wrapper style={[styles.containerSubtitle, {paddingTop: 10}]}>
              <Icon name="address-card" size={16} color="#aeaeae" />
              <Label style={{marginLeft: 8, color: '#aeaeae', fontSize: 13}}>
                Last Name
              </Label>
            </Wrapper>
            <InputTextContext
              currentId="lastname"
              textContentType="familyName"
            />

            <Wrapper style={[styles.containerSubtitle, {paddingTop: 10}]}>
              <Icon name="phone" size={16} color="#aeaeae" />
              <Label style={{marginLeft: 8, color: '#aeaeae', fontSize: 13}}>
                Phone
              </Label>
            </Wrapper>
            <InputTextContext
              currentId="phone"
              keyboardType="numeric"
              textContentType="telephoneNumber"
            />

            <ButtonSubmit
              label="Update and continue"
              onSubmit={updateProfile}
              showValidationError
              style={{marginTop: 20}}
            />
          </BasicFormProvider>
        </Wrapper>
      </KeyboardAwareScrollView>

      <ImageOptionSheet
        ref={refCallSheet}
        initCamera={initCamera}
        initGallery={initGallery}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
    paddingHorizontal: 5,
  },
  center: {
    alignSelf: 'center',
  },
  containerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    marginBottom: 2,
  },
});
