import React, {memo, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {COLORS} from '@styles/colors';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';

interface PhotoSlotProps {
  uri?: string;
  base64?: string;
  onEdit: () => void;
  onRemove: () => void;
}

export const PhotoSlot = memo<PhotoSlotProps>(
  ({uri, base64, onEdit, onRemove}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 🔥 Construir source de forma más robusta
    const imageSource: ImageSourcePropType = React.useMemo(() => {
      if (error) {
        return require('@assets/images/placeholder.png');
      }

      if (uri) {
        // Verificar que la URI sea válida
        if (
          uri.startsWith('file://') ||
          uri.startsWith('content://') ||
          uri.startsWith('http://') ||
          uri.startsWith('https://') ||
          uri.startsWith('data:image')
        ) {
          return {uri};
        }
      }

      if (base64 && base64.length > 100) {
        return {uri: `data:image/jpeg;base64,${base64}`};
      }

      return require('@assets/images/placeholder.png');
    }, [uri, base64, error]);

    return (
      <View style={styles.container}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          onError={(e) => {
            // console.error('Image load error:', e.nativeEvent.error);
            setLoading(false);
            setError(true);
          }}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <Icon name="image-slash" size={30} color="#999" type="solid" />
          </View>
        )}

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
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
