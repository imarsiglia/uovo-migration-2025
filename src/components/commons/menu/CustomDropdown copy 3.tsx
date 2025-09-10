import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import {Portal} from '@gorhom/portal';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {TouchableWithoutFeedback} from '@gorhom/bottom-sheet';

type Position = 'top' | 'bottom' | 'auto';

const PADDING = 8;
const ARROW = 10;
const {width: SW, height: SH} = Dimensions.get('window');

type CustomDropdownType = {
  button: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  position?: Position; // 'top' (default) | 'bottom' | 'auto'
  children?: React.ReactNode | ((api: {close: () => void}) => React.ReactNode);
  /** Opcional: nombre del host del portal (por defecto 'root') */
  hostName?: string;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

const CustomDropdown = ({
  button,
  children,
  buttonStyle,
  position = 'top',
  hostName = 'root',
}: CustomDropdownType) => {
  const [isVisible, setVisible] = useState(false);
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

  const [placement, setPlacement] = useState<Exclude<Position, 'auto'>>(
    position === 'bottom' ? 'bottom' : 'top',
  );

  const buttonRef = useRef<any>(null);
  const lockRef = useRef(false);

  // Animación
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

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

  const toggle = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setTimeout(() => (lockRef.current = false), 600);

    if (isVisible) {
      close();
    } else {
      // Medir el botón ANTES de abrir
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
          setOpenKey((k: number) => k + 1);

          // Estado inicial de la animación
          translateY.value = position === 'bottom' ? 8 : -8;
          opacity.value = 0;
          setVisible(true);
        },
      );
    }
  };

  const openAnim = useCallback(() => {
    opacity.value = withTiming(1, {duration: 200});
    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.inOut(Easing.ease),
    });
  }, [opacity, translateY]);

  const close = useCallback(() => {
    opacity.value = withTiming(0, {duration: 180});
    translateY.value = withTiming(placement === 'bottom' ? 8 : -8, {
      duration: 180,
      easing: Easing.inOut(Easing.ease),
    });
    setTimeout(() => setVisible(false), 180);
  }, [opacity, translateY, placement]);

  // Abrir la animación cuando ya montó el portal
  useEffect(() => {
    if (isVisible) openAnim();
  }, [isVisible, openKey, openAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  // Recalcular placement cuando tengamos tamaños
  const effectivePlacement = useMemo(
    () => decidePlacement(position, buttonLayout, menuLayout),
    [position, buttonLayout, menuLayout, decidePlacement],
  );
  useEffect(() => setPlacement(effectivePlacement), [effectivePlacement]);

  // Posición del menú
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

  const arrowLeft = Math.round(menuLayout.width / 2 - ARROW);

  const renderChildren = useMemo(() => {
    if (typeof children === 'function') {
      return (children as (api: {close: () => void}) => React.ReactNode)({
        close,
      });
    }
    return children;
  }, [children, close]);

  // Cerrar al cambiar de pantalla
  useFocusEffect(
    useCallback(() => {
      return () => close();
    }, [close]),
  );

  return (
    <>
      <TouchableOpacity ref={buttonRef} onPress={toggle} style={buttonStyle}>
        {button}
      </TouchableOpacity>

      {isVisible && (
        <Portal hostName={hostName}>
          <TouchableWithoutFeedback style={ RNStyleSheet.absoluteFill}>
            <View style={styles.portalRoot} pointerEvents="box-none">
              {/* Backdrop: toca para cerrar */}
              <TouchableOpacity
                style={[
                  RNStyleSheet.absoluteFill,
                  {backgroundColor: '#00000070'},
                ]}
                // onPress={close}
              />

              {/* Contenedor del menú */}
              <Animated.View
                style={[
                  styles.menuContainer,
                  {top: computedTop, left: computedLeft},
                  animatedStyle,
                ]}
                pointerEvents="auto">
                <View
                  style={styles.menu}
                  onLayout={(e) => setMenuLayout(e.nativeEvent.layout)}>
                  {renderChildren}
                </View>

                {/* Flecha */}
                {menuLayout.width > 0 && (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.arrowBase,
                      placement === 'bottom'
                        ? styles.arrowUp
                        : styles.arrowDown,
                      placement === 'bottom'
                        ? {top: -ARROW, left: arrowLeft}
                        : {bottom: -ARROW, left: arrowLeft},
                    ]}
                  />
                )}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Portal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  portalRoot: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
  },
  menuContainer: {
    position: 'absolute',
    overflow: 'visible', // importante para que se vea la flecha
    zIndex: 99999999999,
    elevation: 8,
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    // sombra
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  arrowBase: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
  },
  // Triángulo hacia ARRIBA (menú debajo del botón)
  arrowUp: {
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomWidth: ARROW,
    borderBottomColor: 'white',
  },
  // Triángulo hacia ABAJO (menú arriba del botón)
  arrowDown: {
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopWidth: ARROW,
    borderTopColor: 'white',
  },
});

export default CustomDropdown;
