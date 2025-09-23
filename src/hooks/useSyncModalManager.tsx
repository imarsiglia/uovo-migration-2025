// src/hooks/useSyncModalManager.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { getQueue } from '../offline/outbox';

type UseSyncModalManagerReturn = {
  syncModalOpen: boolean;
  setSyncModalOpen: (v: boolean) => void;
  lastAutoOpenAt: number | null;
};

export function useSyncModalManager(): UseSyncModalManagerReturn {
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [lastAutoOpenAt, setLastAutoOpenAt] = useState<number | null>(null);

  const debounceRef = useRef<number | null>(null);

  // helper to inspect queue quickly
  const hasActiveOps = useCallback(() => {
    try {
      const q = getQueue();
      return q.some(i => i.status === 'pending' || i.status === 'in_progress' || i.status === 'failed');
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // NetInfo listener: cuando reconecte, si hay items pendientes -> abrir modal
    const unsubNet = NetInfo.addEventListener(state => {
      const isOnline = !!state.isConnected && state.isInternetReachable !== false;
      if (isOnline) {
        // debounce pequeño para evitar abrir/cerrar rápidamente
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        debounceRef.current = setTimeout(() => {
          if (hasActiveOps()) {
            setSyncModalOpen(true);
            setLastAutoOpenAt(Date.now());
          }
        }, 400) as unknown as number;
      }
    });

    // AppState: al volver al foreground intentamos abrir si hay ops
    const unsubApp = AppState.addEventListener('change', status => {
      if (status === 'active') {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        debounceRef.current = setTimeout(() => {
          if (hasActiveOps()) {
            setSyncModalOpen(true);
            setLastAutoOpenAt(Date.now());
          }
        }, 400) as unknown as number;
      }
    });

    // inicial: si al arrancar ya hay ops y estamos online, abrir
    NetInfo.fetch().then(s => {
      const isOnline = !!s.isConnected && s.isInternetReachable !== false;
      if (isOnline && hasActiveOps()) {
        setSyncModalOpen(true);
      }
    });

    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasActiveOps]);

  return { syncModalOpen, setSyncModalOpen, lastAutoOpenAt };
}
