// src/components/SyncProgress.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { processQueueOnce } from '../offline/processor';
import { useQueryClient } from '@tanstack/react-query';
import { getQueue } from '@offline/outbox';

export default function SyncProgress({ onClose, disallowCloseWhileProcessing = true }: { onClose?: ()=>void; disallowCloseWhileProcessing?: boolean }) {
  const qc = useQueryClient();
  const [queue, setQueue] = useState<any[]>(() => getQueue());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let t: any = null;
    const poll = () => {
      try { setQueue(getQueue()); } catch {}
      t = setTimeout(poll, 1000);
    };
    poll();
    return () => { if (t) clearTimeout(t); };
  }, []);

  const { total, pending, inProgress, succeeded, failed } = useMemo(() => {
    const total = queue.length;
    const pending = queue.filter((q) => q.status === 'pending').length;
    const inProgress = queue.filter((q) => q.status === 'in_progress').length;
    const succeeded = queue.filter((q) => q.status === 'succeeded').length;
    const failed = queue.filter((q) => q.status === 'failed').length;
    return { total, pending, inProgress, succeeded, failed };
  }, [queue]);

  const percent = total === 0 ? 1 : Math.min(1, succeeded / total);

  const onForce = useCallback(async () => {
    setIsProcessing(true);
    try {
      await processQueueOnce(qc);
    } catch (e) {
      console.warn('force sync error', e);
    } finally {
      setIsProcessing(false);
    }
  }, [qc]);

  const isActive = pending > 0 || inProgress > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sincronización</Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.round(percent*100)}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(percent*100)}% — {succeeded}/{total} sincronizados</Text>

      <View style={styles.counters}>
        <Text>Total: {total}</Text>
        <Text>Pendientes: {pending}</Text>
        <Text>En proceso: {inProgress}</Text>
        <Text>Errores: {failed}</Text>
      </View>

      <View style={styles.controls}>
        {failed > 0 ? (
          <TouchableOpacity style={styles.btn} onPress={onForce} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Forzar sincronización</Text>}
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => { if (!isActive || !disallowCloseWhileProcessing) onClose?.(); }} disabled={isActive && disallowCloseWhileProcessing}>
          <Text style={[styles.btnText, styles.btnGhostText]}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...queue].reverse()}
        keyExtractor={(i) => i.uid}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.kind}>{item.payload.entity} — {item.op}</Text>
            <Text style={styles.uid}>{item.uid} • {item.attempts}x • {item.status}</Text>
            {item.lastError ? <Text style={styles.err}>{item.lastError}</Text> : null}
          </View>
        )}
        style={{ marginTop: 12, maxHeight: 300 }}
        ListEmptyComponent={() => <Text style={{ textAlign: 'center', color: '#666' }}>Sin operaciones pendientes</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', minHeight: 200 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  progressBarBackground: { height: 10, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: 10, backgroundColor: '#2b8aef' },
  progressText: { fontSize: 12, color: '#444', marginBottom: 8 },
  counters: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  controls: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  btn: { backgroundColor: '#2b8aef', padding: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', marginLeft: 8 },
  btnGhostText: { color: '#444' },
  item: { padding: 8, borderRadius: 6, backgroundColor: '#fafafa', marginBottom: 8 },
  kind: { fontWeight: '700' },
  uid: { color: '#666', fontSize: 12 },
  err: { color: '#c53030', marginTop: 4 }
});
