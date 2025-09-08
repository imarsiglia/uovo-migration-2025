import {useHelpDeskService} from '@api/hooks/HooksGeneralServices';
import {useGetBOLCount} from '@api/hooks/HooksTaskServices';
import {Icons} from '@assets/icons/icons';
import {
  ImageOptionSheet,
  RBSheetRef,
} from '@components/commons/bottomsheets/ImageOptionSheet';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {SelectRadioButtonContext} from '@components/commons/form/SelectRadioButtonContext';
import {SpeechFormInputRef} from '@components/commons/form/SpeechFormContext';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {RoutesNavigation} from '@navigation/types';
import {useRoute} from '@react-navigation/native';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getDeviceInfoAsString} from '@utils/functions';
import {onLaunchCamera, onSelectImage} from '@utils/image';
import {showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Keyboard, StyleSheet} from 'react-native';
import type {Image as ImageType} from 'react-native-image-crop-picker';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useCustomNavigation} from 'src/hooks/useCustomNavigation';
import {HelpDeskSchemaType, PieceCountSchema} from 'src/types/schemas';

export const EditPieceCountScreen = () => {
  const {goBack, navigate} = useCustomNavigation();
  const route = useRoute<any>();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail);

  const {mutateAsync, isPending} = useHelpDeskService();

  const {data, isLoading} = useGetBOLCount({
    idJob,
  });

  console.log('data bol count');
  console.log(data);

  const saveReport = useCallback((props: HelpDeskSchemaType) => {
    Keyboard.dismiss();
  }, []);

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[styles.container]}>
        {isLoading && <GeneralLoading />}

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
              Edit BOL
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider
          schema={PieceCountSchema}
          defaultValue={{
            packageCount: data.packageCount?.toString(),
            pbs: data.pbs,
          }}>
          <KeyboardAwareScrollView
            bottomOffset={220}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}
            keyboardShouldPersistTaps="handled">
            <InputTextContext label="Package count*" currentId="packageCount" />

            <Label style={styles.subtitle}>Packed by Shipper</Label>
            <SelectRadioButtonContext
              currentId="pbs"
              horizontal
              options={[
                {id: 'Yes', name: 'Yes'},
                {id: 'No', name: 'No'},
              ]}
            />
          </KeyboardAwareScrollView>

          <KeyboardStickyView style={styles.containerBottom}>
            <ButtonSubmit
              label="Save changes"
              icon={<Icons.Save fontSize={21} color="white" />}
              onSubmit={saveReport}
              style={{marginBottom: 10}}
              showValidationError
            />
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
  subtitle: {
    color: COLORS.gray,
    marginBottom: 5,
    marginTop: 20,
    paddingLeft: 5,
    fontSize: 13,
  },
});
