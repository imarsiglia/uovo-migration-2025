import {StyleSheet} from 'react-native';
import {COLORS} from './colors';

export const GLOBAL_STYLES = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  containerBtnOptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  btnOptTop: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    width: 27,
    padding: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerOptionsModalClockOutHorizontal: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#08141F21',
    marginTop: 10,
  },
  modalClockOutHorizontal: {
    borderRadius: 20,
    width: '80%',
    backgroundColor: 'white',
  },
  bodyModalClockOut: {
    padding: 14,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOptionModalClockOutHorizontal: {
    minHeight: 50,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#08141F21',
    padding: 5,
  },
  optionModalClockOutHorizontal: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
  },
  descModalClockOut: {
    color: '#707070',
    marginTop: 20,
    textAlign: 'center',
  },
  titleModalClockOut: {
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  subtitleModalClockOut: {
    color: '#3C424A',
    marginBottom: 0,
    textAlign: 'center',
  },
  lateralPadding: {
    paddingHorizontal: 20,
  },
  alignItems: {
    alignItems: 'center',
  },
  autocompleteText: {
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 12,
    color: 'black',
  },
  fifty: {
    width: '50%',
  },
  fiftyFive: {
    width: '55%',
  },
  inputTitle: {
    color: COLORS.gray,
    fontSize: 13,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: COLORS.borderInputColor,
  },
  backgroundOpacity: {
    zIndex: 5001,
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#d0d0d0',
    opacity: 0.7,
  },
  container: {
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
});
