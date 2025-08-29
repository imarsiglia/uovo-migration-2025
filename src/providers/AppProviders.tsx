// AppProviders.tsx
import React, {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, focusManager, onlineManager} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {mmkvPersister} from '@api/storage/react-query-mmkv';
import {QUERY_KEYS} from '@api/contants/constants';
import {AppState, AppStateStatus} from 'react-native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

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

export default function AppProviders({children}: {children: React.ReactNode}) {
  useReactQueryFocusOnAppState();
  return (
    <BottomSheetModalProvider>
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
              // Ejemplo: guarda solo queries exitosas del calendario
              const areSomeKeys =
                Array.isArray(q.queryKey) &&
                (q.queryKey[0] === QUERY_KEYS.CALENDAR ||
                  q.queryKey[0] === QUERY_KEYS.TIMELINE ||
                  q.queryKey[0] === QUERY_KEYS.LOCATION_PLACES ||
                  q.queryKey[0] === QUERY_KEYS.WO_STATUS_LIST ||
                  q.queryKey[0] === QUERY_KEYS.WO_TYPE_LIST ||
                  q.queryKey[0] === QUERY_KEYS.JOB_QUEUE_LIST);
              const isSuccess = q.state.status === 'success';
              return areSomeKeys && isSuccess;
            },
          },
          // Limpia el cache persistido si cambias la “versión” de datos:
          buster: 'app-v5', // cambia a 'app-v2' tras cambios de schema o logout
        }}>
        {children}
      </PersistQueryClientProvider>
    </BottomSheetModalProvider>
  );
}
