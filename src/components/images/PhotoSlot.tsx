import {Image, StyleSheet, View} from 'react-native';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import Icon from 'react-native-fontawesome-pro';
import {COLORS} from '@styles/colors';

export function PhotoSlot({
  base64,
  onEdit,
  onRemove,
}: {
  base64: string; // file://...
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.containerEditImage}>
      <Image
        resizeMode="cover"
        style={styles.imageEdit}
        source={{uri: `data:image/jpeg;base64,${base64}`}}
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
}

const styles = StyleSheet.create({
  containerEditImage: {
    height: 140,
    width: '48%',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: '#d0d0d0',
  },
  imageEdit: {width: '100%', height: 140},
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
