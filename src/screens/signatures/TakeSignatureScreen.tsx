import {QUERY_KEYS} from '@api/contants/constants';
import {useSaveSignature} from '@api/hooks/HooksTaskServices';
import {SaveSignatureApiProps} from '@api/services/taskServices';
import {SignatureType} from '@api/types/Task';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {
  Canvas,
  CanvasControlProvider,
  CanvasControls,
} from '@equinor/react-native-skia-draw';
import {offlineCreateSignature} from '@features/signatures/offline';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {useUpsertArrayCache} from '@hooks/useToolsReactQueryCache';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageFormat} from '@shopify/react-native-skia';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {generateUUID, lockToLandscape, lockToPortrait} from '@utils/functions';
import {flattenBase64OnWhite} from '@utils/image';
import {showErrorToastMessage} from '@utils/toast';
import {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = NativeStackScreenProps<RootStackParamList, 'TakeSignature'>;

export const TakeSignatureScreen = (props: Props) => {
  const dd: any = undefined;
  return (
    <CanvasControlProvider
      canvasRef={dd}
      initialToolColor={COLORS.dark}
      initialToolType="pen"
      initialStrokeWeight={3}>
      <_TakeSignatureScreen {...props} />
    </CanvasControlProvider>
  );
};

const _TakeSignatureScreen = (props: Props) => {
  const {name, type} = props.route.params;

  const {goBack, getState} = useCustomNavigation();
  const {mutateAsync} = useSaveSignature();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);

  const signatureForce = useTopSheetStore((d) => d.signatureForce);
  const {user_id} = useAuth((d) => d.user!);

  const signaturesKey = [
    QUERY_KEYS.SIGNATURES,
    {idJob, forceSend: signatureForce},
  ];

  const {refetchAll} = useRefreshIndicator([
    signaturesKey,
    [QUERY_KEYS.TASK_COUNT, {idJob}],
  ]);
  const refCanvas = useRef<CanvasControls>(null);
  const {online} = useOnline();

  const upsertSignature = useUpsertArrayCache<SignatureType>(signaturesKey);

  useEffect(() => {
    lockToLandscape();
    return () => {
      lockToPortrait();
    };
  }, []);

  const [blankFP, setBlankFP] = useState<string | null>(null);

  // toma el base64 del snapshot actual
  const getSnapshotB64 = useCallback(() => {
    const snap = refCanvas.current?.makeImageSnapshot?.({
      imageFormat: ImageFormat.PNG,
    });
    return snap?.data ?? null;
  }, []);

  // fingerprint simple y rápido (largo + primeros/últimos bytes)
  const fingerprint = useCallback((b64: string) => {
    return `${b64.length}:${b64.slice(0, 64)}:${b64.slice(-64)}`;
  }, []);

  // captura el "estado en blanco" (después de montar o de limpiar)
  const captureBlank = useCallback(() => {
    const b64 = getSnapshotB64();
    if (b64) setBlankFP(fingerprint(b64));
  }, [getSnapshotB64, fingerprint]);

  const onCanvasLayout = useCallback(() => {
    requestAnimationFrame(() => setTimeout(captureBlank, 50));
  }, [captureBlank]);

  const saveSign = useCallback(() => {
    const snap = refCanvas.current?.makeImageSnapshot?.({
      imageFormat: ImageFormat.PNG,
    });
    let signatureBase64 = snap?.data?.replace(/(\r\n|\n|\r)/gm, '');
    if (!signatureBase64) return;

    if (blankFP && fingerprint(signatureBase64) === blankFP) {
      showErrorToastMessage('Please sign before saving');
      return;
    }

    signatureBase64 = flattenBase64OnWhite(signatureBase64, 'png');

    if (!signatureBase64) {
      showErrorToastMessage('Error while processing signature');
      return;
    }

    if (online) {
      loadingWrapperPromise(
        mutateAsync({
          idJob,
          force_send: true,
          printName: name,
          type,
          signature: signatureBase64,
        })
          .then((d) => {
            if (d) {
              refetchAll();
              goBack();
            } else {
              showErrorToastMessage('Could not save the signature');
            }
          })
          .catch((e) => {
            console.error('error');
            console.error(e);
            showErrorToastMessage('Could not save the signature');
          }),
      );
    } else {
      // OFFLINE: enqueue + optimistic cache
      try {
        // create a new offline draft with auto clientId
        const clientId = generateUUID();
        offlineCreateSignature({
          idJob,
          clientId,
          force_send: true,
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
      } catch (e) {
        console.log(e);
      }
    }
  }, [
    online,
    blankFP,
    fingerprint,
    idJob,
    name,
    type,
    getState,
    mutateAsync,
    refetchAll,
    offlineCreateSignature,
    upsertSignature,
    goBack,
  ]);

  const clear = useCallback(() => {
    if (refCanvas.current && refCanvas.current) {
      refCanvas.current.clear();
      setTimeout(captureBlank, 50);
    }
  }, [refCanvas?.current, captureBlank]);

  return (
    <Wrapper style={[styles.container]}>
      <Wrapper style={[{backgroundColor: 'white'}]}>
        <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton onPress={goBack} title="Signature" />

          <Wrapper style={{flexDirection: 'row'}}>
            <PressableOpacity onPress={clear} style={styles.btnOptTop}>
              <Icon name="times" color="white" type="solid" size={15} />
              <Label style={styles.labelOptTop}>Clear</Label>
            </PressableOpacity>

            <PressableOpacity
              onPress={() => saveSign()}
              style={styles.btnOptTop}>
              <Icon name="save" color="white" type="solid" size={15} />
              <Label style={styles.labelOptTop}>Save</Label>
            </PressableOpacity>
          </Wrapper>
        </Wrapper>

        <Wrapper style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
          <Label
            onLayout={onCanvasLayout}
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Sign below
          </Label>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      <Canvas
        ref={refCanvas}
        style={{
          width: '100%',
          height: '100%',
          alignSelf: 'center',
          backgroundColor: 'white',
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  btnOptTop: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    width: 80,
    paddingHorizontal: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  labelOptTop: {
    color: 'white',
    marginLeft: 5,
  },
  topsheet: {
    color: '#3a3a3a',
  },
});
