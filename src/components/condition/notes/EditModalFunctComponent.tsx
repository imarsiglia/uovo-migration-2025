import {
  SpeechButton,
  SpeechFormInputRef,
} from '@components/commons/voice/SpeechButton';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Text,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
// import KeyboardSpacer from 'react-native-keyboard-spacer';

const DIALOG_WIDTH = 320;

const INITIAL_STATE = {
  label: '',
  details: '',
  voiceReady: false,
};

const NoteDialog = (props: any) => {
  // ====== estado inicial idéntico a _getState(props) ======
  const initialFromProps = useMemo(() => {
    const {modal: {params: {note: {label = '', details = ''} = {}} = {}} = {}} =
      props;
    return {
      ...INITIAL_STATE,
      label,
      details,
    };
  }, [props]);

  const [label, setLabel] = useState(initialFromProps.label);
  const [details, setDetails] = useState(initialFromProps.details);
  const [voiceReady, setVoiceReady] = useState(initialFromProps.voiceReady);

  const voiceRef = useRef<SpeechFormInputRef>(null);

  // ====== componentDidMount: _initVoice() ======
  useEffect(() => {
    let mounted = true;
    const _initVoice = async () => {
      try {
        const available = voiceRef.current?.isRecognitionAvailable();
        if (mounted) setVoiceReady(!!available);
      } catch {
        if (mounted) setVoiceReady(false);
      }
    };
    _initVoice();
    return () => {
      mounted = false;
    };
  }, []);

  // ====== handlers 1:1 ======
  const saveNote = useCallback(() => {
    const {
      modal: {
        params: {
          onSave,
          note,
          onZoomButtonPress,
          copyEditModalFunction,
          copyNote,
        } = {},
        openModal,
        closeModal,
      } = {},
    } = props;

    const tempNote = {
      ...note,
      label,
      details,
      editing: false,
    };

    if (copyEditModalFunction) {
      const editModalFunction = () => {
        openModal?.('EditModal', {
          onSave,
          onZoomButtonPress,
          note: tempNote,
          copyEditModalFunction,
          copyNote,
        });
      };
      // mantiene el mismo flujo que el class component
      copyNote?.(tempNote);
      copyEditModalFunction?.(editModalFunction);
    }

    if (onSave) {
      onSave({
        ...note,
        label,
        details,
        editing: false,
      });
      closeModal?.();
    }
  }, [details, label, props]);

  const _onRetake = useCallback(() => {
    const {modal: {params: {note} = {}} = {}} = props;
    const {onRetake} = props;
    onRetake?.(note);
  }, [props]);

  const _onExpand = useCallback(() => {
    const {onExpand, note} = props;
    onExpand?.(note?.photoZoom);
  }, [props]);

  const _onEdit = useCallback(() => {
    const {note, onEdit} = props;
    onEdit?.(note);
  }, [props]);

  const addPhotoZoom = useCallback(() => {
    // mismo orden que el class component
    saveNote();
    props?.modal?.params?.onZoomButtonPress?.();
  }, [props, saveNote]);

  const _promptDelete = useCallback(() => {
    // (Se conserva por si usas este modal para borrar en otra parte)
    Alert.alert('Are you sure?', 'This cannot be undone', [
      {text: 'Cancel', onPress: () => null},
      {text: 'Delete', onPress: () => null},
    ]);
  }, []);

  // ====== render ======
  const {note} = props;

  return (
    <View style={styles.dialog}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <Icon
            name="tag"
            color="#959595"
            size={15}
            type="light"
            style={styles.icon}
          />
          <Text style={styles.label}>Label</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.detailsRow}>
            <Icon
              name="sticky-note"
              color="#959595"
              size={15}
              type="light"
              style={styles.icon}
            />
            <Text style={styles.label}>Details</Text>
          </View>
          {false && (
            <TouchableOpacity style={styles.linkTextButton}>
              <Icon
                name="book"
                color="#0400E6"
                size={15}
                type="light"
                style={styles.iconZoom}
              />
              <Text style={styles.linkText}>Glossary</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.inputContainer, styles.textarea]}>
          <TextInput
            style={styles.input}
            multiline
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <View style={styles.row}>
          {voiceReady != null && (
            <SpeechButton ref={voiceRef} onResult={setDetails} />
          )}
        </View>

        {note?.photoZoom ? (
          <View style={styles.photoZoomContainer}>
            <ImageBackground
              source={{uri: note?.photoZoom?.uri}}
              style={styles.photoZoom}>
              <View style={styles.photoZoomButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={_onRetake}>
                  <Icon name="camera" type="light" color="white" size={17} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={_onExpand}>
                  <Icon name="expand" type="light" color="white" size={17} />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ) : (
          <TouchableOpacity style={styles.zoomButton} onPress={addPhotoZoom}>
            <Icon
              name="search-plus"
              color="#0400E6"
              size={15}
              type="light"
              style={styles.iconZoom}
            />
            <Text style={styles.photoZoomText}>Add photo zoom</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButton]}
            onPress={saveNote}>
            <Icon
              name="save"
              type="solid"
              color="white"
              size={15}
              style={styles.icon}
            />
            <Text style={styles.footerButtonText}> Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={props?.modal?.closeModal}>
            <Text style={styles.footerButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* {
          Platform.OS == "ios" &&
          <KeyboardSpacer />
        } */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dialog: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: DIALOG_WIDTH,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 7,
  },
  label: {
    fontSize: 13,
    color: '#959595',
  },
  inputContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#959595',
    borderRadius: 7,
    paddingHorizontal: 10,
    marginBottom: 16,
    height: 45,
  },
  input: {
    flex: 1,
    color: '#1F1E1E',
    height: 40,
    justifyContent: 'center',
    textAlignVertical: 'top',
  },
  textarea: {
    height: 80,
  },
  detailsRow: {
    flexDirection: 'row',
    marginRight: 15,
  },
  zoomButton: {
    alignSelf: 'stretch',
    height: 45,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0400E6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 20,
  },
  photoZoomText: {
    color: '#0400E6',
    fontSize: 15,
  },
  iconZoom: {
    marginRight: 7,
  },
  footer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00D3ED',
    marginRight: 20,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#00D3ED',
        shadowOffset: {width: 2, height: 4},
        shadowOpacity: 0.4,
      },
    }),
  },
  cancelButton: {
    backgroundColor: '#C13737',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#C13737',
        shadowOffset: {width: 2, height: 4},
        shadowOpacity: 0.4,
      },
    }),
  },
  photoZoomContainer: {
    alignSelf: 'stretch',
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoZoom: {
    width: null,
    height: null,
    flex: 1,
    resizeMode: 'cover',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  photoZoomButtons: {
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  iconButton: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  linkText: {
    color: '#0400E6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

// const mapStateToProps = (state) => ({
//   editModalFunction: state.editModalFunction,
// });

export default NoteDialog;
