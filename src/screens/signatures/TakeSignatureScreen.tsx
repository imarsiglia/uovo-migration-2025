// TakeSignatureScreen.tsx (versión robusta)
import {QUERY_KEYS} from '@api/contants/constants';
import {useSaveSignature} from '@api/hooks/HooksTaskServices';
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
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = NativeStackScreenProps<RootStackParamList, 'TakeSignature'>;

export const TakeSignatureScreen = (props: Props) => {
  // 👉 Usa el MISMO ref para provider y canvas
  const refCanvas = useRef<CanvasControls>(null);

  return (
    <CanvasControlProvider
      // @ts-ignore
      canvasRef={refCanvas}
      initialToolColor={COLORS.dark}
      initialToolType="pen"
      initialStrokeWeight={3}>
      {/* @ts-ignore */}
      <_TakeSignatureScreen {...props} refCanvas={refCanvas} />
    </CanvasControlProvider>
  );
};

const _TakeSignatureScreen = ({
  route,
  refCanvas,
}: Props & {refCanvas: React.RefObject<CanvasControls>}) => {
  const {name, type} = route.params;
  const {goBack} = useCustomNavigation();
  const {mutateAsync} = useSaveSignature();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const signatureForce = useTopSheetStore((d) => d.signatureForce);
  const {user_id} = useAuth((d) => d.user!);
  const {online} = useOnline();

  const signaturesKey = [
    QUERY_KEYS.SIGNATURES,
    {idJob, forceSend: signatureForce},
  ];
  const {refetchAll} = useRefreshIndicator([
    signaturesKey,
    [QUERY_KEYS.TASK_COUNT, {idJob}],
  ]);
  const upsertSignature = useUpsertArrayCache<SignatureType>(signaturesKey);

  // 1) Bloqueo de orientación + “ready” gate para montar Canvas
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    lockToLandscape();
    // espera breve para que termine la rotación y el layout sea estable
    const t = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
      lockToPortrait();
    };
  }, []);

  // 2) Dimensiones reales para no crear el Surface en tamaño 0
  const [dims, setDims] = useState<{w: number; h: number} | null>(null);
  const onHostLayout = useCallback((e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({w: width, h: height});
  }, []);

  // 3) Fingerprint de “lienzo en blanco”
  const [blankFP, setBlankFP] = useState<string | null>(null);
  const getSnapshotB64 = useCallback(() => {
    const snap = refCanvas.current?.makeImageSnapshot?.({
      imageFormat: ImageFormat.PNG,
    });
    return snap?.data ?? null;
  }, [refCanvas]);

  const fingerprint = useCallback((b64: string) => {
    return `${b64.length}:${b64.slice(0, 64)}:${b64.slice(-64)}`;
  }, []);

  useEffect(() => {
    if (!ready || !dims) return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        const b64 = refCanvas.current?.makeImageSnapshot?.({
          imageFormat: ImageFormat.PNG,
        })?.data;
        if (b64) setBlankFP(fingerprint(b64));
      }, 60);
    });
  }, [ready, dims, fingerprint]);

  // const captureBlankSoon = useCallback(() => {
  //   // pequeño debounce para asegurar que el surface ya está vivo
  //   requestAnimationFrame(() => {
  //     setTimeout(() => {
  //       const b64 = getSnapshotB64();
  //       if (b64) setBlankFP(fingerprint(b64));
  //     }, 60);
  //   });
  // }, [getSnapshotB64, fingerprint]);

  // 4) Guardar
  const saveSign = useCallback(() => {
    loadingWrapperPromise(
      (async () => {
        const snap = refCanvas.current?.makeImageSnapshot?.({
          imageFormat: ImageFormat.PNG,
        });
        let signatureBase64 = snap?.data?.replace(/(\r\n|\n|\r)/gm, '');
        if (!signatureBase64) return;

        if (blankFP && fingerprint(signatureBase64) === blankFP) {
          showErrorToastMessage('Please sign before saving');
          return;
        }

        // aplana sobre blanco para evitar fondos oscuros
        signatureBase64 = flattenBase64OnWhite(signatureBase64, 'png');
        if (!signatureBase64) {
          showErrorToastMessage('Error while processing signature');
          return;
        }

        if (online) {
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
        } else {
          // OFFLINE: enqueue + optimistic cache
          const clientId = generateUUID();
          // encola a tu outbox
          // offlineCreateSignature({...});
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
        }
      })(),
    );
  }, [
    online,
    blankFP,
    fingerprint,
    idJob,
    name,
    type,
    mutateAsync,
    refetchAll,
    upsertSignature,
    goBack,
    refCanvas,
  ]);

  const clear = useCallback(() => {
    refCanvas.current?.clear();
    // captureBlankSoon();
  }, [refCanvas]);

  return (
    <Wrapper style={styles.container}>
      {/* Header no bloquea toques fuera de su caja */}
      <View style={{backgroundColor: 'white'}} pointerEvents="box-none">
        <View style={GLOBAL_STYLES.containerBtnOptTop} pointerEvents="box-none">
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

        <View style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Sign below
          </Label>
        </View>
      </View>

      <MinRoundedView />

      {/* Host mide y sólo monta el Canvas cuando hay tamaño y landscape ya aplicado */}
      <View style={{flex: 1}} onLayout={onHostLayout}>
        {ready && dims && (
          <Canvas
            ref={refCanvas}
            style={{
              width: dims.w,
              height: dims.h,
              alignSelf: 'center',
              backgroundColor: 'white',
            }}
          />
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fbfbfb'},
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
  labelOptTop: {color: 'white', marginLeft: 5},
  topsheet: {color: '#3a3a3a'},
});
