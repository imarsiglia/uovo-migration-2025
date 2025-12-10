// EditImageScreen.tsx
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  CanvasControlProvider,
  CanvasControls,
} from '@equinor/react-native-skia-draw';
import {
  Image as SkImageNode,
  ImageFormat,
  Rect,
  Skia,
} from '@shopify/react-native-skia';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Icons} from '@assets/icons/icons';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {COLORS} from '@styles/colors';
import {RootStackParamList} from '@navigation/types';
import {useCustomNavigation} from '@hooks/useCustomNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditImage'>;

// 'white' = fondo blanco; 'transparent' = PNG con alfa
const SAVE_BG_MODE: 'white' | 'transparent' = 'white';
const HEADER_H = 48;

export const EditImageScreen: React.FC<Props> = (props) => {
  // No necesitamos el ref externo del provider
  const dummyRef: any = undefined;
  return (
    <CanvasControlProvider
      canvasRef={dummyRef}
      initialToolColor={COLORS.strokeRed}
      initialToolType="pen"
      initialStrokeWeight={4} // grosor por defecto, ajustable
    >
      <DrawImage {...props} />
    </CanvasControlProvider>
  );
};

const DrawImage: React.FC<Props> = (props) => {
  const refCanvas = useRef<CanvasControls>(null);
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {goBack, navigate, getState} = useCustomNavigation();

  const [exportOverlay, setExportOverlay] = useState(false);

  // Carga base64 → SkImage
  const skImage = useMemo(() => {
    const b64 = props.route.params?.photo?.data;
    return b64 ? Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(b64)) : null;
  }, [props.route.params?.photo?.data]);

  // Área del canvas visible (edición en pantalla)
  const canvasW = width;
  const canvasH = Math.max(1, height - insets.top - HEADER_H - 8);

  // Paint único (evita "expected an Object")
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAntiAlias(true);
    return p;
  }, []);

  // Calcula dónde “cae” la imagen dentro del canvas visible (fit=contain)
  const viewRectOfImage = useCallback((imgW: number, imgH: number, boxW: number, boxH: number) => {
    const s = Math.min(boxW / imgW, boxH / imgH);
    const w = imgW * s;
    const h = imgH * s;
    const x = (boxW - w) / 2;
    const y = (boxH - h) / 2;
    return { x, y, w, h };
  }, []);

  const saveImage = useCallback(async () => {
    try {
      if (!skImage || !refCanvas.current) return;

      // 1) Captura SOLO trazos (oculta base para el snapshot)
      setExportOverlay(true);
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      await new Promise<void>(r => requestAnimationFrame(() => r()));

      const overlaySnap = refCanvas.current.makeImageSnapshot?.({
        imageFormat: ImageFormat.PNG, // overlay sin pérdida
      });

      setExportOverlay(false);
      const overlayB64 = overlaySnap?.data?.replace(/(\r\n|\n|\r)/gm, '');
      if (!overlayB64) {
        // Sin trazos: devolvemos la imagen original (PNG)
        const originalPNG = skImage.encodeToBase64(ImageFormat.PNG);
        if (!originalPNG) return;
        return navigate(
          getState().routes[getState().index - 1]?.name as any,
          {
            editedImage: { ...props.route.params.photo, data: originalPNG, compress: false },
            photos: props.route.params?.photos,
          },
          { merge: true, pop: true }
        );
      }

      const overlayImg = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(overlayB64));
      if (!overlayImg) return;

      // 2) Surface offscreen a resolución ORIGINAL
      const origW = skImage.width();
      const origH = skImage.height();
      const surface = Skia.Surface.MakeOffscreen(origW, origH);
      if (!surface) return;
      const canvas = surface.getCanvas();

      // 3) Fondo
      if (SAVE_BG_MODE === 'white') {
        const bg = Skia.Paint();
        bg.setColor(Skia.Color('#FFFFFF'));
        canvas.drawRect(Skia.XYWHRect(0, 0, origW, origH), bg);
      } else {
        canvas.clear(Skia.Color('transparent'));
      }

      // 4) Dibuja base (full-res)
      const srcFull = Skia.XYWHRect(0, 0, origW, origH);
      const dstFull = Skia.XYWHRect(0, 0, origW, origH);
      canvas.drawImageRect(skImage, srcFull, dstFull, paint);

      // 5) Proyecta overlay desde coords de la vista → coords originales
      //    - overlayImg: tamaño = (canvasW, canvasH) del snapshot
      const viewRect = viewRectOfImage(origW, origH, canvasW, canvasH);
      const sx = overlayImg.width() / canvasW;   // pxOverlay por dp
      const sy = overlayImg.height() / canvasH;

      // Recorta del overlay SOLO el área donde estuvo la imagen base
      const srcOverlay = Skia.XYWHRect(viewRect.x * sx, viewRect.y * sy, viewRect.w * sx, viewRect.h * sy);
      // Ese recorte lo estiramos al tamaño original completo (para que las trazos queden encima de la base nativa)
      canvas.drawImageRect(overlayImg, srcOverlay, dstFull, paint);

      // 6) Exporta PNG full-res sin pérdida
      const outImage = surface.makeImageSnapshot();
      const outPNG = outImage.encodeToBase64(ImageFormat.PNG);
      if (!outPNG) return;

      navigate(
        getState().routes[getState().index - 1]?.name as any,
        {
          editedImage: { ...props.route.params.photo, data: outPNG, compress: false },
          photos: props.route.params?.photos,
        },
        { merge: true, pop: true }
      );
    } catch (e) {
      console.error('[EditImage] saveImage error:', e);
      setExportOverlay(false);
    }
  }, [
    skImage,
    refCanvas,
    canvasW,
    canvasH,
    viewRectOfImage,
    paint,
    navigate,
    getState,
    props.route.params?.photo,
    props.route.params?.photos,
  ]);

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

      {/* Herramientas fijas */}
      <View pointerEvents="box-none" style={[styles.toolsOverlay, {top: HEADER_H + 8, right: 12}]}>
        <TouchableOpacity onPress={undo} style={styles.functionButtonRound}>
          <Icons.Undo fontSize={15} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={clear} style={styles.functionButtonRound}>
          <Icons.PaintRoller fontSize={15} color={COLORS.white} />
        </TouchableOpacity>
        {/* Aquí podrías añadir botones de color/grosor si lo deseas */}
      </View>

      {/* Canvas visible de edición */}
      <View style={styles.canvasHost}>
        {skImage && (
          <Canvas ref={refCanvas} style={{width: canvasW, height: canvasH, alignSelf: 'center'}}>
            {/* Fondo visible (NO se incluye cuando exportOverlay = true) */}
            {!exportOverlay && SAVE_BG_MODE === 'white' && (
              <Rect x={0} y={0} width={canvasW} height={canvasH} color="#FFFFFF" />
            )}

            {/* Imagen base (oculta al exportar overlay) */}
            {!exportOverlay && (
              <SkImageNode image={skImage} width={canvasW} height={canvasH} fit="contain" />
            )}
            {/* Encima van las trazos que pinta el provider */}
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
    // decorativo: NO se guarda
    backgroundColor: '#fff',
  },
});
