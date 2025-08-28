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
  inputSearch: {
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.5,
    backgroundColor: 'white',
    fontSize: 10,
    height: 40,
    padding: 0,
    paddingLeft: 10,
    borderBottomWidth: 0.5,
  },
  sizeSearch: {
    fontSize: 16,
    color: '#3C424A',
    opacity: 0.6,
  },
   containerInputSearchIcon: {
    height: '100%',
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerTabContent: {
    backgroundColor: '#fafafa',
  },
  inputDate: {
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.5,
    backgroundColor: 'white',
    padding: 10,
    paddingBottom: 0,
    paddingTop: 0,
    fontSize: 10,
    height: 40,
    paddingRight: 0,
    borderBottomWidth: 0.5,
  },

});
