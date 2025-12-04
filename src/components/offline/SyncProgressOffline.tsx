// src/components/offline/SyncProgressOffline.tsx
import React, {useEffect, useMemo, useState, useCallback, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

import {
  readProcessingSession,
  getQueueByStatus,
  archiveAndClearFailed,
  readQueue,
  writeQueue,
  replaceQueue,
} from '@offline/outbox';
import {processQueueOnce} from './processor';
import {OutboxItem} from '@offline/types';
import ModalSyncroOffline from './ModalSyncroOffline';

type Props = {
  onClose?: () => void;
};

export default function SyncProgressOffline({onClose}: Props) {
  const qc = useQueryClient();

  // -------- live data --------
  const [session, setSession] = useState<{
    total: number;
    processed: number;
    currentUid: string | null;
  } | null>(null);
  const [lists, setLists] = useState<{
    pending: OutboxItem[];
    in_progress: OutboxItem[];
    succeeded: OutboxItem[];
    failed: OutboxItem[];
  }>({pending: [], in_progress: [], succeeded: [], failed: []});

  // -------- connectivity --------
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    const sub = NetInfo.addEventListener((s) => {
      const ok = !!s.isConnected && (s.isInternetReachable ?? true);
      setOnline(ok);
    });
    NetInfo.fetch().then((s) => {
      const ok = !!s.isConnected && (s.isInternetReachable ?? true);
      setOnline(ok);
    });
    return () => sub && sub();
  }, []);

  const refresh = useCallback(async () => {
    const s = await readProcessingSession();
    const l = await getQueueByStatus();
    setSession(
      s
        ? {total: s.total, processed: s.processed, currentUid: s.currentUid}
        : null,
    );
    setLists({
      pending: l.pending,
      in_progress: l.in_progress,
      succeeded: l.succeeded,
      failed: l.failed,
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 700);
    return () => clearInterval(id);
  }, [refresh]);

  // -------- derived --------
  // const totalBase = useMemo(
  //   () =>
  //     session ? session.total : lists.pending.length + lists.failed.length,
  //   [session, lists.pending.length, lists.failed.length],
  // );
  // const processedBase = useMemo(
  //   () => (session ? session.processed : lists.succeeded.length),
  //   [session, lists.succeeded.length],
  // );

  // -------- derived --------
  const totalBase = useMemo(() => {
    // 1. Si la sesión trae un total válido, úsalo
    if (session && session.total > 0) {
      return session.total;
    }

    // 2. Si no, usa el total real de la cola
    return (
      lists.pending.length +
      lists.in_progress.length +
      lists.succeeded.length +
      lists.failed.length
    );
  }, [
    session,
    lists.pending.length,
    lists.in_progress.length,
    lists.succeeded.length,
    lists.failed.length,
  ]);

  const processedBase = useMemo(() => {
    // Si la sesión es válida, usamos su contador
    if (session && session.total > 0) {
      return session.processed;
    }

    // Si no hay sesión, consideramos como "procesados" los succeeded
    // (si quieres que los failed también cuenten como procesados, suma lists.failed.length)
    return lists.succeeded.length;
  }, [session, lists.succeeded.length]);

  const isProcessing = lists.in_progress.length > 0 || !!session?.currentUid;
  const hasFailed = lists.failed.length > 0;
  const finished =
    !isProcessing &&
    lists.pending.length === 0 &&
    lists.in_progress.length === 0;

  // -------- auto-kick (pendientes + internet) --------
  const kickingRef = useRef(false);
  const kickSyncIfNeeded = useCallback(async () => {
    if (kickingRef.current) return;
    const shouldProcess =
      online && lists.pending.length > 0 && lists.in_progress.length === 0;
    if (!shouldProcess) return;

    kickingRef.current = true;
    try {
      await processQueueOnce(qc, {processFailedItems: false});
    } finally {
      kickingRef.current = false;
    }
  }, [online, lists.pending.length, lists.in_progress.length, qc]);

  useEffect(() => {
    void kickSyncIfNeeded();
  }, [kickSyncIfNeeded]);

  // -------- actions --------
  const ensureInternet = async () => {
    const n = await NetInfo.fetch();
    return !!n.isConnected && n.isInternetReachable !== false;
  };

  // const retryFailed = async () => {
  //   if (!hasFailed) return;
  //   if (!(await ensureInternet())) {
  //     Alert.alert('No internet', 'Please connect to the internet to retry.');
  //     return;
  //   }
  //   await processQueueOnce(qc, {processFailedItems: true});
  // };
  const retryFailed = async () => {
    if (!hasFailed) return;
    if (!(await ensureInternet())) {
      Alert.alert('No internet', 'Please connect to the internet to retry.');
      return;
    }

    // Resetear items fallidos a pending
    let q = await readQueue();
    q = q.map((it: any) =>
      it.status === 'failed'
        ? {...it, status: 'pending', updatedAt: Date.now(), attempts: 0}
        : it,
    );
    await replaceQueue(q);

    // Ahora procesar
    await processQueueOnce(qc);
  };

  const purgeNonFailedFromQueue = useCallback(async () => {
    const q = await readQueue();
    const failedOnly = q.filter((i) => i.status === 'failed');
    await writeQueue(failedOnly);
  }, []);

  const handleClose = useCallback(async () => {
    if (!finished) return;

    if (hasFailed) {
      const archived = await archiveAndClearFailed();
      if (archived > 0) {
        // Alert.alert(
        //   'Archived',
        //   `${archived} failed item(s) were archived for later review.`,
        // );
      }
      await purgeNonFailedFromQueue();
    } else {
      await purgeNonFailedFromQueue();
    }

    onClose?.();
  }, [finished, hasFailed, onClose, purgeNonFailedFromQueue]);

  // -------- UI (diseño simplificado como el original) --------
  return (
    <View style={styles.container}>
      {finished ? (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 18, marginBottom: 10, fontWeight: '500'}}>
            Sync completed!
          </Text>

          {hasFailed ? (
            <View>
              <Text style={[styles.results, {color: 'red'}]}>
                {lists.failed.length} events with error
              </Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.results, {color: 'green'}]}>0 Errors</Text>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              paddingTop: 30,
            }}>
            <TouchableOpacity style={styles.touchable} onPress={handleClose}>
              <Text style={styles.optionLeft}>OK</Text>
            </TouchableOpacity>

            {hasFailed && (
              <TouchableOpacity style={styles.touchable} onPress={retryFailed}>
                <Text style={styles.optionRight}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <ModalSyncroOffline value={processedBase} total={totalBase} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  touchable: {
    padding: 10,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLeft: {
    fontSize: 16,
  },
  optionRight: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  results: {
    fontSize: 15,
  },
});
