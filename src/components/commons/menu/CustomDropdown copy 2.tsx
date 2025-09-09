import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useMemo, useRef, useState, useEffect} from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Portal} from '@gorhom/portal';

const PADDING = 8;
const ARROW = 10; // tamaño base del triángulo
const {width: SW, height: SH} = Dimensions.get('window');

type Position = 'top' | 'bottom' | 'auto';

type CustomDropdownType = {
  button: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  position?: Position; // 'top' (default) | 'bottom' | 'auto'
  children?: React.ReactNode | ((api: {close: () => void}) => React.ReactNode);
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

const CustomDropdown = ({
  button,
  children,
  buttonStyle,
  position = 'top',
}: CustomDropdownType) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [openKey, setOpenKey] = useState(0);

  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [menuLayout, setMenuLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // posición final efectiva (para 'auto' o al cambiar tamaños)
  const [placement, setPlacement] = useState<Exclude<Position, 'auto'>>(
    position === 'bottom' ? 'bottom' : 'top',
  );

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  const buttonRef = useRef<any>(null);
  const lockRef = useRef(false);

  const decidePlacement = useCallback(
    (desired: Position, btn: typeof buttonLayout, menu: typeof menuLayout) => {
      if (desired !== 'auto') return desired;
      const spaceAbove = btn.y - PADDING;
      const spaceBelow = SH - (btn.y + btn.height) - PADDING;
      const need = menu.height + ARROW;
      if (spaceBelow >= need) return 'bottom';
      if (spaceAbove >= need) return 'top';
      return spaceBelow >= spaceAbove ? 'bottom' : 'top';
    },
    [],
  );

  const toggleModal = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setTimeout(() => (lockRef.current = false), 600);

    if (isModalVisible) {
      closeModal();
    } else {
      // Medir botón
      buttonRef.current?.measure?.(
        (
          fx: number,
          fy: number,
          width: number,
          height: number,
          px: number,
          py: number,
        ) => {
          setButtonLayout({x: px, y: py, width, height});
          setOpenKey((k) => k + 1);
          // animación inicial según intención
          translateY.value = position === 'bottom' ? 8 : -8;
          opacity.value = 0;
          setModalVisible(true);
        },
      );
    }
  };

  const openModal = useCallback(() => {
    opacity.value = withTiming(1, {duration: 200});
    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.inOut(Easing.ease),
    });
  }, [opacity, translateY]);

  const closeModal = useCallback(() => {
    opacity.value = withTiming(0, {duration: 180});
    translateY.value = withTiming(placement === 'bottom' ? 8 : -8, {
      duration: 180,
      easing: Easing.inOut(Easing.ease),
    });
    setTimeout(() => setModalVisible(false), 180);
  }, [opacity, translateY, placement]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  // Determinar placement cuando tengamos tamaños
  const effectivePlacement = useMemo(
    () => decidePlacement(position, buttonLayout, menuLayout),
    [position, buttonLayout, menuLayout, decidePlacement],
  );

  useEffect(() => {
    setPlacement(effectivePlacement);
  }, [effectivePlacement]);

  // Posición del contenedor (envoltura del menú + se posiciona la flecha dentro)
  const computedTop =
    placement === 'top'
      ? clamp(
          buttonLayout.y - menuLayout.height,
          PADDING,
          SH - menuLayout.height - PADDING,
        )
      : clamp(
          buttonLayout.y + buttonLayout.height,
          PADDING,
          SH - menuLayout.height - PADDING,
        );

  const computedLeft = clamp(
    buttonLayout.x + buttonLayout.width / 2 - menuLayout.width / 2,
    PADDING,
    SW - menuLayout.width - PADDING,
  );

  // Posición horizontal de la flecha para centrarla respecto al menú
  const arrowLeft = Math.round(menuLayout.width / 2 - ARROW);

  const renderChildren = useMemo(() => {
    if (typeof children === 'function') {
      return (children as (api: {close: () => void}) => React.ReactNode)({
        close: closeModal,
      });
    }
    return children;
  }, [children, closeModal]);

  useFocusEffect(
    useCallback(
      () => () => {
        closeModal();
      },
      [closeModal],
    ),
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={toggleModal}
        style={buttonStyle}>
        {button}
      </TouchableOpacity>

      {isModalVisible && <Portal></Portal>}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        backdropOpacity={0.2}
        style={styles.modal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={200}
        animationOutTiming={180}
        useNativeDriver
        onModalShow={openModal}
        onModalHide={() => setMenuLayout({x: 0, y: 0, width: 0, height: 0})}>
        <View style={styles.backdrop} pointerEvents="box-none">
          <Animated.View
            key={openKey}
            style={[
              styles.menuContainer,
              animatedStyle,
              {top: computedTop, left: computedLeft},
            ]}>
            {/* Menú */}
            <View
              style={styles.menu}
              onLayout={(e) => setMenuLayout(e.nativeEvent.layout)}>
              {renderChildren}
            </View>

            {/* Flecha absoluta (no intercepta toques) */}
            {menuLayout.width > 0 && (
              <View
                pointerEvents="none"
                style={[
                  styles.arrowBase,
                  placement === 'bottom' ? styles.arrowUp : styles.arrowDown,
                  placement === 'bottom'
                    ? {top: -ARROW, left: arrowLeft}
                    : {bottom: -ARROW, left: arrowLeft},
                ]}
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-start'},
  backdrop: {flex: 1},
  menuContainer: {
    position: 'absolute',
    // MUY IMPORTANTE: permitir que la flecha salga fuera
    overflow: 'visible',
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
    zIndex: 1,
  },
  // Base del triángulo
  arrowBase: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 2,
    elevation: 7,
    borderStyle: 'solid',
  },
  // Triángulo apuntando hacia ARRIBA (para placement "bottom": el menú está abajo del botón)
  arrowUp: {
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
    borderBottomWidth: ARROW,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  // Triángulo apuntando hacia ABAJO (para placement "top": el menú está arriba del botón)
  arrowDown: {
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
    borderTopWidth: ARROW,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
});

export default CustomDropdown;
