import {Portal} from '@gorhom/portal';
import {PressableOpacity} from '../buttons/PressableOpacity';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';

type Props = {
  visible: boolean;
  handleVisible: (val: boolean) => void;
  children: React.ReactNode;
  hostName?: string;
  /** estilos opcionales para el contenedor del contenido */
  contentStyle?: StyleProp<ViewStyle>;
};

export const CustomModal = ({
  visible,
  handleVisible,
  children,
  hostName = 'root',
  contentStyle,
}: Props) => {
  if (!visible) return null;

  return (
    <Portal hostName={hostName}>
      <View style={styles.portalRoot} pointerEvents="box-none">
        {/* Backdrop: cierra al tocar afuera */}
        <PressableOpacity
          style={styles.backdrop}
          onPress={() => handleVisible(false)}
        />

        {/* Contenedor que centra el contenido (y evita teclado en iOS) */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centerWrap}
          pointerEvents="box-none">
          {/* “Card” del modal: aquí van tus children */}
          <View style={[styles.card, contentStyle]} pointerEvents="auto">
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  portalRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000070',
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    maxWidth: '90%',
    borderRadius: 16,
    backgroundColor: '#fff',
    // sombra
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
    overflow: 'hidden',
  },
});
