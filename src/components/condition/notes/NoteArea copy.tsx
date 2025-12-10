import React, { PureComponent } from 'react';
import { View, StyleSheet, UIManager, findNodeHandle } from 'react-native';
import { NOTE_AREA } from './helpers';
import Gestures from '../gestures/Gestures';

class NoteArea extends PureComponent {
  // cache de la última medida válida
  lastMeasure = null;
  _mounted = false;

  setRef = (ref) => {
    this.component = ref;
  };

  componentDidMount() {
    this._mounted = true;
    // intenta medir tras el primer layout
    requestAnimationFrame(this.measureInWindowSafe);
  }

  componentDidUpdate() {
    // cada actualización, vuelve a cachear la medida
    requestAnimationFrame(this.measureInWindowSafe);
  }

  componentWillUnmount() {
    this._mounted = false;
    const { onFinishAreaEdit, note, headerHeight = 0 } = this.props;
    const m = this.lastMeasure;
    if (m) {
      const { w, h, px, py } = m;
      onFinishAreaEdit({
        note,
        measure: {
          areaSet: true,
          width: w,
          height: h,
          translation: {
            top: py - headerHeight - 20,
            left: px,
          },
        },
      });
    }
    // si no hay medida cacheada, no intentes medir aquí: el nodo ya puede no existir
  }

  // ----- medición robusta (Fabric/Bridgeless) -----
  measureInWindowSafe = () => {
    if (!this._mounted || !this.component) return;
    // 1) Usa measureInWindow del host ref si existe
    if (this.component.measureInWindow) {
      this.component.measureInWindow((x, y, w, h) => {
        if (!this._mounted) return;
        this.lastMeasure = { px: x, py: y, w, h };
      });
      return;
    }
    // 2) Fallback a UIManager.measureInWindow
    const node = findNodeHandle(this.component);
    if (node) {
      UIManager.measureInWindow(
        node,
        (x, y, w, h) => {
          if (!this._mounted) return;
          this.lastMeasure = { px: x, py: y, w, h };
        }
      );
    }
  };

  // si tu Gestures expone callbacks, refrescamos tras finalizar gesto
  handleGestureEnd = () => {
    // deja terminar layout y mide
    requestAnimationFrame(this.measureInWindowSafe);
  };

  render() {
    const { position, updating } = this.props.note;
    const borderColor = updating ? '#ff0000' : '#fff';

    return (
      <View style={[styles.wrapper, { ...position }]} pointerEvents="box-none">
        <Gestures
          rotatable={false}
          scalable={{ min: 1, max: 2 }}
          // ⬇️ si tu Gestures tiene estos props, úsalos para “congelar” la última medida buena
          onEnd={this.handleGestureEnd}
          onScaleEnd={this.handleGestureEnd}
        >
          <View
            // ⬅️ MUY IMPORTANTE para que RN no colapse el nodo que medimos
            collapsable={false}
            style={[styles.container, { borderColor }]}
            ref={this.setRef}
            onLayout={this.measureInWindowSafe}
          >
            <View style={[styles.cornerCirle, { left: -5, top: -5 }]} />
            <View style={[styles.cornerCirle, { right: -5, top: -5 }]} />
            <View style={[styles.cornerCirle, { left: -5, bottom: -5 }]} />
            <View style={[styles.cornerCirle, { right: -5, bottom: -5 }]} />
          </View>
        </Gestures>
      </View>
    );
  }
}

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
