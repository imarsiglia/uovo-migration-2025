import {useSyncModalManager} from '@hooks/useSyncModalManager';
import {Platform} from 'react-native';
import Modal from 'react-native-modal';
import SyncProgressOffline from './SyncProgressOffline';
import { useQueryClient } from '@tanstack/react-query';
import { useOutboxProcessor } from './processor';

export const ModalOffline = () => {
  const qc = useQueryClient();
  useOutboxProcessor(qc); // MANTÉN ESTO: motor global de sync

  const {syncModalOpen, setSyncModalOpen} = useSyncModalManager();
  return (
    <Modal
      isVisible={syncModalOpen}
      useNativeDriver={Platform.OS == 'android'}
      style={{borderRadius: 100}}>
      <SyncProgressOffline
        autoCloseOnFinish={false}
        disallowCloseWhileProcessing={true}
        onClose={() => setSyncModalOpen(false)}
      />
    </Modal>
  );
};
