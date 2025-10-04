// src/hooks/useSyncModalManager.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { getQueue } from '@offline/outbox';

export function useSyncModalManager() {
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const lastAutoOpen = useRef<number | null>(null);
  const debounceRef = useRef<any>(null);

  const hasActiveOps = useCallback(() => {
    try {
      const q = getQueue();
      return q.some(i => i.status === 'pending' || i.status === 'in_progress' || i.status === 'failed');
    } catch { return false; }
  }, []);

  useEffect(() => {
    const triggerIfHas = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (hasActiveOps()) {
          setSyncModalOpen(true);
          lastAutoOpen.current = Date.now();
        }
      }, 300);
    };

    const unsubNet = NetInfo.addEventListener(s => {
      if (s.isConnected && s.isInternetReachable !== false) triggerIfHas();
    });

    const unsubApp = AppState.addEventListener('change', (status) => {
      if (status === 'active') triggerIfHas();
    });

    // initial
    NetInfo.fetch().then(s => {
      if (s.isConnected && s.isInternetReachable !== false && hasActiveOps()) {
        setSyncModalOpen(true);
      }
    });

    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasActiveOps]);

  return { syncModalOpen, setSyncModalOpen, lastAutoOpenAt: lastAutoOpen.current };
}
