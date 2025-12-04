import {GLOBAL_STYLES} from '@styles/globalStyles';
import {PressableOpacity} from './PressableOpacity';
import {Wrapper} from '../wrappers/Wrapper';
import {Label} from '../text/Label';
import Icon from 'react-native-fontawesome-pro';
import {StyleSheet} from 'react-native';
import {COLORS} from '@styles/colors';
import OfflineValidation from '@components/offline/OfflineValidation';

type ButtonPhotosCountProps = {
  title: string;
  total: number;
  onPress: () => void;
  offline?: boolean;
};

export const ButtonPhotosCount = ({
  title,
  total,
  onPress,
  offline
}: ButtonPhotosCountProps) => {
  return (
    <PressableOpacity
      style={[
        GLOBAL_STYLES.row,
        styles.btnTakePhoto,
        {
          justifyContent: 'space-between',
        },
      ]}
      onPress={onPress}>
      <Wrapper
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
        }}>
        <Label style={styles.textTakePhoto}>{title}</Label>
        <OfflineValidation offline={offline} />
        {/* Aquí podrías reactivar validaciones offline específicas
            para ConditionCheck si las necesitas en el futuro */}
      </Wrapper>

      <Wrapper style={[GLOBAL_STYLES.row, styles.containerCountCamera]}>
        <Wrapper style={styles.countTakePhoto}>
          <Label style={styles.numberCount} allowFontScaling={false}>
            {total}
          </Label>
        </Wrapper>
        <Wrapper style={styles.viewCamera}>
          <Icon name="camera" type="solid" color="white" size={25} />
        </Wrapper>
      </Wrapper>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  textTakePhoto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  countTakePhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#3C424A',
  },
  containerCountCamera: {
    paddingLeft: 5,
    alignItems: 'center',
  },
  numberCount: {
    color: 'white',
    fontSize: 18,
  },
  viewCamera: {
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: '#3C424A',
    height: 30,
    padding: 5,
    marginLeft: 6,
  },
  btnTakePhoto: {
    width: '48%',
    borderRadius: 25,
    height: 40,
    backgroundColor: COLORS.terteary,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});
