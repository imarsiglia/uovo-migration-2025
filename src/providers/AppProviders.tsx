// AppProviders.tsx
import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { mmkvPersister } from '@api/storage/react-query-mmkv';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 min “fresh”
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

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
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
            const isCalendar = Array.isArray(q.queryKey) && q.queryKey[0] === 'CALENDAR';
            const isSuccess = q.state.status === 'success';
            return isCalendar && isSuccess;
          },
        },
        // Limpia el cache persistido si cambias la “versión” de datos:
        buster: 'app-v1', // cambia a 'app-v2' tras cambios de schema o logout
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PersistQueryClientProvider>
  );
}
