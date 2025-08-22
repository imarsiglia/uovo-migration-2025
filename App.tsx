import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
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

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

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
  // const [hasLoadedEds] = useEDS(); // carga fuentes/assets de EDS
  // if (!hasLoadedEds) return null;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* <Provider store={store}> */}
      <AutocompleteDropdownContextProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{persister: asyncStoragePersister}}>
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
              </SafeAreaProvider>
              {/* </InventoryProvider>
                    </NationalShuttleProvider>
                  </TabHomeProvider> */}
              {/* </UserProvider> */}
              {/* </ModalProvider> */}
            </EDSProvider>
          </KeyboardProvider>
        </PersistQueryClientProvider>
      </AutocompleteDropdownContextProvider>
      {/* </Provider> */}
    </GestureHandlerRootView>
  );
};

// LogBox.ignoreLogs([
//   'VirtualizedLists should never be nested', // TODO: Remove when fixed
// ]);

// LogBox.ignoreLogs(['ViewPropTypes will be removed from React Native']);

// LogBox.ignoreLogs([
//   `ViewPropTypes will be removed from React Native, along with all other PropTypes. We recommend that you migrate away from PropTypes and switch to a type system like TypeScript. If you need to continue using ViewPropTypes, migrate to the 'deprecated-react-native-prop-types' package.`,
// ]);

// LogBox.ignoreLogs([
//   '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.',
// ]);

// LogBox.ignoreLogs([
//   '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.',
// ]);

export default App;
