import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
export const NOTE_AREA = (width - 200) / 2;

// TODO memoize
//
export const getTopPosition = ({translation, position: {top}}) => {
  if (translation) {
    return translation.top;
  }
  return top;
};

export const getLeftPosition = ({translation, position: {left}}) => {
  if (translation) {
    return translation.left;
  }
  return left;
};

export const getFakeAreaStyles = (note) => {
  const style = {
    width: note?.width || NOTE_AREA,
    height: note?.height || NOTE_AREA,
    top: getTopPosition(note),
    left: getLeftPosition(note),
  };
  return style;
};
