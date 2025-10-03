import {useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const useCustomInsetBottom = () => {
  const {bottom} = useSafeAreaInsets();

  const percentValue = useMemo(() => {
    return bottom ? (bottom * 44) / 100 : 0;
  }, [bottom]);

  return percentValue;
};
