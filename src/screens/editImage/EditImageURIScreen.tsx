import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SketchCanvas} from '@sourcetoad/react-native-sketch-canvas';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {nextFrame} from '@utils/functions';
import {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import RNFS from 'react-native-fs';

type Props = NativeStackScreenProps<RootStackParamList, 'EditImageUri'>;
export const EditImageURIScreen = (props: Props) => {
  const refCanvas = useRef<SketchCanvas | undefined>(null);
  const {navigate, getState} = useCustomNavigation();

  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    return () => {
      if (props.route.params.photo.path) {
        RNFS.unlink(props.route.params.photo.path)
          .then(() => {
            // console.log('FILE DELETED EF');
          })
          .catch((err) => {
            // console.log(err.message);
          });
      }
    };
  }, []);

  const saveImage = async () => {
    await nextFrame();
    await nextFrame();
    setInitLoading(true);
    await nextFrame();
    await nextFrame();
    refCanvas.current?.getBase64('jpg', false, true, false, true);
  };

  const updateImage = async (base64: string) => {
    const fileName = `edited_${Date.now()}.jpg`;
    const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await nextFrame();
    await RNFS.writeFile(filePath, base64, 'base64');
    await nextFrame();
    navigate(
      getState().routes[getState().index - 1]?.name as any,
      {
        editedUri: `file://${filePath}`,
        editedBase64: base64,
      },
      {merge: true, pop: true},
    );
    setInitLoading(false);
  };

  return (
    <View style={GLOBAL_STYLES.safeAreaLight}>
      {initLoading && <GeneralLoading />}

      <View style={[styles.container]}>
        <View style={[{backgroundColor: 'white'}]}>
          <View style={GLOBAL_STYLES.containerBtnOptTop}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <View style={styles.backBtn}>
                <Icon
                  name="chevron-left"
                  color="#959595"
                  type="light"
                  size={15}
                />
                <Text style={styles.backBtnText}>Cancel</Text>
              </View>
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
              onPress={saveImage}>
              <Icon name="check" color="white" type="solid" size={15} />
              <Text style={{color: 'white', marginLeft: 5}}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>

        <MinRoundedView />

        {props.route.params.photo != null && (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View
              style={{
                flexDirection: 'row',
                position: 'absolute',
                zIndex: 10,
                top: 0,
                right: 20,
                opacity: 0.7,
              }}>
              <TouchableOpacity
                onPress={() => refCanvas.current?.undo()}
                style={[styles.functionButtonRound]}>
                <Icon
                  style={{opacity: 0.5}}
                  name="undo"
                  color="white"
                  type="solid"
                  size={15}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => refCanvas.current?.clear()}
                style={[styles.functionButtonRound]}>
                <Icon
                  name="paint-roller"
                  color="white"
                  type="solid"
                  size={15}
                />
              </TouchableOpacity>
            </View>

            <SketchCanvas
              // @ts-ignore
              ref={refCanvas}
              strokeColor={'red'}
              strokeWidth={3}
              localSourceImage={{
                filename: props.route.params.photo.path,
                mode: 'AspectFit',
              }}
              onGenerateBase64={({base64}) => {
                updateImage(base64);
              }}
              defaultStrokeIndex={0}
              defaultStrokeWidth={3}
              onCanvasReady={() => {
                setInitLoading(false);
              }}
              style={{flex: 1}}
              // savePreference={() => {
              //   return {
              //     folder: 'RNSketchCanvas',
              //     filename: String(Math.ceil(Math.random() * 100000000)),
              //     transparent: false,
              //     imageType: 'png',
              //   };
              // }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
  },
  btnOptTop: {
    backgroundColor: '#1155cc',
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
    color: '#3a3a3a',
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#39579A',
  },
  functionButton: {
    paddingHorizontal: 10,
    marginVertical: 8,
    height: 30,
    backgroundColor: '#1155CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  functionButtonRound: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 30,
    backgroundColor: '#1155CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
});
