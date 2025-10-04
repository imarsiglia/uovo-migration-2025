// src/offline/types.ts
export type EntityKind = 'note' | 'report' | 'image' | 'inventory' | string;

export type OutboxOpKind = 'create' | 'update' | 'delete';

export type OutboxStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed';

export type GenericPayload = {
  entity: EntityKind;
  idJob?: number; // ejemplo: job id si aplica
  id?: number; // server id if exists
  clientId?: string; // local-only identifier for newly created items
  // entity-specific body (note: keep small, store full object if necessary)
  body?: Record<string, any>;
  // timestamp local
  clientCreatedAt?: number;
  clientUpdatedAt?: number;
};

export type OutboxItem = {
  uid: string;
  op: OutboxOpKind;
  createdAt: number;
  attempts: number;
  status: OutboxStatus;
  lastError?: string | null;
  payload: GenericPayload;
  updatedAt?: number;
};
