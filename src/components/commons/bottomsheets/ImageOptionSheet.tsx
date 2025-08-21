import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

export type RBSheetRef = {
  open: () => void;
  close: () => void;
};

type ImageOptionSheetProps = {
  initCamera: () => void;
  initGallery: () => void;
  height?: number;
};

export type ImageOptionSheetHandle = {
  open: () => void;
  close: () => void;
};

export const ImageOptionSheet = forwardRef<
  ImageOptionSheetHandle,
  ImageOptionSheetProps
>(({initCamera, initGallery, height = 250}, ref) => {
  const sheetRef = useRef<RBSheetRef | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  return (
    <RBSheet
      ref={sheetRef as any}
      height={height}
      openDuration={10}
      closeDuration={10}
      closeOnPressMask={true}
      closeOnPressBack={true}
      draggable={true} // v3: reemplaza closeOnDragDown
      useNativeDriver={true}
      customModalProps={{
        animationType: 'slide', // v3: va dentro de customModalProps
        statusBarTranslucent: true,
      }}
      customAvoidingViewProps={{enabled: false}}
      customStyles={{
        container: {
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
          height,
          backgroundColor: 'white',
        },
        wrapper: {backgroundColor: '#eeeeee5e'},
        draggableIcon: {backgroundColor: '#d1d1d1', width: 100},
      }}>
      <View style={{flex: 1}}>
        <View style={{paddingTop: 10, justifyContent: 'center'}}>
          <Text style={{fontSize: 20, textAlign: 'center', color: 'gray'}}>
            Select an option
          </Text>
        </View>

        <View style={{paddingTop: 20}}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {borderBottomWidth: 0.5, borderTopWidth: 0.5},
            ]}
            onPress={initCamera}>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, {borderBottomWidth: 0.5}]}
            onPress={initGallery}>
            <Text style={styles.optionText}>Choose from library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton]}
            onPress={() => sheetRef.current?.close()}>
            <Text style={[styles.optionText, {fontSize: 20}]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  optionText: {
    textAlign: 'center',
    fontSize: 22,
    color: '#0084ff',
  },
  optionButton: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#d1d1d1',
  },
});
