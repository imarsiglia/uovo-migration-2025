import { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
  SafeAreaView,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose?: () => void;
  children?: ReactNode;
  center?: boolean;                 // true: tarjeta centrada | false: overlay fullscreen sin clipping
  animationDuration?: number;
  backdropOpacity?: number;
  contentStyle?: StyleProp<ViewStyle>;
  disableBackdropClose?: boolean;
  useSafeArea?: boolean;
  testID?: string;
};

export const CustomModal: React.FC<Props> = ({
  visible,
  onClose,
  children,
  center = true,
  animationDuration = 200,
  backdropOpacity = 0.35,
  contentStyle,
  disableBackdropClose = false,
  useSafeArea = false,
  testID,
}) => {
  // En Android, RNModal requiere onRequestClose para el botón "back"
  const handleRequestClose = () => {
    if (onClose) onClose();
  };

  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <RNModal
      testID={testID}
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleRequestClose}
      hardwareAccelerated
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        testID={testID ? `${testID}-backdrop` : undefined}
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${backdropOpacity})` }]}
        onPress={() => {
          if (!disableBackdropClose && onClose) onClose();
        }}
      />

      {center ? (
        // ---- MODO TARJETA CENTRADA ----
        <View style={styles.centeredWrap} pointerEvents="box-none">
          <Container style={[styles.card, contentStyle]}>
            {children}
          </Container>
        </View>
      ) : (
        // ---- MODO OVERLAY FULLSCREEN (SIN CLIPPING) ----
        <Container
          style={[styles.fullOverlay, contentStyle]}
          pointerEvents="box-none"
        >
          {children}
        </Container>
      )}
    </RNModal>
  );
};

const styles = StyleSheet.create({
  centeredWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10, // margen lateral en modo tarjeta
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',          // solo en modo tarjeta
    // Sombra
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Importante: sin overflow para no recortar dropdowns/flechas
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
});

export default CustomModal;
