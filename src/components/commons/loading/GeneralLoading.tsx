
import { COLORS } from '@styles/colors';
import {ActivityIndicator, View} from 'react-native';

export const GeneralLoading = () => {
  return (
    <View
      style={{
        position: 'absolute',
        zIndex: 99999999,
        width: '100%',
        height: '100%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        opacity: 0.5
      }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};
