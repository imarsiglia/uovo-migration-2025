import { SIGNER_TYPES } from '@api/contants/constants';
import { useGetSignatures } from '@api/hooks/HooksTaskServices';
import { SignatureType } from '@api/types/Task';
import { Icons } from '@assets/icons/icons';
import { PressableOpacity } from '@components/commons/buttons/PressableOpacity';
import { BasicFormProvider } from '@components/commons/form/BasicFormProvider';
import { ButtonSubmit } from '@components/commons/form/ButtonSubmit';
import { InputTextContext } from '@components/commons/form/InputTextContext';
import { SelectRadioButtonContext } from '@components/commons/form/SelectRadioButtonContext';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import { RoutesNavigation } from '@navigation/types';
import { useRoute } from '@react-navigation/native';
import useTopSheetStore from '@store/topsheet';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { capitalize } from '@utils/functions';
import { showErrorToastMessage } from '@utils/toast';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    ListRenderItemInfo,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import { useCustomNavigation } from 'src/hooks/useCustomNavigation';
import {
    PreSaveSignatureSchema,
    PreSaveSignatureSchemaType,
} from 'src/types/schemas';

const DEFAULT_VALUE_TYPE = SIGNER_TYPES[0].id;

export const SignaturesScreen = () => {
  const {goBack, navigate} = useCustomNavigation();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const [forceSend, setForceSend] = useState(false);
  const route = useRoute<any>();

  const {
    data: signatures,
    isLoading,
    isRefetching,
    refetch,
  } = useGetSignatures({
    idJob: jobDetail.id,
    forceSend,
  });

  useEffect(() => {
    if (route.params?.changed > 0) {
      refetch();
    }
  }, [route.params?.changed]);

  const initSaveSignature = useCallback(
    (props: PreSaveSignatureSchemaType) => {
      Keyboard.dismiss();

      if (signatures?.length > 2) {
        showErrorToastMessage('All signatures have already been registered');
        return;
      }

      if (signatures?.some((item) => item.type === props.type)) {
        showErrorToastMessage(
          `You cannot add more than one ${capitalize(props.type)} signature.`,
        );
        return;
      }

      navigate(RoutesNavigation.TakeSignature, {
        name: props.name!,
        type: props.type!,
        forceSend,
        changed: route.params?.changed,
      });
    },
    [navigate, forceSend],
  );

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<SignatureType>) => {
      return (
        <Wrapper key={item.id} style={styles.containerNotification}>
          <Wrapper style={styles.viewNotification}>
            <PressableOpacity
              onPress={() =>
                navigate('VisualizePhoto', {photo: item.signature_data})
              }>
              <Label style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
                {item.print_name}
              </Label>
              <Label style={styles.subtitleNotification}>{item.type}</Label>
            </PressableOpacity>
            <Wrapper style={GLOBAL_STYLES.row}>
              <PressableOpacity
                style={[styles.iconOption, {marginRight: 5}]}
                onPress={() =>
                  navigate('VisualizePhoto', {
                    photo: item.signature_data,
                  })
                }>
                <Icon name="eye" type="solid" size={20} color="#00D3ED" />
              </PressableOpacity>
              <PressableOpacity onPress={() => {}} style={styles.iconOption}>
                <Icon name="trash" type="solid" size={20} color="#00D3ED" />
              </PressableOpacity>
            </Wrapper>
          </Wrapper>
        </Wrapper>
      );
    },
    [navigate],
  );

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[styles.container]}>
        {(isLoading || isRefetching) && (
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
              Signature
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <BasicFormProvider
          schema={PreSaveSignatureSchema}
          defaultValue={{
            type: DEFAULT_VALUE_TYPE,
          }}>
          <Wrapper style={[styles.minLateralPadding, {gap: 5}]}>
            <InputTextContext label="Print Name*" currentId="name" />
            <SelectRadioButtonContext
              currentId="type"
              options={SIGNER_TYPES}
              horizontal
            />

            <Wrapper
              style={[
                GLOBAL_STYLES.row,
                {
                  marginTop: 5,
                  marginBottom: 20,
                  justifyContent: 'space-between',
                },
              ]}>
              <ButtonSubmit
                onSubmit={initSaveSignature}
                style={styles.btnOpenSignature}
                label="Open space for signature"
                onInvalid={() =>
                  showErrorToastMessage('Please, enter the Print Name')
                }
                icon={<Icon name="signature" color="white" size={16} />}
              />
            </Wrapper>
          </Wrapper>
        </BasicFormProvider>

        {signatures?.length > 0 && (
          <Wrapper
            style={[
              styles.minLateralPadding,
              {
                borderTopWidth: 0.5,
                borderTopColor: '#d0d0d0',
                opacity: 0.5,
              },
            ]}>
            <Label style={[GLOBAL_STYLES.bold, {marginTop: 10}]}>
              Registered signatures
            </Label>
          </Wrapper>
        )}

        <FlatList
          data={signatures}
          renderItem={renderItem}
          bounces={false}
          contentContainerStyle={styles.scrollview}
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
  minLateralPadding: {
    paddingHorizontal: 10,
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
  btnOpenSignature: {
    borderRadius: 50,
    alignSelf: 'flex-start',
    height: 30,
    minHeight: 30,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: COLORS.primary,
    gap: 5,
  },
  scrollview: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 150,
  },
  containerNotification: {
    marginBottom: 5,
  },
  viewNotification: {
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
  titleNotification: {
    color: '#464646',
    fontSize: 14,
  },
  subtitleNotification: {
    color: '#3C424A',
    opacity: 0.66,
    fontSize: 12,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  iconOption: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
