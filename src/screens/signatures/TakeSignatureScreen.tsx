// TakeSignatureScreen.tsx
import { QUERY_KEYS } from '@api/contants/constants';
import { useSaveSignature } from '@api/hooks/HooksTaskServices';
import { SignatureType } from '@api/types/Task';
import { BackButton } from '@components/commons/buttons/BackButton';
import { PressableOpacity } from '@components/commons/buttons/PressableOpacity';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import { offlineCreateSignature } from '@features/signatures/offline';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import { useOnline } from '@hooks/useOnline';
import { useRefreshIndicator } from '@hooks/useRefreshIndicator';
import { useUpsertArrayCache } from '@hooks/useToolsReactQueryCache';
import { RootStackParamList } from '@navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SketchCanvas } from '@sourcetoad/react-native-sketch-canvas';
import { loadingWrapperPromise } from '@store/actions';
import { useAuth } from '@store/auth';
import useTopSheetStore from '@store/topsheet';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import {
  generateUUID,
  lockToLandscape,
  lockToPortrait,
  satinizeBase64
} from '@utils/functions';
import { showErrorToastMessage } from '@utils/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = NativeStackScreenProps<RootStackParamList, 'TakeSignature'>;

export const TakeSignatureScreen = ({route}: Props) => {
  const {name, type} = route.params;
  const refCanvas = useRef<SketchCanvas>(null);

  const {goBack, addListener} = useCustomNavigation();
  const {mutateAsync} = useSaveSignature();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const signatureForce = useTopSheetStore((d) => d.signatureForce);
  const {user_id} = useAuth((d) => d.user!);
  const {online} = useOnline();

  const [isEmpty, setIsEmpty] = useState(true);

  const signaturesKey = [
    QUERY_KEYS.SIGNATURES,
    {idJob, forceSend: signatureForce},
  ];

  const {refetchAll} = useRefreshIndicator([
    signaturesKey,
    [QUERY_KEYS.TASK_COUNT, {idJob}],
  ]);

  const upsertSignature = useUpsertArrayCache<SignatureType>(signaturesKey);

  useEffect(() => {
    lockToLandscape();
    return () => {
      lockToPortrait();
    };
  }, []);

  const saveSign = useCallback(() => {
    if (isEmpty) {
      showErrorToastMessage('Please sign before saving');
      return;
    }
    refCanvas.current?.getBase64('png', false, true, false, false);
    // loadingWrapperPromise(
    //   new Promise<void>(async (resolve) => {
    //     refCanvas.current?.getBase64('png', false, true, false, true);
    //     resolve();
    //   }),
    // );
  }, [isEmpty]);

  const onGenerateBase64 = async ({base64}: {base64: string}) => {
    const signatureBase64 = satinizeBase64(base64);

    if (!signatureBase64) {
      showErrorToastMessage('Error while processing signature');
      return;
    }

    if (online) {
      loadingWrapperPromise(async () => {
        const ok = await mutateAsync({
          idJob,
          force_send: true,
          printName: name,
          type,
          signature: signatureBase64,
        }).catch(() => false);

        if (ok) {
          refetchAll();
          goBack();
        } else {
          showErrorToastMessage('Could not save the signature');
        }
      }).catch(() => {});
    } else {
      loadingWrapperPromise(async () => {
        const clientId = generateUUID();
        await offlineCreateSignature({
          idJob,
          clientId,
          printName: name,
          type,
          signature: signatureBase64,
        });

        upsertSignature({
          clientId,
          id_job: idJob,
          id_user: user_id,
          print_name: name,
          type,
          signature_data: signatureBase64,
          signature_timestamp: new Date().toISOString().split('.')[0],
        });
        goBack();
      }).catch(() => {});
    }
  };

  const clear = () => {
    refCanvas.current?.clear();
    setIsEmpty(true);
  };

  return (
    <Wrapper style={styles.container}>
      <View style={{backgroundColor: 'white'}}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton onPress={goBack} title="Signature" />

          <View style={{flexDirection: 'row'}}>
            <PressableOpacity onPress={clear} style={styles.btnOptTop}>
              <Icon name="times" color="white" type="solid" size={15} />
              <Label style={styles.labelOptTop}>Clear</Label>
            </PressableOpacity>

            <PressableOpacity onPress={saveSign} style={styles.btnOptTop}>
              <Icon name="save" color="white" type="solid" size={15} />
              <Label style={styles.labelOptTop}>Save</Label>
            </PressableOpacity>
          </View>
        </View>

        <View style={[GLOBAL_STYLES.lateralPadding]}>
          <Label style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold]}>
            Sign below
          </Label>
        </View>
      </View>

      <MinRoundedView />

      <View style={{flex: 1}}>
        <SketchCanvas
          ref={refCanvas}
          style={{flex: 1, backgroundColor: 'white'}}
          strokeColor={COLORS.dark}
          strokeWidth={4}
          onStrokeStart={() => setIsEmpty(false)}
          onGenerateBase64={onGenerateBase64}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fbfbfb'},
  btnOptTop: {
    backgroundColor: COLORS.primary,
    height: 27,
    width: 80,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  labelOptTop: {color: 'white', marginLeft: 5},
});
