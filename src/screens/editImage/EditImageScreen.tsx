import {Icons} from '@assets/icons/icons';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {
  Canvas,
  CanvasControlProvider,
  CanvasControls,
} from '@equinor/react-native-skia-draw';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Image as SkImageNode,
  ImageFormat,
  Rect,           // 👈 importa Rect de Skia
  Skia
} from '@shopify/react-native-skia';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import React, {useCallback, useMemo, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'EditImage'>;

// Cambia este modo según lo que necesites:
const SAVE_BG_MODE: 'white' | 'transparent' = 'white'; // 'transparent' → PNG

export const EditImageScreen = (props: Props) => {
  const dummyRef: any = undefined;
  return (
    <CanvasControlProvider
      canvasRef={dummyRef}
      initialToolColor={COLORS.strokeRed}
      initialToolType="pen"
      initialStrokeWeight={3}>
      <DrawImage {...props} />
    </CanvasControlProvider>
  );
};

const HEADER_H = 48;

const DrawImage = (props: Props) => {
  const refCanvas = useRef<CanvasControls>(null);
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {goBack, navigate, getState} = useCustomNavigation();

  // Carga de imagen desde base64
  const skImage = useMemo(() => {
    const b64 = props.route.params?.photo?.data;
    return b64 ? Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(b64)) : null;
  }, [props.route.params?.photo?.data]);

  // Área fija del lienzo (lo que exportarás en el snapshot)
  const canvasW = width;
  const canvasH = Math.max(1, height - insets.top - HEADER_H - 8);

  const saveImage = useCallback(() => {
    // Si quieres transparencia real, conviene PNG
    const usePng = SAVE_BG_MODE === 'white';
    const snap = refCanvas.current?.makeImageSnapshot?.({
      imageFormat: usePng ? ImageFormat.PNG : ImageFormat.JPEG,
      quality: usePng ? undefined : 85,
    });
    const b64 = snap?.data?.replace(/(\r\n|\n|\r)/gm, '');
    if (!b64) return;

    navigate(
      getState().routes[getState().index - 1]?.name as any,
      {
        editedImage: {
          ...props.route.params.photo,
          data: b64,
          compress: false,
        },
        photos: props.route.params?.photos,
      },
      {merge: true, pop: true},
    );
  }, [getState, navigate, props.route.params?.photo, props.route.params?.photos]);

  const undo = useCallback(() => refCanvas.current?.undo?.(), []);
  const clear = useCallback(() => refCanvas.current?.clear?.(), []);

  return (
    <View style={styles.root}>
      {/* HEADER fijo */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <TouchableOpacity onPress={goBack}>
            <View style={styles.backBtn}>
              <Icons.AngleLeft fontSize={15} color={COLORS.gray} />
              <Text style={styles.backBtnText}>Cancel</Text>
            </View>
          </TouchableOpacity>

          <Text style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.headerTitle]}>
            Edit image
          </Text>

          <TouchableOpacity style={[styles.functionButton, GLOBAL_STYLES.row]} onPress={saveImage}>
            <Icons.Check fontSize={15} color={COLORS.white} />
            <Text style={{color: 'white', marginLeft: 5}}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MinRoundedView />

      {/* Toolbar fija */}
      <View pointerEvents="box-none" style={[styles.toolsOverlay, {top: HEADER_H + 8, right: 12}]}>
        <TouchableOpacity onPress={undo} style={styles.functionButtonRound}>
          <Icons.Undo fontSize={15} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={clear} style={styles.functionButtonRound}>
          <Icons.PaintRoller fontSize={15} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Lienzo */}
      <View style={styles.canvasHost}>
        {skImage && (
          <Canvas
            ref={refCanvas}
            style={{width: canvasW, height: canvasH, alignSelf: 'center'}}
          >
            {/* ⬇️ Fondo pintado dentro del Canvas (se incluye en el snapshot) */}
            {SAVE_BG_MODE === 'white' && (
              <Rect x={0} y={0} width={canvasW} height={canvasH} color="#FFFFFF" />
            )}

            {/* Imagen centrada/contain sobre el fondo */}
            <SkImageNode image={skImage} width={canvasW} height={canvasH} fit="contain" />
            {/* Las pinceladas del CanvasControlProvider se dibujan encima */}
          </Canvas>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.bgWhite ?? '#fbfbfb'},

  headerOverlay: {backgroundColor: COLORS.white},
  headerTitle: {color: COLORS.titleColor, fontSize: 20},

  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {color: COLORS.gray, fontSize: 18, paddingBottom: 1},

  functionButton: {
    paddingHorizontal: 10,
    marginVertical: 8,
    height: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },

  toolsOverlay: {
    position: 'absolute',
    zIndex: 25,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF50',
    borderRadius: 10,
  },
  functionButtonRound: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },

  canvasHost: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // este color NO se guarda; sólo decorativo de pantalla
    backgroundColor: '#fff',
  },
});
