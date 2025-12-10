import React, {useMemo, useRef, useCallback, useEffect} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
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

export type StickyNoteProps = {
  note: StickyNoteType;
  onStickyNoteDragged?: (args: {
    note: StickyNoteType;
    translation: StickyNoteTranslation;
  }) => void;
  onSave?: (n: StickyNoteType) => void;
  onZoomButtonPress?: (n: StickyNoteType) => void;
  onEditPosition?: (n: StickyNoteType) => void;
  onDeleteNote?: (n: StickyNoteType) => void;
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

  // Inicializar Animated.Values en 0 (como en el ClassComponent)
  const translateX = useRef(
    new Animated.Value(note?.stickyNoteTranslation?.translationX ?? 0),
  ).current;
  const translateY = useRef(
    new Animated.Value(note?.stickyNoteTranslation?.translationY ?? 0),
  ).current;

  const lastOffset = useRef({x: 0, y: 0});
  const lastNativeEventRef =
    useRef<PanGestureHandlerGestureEvent['nativeEvent']>();

  // Ref para tracking de la posición actual durante el gesto
  const translationRef = useRef<StickyNoteTranslation>({
    translationX: 0,
    translationY: 0,
    absoluteX: note?.stickyNoteTranslation?.absoluteX ?? 0,
    absoluteY: note?.stickyNoteTranslation?.absoluteY ?? 0,
  });

  // Configurar offset inicial solo una vez al montar
  useEffect(() => {
    const initialX = note?.stickyNoteTranslation?.translationX ?? 0;
    const initialY = note?.stickyNoteTranslation?.translationY ?? 0;

    translateX.setOffset(initialX);
    translateY.setOffset(initialY);
    lastOffset.current = {x: initialX, y: initialY};

    translationRef.current = {
      translationX: initialX,
      translationY: initialY,
      absoluteX: note?.stickyNoteTranslation?.absoluteX ?? 0,
      absoluteY: note?.stickyNoteTranslation?.absoluteY ?? 0,
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // const onGestureEvent = useRef(
  //   Animated.event<PanGestureHandlerGestureEvent['nativeEvent']>(
  //     [
  //       {
  //         nativeEvent: {
  //           translationX: translateX,
  //           translationY: translateY,
  //         },
  //       },
  //     ],
  //     {
  //       useNativeDriver: true,
  //       listener: (e: PanGestureHandlerGestureEvent) => {
  //         // Calcular posición total: offset acumulado + delta del gesto actual
  //         translationRef.current = {
  //           ...translationRef.current,
  //           translationX: lastOffset.current.x + e.nativeEvent.translationX,
  //           translationY: lastOffset.current.y + e.nativeEvent.translationY,
  //         };
  //       },
  //     },
  //   ),
  // ).current;

  const onGestureEvent = useRef(
  Animated.event(
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
      listener: ({nativeEvent}) => {
        // Igual que this._translation = nativeEvent
        lastNativeEventRef.current = nativeEvent;
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

      if (onStickyNoteDragged && lastNativeEventRef.current) {
        const {translationX, translationY, absoluteX, absoluteY} =
          lastNativeEventRef.current;

        onStickyNoteDragged({
          note,
          translation: {
            translationX,
            translationY,
            absoluteX,
            absoluteY,
          },
        });
      }
    }
  },
  [note, onStickyNoteDragged, translateX, translateY],
);

  const onEdit = useCallback(() => {
    const editModalFunction = () => {
      openModal('EditModal', {
        onSave,
        onZoomButtonPress,
        note,
        copyEditModalFunction,
        copyNote,
      });
    };

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

  const calculatedStyles = useMemo(() => getFakeAreaStyles(note), [note]);

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
