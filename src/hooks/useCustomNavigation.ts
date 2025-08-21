import {CommonActions, NavigationProp, useNavigation} from '@react-navigation/native';
import { RootStackParamList } from 'src/navigation/types';

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

  return {
    ...navigation,
    resetTo,
  };
};
