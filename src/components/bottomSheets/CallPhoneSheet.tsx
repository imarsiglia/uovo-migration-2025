// components/GlobalCallSheet.tsx
import React, {useEffect, useRef, useCallback} from 'react';
import {Platform, Linking, StyleSheet, ScrollView} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-fontawesome-pro';

import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getFormattedNumber} from '@utils/functions';
import {showErrorToastMessage} from '@utils/toast';
import {useCallSheetStore} from '@store/callSheetStore';
import {RBSheetRef} from '@components/commons/bottomsheets/ImageOptionSheet';

const GlobalCallSheet: React.FC = () => {
  const {isOpen, phone, close} = useCallSheetStore();

  const sheetRef = useRef<RBSheetRef>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.open();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  // Safe open URL util
  const safeOpenUrl = useCallback(async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        showErrorToastMessage('Calling app not available');
        return false;
      }
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.warn('open url error', error);
      showErrorToastMessage('Calling app not available');
      return false;
    }
  }, []);

  const onCall = useCallback(() => {
    if (!phone) return;
    sheetRef.current?.close();
    const formatted = getFormattedNumber(phone);
    const url =
      Platform.OS === 'ios' ? `telprompt:${formatted}` : `tel:${formatted}`;
    void safeOpenUrl(url);
    // close store state
    close();
  }, [phone, safeOpenUrl, close]);

  const onFaceTime = useCallback(() => {
    if (!phone) return;
    sheetRef.current?.close();
    const formatted = getFormattedNumber(phone);
    const url = `facetime:${formatted}`; // or facetime-audio
    void safeOpenUrl(url);
    close();
  }, [phone, safeOpenUrl, close]);

  return (
    <RBSheet
      ref={sheetRef}
      closeOnPressBack={false}
      closeOnPressMask={false}
      useNativeDriver
      draggable={false}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      onClose={() => {
        // asegúrate de sincronizar el store cuando el user haga drag/press outside
        close();
      }}
      customStyles={{
        container: {
          paddingTop: 20,
          paddingHorizontal: 20,
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
          height: 200,
        },
        wrapper: {
          backgroundColor: '#00000070',
        },
        draggableIcon: {
          backgroundColor: 'gray',
          width: 100,
        },
      }}>
      <Wrapper style={{flex: 1, paddingHorizontal: 20}}>
        <Wrapper style={{marginBottom: 5}}>
          <Label style={{fontWeight: 'bold'}}>Call with</Label>
        </Wrapper>

        <ScrollView style={styles.gridContainer} horizontal>
          <Wrapper style={[GLOBAL_STYLES.row]}>
            <PressableOpacity style={styles.callOptionView} onPress={onCall}>
              <Icon name="phone" type="solid" size={25} color="#898989" />
              <Label style={styles.callOptionText}>Phone</Label>
            </PressableOpacity>

            {Platform.OS === 'ios' && (
              <PressableOpacity
                style={styles.callOptionView}
                onPress={onFaceTime}>
                <Icon name="video" type="solid" size={25} color="#898989" />
                <Label style={styles.callOptionText}>FaceTime</Label>
              </PressableOpacity>
            )}
          </Wrapper>
        </ScrollView>
      </Wrapper>

      <PressableOpacity
        style={{
          position: 'absolute',
          bottom: 0,
          padding: 10,
          paddingBottom: 40,
          right: 0,
          paddingRight: 20,
        }}
        onPress={() => {
          sheetRef.current?.close();
          close();
        }}>
        <Label>Close</Label>
      </PressableOpacity>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  callOptionView: {
    alignItems: 'center',
    marginRight: 25,
  },
  callOptionText: {
    color: '#898989',
    marginTop: 5,
  },
  gridContainer: {
    flex: 1,
    marginBottom: 60,
  },
});

export default GlobalCallSheet;
