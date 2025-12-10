import {useModalDialogStore} from '@store/modals';
import {memo, useCallback} from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

const DIALOG_WIDTH = 320;

const EditDeleteModal = memo((props: any) => {
  // componentDidMount() {}
  // constructor(props) { super(props); }

  const showDialog = useModalDialogStore((d) => d.showVisible);

  const _editPosition = useCallback(() => {
    const {
      modal: {
        closeModal,
        params: {note, onEditPosition},
      },
    } = props;
    if (note && onEditPosition) {
      onEditPosition(note);
    }
    closeModal();
  }, [props]);

  const _closeModal = useCallback(() => {
    const {
      modal: {closeModal},
    } = props;
    closeModal();
  }, [props]);

  const _delete = useCallback(() => {
    const {
      modal: {
        closeModal,
        params: {note, onDeleteNote},
      },
    } = props;
    if (note && onDeleteNote) {
      onDeleteNote(note);
    }
    closeModal();
  }, [props]);

  const _promptDelete = useCallback(() => {
    showDialog({
      modalVisible: true,
      message: 'Are you sure?\nThis cannot be undone',
      type: 'warning',
      onConfirm: _delete,
      cancelable: true,
      cancelBtnLabel: 'Cancel',
      confirmBtnLabel: 'Delete',
    });
    // Alert.alert('Are you sure?', 'This cannot be undone', [
    //   {text: 'Cancel', onPress: () => null},
    //   {text: 'Delete', onPress: _delete},
    // ]);
  }, [_delete]);

  return (
    <View style={styles.dialog}>
      <TouchableOpacity
        style={[styles.footerButton, styles.saveButton]}
        onPress={_editPosition}>
        <Icon
          name="pen"
          type="solid"
          color="white"
          size={15}
          style={styles.icon}
        />
        <Text allowFontScaling={false} style={styles.footerButtonText}>
          {' '}
          Edit Position
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.footerButton, styles.deleteButton]}
        onPress={_promptDelete}>
        <Icon
          name="trash"
          type="solid"
          color="white"
          size={15}
          style={styles.icon}
        />
        <Text allowFontScaling={false} style={styles.footerButtonText}>
          {' '}
          Delete Note
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.footerButton, styles.cancelButton]}
        onPress={_closeModal}>
        <Text style={styles.footerButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  dialog: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: DIALOG_WIDTH,
    height: DIALOG_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    marginTop: 30,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00D3ED',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#00D3ED',
        shadowOffset: {
          width: 2,
          height: 4,
        },
        shadowOpacity: 0.4,
      },
    }),
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#C13737',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#C13737',
        shadowOffset: {
          width: 2,
          height: 4,
        },
        shadowOpacity: 0.4,
      },
    }),
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#b9b9b9',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#b9b9b9',
        shadowOffset: {
          width: 2,
          height: 4,
        },
        shadowOpacity: 0.4,
      },
    }),
  },
  icon: {
    paddingRight: 10,
  },
});

export default EditDeleteModal;
