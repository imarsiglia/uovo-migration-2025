import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  activityIndicatorProps?: ActivityIndicatorProps;
};

export const IndicatorLoading = ({
  containerStyle,
  activityIndicatorProps,
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator
        size="large"
        color={'white'}
        {...activityIndicatorProps}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
