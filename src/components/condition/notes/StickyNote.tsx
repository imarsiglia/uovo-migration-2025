import React, {useMemo, useRef, useCallback} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Gesture,
  PanGestureHandler,
  State,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Icon from 'react-native-fontawesome-pro';
import {useModal} from 'react-native-modalfy';
import {getFakeAreaStyles, NOTE_AREA} from './helpers';
import useConditionStore from '@store/condition';
import {StickyNoteTranslation, StickyNoteType} from '@api/types/Condition';

// ⛔️ Redux removido. Si necesitas estado global, inyecta callbacks de zustand por props.

export type StickyNoteProps = {
  note: StickyNoteType;

  // Callbacks del padre
  onStickyNoteDragged?: (args: {
    note: StickyNoteType;
    translation: StickyNoteTranslation;
  }) => void;
  onSave?: (n: StickyNoteType) => void;
  onZoomButtonPress?: (n: StickyNoteType) => void;
  onEditPosition?: (n: StickyNoteType) => void;
  onDeleteNote?: (n: StickyNoteType) => void;
  // Estilo extra opcional
  containerStyle?: StyleProp<ViewStyle>;

  onCancel?: (idNote: number) => void;
  onFinishAreaEdit?: ({
    note,
    measure,
  }: {
    note: StickyNoteType;
    measure: any;
  }) => void;
  onExpand?: (photo?: any) => void;
  onRetake?: () => void;
  onEdit?: (note: StickyNoteType) => void;

  headerHeight?: number;
};

const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onStickyNoteDragged,
  onSave,
  onZoomButtonPress,
  onEditPosition,
  onDeleteNote,
  containerStyle,
}) => {
  const {openModal} = useModal();
  const copyEditModalFunction = useConditionStore(
    (d) => d.setEditModalFunction,
  );
  const copyNote = useConditionStore((d) => d.setCopyNote);

  // Animated values iniciales desde el estado persistido (si existe)
  const translateX = useRef(
    new Animated.Value(note?.stickyNoteTranslation?.translationX ?? 0),
  ).current;
  const translateY = useRef(
    new Animated.Value(note?.stickyNoteTranslation?.translationY ?? 0),
  ).current;

  const lastOffset = useRef({x: 0, y: 0});
  const translationRef = useRef<StickyNoteTranslation>({
    translationX: note?.stickyNoteTranslation?.translationX ?? 0,
    translationY: note?.stickyNoteTranslation?.translationY ?? 0,
    absoluteX: note?.stickyNoteTranslation?.absoluteX ?? 0,
    absoluteY: note?.stickyNoteTranslation?.absoluteY ?? 0,
  });

  const onGestureEvent = useRef(
    Animated.event<PanGestureHandlerGestureEvent['nativeEvent']>(
      [
        {
          nativeEvent: {
            translationX: translateX,
            translationY: translateY,
          },
        },
      ],
      {
        useNativeDriver: true,
        listener: (e: PanGestureHandlerGestureEvent) => {
          translationRef.current = {
            ...translationRef.current,
            translationX:
              // @ts-ignore
              e.nativeEvent.translationX +
                (translateX as any).__getOffset?.() ?? 0,
            translationY:
              // @ts-ignore
              e.nativeEvent.translationY +
                (translateY as any).__getOffset?.() ?? 0,
          };
        },
      },
    ),
  ).current;

  const onHandlerStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      const {nativeEvent} = event;
      if (nativeEvent.oldState === State.ACTIVE) {
        lastOffset.current.x += nativeEvent.translationX;
        lastOffset.current.y += nativeEvent.translationY;

        translateX.setOffset(lastOffset.current.x);
        translateX.setValue(0);
        translateY.setOffset(lastOffset.current.y);
        translateY.setValue(0);

        if (onStickyNoteDragged) {
          onStickyNoteDragged({note, translation: translationRef.current});
        }
      }
    },
    [note, onStickyNoteDragged, translateX, translateY],
  );

  // Abrir modal de edición (antes usaba withModal + redux; ahora useModal + props opcionales para zustand)
  const onEdit = useCallback(() => {
    const editModalFunction = () => {
      openModal('EditModal', {
        onSave,
        onZoomButtonPress,
        note,
        // Estos dos eran acciones redux; ahora déjalos conectados a tu store de zustand si los pasas por props:
        copyEditModalFunction,
        copyNote,
      });
    };

    // Simular comportamiento previo: guardar nota/función en store global si llega por props
    copyNote(note);
    copyEditModalFunction(editModalFunction);
    editModalFunction();
  }, [
    copyEditModalFunction,
    copyNote,
    note,
    onSave,
    onZoomButtonPress,
    openModal,
  ]);

  const onLongPress = useCallback(() => {
    openModal('EditDeleteModal', {onEditPosition, onDeleteNote, note});
  }, [note, onDeleteNote, onEditPosition, openModal]);

  // Estilos calculados (área visual de la nota)
  const calculatedStyles = useMemo(() => getFakeAreaStyles(note), [note]);
  const width = note?.width ?? NOTE_AREA;
  const stickyNotePosition = width / 2 - 10; // (no se usa, lo conservo por si fuera necesario)

  return (
    <View style={[styles.fakeArea, calculatedStyles, containerStyle]}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.wrapper,
            {
              top: 0,
              left: 0,
              transform: [{translateX}, {translateY}],
            },
          ]}>
          <TouchableOpacity
            onPress={onEdit}
            onLongPress={onLongPress}
            style={styles.touchArea}>
            <Icon name="sticky-note" size={25} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default StickyNote;

const styles = StyleSheet.create({
  fakeArea: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  wrapper: {
    flex: 1,
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
