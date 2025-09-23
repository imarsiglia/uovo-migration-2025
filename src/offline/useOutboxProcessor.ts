import NetInfo from '@react-native-community/netinfo';
import { QueryClient } from '@tanstack/react-query';
import { getQueue, replaceQueue, isProcessingPersisted, setProcessingPersisted } from './outbox';
import { OutboxItem } from './types';
import { taskServices } from '@api/services/taskServices'; // tu cliente HTTP

let inMemoryProcessing = false;
const backoff = (attempts: number) => Math.min(60_000, 1000 * Math.pow(2, attempts));

/**
 * heuristicsMatch: compara local note con notas traídas del server
 * para intentar encontrar la nota recién creada si el server no devolvió id.
 * Usa comparación conservadora: title exacto + description exacto (puedes ampliar).
 */
function heuristicsMatch(local: NoteType, serverNote: NoteType) {
  if (!local || !serverNote) return false;
  return (local.title === serverNote.title) && (local.description === serverNote.description);
}

async function handleCreate(it: OutboxItem, qc: QueryClient) {
  const payload = it.payload;
  // 1) call saveNote (server returns boolean)
  const res = await taskServices.saveNote({
    // @ts-ignore
    idJob: payload.idJob,
    id: undefined,
    title: payload.title,
    // @ts-ignore
    description: payload.description,
  });

  if (!res) {
    // failed at server side -> throw to be caught by caller and retried
    throw new Error('Server returned false for create');
  }

  // res === true -> server claims success but did not return created object.
  // Try to reconcile via refetch and heuristics.

  const key = [QUERY_KEYS.NOTES, { idJob: payload.idJob }];
  // Force a fresh fetch from server
  try {
    await qc.invalidateQueries({ queryKey: key }); // triggers refetch
    // wait a bit to let refetch settle; or use fetchQuery with networkBailout false
    await qc.fetchQuery({ queryKey: key, queryFn: () => /* your fetchNotes API */ taskServices.getNotes({ idJob: payload.idJob }), staleTime: 0 }).catch(() => null);
  } catch (e) {
    // ignore, we'll fallback below
  }

  const refreshed = qc.getQueryData<any[]>(key) ?? [];

  // Heurística conservadora para buscar coincidencia:
  // prefer match title + description exactos y createdAt cercano (clientCreatedAt).
  const match = refreshed.find(sn => {
    if (!payload.title || !payload.description) return false;
    const titleMatch = sn.title === payload.title;
    const descMatch = sn.description === payload.description;
    if (!titleMatch || !descMatch) return false;
    // if server exposes createdAt, compare closeness to clientCreatedAt (± 2 min)
    if (payload.clientCreatedAt && sn.createdAt) {
      const delta = Math.abs(new Date(sn.createdAt).getTime() - payload.clientCreatedAt);
      return delta < 2 * 60 * 1000; // 2 minutes tolerance
    }
    return true; // fallback to title+description match
  });

  if (match) {
    // found server note -> map local clientId to server id in cache
    const serverId = match.id;
    const local = qc.getQueryData<any[]>(key) ?? [];
    const mapped = local.map(n => (n.clientId && payload.clientId && n.clientId === payload.clientId ? { ...match, pending: false } : n));
    qc.setQueryData(key, mapped);
    return { success: true, serverId };
  } else {
    // No match found. To avoid duplicate creates upon retries, we MARK AS SUCCEEDED (no further create).
    // We also invalidate to get authoritative list.
    console.warn(`[OUTBOX] create succeeded(true) but no match found for clientId=${payload.clientId}. Marking succeeded to avoid duplicate creates.`);
    await qc.invalidateQueries({ queryKey: key });
    return { success: true, serverId: null, note: 'no-match' };
  }
}

// async function handleCreate(it: OutboxItem, qc: QueryClient) {
//   // it.payload has clientId and final content
//   // 1) send create to server (without clientId in payload, because you don't want server to use it)
//   const payload = it.payload;
//   const res = await taskServices.saveNote({
//     idJob: payload.idJob,
//     id: undefined,
//     title: payload.title,
//     description: payload.description,
//   });
//   // res could be:
//   // - object: created note { id, title, description }
//   // - boolean true/false (older API)
//   if (res && typeof res === 'object' && (res as any).id) {
//     // map server id to local cache: replace items with clientId
//     const serverId = (res as any).id;
//     const key = ['notes', { idJob: payload.idJob }];
//     const local = qc.getQueryData<any[]>(key) ?? [];
//     const mapped = local.map(n => {
//       if (n.clientId && payload.clientId && n.clientId === payload.clientId) {
//         // substitute with server object (but keep extra fields if needed)
//         return { ...res, pending: false };
//       }
//       return n;
//     });
//     qc.setQueryData(key, mapped);
//     return { success: true, serverId };
//   } else if (res === true) {
//     // server didn't return created object. We'll try to refetch the list and find a match.
//     const key = ['notes', { idJob: payload.idJob }];
//     // refetch notes from server to get authoritative list
//     await qc.invalidateQueries({ queryKey: key });
//     // small delay ensuring refetch happens - optionally you can await queryClient.fetchQuery
//     await sleep(300);
//     const refreshed = qc.getQueryData<any[]>(key) ?? [];
//     // try to match by content
//     const match = refreshed.find(sn => heuristicsMatch(payload, sn));
//     if (match) {
//       // map local
//       const mapped = (qc.getQueryData<any[]>(key) ?? []).map(n => (n.clientId === payload.clientId ? { ...match, pending: false } : n));
//       qc.setQueryData(key, mapped);
//       return { success: true, serverId: match.id };
//     } else {
//       // No match found: this is risky. To avoid creating duplicates, mark succeeded but inform via lastError/logging.
//       // We choose to mark as succeeded (no further retries) to avoid duplicate creates.
//       console.warn('[OUTBOX] create: no match after server true; marking succeeded to avoid duplicate create.');
//       return { success: true, serverId: null, note: 'no-match' };
//     }
//   } else {
//     throw new Error('create failed');
//   }
// }

async function handleUpdate(it: OutboxItem, qc: QueryClient) {
  const p = it.payload;
  // Prefer server id if exists; else we might have clientId only (local note)
  const serverId = p.id;
  if (serverId) {
    const res = await taskServices.saveNote({
    // @ts-ignore
      idJob: p.idJob,
      id: serverId,
      title: p.title,
      // @ts-ignore
      description: p.description,
    });
    // assume success if not throwing
    await qc.invalidateQueries({ queryKey: ['notes', { idJob: p.idJob }] });
    return { success: true };
  } else {
    // update for a local-only note (only clientId) -> merge into create if create pending exists
    // if no create exists (maybe was already sent) then we try to find server note that matches and update it
    // For safety: we'll invalidate and search for a matching note
    await qc.invalidateQueries({ queryKey: ['notes', { idJob: p.idJob }] });
    await sleep(300);
    const list = qc.getQueryData<any[]>(['notes', { idJob: p.idJob }]) ?? [];
    const match = list.find(sn => heuristicsMatch(p, sn) && !sn.pending);
    if (match && match.id) {
      // call update on server id
    //   @ts-ignore
      await taskServices.saveNote({ idJob: p.idJob, id: match.id, title: p.title, description: p.description });
      await qc.invalidateQueries({ queryKey: ['notes', { idJob: p.idJob }] });
      return { success: true };
    } else {
      // nothing to update on server: treat as success (local-only)
      // Alternatively could enqueue create, but coalescing should have prevented duplicate creates.
      return { success: true, note: 'no-server-match' };
    }
  }
}

async function handleDelete(it: OutboxItem, qc: QueryClient) {
  const p = it.payload;
  if (p.id) {
    await taskServices.deleteNote({ id: p.id });
    await qc.invalidateQueries({ queryKey: ['notes', { idJob: p.idJob }] });
    return { success: true };
  } else if (p.clientId) {
    // There was a local-only note. Check if a create for this clientId exists in queue or has been already sent:
    // If create is still pending in queue, coalescing should have removed it (create+delete -> no-op).
    // If create already sent and server has note, try to find by content and delete by server id.
    await qc.invalidateQueries({ queryKey: ['notes', { idJob: p.idJob }] });
    await sleep(300);
    const list = qc.getQueryData<any[]>(['notes', { idJob: p.idJob }]) ?? [];
    const match = list.find(sn => heuristicsMatch(p, sn) && !sn.pending);
    if (match && match.id) {
      await taskServices.deleteNote({ id: match.id });
      await qc.invalidateQueries({ queryKey: ['notes', { idJob: p.idJob }] });
      return { success: true };
    } else {
      // nothing on server to delete (local-only), treat as succeeded and ensure local copies removed
      return { success: true, note: 'local-only-deleted' };
    }
  } else {
    // nothing to do
    return { success: true };
  }
}

async function safeRunOne(it: OutboxItem, qc: QueryClient) {
  if (it.kind === 'note/create') return await handleCreate(it, qc);
  if (it.kind === 'note/update') return await handleUpdate(it, qc);
  if (it.kind === 'note/delete') return await handleDelete(it, qc);
  throw new Error('unknown kind');
}

export async function processQueueOnce(qc: QueryClient) {
  if (inMemoryProcessing) return;
  if (isProcessingPersisted()) return;
  inMemoryProcessing = true;
  setProcessingPersisted(true);

  try {
    let queue = getQueue();
    for (let i = 0; i < queue.length; i++) {
      const it = queue[i];
      if (it.status === 'succeeded') continue;

      // mark in_progress and persist
      it.status = 'in_progress';
      it.attempts = (it.attempts ?? 0) + 1;
      replaceQueue(queue);

      try {
        let result: any;
        if (it.kind === 'note/create') result = await handleCreate(it, qc);
        else if (it.kind === 'note/update') result = await handleUpdate(it, qc);
        else if (it.kind === 'note/delete') result = await handleDelete(it, qc);

        // success => mark succeeded
        it.status = 'succeeded';
        it.lastError = null;
        replaceQueue(queue);

        // CLEANUP: remove any other items that reference same clientId or server id
        const remaining = getQueue().filter(x => {
          const p = x.payload;
          if (it.payload.clientId && p.clientId === it.payload.clientId) return false;
          if (result && (result as any).serverId && p.id && p.id === (result as any).serverId) return false;
          return true;
        });
        replaceQueue(remaining);

        // ensure cache authoritative (refetch)
        await qc.invalidateQueries({ queryKey: ['notes', { idJob: it.payload.idJob }] });

      } catch (err) {
        it.status = 'failed';
        it.lastError = String(err?.message ?? err);
        replaceQueue(queue);
        // backoff
        const delay = Math.min(60_000, 1000 * Math.pow(2, it.attempts ?? 1));
        await new Promise(res => setTimeout(res, delay));
      }

      queue = getQueue();
    }

    // final remove succeeded
    const final = getQueue().filter(x => x.status !== 'succeeded');
    replaceQueue(final);

  } finally {
    inMemoryProcessing = false;
    setProcessingPersisted(false);
  }
}

// export async function processQueueOnce(qc: QueryClient) {
//   if (inMemoryProcessing) return;
//   if (isProcessingPersisted()) return;
//   inMemoryProcessing = true;
//   setProcessingPersisted(true);

//   try {
//     let queue = getQueue();
//     for (let i = 0; i < queue.length; i++) {
//       const it = queue[i];
//       if (it.status === 'succeeded') continue;

//       // mark in_progress and persist immediately
//       it.status = 'in_progress';
//       it.attempts = (it.attempts ?? 0) + 1;
//       replaceQueue(queue);

//       try {
//         const result = await safeRunOne(it, qc);

//         // Success: mark succeeded and persist
//         it.status = 'succeeded';
//         it.lastError = null;
//         replaceQueue(queue);

//         // Remove any other queue entries related to same clientId or server id (cleanup)
//         const remaining = getQueue().filter(x => {
//           const p = x.payload;
//           // remove items that reference same clientId OR same server id (if result provided)
//           if (it.payload.clientId && p.clientId === it.payload.clientId) return false;
//           if ((it.payload.id || (result && (result as any).serverId)) && p.id && (p.id === it.payload.id || p.id === (result as any).serverId)) return false;
//           // otherwise keep
//           return true;
//         });
//         replaceQueue(remaining);

//         // Ensure UI cache reconciled
//         await qc.invalidateQueries({ queryKey: ['notes', { idJob: it.payload.idJob }] });

//       } catch (err: any) {
//         it.status = 'failed';
//         it.lastError = String(err?.message ?? err);
//         replaceQueue(queue);
//         // backoff delay before trying next item
//         const delay = backoff(it.attempts ?? 1);
//         await sleep(delay);
//       }
//       // refresh queue variable
//       queue = getQueue();
//     }

//     // final cleanup: remove succeeded
//     const final = getQueue().filter(x => x.status !== 'succeeded');
//     replaceQueue(final);
//   } finally {
//     inMemoryProcessing = false;
//     setProcessingPersisted(false);
//   }
// }

/** Hook to trigger processQueueOnce with debounce and NetInfo/AppState listeners */
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { NoteType } from '@api/types/Task';
import { QUERY_KEYS } from '@api/contants/constants';
import { sleep } from '@utils/functions';

export function useOutboxProcessor(qc: QueryClient) {
  useEffect(() => {
    let t: any = null;
    const trigger = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        NetInfo.fetch().then(s => {
          if (s.isConnected && s.isInternetReachable !== false) {
            processQueueOnce(qc).catch(e => console.warn('[OUTBOX] processQueueOnce error', e));
          }
        });
      }, 700);
    };

    const unsubNet = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable !== false) trigger();
    });

    const unsubApp = AppState.addEventListener('change', status => {
      if (status === 'active') trigger();
    });

    trigger();
    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
      if (t) clearTimeout(t);
    };
  }, [qc]);
}
