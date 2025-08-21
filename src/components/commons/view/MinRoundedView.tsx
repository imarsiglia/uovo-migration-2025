import { COLORS } from '@styles/colors';
import { StyleSheet, View } from 'react-native';

const MinRoundedView = ({height = 10}) => {
  return (
    <View style={{backgroundColor: COLORS.bgWhite}}>
      <View style={[{paddingBottom: height}, styles.container]}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
    borderLeftWidth: 1,
    borderLeftColor: '#e3e3e3',
    borderRightWidth: 1,
    borderRightColor: '#e3e3e3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default MinRoundedView;
