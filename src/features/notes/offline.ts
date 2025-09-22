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
  payload: Omit<NoteType, 'id' | 'clientId'>,
) {
  const clientId = uuid();
  // 1) Optimista: agregar localmente
  const current = getNotesCache(qc, payload.idJob!);
  setNotesCache(qc, payload.idJob!, [
    {...payload, clientId, pending: true},
    ...current,
  ]);

  // 2) Encolar
  enqueueCoalesced('note/create', {
    clientId: uuid(),
    ...payload,
  });

  // enqueue({
  //   id: uuid(),
  //   kind: 'note/create',
  //   createdAt: Date.now(),
  //   attempts: 0,
  //   payload: {...payload, clientId},
  // });
}

export function updateNoteOffline(qc: QueryClient, note: NoteType) {
  const current = getNotesCache(qc, note.idJob!);
  const next = current.map((n) => {
    const same =
      (note.id && n.id === note.id) ||
      (!!note.clientId && n.clientId === note.clientId);
    return same ? {...n, ...note, pending: true} : n;
  });
  setNotesCache(qc, note.idJob!, next);
  enqueueCoalesced('note/update', {
    ...note,
  });

  // enqueue({
  //   id: uuid(),
  //   kind: 'note/update',
  //   createdAt: Date.now(),
  //   attempts: 0,
  //   payload: {...note},
  // });
}

export function deleteNoteOffline(qc: QueryClient, note: NoteType) {
  const current = getNotesCache(qc, note.idJob!);
  const next = current.filter((n) => {
    const same =
      (note.id && n.id === note.id) ||
      (!!note.clientId && n.clientId === note.clientId);
    return !same;
  });
  setNotesCache(qc, note.idJob!, next);

  enqueueCoalesced("note/delete", note);

  // enqueue();

  // enqueue({
  //   id: uuid(),
  //   kind: 'note/delete',
  //   createdAt: Date.now(),
  //   attempts: 0,
  //   payload: {idJob: note.idJob!, id: note.id, clientId: note.clientId},
  // });
}
