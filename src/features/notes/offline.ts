import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import {QueryClient} from '@tanstack/react-query';
import {QUERY_KEYS} from '@api/contants/constants';
import {enqueueCoalesced} from '@offline/outbox';
import {NoteType} from '@api/types/Task';

function getNotesCache(qc: QueryClient, idJob: number): NoteType[] {
  const data = qc.getQueryData<NoteType[]>([QUERY_KEYS.NOTES, {idJob}]);
  return data ?? [];
}

function setNotesCache(qc: QueryClient, idJob: number, notes: NoteType[]) {
  qc.setQueryData([QUERY_KEYS.NOTES, {idJob}], notes);
}

export function createNoteOffline(
  qc: QueryClient,
  payload: {idJob: number; title: string; description: string},
) {

  console.log("payload")
  console.log(payload)
  const clientId = uuid();
  const clientCreatedAt = Date.now();
  const key = [QUERY_KEYS.NOTES, {idJob: payload.idJob}];
  const prev = qc.getQueryData<any[]>(key) ?? [];

  console.log("prev")
  console.log(prev)

  // add local note with clientId, clientCreatedAt and pending flag
  const localNote = {
    ...payload,
    clientId,
    clientCreatedAt,
    pending: true,
  };
  qc.setQueryData(key, [localNote, ...prev]);

  enqueueCoalesced('note/create', {...payload, clientId, clientCreatedAt});
  return clientId;
}

// export function createNoteOffline(
//   qc: QueryClient,
//   payload: Omit<NoteType, 'id' | 'clientId'>,
// ) {
//   const clientId = uuid();
//   // 1) Optimista: agregar localmente
//   const current = getNotesCache(qc, payload.idJob!);
//   setNotesCache(qc, payload.idJob!, [
//     {...payload, clientId, pending: true},
//     ...current,
//   ]);

//   // 2) Encolar
//   enqueueCoalesced('note/create', {
//     clientId: uuid(),
//     ...payload,
//   });

//   // enqueue({
//   //   id: uuid(),
//   //   kind: 'note/create',
//   //   createdAt: Date.now(),
//   //   attempts: 0,
//   //   payload: {...payload, clientId},
//   // });
// }

export function updateNoteOffline(
  qc: QueryClient,
  note: {
    id?: number;
    clientId?: string;
    idJob: number;
    title: string;
    description: string;
  },
) {
  const key = [QUERY_KEYS.NOTES, {idJob: note.idJob}];
  const prev = qc.getQueryData<any[]>(key) ?? [];
  const next = prev.map((n) => {
    const same =
      (note.id && n.id === note.id) ||
      (note.clientId && n.clientId === note.clientId);
    return same ? {...n, ...note, pending: true} : n;
  });
  qc.setQueryData(key, next);

  enqueueCoalesced('note/update', {
    idJob: note.idJob,
    id: note.id,
    clientId: note.clientId,
    title: note.title,
    description: note.description,
    clientUpdatedAt: Date.now(),
  });
}

// export function updateNoteOffline(qc: QueryClient, note: NoteType) {
//   const current = getNotesCache(qc, note.idJob!);
//   const next = current.map((n) => {
//     const same =
//       (note.id && n.id === note.id) ||
//       (!!note.clientId && n.clientId === note.clientId);
//     return same ? {...n, ...note, pending: true} : n;
//   });
//   setNotesCache(qc, note.idJob!, next);
//   enqueueCoalesced('note/update', {
//     ...note,
//   });

//   // enqueue({
//   //   id: uuid(),
//   //   kind: 'note/update',
//   //   createdAt: Date.now(),
//   //   attempts: 0,
//   //   payload: {...note},
//   // });
// }

export function deleteNoteOffline(
  qc: QueryClient,
  note: {id?: number; clientId?: string; idJob: number},
) {
  console.log('delete note offline');
  console.log(note);

  const key = [QUERY_KEYS.NOTES, {idJob: note.idJob}];
  const prev = qc.getQueryData<any[]>(key) ?? [];

  console.log("prev")
  console.log(prev)
  const next = prev.filter((n) => {
    const same =
      (note.id && n.id === note.id) ||
      (note.clientId && n.clientId === note.clientId);
    return !same;
  });

  const nextTemp = prev.filter(
    (x) =>
      !(
        (x.id && note.id && x.id == note.id) ||
        (x.clientId && note.clientId && x.clientId == note.clientId)
      ),
  );

  console.log('next temp');
  console.log(nextTemp);

  console.log('next');
  console.log(next);
  qc.setQueryData(key, next);

  // @ts-ignore
  enqueueCoalesced('note/delete', {
    idJob: note.idJob,
    id: note.id,
    clientId: note.clientId,
  });
}

// export function deleteNoteOffline(qc: QueryClient, note: NoteType) {
//   const current = getNotesCache(qc, note.idJob!);
//   const next = current.filter((n) => {
//     const same =
//       (note.id && n.id === note.id) ||
//       (!!note.clientId && n.clientId === note.clientId);
//     return !same;
//   });
//   setNotesCache(qc, note.idJob!, next);

//   enqueueCoalesced('note/delete', note);

//   // enqueue();

//   // enqueue({
//   //   id: uuid(),
//   //   kind: 'note/delete',
//   //   createdAt: Date.now(),
//   //   attempts: 0,
//   //   payload: {idJob: note.idJob!, id: note.id, clientId: note.clientId},
//   // });
// }
