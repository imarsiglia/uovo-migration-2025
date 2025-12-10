// src/components/offline/SyncProgressOffline.tsx
import React, {useEffect, useMemo, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

import {
  readProcessingSession,
  getQueueByStatus,
  archiveAndClearFailed,
  readQueue,
  writeQueue,
} from '@offline/outbox';
import {processQueueOnce} from './processor';
import {OutboxItem} from '@offline/types';

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
  const totalBase = useMemo(
    () =>
      session ? session.total : lists.pending.length + lists.failed.length,
    [session, lists.pending.length, lists.failed.length],
  );
  const processedBase = useMemo(
    () => (session ? session.processed : lists.succeeded.length),
    [session, lists.succeeded.length],
  );
  const pct =
    totalBase > 0
      ? Math.min(100, Math.round((processedBase / totalBase) * 100))
      : 100;

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
      // No pasamos pingBefore para evitar bloqueo por health
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

  const retryFailed = async () => {
    if (!hasFailed) return;
    if (!(await ensureInternet())) {
      Alert.alert('No internet', 'Please connect to the internet to retry.');
      return;
    }
    await processQueueOnce(qc, {processFailedItems: true});
  };

  const purgeNonFailedFromQueue = useCallback(async () => {
    const q = await readQueue();
    const failedOnly = q.filter((i) => i.status === 'failed');
    await writeQueue(failedOnly);
  }, []);

  const handleClose = useCallback(async () => {
    if (!finished) return; // deshabilitado hasta terminar

    if (hasFailed) {
      const archived = await archiveAndClearFailed();
      if (archived > 0) {
        Alert.alert(
          'Archived',
          `${archived} failed item(s) were archived for later review.`,
        );
      }
      await purgeNonFailedFromQueue();
    } else {
      await purgeNonFailedFromQueue();
    }

    onClose?.();
  }, [finished, hasFailed, onClose, purgeNonFailedFromQueue]);

  // -------- UI --------
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Offline synchronization</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${pct}%`}]} />
        </View>
        <Text style={styles.percent}>{pct}%</Text>

        <View style={styles.stateRow}>
          <StatePill
            label={online ? 'Online' : 'Waiting for network…'}
            kind={online ? 'ok' : 'warn'}
          />
          <StatePill
            label={
              isProcessing
                ? 'Processing…'
                : finished
                ? hasFailed
                  ? 'Finished with errors'
                  : 'Finished successfully'
                : lists.pending.length > 0
                ? 'Ready to process'
                : 'Idle'
            }
            kind={
              isProcessing
                ? 'ok'
                : finished
                ? hasFailed
                  ? 'warn'
                  : 'ok'
                : 'muted'
            }
          />
        </View>
      </View>

      {/* Body (scrollable) */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled">
        <CountersRow
          pending={lists.pending.length}
          in_progress={lists.in_progress.length}
          succeeded={lists.succeeded.length}
          failed={lists.failed.length}
        />

        <ListSection title="In-progress items" data={lists.in_progress} />
        <ListSection title="Pending items" data={lists.pending} />
        <ListSection title="Succeeded items" data={lists.succeeded} />
        <ListSection title="Failed items" data={lists.failed} showError />
      </ScrollView>

      {/* Footer (fixed) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, !hasFailed && styles.btnDisabled]}
          onPress={retryFailed}
          disabled={!hasFailed || isProcessing || !online}>
          <Text
            style={[
              styles.btnText,
              (!hasFailed || isProcessing || !online) && styles.btnTextDisabled,
            ]}>
            Retry failed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            hasFailed ? styles.btnDanger : styles.btnPrimary,
            !finished &&
              (hasFailed ? styles.btnDangerMuted : styles.btnPrimaryMuted),
          ]}
          onPress={handleClose}
          disabled={!finished}>
          <Text
            style={hasFailed ? styles.btnDangerText : styles.btnPrimaryText}>
            {hasFailed ? 'Close & Archive errors' : 'Close'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- Subcomponents ---------- */

function ListSection({
  title,
  data,
  showError = false,
}: {
  title: string;
  data: OutboxItem[];
  showError?: boolean;
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(it) => it.uid}
        scrollEnabled={false}
        renderItem={({item}) => (
          <View style={styles.line}>
            <Text style={styles.lineText}>
              [{item.payload.entity}] {item.op.toUpperCase()}{' '}
              {item.payload.id ?? item.payload.clientId ?? item.uid}
            </Text>
            {showError && item.lastError ? (
              <Text style={styles.lineError}>({item.lastError})</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>None</Text>}
      />
    </View>
  );
}

function CountersRow({
  pending,
  in_progress,
  succeeded,
  failed,
}: {
  pending: number;
  in_progress: number;
  succeeded: number;
  failed: number;
}) {
  return (
    <View style={styles.countersRow}>
      <Badge label="Pending" value={pending} />
      <Badge label="In progress" value={in_progress} />
      <Badge label="Succeeded" value={succeeded} />
      <Badge label="Failed" value={failed} />
    </View>
  );
}

function Badge({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
    </View>
  );
}

function StatePill({
  label,
  kind,
}: {
  label: string;
  kind: 'ok' | 'warn' | 'muted';
}) {
  const bg =
    kind === 'ok' ? '#D1FAE5' : kind === 'warn' ? '#FEF3C7' : '#E5E7EB';
  const fg =
    kind === 'ok' ? '#065F46' : kind === 'warn' ? '#92400E' : '#374151';
  return (
    <View style={[styles.pill, {backgroundColor: bg}]}>
      <Text style={[styles.pillText, {color: fg}]}>{label}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  root: {
    flex: 1, // ocupa toda la altura dada por el modal (80% de pantalla)
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {fontWeight: '700', fontSize: 18, marginBottom: 10},
  progressBar: {
    height: 8,
    backgroundColor: '#E7E9EE',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {height: 8, backgroundColor: '#2563EB'},
  percent: {marginTop: 6, fontWeight: '600'},

  stateRow: {flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8},

  // Body scroll area uses remaining space between header and footer
  body: {flex: 1, marginTop: 8},
  bodyContent: {paddingHorizontal: 12, paddingBottom: 12},

  countersRow: {flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap'},

  pill: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999},
  pillText: {fontWeight: '600'},

  badge: {
    backgroundColor: '#F2F3F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    gap: 6,
  },
  badgeLabel: {color: '#4B5563'},
  badgeValue: {fontWeight: '700'},

  listSection: {marginTop: 10},
  sectionTitle: {fontWeight: '700', marginBottom: 6},
  empty: {color: '#6B7280', fontStyle: 'italic'},
  line: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  lineText: {color: '#111827'},
  lineError: {color: '#DC2626'},

  // Footer fijo
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 8,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  btnText: {fontWeight: '600', color: '#111827'},
  btnDisabled: {backgroundColor: '#E5E7EB'},
  btnTextDisabled: {color: '#9CA3AF'},

  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  btnPrimaryMuted: {backgroundColor: '#93C5FD'},
  btnPrimaryText: {color: 'white', fontWeight: '700'},

  btnDanger: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  btnDangerMuted: {backgroundColor: '#FECACA'},
  btnDangerText: {color: '#991B1B', fontWeight: '700'},
});
