import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, StyleSheet, type View as RNView} from 'react-native';
import {NOTE_AREA} from './helpers';
import Gestures from '../gestures/Gestures';

type Position = {top: number; left: number};
type Note = {
  position: Position;
  updating?: boolean;
  width?: number;
  height?: number;
  // …otros campos que uses en tu modelo de nota
};

type MeasurePayload = {
  areaSet: true;
  width: number;
  height: number;
  translation: {top: number; left: number};
};

type Props = {
  note: Note;
  headerHeight: number;
  onFinishAreaEdit: (args: {note: Note; measure: MeasurePayload}) => void;
};

const NoteArea: React.FC<Props> = ({note, headerHeight, onFinishAreaEdit}) => {
  const componentRef = useRef<RNView | null>(null);
  const [measureStyles, setMeasureStyles] = useState<null | any>(null);

  // Mide y envía el resultado cuando el componente se desmonta (mismo comportamiento)
  useEffect(() => {
    return () => {
      console.log('on destroy component');
      if (measureStyles) {
        const {w, h, px, py} = measureStyles;
        console.log({w, h, px, py});
        onFinishAreaEdit({
          note,
          measure: {
            areaSet: true,
            width: w,
            height: h,
            translation: {top: py - headerHeight - 20, left: px},
          },
        });
      }
    };
  }, [headerHeight, note, onFinishAreaEdit, measureStyles]);

  const borderColor = useMemo(
    () => (note.updating ? '#ff0000' : '#fff'),
    [note.updating],
  );

  const updateLayout = useCallback(() => {
    if (!componentRef.current) return;
    componentRef.current.measure((_x, _y, w, h, px, py) => {
      console.log({w, h, px, py});
      setMeasureStyles({w, h, px, py});
    });
  }, [setMeasureStyles]);

  return (
    <View style={[styles.wrapper, {...note.position}]}>
      <Gestures
        rotatable={false}
        scalable={{min: 1, max: 2}}
        // Si en algún momento quieres persistir estilos:
        // onScaleEnd={(_, styles) => { /* guardar styles */ }}
        onEnd={(_, styles) => {
          requestAnimationFrame(updateLayout);
        }}>
        <View ref={componentRef} style={[styles.container, {borderColor}]}>
          <View style={[styles.cornerCirle, {left: -5, top: -5}]} />
          <View style={[styles.cornerCirle, {right: -5, top: -5}]} />
          <View style={[styles.cornerCirle, {left: -5, bottom: -5}]} />
          <View style={[styles.cornerCirle, {right: -5, bottom: -5}]} />
        </View>
      </Gestures>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    position: 'absolute',
  },
  container: {
    width: NOTE_AREA,
    height: NOTE_AREA,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  cornerCirle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: 10,
    height: 10,
    borderWidth: 4,
    borderRadius: 50,
    borderColor: 'gold',
  },
});

export default NoteArea;
