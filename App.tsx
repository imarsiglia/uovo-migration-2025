import AsyncStorage from '@react-native-async-storage/async-storage';
// import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {QueryClient} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import * as React from 'react';
import {
  Dimensions,
  Easing,
  LogBox,
  Platform,
  Text,
  useColorScheme,
} from 'react-native';
import {AutocompleteDropdownContextProvider} from 'react-native-autocomplete-dropdown';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ModalProvider, createModalStack} from 'react-native-modalfy';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {AppNavigation} from './src/navigation/AppNavigation';
import {ColorScheme, EDSProvider, useEDS} from '@equinor/mad-components';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import AppProviders from '@providers/AppProviders';
import {ModalDialog} from '@components/commons/modals/ModalDialog';
import {ModalLoading} from '@components/commons/modals/ModalLoading';
import {PortalHost} from '@gorhom/portal';

// import EditDeleteModal from './src/components/conditionReport/EditDeleteModal';
// import EditModal from './src/components/conditionReport/EditModal';
// import CustomStatusBar from './src/components/general/StatusBar';
// import AppNavigator from './src/navigation/root-navigation';
// import UserProvider from './src/provider/UserProvider';
// import userReducer from './src/reducers/user';

// import * as Sentry from '@sentry/react-native';
// import {InventoryProvider} from './src/provider/InventoryProvider';
// import {NationalShuttleProvider} from './src/provider/NationalShuttleProvider';
// import {TabHomeProvider} from './src/provider/TabHomeProvider';

// Sentry.init({
//   dsn: 'https://4e6533e974a149768cb0f58cc2d6397e@o4505777352802304.ingest.sentry.io/4505777354047488',
//   attachViewHierarchy: true,
// });

// const store = createStore(userReducer);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 72, // 72 hours
    },
  },
});

// const asyncStoragePersister = createAsyncStoragePersister({
//   storage: AsyncStorage,
// });

const {height} = Dimensions.get('screen');
const defaultOptions = {
  backdropOpacity: 0.5,
  animateInConfig: {
    easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
    duration: 450,
  },
  animateOutConfig: {
    easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
    duration: 450,
  },
  transitionOptions: (animatedValue: any) => ({
    opacity: animatedValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 0.9],
    }),
    transform: [
      {perspective: 2000},
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [height / 1.5, 0, -height / 1.5],
          extrapolate: 'clamp',
        }),
      },
    ],
  }),
};

// const modalConfig = {
//   EditModal: {
//     modal: EditModal,
//     disableFlingGesture: true,
//     backBehavior: 'none',
//   },
//   EditDeleteModal: {
//     modal: EditDeleteModal,
//     disableFlingGesture: true,
//     backBehavior: 'none',
//   },
// };

// const modalStack = createModalStack(modalConfig, defaultOptions);

const App = () => {
  // React.useEffect(() => {
  //   if (Text.defaultProps == null) Text.defaultProps = {};
  //     Text.defaultProps.allowFontScaling = false;

  //   if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  //     TextInput.defaultProps.allowFontScaling = false;
  // }, [])

  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* <Provider store={store}> */}
      <AutocompleteDropdownContextProvider>
        <AppProviders>
          <KeyboardProvider>
            <EDSProvider colorScheme={scheme as ColorScheme} density="phone">
              {/* {Platform.OS == 'android' && <CustomStatusBar />} */}
              {/* <ModalProvider stack={modalStack}> */}
              {/* <UserProvider
                  value={{isInventoryMode: false, activeFilter: false}}> */}
              {/* <TabHomeProvider>
                    <NationalShuttleProvider>
                      <InventoryProvider> */}
              <SafeAreaProvider>
                <AppNavigation />
                <PortalHost name="root" />
              </SafeAreaProvider>
              {/* </InventoryProvider>
                    </NationalShuttleProvider>
                  </TabHomeProvider> */}
              {/* </UserProvider> */}
              {/* </ModalProvider> */}
              <ModalDialog />
              <ModalLoading />
            </EDSProvider>
          </KeyboardProvider>
        </AppProviders>
      </AutocompleteDropdownContextProvider>
      {/* </Provider> */}
    </GestureHandlerRootView>
  );
};

export default App;
