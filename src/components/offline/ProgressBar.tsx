import React, {useMemo} from 'react';
import {View} from 'react-native';

type Props = {
  value: number;
  total: number;
};
const ProgressBar = ({value, total}: Props) => {
  const percent = useMemo(() => {
    if (total < 1) {
      return 0;
    }
    return (value * 100) / total;
  }, [value, total]);

  return (
    <View
      style={{
        height: 10,
        backgroundColor: '#f3f3f3',
        width: '100%',
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: "gray"
      }}>
      <View
        style={{
          height: 10,
          backgroundColor: '#1155cc',
          width: `${percent}%`,
          overflow: 'hidden',
        }}></View>
    </View>
  );
};

export default ProgressBar;
