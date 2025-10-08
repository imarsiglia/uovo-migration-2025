// src/hooks/useSyncModalManager.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { readQueue } from '@offline/outbox';

const AUTO_OPEN_DEBOUNCE_MS = 1000;
const AUTO_OPEN_COOLDOWN_MS = 12_000;

/**
 * Opens the offline sync modal only if:
 *  - there is actual internet connectivity, AND
 *  - there are queued items (pending/in_progress/failed).
 *
 * It NEVER auto-closes the modal. Closing is manual via setSyncModalOpen(false).
 */
export function useSyncModalManager() {
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const lastAutoOpen = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveOps = useCallback(async (): Promise<boolean> => {
    try {
      const q = await readQueue();
      return q.some(
        (i) =>
          i.status === 'pending' ||
          i.status === 'in_progress' ||
          i.status === 'failed'
      );
    } catch {
      return false;
    }
  }, []);

  const hasInternet = useCallback(async (): Promise<boolean> => {
    const s = await NetInfo.fetch();
    return !!s.isConnected && (s.isInternetReachable ?? true);
  }, []);

  const maybeOpenModal = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const [reachable, activeOps] = await Promise.all([
        hasInternet(),
        hasActiveOps(),
      ]);

      // Only OPEN if both conditions are true. Never auto-close.
      if (reachable && activeOps) {
        const now = Date.now();
        const last = lastAutoOpen.current ?? 0;
        if (!syncModalOpen && now - last > AUTO_OPEN_COOLDOWN_MS) {
          setSyncModalOpen(true);
          lastAutoOpen.current = now;
        }
      }
      // If conditions are false, do nothing: keep current open/closed state as is.
    }, AUTO_OPEN_DEBOUNCE_MS);
  }, [hasInternet, hasActiveOps, syncModalOpen]);

  useEffect(() => {
    // Subscribe to network changes
    const unsubNet = NetInfo.addEventListener(() => {
      void maybeOpenModal();
    });

    // Subscribe to app foreground
    const unsubApp = AppState.addEventListener('change', (status) => {
      if (status === 'active') void maybeOpenModal();
    });

    // Initial check
    void maybeOpenModal();

    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [maybeOpenModal]);

  return { syncModalOpen, setSyncModalOpen };
}
