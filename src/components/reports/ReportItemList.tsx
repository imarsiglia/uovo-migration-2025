import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  id: number;
  name: string;
  clientRef: string;
  partial?: boolean | null;
  onEdit: () => void;
};

const ReportItemList = ({id, name, clientRef, partial, onEdit}: Props) => {
  return (
    <View style={styles.containerNotification}>
      <View style={styles.viewNotification}>
        <View style={styles.viewDescNotification}>
          <Text style={styles.subtitleNotification}>ID: {id ? id : 'N/A'}</Text>
          <Text
            ellipsizeMode="tail"
            numberOfLines={2}
            style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
            {name}
          </Text>
          <Text style={[styles.subtitleClientRef]}>
            Client ref ID: {clientRef ? clientRef : 'N/A'}
          </Text>
          {partial == true && (
            <View style={styles.partialStatus}>
              <Text style={styles.partialStatusText}>Partial</Text>
            </View>
          )}
        </View>
        <View style={[GLOBAL_STYLES.row, {width: '10%'}]}>
          <TouchableOpacity onPress={() => onEdit()} style={styles.btnEdit}>
            <Icon name="edit" color="#00D3ED" type="solid" size={22} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerNotification: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  viewNotification: {
    backgroundColor: '#F7F5F4',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
  },
  circleNotification: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
  },
  letterNotification: {
    alignSelf: 'center',
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  viewDescNotification: {
    paddingLeft: 10,
    paddingRight: 40,
    width: '90%',
  },
  titleNotification: {
    color: '#464646',
    fontSize: 16,
  },
  subtitleNotification: {
    color: '#bfbfbf',
    opacity: 1,
    fontSize: 12,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  subtitleClientRef: {
    color: '#3C424A',
    opacity: 0.66,
    fontSize: 12,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  containerQuantity: {
    width: 25,
    height: 25,
    backgroundColor: '#959595',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 12,
    color: 'white',
  },
  btnEdit: {
    marginLeft: 10,
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDelete: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partialStatus: {
    backgroundColor: COLORS.terteary,
    borderRadius: 50,
    height: 25,
    width: 80,
    justifyContent: 'center',
    marginTop: 5,
  },
  partialStatusText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default ReportItemList;
