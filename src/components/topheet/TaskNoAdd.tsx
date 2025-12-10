import OfflineValidation from '@components/offline/OfflineValidation';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  onPress: () => void;
  description?: string;
  quantity?: number;
  offline?: boolean;
  idJob?: number;
};

const TaskNoAdd = ({onPress, description, quantity, offline, idJob}: Props) => {
  return (
    <TouchableOpacity style={styles.buttonTask} onPress={onPress}>
      <View style={GLOBAL_STYLES.row}>
        <View style={[styles.viewIcon, {backgroundColor: '#A63AC9'}]}>
          <Icon
            name="clipboard"
            type="solid"
            color="white"
            size={23}
            style={styles.icon}
          />
        </View>
        <View
          style={[
            styles.minPaddingLeft,
            {flexDirection: 'row', alignItems: 'center', gap: 5},
          ]}>
          <Text style={[GLOBAL_STYLES.bold, styles.labelTask]}>{description}</Text>
          <OfflineValidation offline={offline} />
        </View>
      </View>

      <View
        style={[
          styles.btnArrow,
          {
            width: '30%',
            justifyContent: 'space-between',
            paddingRight: 13,
          },
        ]}>
        <View style={[styles.containerQuantity]}>
          <View style={styles.viewQuantity}>
            <Text style={styles.quantity} allowFontScaling={false}>
              {quantity}
            </Text>
          </View>
        </View>

        <Icon name="angle-right" type="light" size={26} color="#959595" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  minPaddingLeft: {
    paddingLeft: 10,
  },
  labelTask: {
    color: '#464646',
    fontSize: 14,
  },
  buttonTask: {
    flexDirection: 'row',
    backgroundColor: '#F7F5F4',
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    alignContent: 'center',
    marginBottom: 15,
    paddingLeft: 20,
    paddingRight: 0,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  viewIcon: {
    backgroundColor: '#A278C2',
    width: 45,
    height: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    alignSelf: 'center',
  },
  quantity: {
    textAlign: 'center',
    alignSelf: 'center',
    color: 'white',
    fontSize: 18,
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
    minWidth: 30,
    minHeight: 30,
  },
  btnArrow: {
    flexDirection: 'row',
    height: '100%',
    width: 50,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TaskNoAdd;
