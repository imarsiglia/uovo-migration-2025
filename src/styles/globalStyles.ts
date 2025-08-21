import {StyleSheet} from 'react-native';

export const GLOBAL_STYLES = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: "row",
    gap: 2,
    alignItems: "center"
  },
  containerBtnOptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    paddingLeft: 5,
  },
  bgwhite: {
    backgroundColor: 'white',
  },
  backgroundLoading: {
    zIndex: 9999,
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    opacity: 0.7,
    justifyContent: 'center',
  },
  safeAreaLight: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30,
  },
  bold: {
    fontWeight: 'bold',
  },

});
