import {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, focusManager, onlineManager} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {mmkvPersister} from '@api/storage/react-query-mmkv';
import {QUERY_KEYS} from '@api/contants/constants';
import {AppState, AppStateStatus, useColorScheme} from 'react-native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AutocompleteDropdownContextProvider} from 'react-native-autocomplete-dropdown';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {ColorScheme, EDSProvider} from '@equinor/mad-components';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import EditModal from '@components/condition/notes/EditModal';
import {createModalStack, ModalProvider} from 'react-native-modalfy';
import {DEFAULT_OPTIONS_MODALFY} from '@utils/functions';
import EditDeleteModal from '@components/condition/notes/EditDeleteModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min “fresh”
      gcTime: 30 * 24 * 60 * 60 * 1000, // 30 días en memoria
      retry: 1,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
    },
  },
});

// Conectar React Query a NetInfo (pausa refetch si no hay internet)
onlineManager.setEventListener((setOnline) => {
  const unsub = NetInfo.addEventListener((s) => {
    const online = !!s.isConnected && s.isInternetReachable !== false;
    setOnline(online);
  });
  return unsub;
});

function useReactQueryFocusOnAppState() {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}

const modalConfig = {
  EditModal: {
    modal: EditModal,
    disableFlingGesture: true,
    backBehavior: 'none',
  },
  EditDeleteModal: {
    modal: EditDeleteModal,
    disableFlingGesture: true,
    backBehavior: 'none',
  },
};

// @ts-ignore
const modalStack = createModalStack(modalConfig, DEFAULT_OPTIONS_MODALFY);

export default function AppProviders({children}: {children: React.ReactNode}) {
  useReactQueryFocusOnAppState();

  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AutocompleteDropdownContextProvider>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <EDSProvider colorScheme={scheme as ColorScheme} density="phone">
              <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{
                  persister: mmkvPersister,
                  // ❗ Decide cuánto tiempo consideras válido el snapshot en disco
                  // Si expira, se ignora y se limpia al hidratar:
                  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año (ajusta a tu gusto)
                  // Solo persiste lo que quieras:
                  dehydrateOptions: {
                    shouldDehydrateQuery: (q) => {
                      const k = Array.isArray(q.queryKey)
                        ? q.queryKey[0]
                        : q.queryKey;
                      const allow =
                        k === QUERY_KEYS.CALENDAR ||
                        k === QUERY_KEYS.TIMELINE ||
                        k === QUERY_KEYS.LOCATION_PLACES ||
                        k === QUERY_KEYS.WO_STATUS_LIST ||
                        k === QUERY_KEYS.WO_TYPE_LIST ||
                        k === QUERY_KEYS.JOB_QUEUE_LIST ||
                        k === QUERY_KEYS.TOPSHEET ||
                        k === QUERY_KEYS.TASK_COUNT ||
                        k === QUERY_KEYS.NOTES ||
                        k === QUERY_KEYS.IMAGES ||
                        k === QUERY_KEYS.LOAD_FULL_IMAGE ||
                        k === QUERY_KEYS.REPORT_MATERIALS ||
                        k === QUERY_KEYS.ALL_REPORT_MATERIALS_INVENTORY ||
                        k === QUERY_KEYS.ALL_ARTIST ||
                        k === QUERY_KEYS.SIGNATURES ||
                        k === QUERY_KEYS.BOL_COUNT ||
                        k === QUERY_KEYS.JOB_INVENTORY ||
                        k === QUERY_KEYS.INVENTORY_ITEM_DETAIL ||
                        k === QUERY_KEYS.RESUME_CONDITION_REPORT ||
                        k === QUERY_KEYS.RESUME_CONDITION_CHECK ||
                        k === QUERY_KEYS.CONDITION_REPORT_BY_INVENTORY ||
                        k === QUERY_KEYS.CONDITION_CHECK_BY_INVENTORY ||
                        k === QUERY_KEYS.WO_ATTACHMENTS ||
                        k === QUERY_KEYS.TOTAL_PHOTOS_CONDITION_CHECK ||
                        k === QUERY_KEYS.TOTAL_PHOTOS_CONDITION_REPORT ||
                        k === QUERY_KEYS.PLACES_CONDITION_REPORT ||
                        k === QUERY_KEYS.PHOTOS_CONDITION ||
                        k === QUERY_KEYS.PHOTO_CONDITION_DETAIL ||
                        k === QUERY_KEYS.PHOTO_CONDITION_OVERVIEW ||
                        k === QUERY_KEYS.PACKING_DETAILS ||
                        k === QUERY_KEYS.LABOR_CODES ||
                        k === QUERY_KEYS.NS_EAST_COAST_DROPOFF ||
                        k === QUERY_KEYS.NS_EAST_COAST_PICKUP ||
                        k === QUERY_KEYS.NS_INVENTORY_EAST_COAST_DROPOFF ||
                        k === QUERY_KEYS.NS_INVENTORY_EAST_COAST_PICKUP ||
                        k === QUERY_KEYS.NS_INVENTORY_UNIQUE_ROUTE_DROPOFF ||
                        k === QUERY_KEYS.NS_INVENTORY_UNIQUE_ROUTE_PICKUP ||
                        k === QUERY_KEYS.NS_INVENTORY_WEST_COAST_DROPOFF ||
                        k === QUERY_KEYS.NS_INVENTORY_WEST_COAST_PICKUP ||
                        k === QUERY_KEYS.NS_UNIQUE_ROUTE_DROPOFF ||
                        k === QUERY_KEYS.NS_UNIQUE_ROUTE_PICKUP ||
                        k === QUERY_KEYS.NS_WEST_COAST_DROPOFF ||
                        k === QUERY_KEYS.NS_WEST_COAST_PICKUP;
                      return allow && q.state.status === 'success';
                    },
                  },
                  // Limpia el cache persistido si cambias la “versión” de datos:
                  buster: 'app-v16', // cambia a 'app-v2' tras cambios de schema o logout
                }}>
                <ModalProvider stack={modalStack}>{children}</ModalProvider>
              </PersistQueryClientProvider>
            </EDSProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </AutocompleteDropdownContextProvider>
    </SafeAreaProvider>
  );
}
