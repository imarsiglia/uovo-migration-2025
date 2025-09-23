// src/components/SyncProgress.tsx
import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {AppState} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {getQueue} from '@offline/outbox';
import {processQueueOnce} from '@offline/useOutboxProcessor';
import Icon from 'react-native-fontawesome-pro';
import { COLORS } from '@styles/colors';

type OutboxStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed';
type OutboxItem = {
  uid: string;
  kind: string;
  createdAt: number;
  attempts: number;
  status: OutboxStatus;
  lastError?: string | null;
  payload?: any;
};

function simplePoll<T>(fn: () => T, interval = 1000) {
  // Hook-like polling generator (returns a function to start/stop)
  let timer: any = null;
  let cb: ((value: T) => void) | null = null;
  return {
    onValue: (c: (v: T) => void) => {
      cb = c;
      const run = () => {
        try {
          const v = fn();
          cb && cb(v);
        } catch (e) {
          // ignore
        }
      };
      run();
      timer = setInterval(run, interval);
      return () => {
        if (timer) clearInterval(timer);
      };
    },
  };
}

/**
 * Componente principal que muestra el progreso de sincronización.
 * Úsalo como contenido del modal que ya tienes:
 * <Modal visible={isOpen}> <SyncProgress onClose={() => setOpen(false)} /> </Modal>
 *
 * Props opcionales:
 *  - autoCloseOnFinish: si true cierra solo el modal cuando no haya items pendientes (necesitas pasar onClose).
 *  - onClose: función para cerrar el modal desde aquí.
 */

type Props = {
  onClose?: () => void;
  autoCloseOnFinish?: boolean;
  disallowCloseWhileProcessing?: boolean;
};
export default function SyncProgressOffline({
  onClose,
  autoCloseOnFinish = false,
  disallowCloseWhileProcessing = true,
}: Props) {
  const qc = useQueryClient();

  const [queue, setQueue] = useState<OutboxItem[]>(() => {
    try {
      return getQueue();
    } catch {
      return [];
    }
  });

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  // Poller: lee la cola desde MMKV periódicamente (1s)
  useEffect(() => {
    const poll = simplePoll(() => getQueue(), 1000);
    const stop = poll.onValue((v) => setQueue(v as OutboxItem[]));
    return stop;
  }, []);

  // NetInfo + AppState triggers: actualiza conexión y forzar refresh de queue
  useEffect(() => {
    const unsubNet = NetInfo.addEventListener((s) => {
      setIsConnected(!!s.isConnected && s.isInternetReachable !== false);
      // si estamos online, actualiza queue inmediatamente
      if (s.isConnected && s.isInternetReachable !== false) {
        try {
          setQueue(getQueue());
        } catch {}
      }
    });

    const unsubApp = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        try {
          setQueue(getQueue());
        } catch {}
      }
    });

    // inicial
    NetInfo.fetch().then((s) =>
      setIsConnected(!!s.isConnected && s.isInternetReachable !== false),
    );

    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
    };
  }, []);

  // derive counts
  const {total, pending, inProgress, succeeded, failed} = useMemo(() => {
    const total = queue.length;
    const pending = queue.filter((x) => x.status === 'pending').length;
    const inProgress = queue.filter((x) => x.status === 'in_progress').length;
    const succeeded = queue.filter((x) => x.status === 'succeeded').length;
    const failed = queue.filter((x) => x.status === 'failed').length;
    return {total, pending, inProgress, succeeded, failed};
  }, [queue]);

  const isActive = pending > 0 || inProgress > 0;

  const showForceSync = failed > 0;

  const percent = useMemo(() => {
    if (total === 0) return 1;
    return Math.min(1, succeeded / total);
  }, [succeeded, total]);

  const handleClose = useCallback(() => {
    if (disallowCloseWhileProcessing && isActive) {
      // opcional: show toast "Sincronización en progreso"
      return;
    }
    onClose?.();
  }, [disallowCloseWhileProcessing, isActive, onClose]);

  // Force sync
  const onForceSync = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Llamada al processor (usa tu QueryClient)
      await processQueueOnce(qc);
      setLastSyncAt(Date.now());
      // after process, refresh queue (poller should do it soon)
    } catch (e) {
      console.warn('[SyncProgress] force sync error', e);
    } finally {
      setIsProcessing(false);
    }
  }, [qc, isProcessing]);

  // Auto-close if finished
  useEffect(() => {
    if (autoCloseOnFinish && onClose) {
      // consider finished when there are no pending/in_progress/failed items
      const remaining = queue.filter(
        (q) =>
          q.status === 'pending' ||
          q.status === 'in_progress' ||
          q.status === 'failed',
      );
      if (remaining.length === 0) {
        onClose();
      }
    }
  }, [queue, autoCloseOnFinish, onClose]);

  const renderItem = ({item}: {item: OutboxItem}) => {
    return (
      <View style={styles.itemRow}>
        <View style={{flex: 1}}>
          <Text style={styles.itemKind}>{item.kind}</Text>
          <Text numberOfLines={1} style={styles.itemUid}>
            {item.uid}
          </Text>
        </View>
        <View style={styles.itemMeta}>
          <Text style={styles.metaText}>{item.attempts}x</Text>
          <Text
            style={[
              styles.metaText,
              item.status === 'failed' ? styles.bad : null,
            ]}>
            {item.status}
          </Text>
        </View>
        {item.lastError ? (
          <Text style={styles.errorText} numberOfLines={1}>
            {item.lastError}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync</Text>

      <View style={styles.statusRow}>
        <View style={styles.statusBlock}>
          <Text style={styles.label}>Connection</Text>
          <View style={styles.statusValueRow}>
            <Text style={styles.statusValue}>
              {isConnected
                ? 'Online'
                : isConnected === false
                ? 'Offline'
                : '...'}
            </Text>
            {isConnected ? (
              <Icon name='check-circle' color={COLORS.success} size={12}/>
            ) : null}
          </View>
        </View>

        <View style={styles.statusBlock}>
          <Text style={styles.label}>Last sync</Text>
          <Text style={styles.statusValue}>
            {lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {width: `${Math.round(percent * 100)}%`},
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(percent * 100)}% — {succeeded}/{total} synced
        </Text>
      </View>

      <View style={styles.countersRow}>
        <Counter label="Total" value={total} />
        <Counter label="Pending" value={pending} />
        <Counter label="In progress" value={inProgress} />
        <Counter label="Sucess" value={succeeded} />
        <Counter label="Errors" value={failed} />
      </View>

      <View style={styles.controlsRow}>
        {showForceSync ? (
          <TouchableOpacity
            style={styles.btn}
            onPress={onForceSync}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Force sync</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.btn,
            styles.btnGhost,
            isActive && disallowCloseWhileProcessing ? {opacity: 0.6} : null,
          ]}
          onPress={handleClose}
          disabled={isActive && disallowCloseWhileProcessing}>
          <Text style={[styles.btnText, styles.btnGhostText]}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Details</Text>
        <Text style={styles.listHeaderCount}>{queue.length}</Text>
      </View>

      <FlatList
        data={[...queue].reverse()} // mostrar último encolado arriba
        keyExtractor={(i) => i.uid}
        renderItem={renderItem}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending operations</Text>
        }
      />
    </View>
  );
}

function Counter({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterValue}>{value}</Text>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    minHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 10
  },
  title: {fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: "center"},
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBlock: {flex: 1, marginRight: 8},
  label: {color: '#666', fontSize: 12},
  statusValueRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  statusValue: {fontSize: 14, fontWeight: '600'},

  progressWrapper: {marginBottom: 12},
  progressBarBackground: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#2b8aef',
  },
  progressText: {marginTop: 6, fontSize: 12, color: '#444'},

  countersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  counter: {alignItems: 'center', flex: 1},
  counterValue: {fontSize: 16, fontWeight: '700'},
  counterLabel: {fontSize: 12, color: '#666'},

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#2b8aef',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  btnText: {color: '#fff', fontWeight: '700'},
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  btnGhostText: {color: '#444'},

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listHeaderText: {fontWeight: '700'},
  listHeaderCount: {color: '#666'},
  list: {maxHeight: 220},
  emptyText: {textAlign: 'center', color: '#999', paddingVertical: 12},

  itemRow: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#fafafa',
    flexDirection: 'column',
  },
  itemKind: {fontWeight: '700'},
  itemUid: {color: '#666', fontSize: 12},
  itemMeta: {position: 'absolute', right: 8, top: 8, alignItems: 'flex-end'},
  metaText: {fontSize: 12},
  bad: {color: '#c53030'},
  errorText: {color: '#c53030', fontSize: 12, marginTop: 6},
});
