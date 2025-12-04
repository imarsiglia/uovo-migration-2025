// src/components/offline/ModalOffline.tsx
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';

import {useSyncModalManager} from '@hooks/useSyncModalManager';
import SyncProgressOffline from './SyncProgressOffline';

export const ModalOffline = () => {
  const {syncModalOpen, setSyncModalOpen} = useSyncModalManager();

  return (
    <Modal isVisible={syncModalOpen}>
      <View style={styles.container}>
        <SyncProgressOffline onClose={() => setSyncModalOpen(false)} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
});

export default ModalOffline;
