// src/api/services/entityServices.ts
// Adapter genérico que mapea "entity" -> llamadas concretas a tus servicios.
// Implementa 'note' (usa taskServices) y deja el patrón para añadir otras entidades.
//
// Ajusta los imports / nombres si tus servicios están en rutas distintas.

import { QUERY_KEYS } from "@api/contants/constants";
import { taskServices } from "./taskServices";

export type CreateResult = boolean | Record<string, any>;

/**
 * Firma de funciones que el processor espera:
 * - createEntity({ entity, body, meta }) => Promise<boolean | createdObject>
 * - updateEntity({ entity, id, body, meta }) => Promise<boolean | updatedObject>
 * - deleteEntity({ entity, id, meta }) => Promise<boolean>
 * - getEntityList({ entity, idJob, meta }) => Promise<any[]>
 *
 * meta es un objeto libre que puede contener clientId, clientCreatedAt, etc.
 */

// Nota: si tus servicios devuelven tipos distintos, adapta aquí para convertir/normalizar.
export const entityServices = {
  async createEntity({
    entity,
    body,
    meta,
  }: {
    entity: string;
    body: any;
    meta?: any;
  }): Promise<CreateResult> {
    if (entity === 'note') {
      // tu api actual parece exponer saveNote({ idJob, id, title, description })
      // asumimos body contiene title/description y meta.idJob
      const idJob = meta?.idJob ?? body?.idJob;
      // Llamamos al endpoint existente
      return await taskServices.saveNote({
        idJob,
        id: undefined,
        title: body.title,
        description: body.description,
      });
    }

    // TODO: agrega adaptadores para 'report', 'image', 'inventory' aquí
    throw new Error(`createEntity not implemented for entity=${entity}`);
  },

  async updateEntity({
    entity,
    id,
    body,
    meta,
  }: {
    entity: string;
    id?: number;
    body: any;
    meta?: any;
  }): Promise<CreateResult> {
    if (entity === 'note') {
      const idJob = meta?.idJob ?? body?.idJob;
      // reusar saveNote para update si tu backend usa el mismo endpoint
      return await taskServices.saveNote({
        idJob,
        id, // server id
        title: body.title,
        description: body.description,
      });
    }

    // TODO: agrega adaptadores para 'report', 'image', 'inventory' aquí
    throw new Error(`updateEntity not implemented for entity=${entity}`);
  },

  async deleteEntity({
    entity,
    id,
    meta,
  }: {
    entity: string;
    id?: number;
    meta?: any;
  }): Promise<boolean> {
    if (entity === 'note') {
      if (!id) {
        // Sin id server, nada que eliminar en server — devolvemos true para indicar "no-op"
        return true;
      }
      return await taskServices.deleteNote({id});
    }

    // TODO: agrega adaptadores para 'report', 'image', 'inventory' aquí
    throw new Error(`deleteEntity not implemented for entity=${entity}`);
  },

  async getEntityList({
    entity,
    idJob,
    meta,
  }: {
    entity: string;
    idJob?: number;
    meta?: any;
  }): Promise<any[]> {
    if (entity === 'note') {
      const res = await taskServices.getNotes({idJob: idJob!});
      return res ?? [];
    }

    // TODO: otros entities
    throw new Error(`getEntityList not implemented for entity=${entity}`);
  },

  // helper para resolver el queryKey que tu app usa para cada entidad
  // por defecto uso [entity, { idJob }], pero si tu proyecto usa QUERY_KEYS constants,
  // aquí puedes mapear entity->QUERY_KEYS.* .
  getQueryKeyForEntity(entity: string, opts?: {idJob?: number}) {
    if (entity === 'note') {
      // ejemplo si usas un object QUERY_KEYS: return [QUERY_KEYS.NOTES, { idJob: opts?.idJob }];
      return [QUERY_KEYS.NOTES, {idJob: opts?.idJob}];
    }
    return [entity, {idJob: opts?.idJob}];
  },
};
