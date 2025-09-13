import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {PressableProps, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
// import OfflineValidation from './offline/OfflineValidation';

type Props = {
  icon?: string;
  color?: string;
  name?: string;
  onPress?: () => void;
  light?: boolean;
  offline?: string;
  idJob?: number;
  idInventory?: number;
} & PressableProps;
const TaskOne = ({
  icon,
  color,
  name,
  onPress,
  light,
  offline,
  idJob,
  idInventory,
  ...rest
}: Props) => {
  const styles = StyleSheet.create({
    container: {
      height: light ? 50 : 70,
      backgroundColor: '#F7F5F4',
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignContent: 'center',
      marginBottom: 15,
    },
    btnAdd: {
      flexDirection: 'row',
      borderLeftWidth: 0,
      borderLeftColor: '#959595',
      backgroundColor: '#F7F5F4',
      height: '100%',
      width: 40,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewIcon: {
      backgroundColor: color,
      width: 40,
      height: 40,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      alignSelf: 'center',
    },
    viewName: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    name: {
      color: '#464646',
      fontSize: 14,
    },
    minPadding: {
      paddingLeft: 10,
    },
  });

  return (
    <PressableOpacity
      style={styles.container}
      onPress={() => (onPress ? onPress() : null)}
      {...rest}>
      <Wrapper style={[styles.viewName, {width: '80%'}]}>
        <Wrapper style={[GLOBAL_STYLES.row, {width: '100%'}]}>
          <Wrapper style={styles.viewIcon}>
            <Icon
              name={icon}
              type="solid"
              color="white"
              size={23}
              style={styles.icon}
            />
          </Wrapper>
          <Wrapper
            style={[
              styles.minPadding,
              {flexDirection: 'row', alignItems: 'center', gap: 5},
            ]}>
            <Label style={[GLOBAL_STYLES.bold, styles.name]}>{name}</Label>
            {/* <OfflineValidation
              idInventory={idInventory}
              offline={offline}
              idJob={idJob}
            /> */}
          </Wrapper>
        </Wrapper>
      </Wrapper>

      <Wrapper style={GLOBAL_STYLES.row}>
        <Wrapper style={styles.btnAdd}>
          <Icon name="angle-right" type="light" size={26} color="#959595" />
        </Wrapper>
      </Wrapper>
    </PressableOpacity>
  );
};

export default TaskOne;
