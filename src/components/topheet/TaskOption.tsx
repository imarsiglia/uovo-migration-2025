import OfflineValidation from '@components/offline/OfflineValidation';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  icon?: string;
  color?: string;
  name: string;
  quantity?: number;
  onPressLeft?: () => void;
  onPressRight?: () => void;
  light?: boolean;
  forwardRef?: any;
  openDialog?: boolean;
  hideQuantity?: boolean;
  disabled?: boolean;
  idJob: number;
  offline?: string[];
}

const TaskOption = ({
  icon,
  color,
  name,
  quantity,
  onPressLeft,
  onPressRight,
  light,
  forwardRef,
  openDialog,
  hideQuantity,
  disabled,
  idJob,
  offline,
}: Props) => {
  const styles = StyleSheet.create({
    container: {
      height: light ? 55 : 70,
      opacity: disabled ? 0.3 : 1,
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
      borderLeftWidth: light ? 0.2 : 0,
      borderLeftColor: '#959595',
      backgroundColor: '#F7F5F4',
      height: light ? 35 : '100%',
      width: 50,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewIcon: {
      backgroundColor: color,
      width: 45,
      height: 45,
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
      paddingLeft: 20,
      paddingRight: 20,
    },
    name: {
      color: '#464646',
      fontSize: 14,
    },
    containerQuantity: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    viewQuantity: {
      backgroundColor: '#959595',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 30,
      minWidth: 30,
    },
    quantity: {
      textAlign: 'center',
      color: 'white',
      fontSize: 18,
    },
    minPadding: {
      paddingLeft: 10,
    },
  });

  return (
    <View
      ref={forwardRef}
      style={[styles.container, {opacity: disabled ? 0.2 : 1}]}>
      <TouchableOpacity
        onPress={() => (onPressLeft != undefined ? onPressLeft() : null)}
        style={[styles.viewName, {width: '80%'}]}>
        <View style={[GLOBAL_STYLES.row, {width: '80%'}]}>
          <View style={styles.viewIcon}>
            <Icon
              name={icon}
              type="solid"
              color="white"
              size={23}
              style={styles.icon}
            />
          </View>
          <View
            style={[
              styles.minPadding,
              {flexDirection: 'row', alignItems: 'center', gap: 5},
            ]}>
            <Text style={[GLOBAL_STYLES.bold, styles.name]} numberOfLines={1}>
              {name}
            </Text>
            <OfflineValidation offline={offline} idJob={idJob} />
          </View>
        </View>

        <View style={[styles.containerQuantity, {width: '30%'}]}>
          {!hideQuantity && (
            <View style={styles.viewQuantity}>
              <Text style={styles.quantity} allowFontScaling={false}>
                {quantity}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={GLOBAL_STYLES.row}>
        <View
          style={{
            position: 'absolute',
            height: '80%',
            borderLeftWidth: 0.5,
            width: 1,
            borderLeftColor: '#959595',
            opacity: 0.4,
            left: 0,
            zIndex: 300,
            alignItems: 'center',
          }}></View>
        <TouchableOpacity
          delayPressOut={openDialog ? 200 : 0}
          onPress={() => (onPressRight != undefined ? onPressRight() : null)}>
          <View style={styles.btnAdd}>
            <Icon name="plus" type="light" size={26} color="#959595" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskOption;
