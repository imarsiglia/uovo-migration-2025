// src/offline/types.ts
export type EntityKind = 'note' | 'signature' | 'report' | 'image' | 'inventory' | string;

export type OutboxOpKind = 'create' | 'update' | 'delete';
export type OutboxStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed';

export type GenericPayload = {
  entity: EntityKind;
  idJob?: number;         // optional: the job id that scoping lists use in your app
  id?: number;            // server id (when known)
  clientId?: string;      // local-only id for newly created items
  body?: Record<string, any>; // minimal body to perform the mutation
  clientCreatedAt?: number;
  clientUpdatedAt?: number;
  meta?: Record<string, any>;
  parentClientId?: string;
  parentEntity?: string;
};

export type OutboxItem = {
  uid: string;
  op: OutboxOpKind;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  status: OutboxStatus;
  lastError: string | null;
  payload: GenericPayload;
};

export type ProcessingSession = {
  sessionId: string;
  startedAt: number;
  total: number;
  processed: number;
  currentUid: string | null;
};
