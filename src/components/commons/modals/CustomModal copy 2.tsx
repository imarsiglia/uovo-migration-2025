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
        //   onPress={() => handleVisible(false)}
        />

        {/* Contenedor que centra el contenido */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centerWrap}>
          {/* Contenido del modal */}
          {children}
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
    paddingHorizontal: 24, // margen lateral como react-native-modal
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
