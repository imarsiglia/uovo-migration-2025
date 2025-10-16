import {QUERY_KEYS} from '@api/contants/constants';
import {
  useGetPhotoConditionDetail,
  useSavePhotoCondition,
} from '@api/hooks/HooksReportServices';
import {CONDITION_PHOTO_SIDE_LABELS} from '@api/types/Condition';
import {Icons} from '@assets/icons/icons';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {RoundedButton} from '@components/commons/buttons/RoundedButton';
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
import {CustomImage} from '@components/images/CustomImage';
import {
  SaveTaskImageSchema,
  SaveTaskImageSchemaType,
} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import useConditionStore from '@store/condition';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {onSelectImage} from '@utils/image';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Keyboard, StyleSheet} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {Image as ImageType} from 'react-native-image-crop-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoDetailCondition'>;
export const PhotoDetailCondition = (props: Props) => {
  const {goBack, navigate} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const {conditionType, conditionPhotoType, conditionId, inventoryId} =
    useConditionStore();

  const {photo, item} = props.route.params;
  const [image, setImage] = useState<string | null | undefined>(photo);

  const {data, refetch, isFetching} = useGetPhotoConditionDetail({
    conditionType: conditionType!,
    id: item?.id,
  });
  const {mutateAsync: savePhotoAsync} = useSavePhotoCondition();

  const refCallSheet = useRef<RBSheetRef>(null);
  const refVoice = useRef<SpeechFormInputRef>(null);

  const {refetchAll} = useRefreshIndicator([
    [
      QUERY_KEYS.PHOTOS_CONDITION,
      {
        conditionType: conditionType!,
        sideType: conditionPhotoType!,
        reportId: conditionId!,
      },
    ],
  ]);

  useEffect(() => {
    if (data?.id) {
      setImage(data.photo);
    }
  }, [data]);

  const closeSheet = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.close();
    }
  }, []);

  const manageImage = useCallback(
    (image: ImageType) => {
      setImage(image.data);
    },
    [setImage],
  );

  const initCamera = useCallback(() => {}, []);

  const initGallery = useCallback(() => {
    onSelectImage(closeSheet, (img) => manageImage(img as ImageType));
  }, [closeSheet]);

  const retakePhoto = useCallback(() => {
    if (refCallSheet.current) {
      refCallSheet.current.open();
    }
  }, []);

  const onSave = useCallback(
    (form: SaveTaskImageSchemaType) => {
      Keyboard.dismiss();
      if (refVoice?.current) {
        refVoice.current.stop();
      }
      loadingWrapperPromise(
        savePhotoAsync({
          conditionType: conditionType!,
          idJob,
          reportId: conditionId!,
          idJobInventory: inventoryId!,
          type: conditionPhotoType!,
          title: form.title,
          description: form.description,
          id: item?.id,
          photo: image!,
          idStickyNote: item?.id_sticky_note,
          subType: item?.subtype,
        })
          .then((isSuccess) => {
            if (isSuccess) {
              refetchAll();
              if (item?.id) {
                refetch();
              }
              showToastMessage('Photo saved successfully');
              goBack();
            } else {
              showErrorToastMessage(
                'Error while saving photo, please reattempt',
              );
            }
          })
          .catch(() => {}),
      );
    },
    [
      savePhotoAsync,
      item,
      image,
      conditionType,
      conditionId,
      inventoryId,
      conditionPhotoType,
      refetchAll,
      refetch,
    ],
  );

  const titleHeader = useMemo(() => {
    return conditionPhotoType == 'detail'
      ? CONDITION_PHOTO_SIDE_LABELS[conditionPhotoType]
      : conditionType == 'conditionreport'
      ? 'Photo zoom'
      : conditionPhotoType + ' overview';
  }, [conditionPhotoType, conditionType]);

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
              {titleHeader}
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider
          schema={SaveTaskImageSchema}
          defaultValue={{
            title: item?.title,
            description: data?.description,
          }}>
          <KeyboardAwareScrollView
            bottomOffset={220}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}
            keyboardShouldPersistTaps="handled">
            {image != null && image != '' && (
              <PressableOpacity
                style={[
                  styles.containerEditImage,
                  {
                    height:
                      conditionType == 'conditionreport' ||
                      conditionPhotoType == 'detail'
                        ? 250
                        : 350,
                  },
                ]}
                onPress={() =>
                  navigate(RoutesNavigation.BaseImageScreen, {images: [image]})
                }>
                <CustomImage
                  resizeMode="cover"
                  style={styles.imageEdit}
                  source={{uri: 'data:image/jpeg;base64,' + image}}
                />
              </PressableOpacity>
            )}

            <InputTextContext
              label="Title*"
              currentId="title"
              placeholder="Title for image (required)"
            />
            <InputTextContext
              label="Description"
              currentId="description"
              placeholder="(Optional)"
              multiline={true}
              containerProps={{
                style: {
                  marginTop: 10,
                },
              }}
              style={styles.inputTextArea}
              isErrorHidden={true}
            />

            <Wrapper style={{top: 0}}>
              <SpeechFormContext ref={refVoice} name="description" />
            </Wrapper>

            <Wrapper
              style={{
                marginTop: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 5,
              }}>
              <RoundedButton
                label="Retake photo"
                onPress={retakePhoto}
                icon={<Icons.Camera fontSize={21} color={COLORS.primary} />}
                style={{
                  backgroundColor: 'white',
                  borderColor: COLORS.primary,
                  borderWidth: 1,
                  width: '50%',
                }}
                labelStyles={{color: COLORS.primary}}
              />

              <ButtonSubmit
                disabled={isFetching}
                label="Save photo"
                icon={<Icons.Save fontSize={21} color="white" />}
                onSubmit={onSave}
                style={{width: '50%'}}
              />
            </Wrapper>
          </KeyboardAwareScrollView>
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
    paddingLeft: 10,
    paddingRight: 10,
    height: 80,
  },
  containerEditImage: {
    height: 250,
    width: '100%',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: '#d0d0d0',
    marginBottom: 10,
  },
  imageEdit: {
    width: '100%',
    height: '100%',
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
    paddingBottom: 50,
  },
});
