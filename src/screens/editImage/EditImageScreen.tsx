import {Icons} from '@assets/icons/icons';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {
  Canvas,
  CanvasControlProvider,
  CanvasControls,
} from '@equinor/react-native-skia-draw';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Image, ImageFormat, Skia} from '@shopify/react-native-skia';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useCallback, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'EditImage'>;

export const EditImageScreen = (props: Props) => {
  const dd: any = undefined;
  return (
    <CanvasControlProvider
      canvasRef={dd}
      initialToolColor={COLORS.strokeRed}
      initialToolType="pen"
      initialStrokeWeight={3}>
      <DrawImage {...props} />
    </CanvasControlProvider>
  );
};

const DrawImage = (props: Props) => {
  const refCanvas = useRef<CanvasControls>(null);
  const {width, height} = useWindowDimensions();
  const {goBack, navigate, getState} = useCustomNavigation();
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const skImage = useMemo(() => {
    const b64 = props.route.params?.photo?.data;
    return b64
      ? Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(b64))
      : null;
  }, [props.route.params?.photo?.data]);

  const imageDimensions = useMemo(() => {
    if (!skImage) return null;

    const originalWidth = skImage.width();
    const originalHeight = skImage.height();

    // Escalamos al ancho de pantalla
    const scaleFactor = width / originalWidth;

    return {
      width: width,
      height: originalHeight * scaleFactor,
    };
  }, [skImage]);

  const saveImage = useCallback(() => {
    if (refCanvas.current && refCanvas.current.makeImageSnapshot) {
      const snapshot = refCanvas.current.makeImageSnapshot({
        imageFormat: ImageFormat.JPEG,
        quality: 85,
      });
      if (snapshot?.data) {
        // goBack();
        navigate(
          getState().routes[getState().index - 1]?.name as any,
          {
            editedImage: {
              ...props.route.params.photo,
              data: snapshot?.data.replace(/(\r\n|\n|\r)/gm, ''),
              compress: false,
            },
            photos: props.route.params?.photos,
          },
          {
            merge: true,
            pop: true,
          },
        );
      }
    }
  }, [refCanvas?.current]);

  const undo = useCallback(() => {
    if (refCanvas.current && refCanvas.current) {
      refCanvas.current.undo();
    }
  }, [refCanvas?.current]);

  const clear = useCallback(() => {
    if (refCanvas.current && refCanvas.current) {
      refCanvas.current.clear();
    }
  }, [refCanvas?.current]);

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[{backgroundColor: COLORS.white}]}>
        <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
          <TouchableOpacity onPress={goBack}>
            <Wrapper style={styles.backBtn}>
              <Icons.AngleLeft fontSize={15} color={COLORS.gray} />
              <Text style={styles.backBtnText}>Cancel</Text>
            </Wrapper>
          </TouchableOpacity>
          <Text
            style={[
              GLOBAL_STYLES.title,
              GLOBAL_STYLES.bold,
              styles.topsheet,
              {fontSize: 20},
            ]}>
            Edit image
          </Text>
          <TouchableOpacity
            style={[styles.functionButton, GLOBAL_STYLES.row]}
            onPress={() => saveImage()}>
            <Icons.Check fontSize={15} color={COLORS.white} />
            <Text style={{color: 'white', marginLeft: 5}}>OK</Text>
          </TouchableOpacity>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      {props.route.params.photo != null && (
        <Wrapper
          style={{flex: 1, flexDirection: 'row', position: 'relative'}}
          onLayout={(e) => {
            setDimensions(e.nativeEvent.layout);
          }}>
          <Wrapper style={styles.toolbar}>
            <TouchableOpacity
              onPress={undo}
              style={[styles.functionButtonRound]}>
              <Icons.Undo fontSize={15} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clear}
              style={[styles.functionButtonRound]}>
              <Icons.PaintRoller fontSize={15} color={COLORS.white} />
            </TouchableOpacity>
          </Wrapper>

          {skImage && imageDimensions && (
            <Canvas
              ref={refCanvas}
              style={{
                width: imageDimensions.width,
                height: imageDimensions.height,
                alignSelf: 'center',
              }}>
              <Image
                image={skImage}
                width={imageDimensions.width}
                height={imageDimensions.height}
                fit={'contain'}
              />
            </Canvas>
          )}
        </Wrapper>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
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
  functionButton: {
    paddingHorizontal: 10,
    marginVertical: 8,
    height: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
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
  canvas: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    right: 20,
    backgroundColor: '#FFFFFF50',
    borderRadius: 10,
  },
});
