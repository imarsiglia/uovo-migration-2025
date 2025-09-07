import {
  createContext,
  memo,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
  forwardRef,
} from 'react';
import {View} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type Ctx = {
  registerOpen: (ref: Swipeable | null) => void;
  clearIfMatch: (ref: Swipeable | null) => void;
};
const SwipeCtx = createContext<Ctx | null>(null);

export const SwipeableListProvider = ({children}: PropsWithChildren) => {
  const openRef = useRef<Swipeable | null>(null);

  const registerOpen = useCallback((ref: Swipeable | null) => {
    if (openRef.current && openRef.current !== ref) {
      openRef.current.close();
    }
    openRef.current = ref;
  }, []);

  const clearIfMatch = useCallback((ref: Swipeable | null) => {
    if (openRef.current === ref) openRef.current = null;
  }, []);

  return (
    <SwipeCtx.Provider value={{registerOpen, clearIfMatch}}>
      {children}
    </SwipeCtx.Provider>
  );
};

function useSwipeManager() {
  const ctx = useContext(SwipeCtx);
  if (!ctx) {
    // Permite usar SwipeableRow sin provider (no cierra otras filas)
    return {
      registerOpen: (_: Swipeable | null) => {},
      clearIfMatch: (_: Swipeable | null) => {},
    };
  }
  return ctx;
}

export type SwipeableRowRef = {close: () => void};

type RenderActions = (close: () => void) => ReactNode;

type Props = {
  /** Render de acciones a la derecha (recibe close()) */
  rightActions?: RenderActions;
  /** Render de acciones a la izquierda (recibe close()) */
  leftActions?: RenderActions;
  /** Opcional: ancho de acciones (mejora rendimiento) */
  leftActionWidth?: number;
  rightActionWidth?: number;
  /** Deshabilitar swipe */
  enabled?: boolean;
  /** Callback al abrir/cerrar (opcional) */
  onOpen?: () => void;
  onClose?: () => void;
};

export const SwipeableRow = memo(
  forwardRef<SwipeableRowRef, PropsWithChildren<Props>>(
    (
      {
        children,
        rightActions,
        leftActions,
        leftActionWidth,
        rightActionWidth,
        enabled = true,
        onOpen,
        onClose,
      },
      ref,
    ) => {
      const swipeRef = useRef<Swipeable>(null);
      const {registerOpen, clearIfMatch} = useSwipeManager();

      const close = useCallback(() => {
        swipeRef.current?.close();
      }, []);

      useImperativeHandle(ref, () => ({close}), [close]);

      const renderRight = useCallback(() => {
        if (!rightActions) return null;
        return (
          <View style={{flexDirection: 'row'}}>{rightActions(close)}</View>
        );
      }, [rightActions, close]);

      const renderLeft = useCallback(() => {
        if (!leftActions) return null;
        return <View style={{flexDirection: 'row'}}>{leftActions(close)}</View>;
      }, [leftActions, close]);

      return (
        <Swipeable
          ref={swipeRef}
          enabled={enabled}
          renderRightActions={rightActions ? renderRight : undefined}
          renderLeftActions={leftActions ? renderLeft : undefined}
          rightThreshold={rightActionWidth ?? 40}
          leftThreshold={leftActionWidth ?? 40}
          onSwipeableWillOpen={() => {
            registerOpen(swipeRef.current);
            onOpen?.();
          }}
          onSwipeableWillClose={() => {
            clearIfMatch(swipeRef.current);
            onClose?.();
          }}>
          {children}
        </Swipeable>
      );
    },
  ),
);
SwipeableRow.displayName = 'SwipeableRow';
