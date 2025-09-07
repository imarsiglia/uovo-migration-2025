import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList, RouteName} from 'src/navigation/types';

export const useCustomNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  function resetTo(routeName: string) {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: routeName}],
      }),
    );
  }

  function goBackAndUpdate(props: any) {
    navigation.navigate(
      navigation.getState().routes[navigation.getState().index - 1]
        ?.name as any,
      props,
      {
        merge: true,
        pop: true,
      },
    );
  }

  return {
    ...navigation,
    resetTo,
    goBackAndUpdate,
  };
};
