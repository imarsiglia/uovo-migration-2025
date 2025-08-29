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
import {
  CanvasRef,
  Image,
  ImageFormat,
  Rect,
  Skia,
  useCanvasRef,
} from '@shopify/react-native-skia';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {
  deleteFileSystem,
  writeToFileSystem,
  writeToFileSystemWithTemporaryDirectory,
} from '@utils/filesystem';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import RNFS from 'react-native-fs';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'EditImage'>;

export const EditImageScreen = (props: Props) => {
  const dd: any = undefined;
  return (
    <CanvasControlProvider
      canvasRef={dd}
      initialToolColor={COLORS.strokeRed}
      initialToolType="pen"
      initialStrokeWeight={5}>
      <DrawImage {...props} />
    </CanvasControlProvider>
  );
};

const DrawImage = (props: Props) => {
  const refCanvas = useRef<CanvasControls>(null);
  const {goBack, navigate} = useCustomNavigation();
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

  const finalDimensions = useMemo(() => {
    return dimensions;
  }, [dimensions]);

  useEffect(() => {
    return () => {
      if (props?.route?.params?.photo?.path) {
        // deleteFileSystem(props.route.params.photo.path).catch(() => {});
      }
    };
  }, []);

  // const saveImage = useCallback(() => {
  //   const snap = refCanvas.current?.makeImageSnapshot({
  //     imageFormat: ImageFormat.JPEG,
  //     quality: 0.85,
  //   });
  //   if (!snap?.data) return;
  //   navigate(
  //     RoutesNavigation.ContactUs,
  //     {
  //       editedImage: {
  //         ...props.route.params.photo,
  //         data: snap.data.replace(/\r?\n/g, ''),
  //         compress: false,
  //       },
  //       photos: props.route.params?.photos,
  //     },
  //     {merge: true},
  //   );
  // }, [navigate, props.route.params.photo]);

  const saveImage = () => {
    if (refCanvas.current && refCanvas.current.makeImageSnapshot) {
      const snapshot = refCanvas.current.makeImageSnapshot({
        imageFormat: ImageFormat.JPEG,
        quality: 85,
      });
      if (snapshot?.uri) {
        const imagePath = RNFS.TemporaryDirectoryPath + 'imageToEditUovo2.jpg';
        writeToFileSystem({
          contents: snapshot.data,
          filepath: imagePath,
        }).then(() => updateImage(snapshot.data, imagePath));
        // writeToFileSystemWithTemporaryDirectory({
        //   contents: snapshot.data,
        //   extension: 'jpg',
        // }).then((imagePath) => updateImage(snapshot?.data, imagePath));
      }
    }
  };

  const updateImage = (data: string, path: string) => {
    let tempDate = data.replace(/(\r\n|\n|\r)/gm, '');
    navigate(
      RoutesNavigation.ContactUs,
      {
        editedImage: {
          ...props.route.params.photo,
          data: tempDate,
          path: path,
          compress: false,
        },
        photos: props.route.params?.photos,
      },
      {
        merge: true,
        pop: true,
      },
    );
  };

  function undo() {
    if (refCanvas.current && refCanvas.current) {
      refCanvas.current.undo();
    }
  }

  function clear() {
    if (refCanvas.current && refCanvas.current) {
      refCanvas.current.clear();
    }
  }

  return (
    <SafeAreaView style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[styles.container]}>
        <Wrapper style={[{backgroundColor: COLORS.white}]}>
          <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
            <TouchableOpacity onPress={goBack}>
              <Wrapper style={styles.backBtn}>
                {/* <Icon
                  name="chevron-left"
                  color="#959595"
                  type="light"
                  size={15}
                /> */}
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
              {/* <Icon name="check" color="white" type="solid" size={15} /> */}
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
            <Wrapper
              style={{
                flexDirection: 'row',
                position: 'absolute',
                zIndex: 10,
                top: 0,
                right: 20,
                opacity: 0.7,
              }}>
              <TouchableOpacity
                onPress={undo}
                style={[styles.functionButtonRound]}>
                {/* <Icon
                  style={{opacity: 0.5}}
                  name="undo"
                  color="white"
                  type="solid"
                  size={15}
                /> */}
                <Text>Undo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clear}
                style={[styles.functionButtonRound]}>
                {/* <Icon
                  name="paint-roller"
                  color="white"
                  type="solid"
                  size={15}
                /> */}
                <Text>Clear</Text>
              </TouchableOpacity>
            </Wrapper>

            <Canvas ref={refCanvas} style={styles.canvas}>
              {skImage && finalDimensions && (
                <>
                  <Rect
                    x={0}
                    y={0}
                    width={finalDimensions?.width!}
                    height={finalDimensions?.height!}
                    color="white"
                  />
                  <Image
                    image={skImage}
                    width={finalDimensions.width}
                    height={finalDimensions.height}
                    fit={'contain'}
                  />
                </>
              )}
            </Canvas>
          </Wrapper>
        )}
      </Wrapper>
    </SafeAreaView>
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
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
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
    height: '100%',
    backgroundColor: 'transparent',
    // backgroundColor: COLORS.white,
  },
});
