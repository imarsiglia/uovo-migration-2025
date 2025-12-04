// src/components/offline/ModalOffline.tsx
import React from 'react';
import {Dimensions, Platform, View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
// import { useQueryClient } from '@tanstack/react-query';

import {useSyncModalManager} from '@hooks/useSyncModalManager';
import SyncProgressOffline from './SyncProgressOffline';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.8);

export const ModalOffline = () => {
  // const qc = useQueryClient();
  // useOutboxProcessor(qc); // background auto-trigger on net/foreground

  const {syncModalOpen, setSyncModalOpen} = useSyncModalManager();

  return (
    <Modal
      isVisible={syncModalOpen}
      useNativeDriver={Platform.OS === 'android'}
      onBackdropPress={undefined}
      onBackButtonPress={undefined}
      style={styles.modal}
      backdropOpacity={0.35}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      {/* Altura fija al 80% para permitir layout flex interno */}
      <View style={[styles.card, {height: MODAL_HEIGHT}]}>
        <SyncProgressOffline onClose={() => setSyncModalOpen(false)} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {justifyContent: 'flex-end', margin: 0},
  card: {
    backgroundColor: 'white',
    padding: 0, // el padding interno lo da el hijo
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
});

export default ModalOffline;
