// src/navigation/navigationService.ts
import {RootStackParamList} from '@navigation/types';
import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

export function resetTo(routeName: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: routeName as string}],
      }),
    );
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function replaceScreen(routeName: keyof RootStackParamList, params?: any) {
  navigationRef.dispatch(StackActions.replace(routeName, params));
}
