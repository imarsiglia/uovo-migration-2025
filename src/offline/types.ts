import { NoteType } from "@api/types/Task";

export type OutboxKind = 'note/create' | 'note/update' | 'note/delete';

export type OutboxStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed';

export type OutboxItemBase = {
  uid: string; // uuid de la cola
  kind: OutboxKind;
  createdAt: number;
  attempts: number;
  status: OutboxStatus;
  lastError?: string | null;
  updatedAt?: number;
};

export type OutboxItem =
  | (OutboxItemBase & { kind: 'note/create'; payload: Required<NoteType> })
  | (OutboxItemBase & { kind: 'note/update'; payload: Required<NoteType> })
  | (OutboxItemBase & { kind: 'note/delete'; payload: Required<NoteType> });
