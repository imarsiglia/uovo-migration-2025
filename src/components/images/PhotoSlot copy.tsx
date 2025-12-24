// components/images/PhotoSlot.tsx
import React, {memo} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {COLORS} from '@styles/colors';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';

interface PhotoSlotProps {
  uri?: string; // URI local del archivo
  base64?: string; // Base64 (fallback)
  onEdit: () => void;
  onRemove: () => void;
}

export const PhotoSlot = memo<PhotoSlotProps>(
  ({uri, base64, onEdit, onRemove}) => {
    // Determinar source de la imagen
    const imageSource: ImageSourcePropType = uri
      ? {uri} // Usar URI local (más eficiente)
      : base64
      ? {uri: `data:image/jpeg;base64,${base64}`} // Fallback a base64
      : require('@assets/images/placeholder.png'); // Placeholder si no hay nada

    return (
      <View style={styles.container}>
        <Image
          key={uri}
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
        />

        <PressableOpacity style={[styles.btn, styles.btnEdit]} onPress={onEdit}>
          <Icon name="pen" color="white" type="solid" size={17} />
        </PressableOpacity>
        <PressableOpacity
          style={[styles.btn, styles.btnTrash]}
          onPress={onRemove}>
          <Icon name="trash" color="white" type="solid" size={17} />
        </PressableOpacity>
      </View>
    );
  },
);

PhotoSlot.displayName = 'PhotoSlot';

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  removeButton: {
    backgroundColor: '#FF6C6C',
  },
  btn: {
    alignSelf: 'flex-start',
    borderRadius: 50,
    padding: 9,
    backgroundColor: '#00D3ED',
    position: 'absolute',
    bottom: -15,
  },
  btnEdit: {right: 10},
  btnTrash: {left: 10, backgroundColor: COLORS.terteary ?? '#00D3ED'},
});
