import Icon from 'react-native-fontawesome-pro';
import {StyleSheet} from 'react-native';

type Props = {
  offline?: boolean;
  size?: number;
};
const OfflineValidation = ({offline, size = 16}: Props) => {
  if (!offline) {
    return null;
  }

  return (
    <Icon
      name={'exclamation-triangle'}
      type="solid"
      color={'red'}
      size={size}
      style={styles.icon}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
});

export default OfflineValidation;
