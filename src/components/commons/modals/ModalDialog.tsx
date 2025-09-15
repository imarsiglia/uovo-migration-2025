import {useModalDialogStore} from '@store/modals';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {PressableOpacity} from '../buttons/PressableOpacity';
import {Label} from '../text/Label';
import {Wrapper} from '../wrappers/Wrapper';

const ICONS_TYPE_NAMES = {
  info: {
    icon: 'info-circle',
    color: COLORS.info,
  },
  success: {
    icon: 'check-circle',
    color: COLORS.success,
  },
  error: {
    icon: 'times-circle',
    color: COLORS.error,
  },
  warning: {
    icon: 'exclamation-triangle',
    color: COLORS.warning,
  },
};

export const ModalDialog = () => {
  const {
    showVisible,
    modalVisible,
    cancelBtnLabel,
    confirmBtnLabel,
    message,
    onCancel,
    onConfirm,
    title,
    type,
    cancelable,
    buttonStyle,
    buttonLabelStyle,
  } = useModalDialogStore();
  const scale = useRef(new Animated.Value(0.5)).current; // Empieza pequeño
  const opacity = useRef(new Animated.Value(0)).current; // Comienza invisible

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200, // Duración corta
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const onPressConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    showVisible({modalVisible: false});
  }, [modalVisible, showVisible, onConfirm]);

  const onPressCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    showVisible({modalVisible: false});
  }, [modalVisible, showVisible, onCancel]);

  const IconColor = useMemo(() => {
    return ICONS_TYPE_NAMES[type!];
  }, [type]);

  if (!modalVisible) return null;

  return (
    <Wrapper style={styles.overlay}>
      <Animated.View style={[styles.modal, {transform: [{scale}], opacity}]}>
        <Wrapper style={styles.modalClockOutHorizontal}>
          <Wrapper style={{alignSelf: 'center'}}>
            <Icon name={IconColor.icon} size={30} color={IconColor.color} />
          </Wrapper>

          <Wrapper style={styles.bodyModalClockOut}>
            <Label style={styles.descModalClockOut}>{message}</Label>
          </Wrapper>
          <Wrapper style={[styles.containerOptionsModalClockOutHorizontal]}>
            {cancelable && (
              <PressableOpacity
                onPress={onPressCancel}
                style={[styles.btnOptionModalClockOutHorizontal]}>
                <Label style={styles.optionModalClockOutHorizontal}>
                  {cancelBtnLabel}
                </Label>
              </PressableOpacity>
            )}
            <PressableOpacity
              onPress={onPressConfirm}
              style={[
                styles.btnOptionModalClockOutHorizontal,
                {
                  borderStartWidth: 1,
                  borderLeftColor: '#08141F21',
                },
                buttonStyle,
              ]}>
              <Label
                style={[
                  styles.optionModalClockOutHorizontal,
                  GLOBAL_STYLES.bold,
                  buttonLabelStyle,
                ]}>
                {confirmBtnLabel}
              </Label>
            </PressableOpacity>
          </Wrapper>
        </Wrapper>
      </Animated.View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Overlay con opacidad
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    minWidth: '80%',
    // height: '30%',
    backgroundColor: 'white', // Fondo blanco del modal
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Sombra en Android
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalClockOutHorizontal: {
    paddingTop: 10,
    borderRadius: 20,
    width: '80%',
    backgroundColor: 'white',
  },
  containerTitleModalClockOut: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#00000020',
    // padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleModalClockout: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.titleColor,
  },
  bodyModalClockOut: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descModalClockOut: {
    color: '#707070',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  containerOptionsModalClockOutHorizontal: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#08141F21',
    marginTop: 10,
    width: '100%',
    position: 'relative',
  },
  btnOptionModalClockOutHorizontal: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#08141F21',
    padding: 5,
    flex: 1,
    minWidth: '50%',
  },
  optionModalClockOutHorizontal: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
