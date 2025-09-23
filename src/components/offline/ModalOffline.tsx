import {useSyncModalManager} from '@hooks/useSyncModalManager';
import {Platform} from 'react-native';
import Modal from 'react-native-modal';
import SyncProgressOffline from './SyncProgressOffline';

export const ModalOffline = () => {
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
