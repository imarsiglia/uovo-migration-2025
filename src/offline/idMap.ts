// src/offline/idMap.ts
import {MMKV} from 'react-native-mmkv';
import {ENTITY_TYPES} from '@api/contants/constants';

type EntityKey = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

type IdMap = {
  [entity: string]: {
    [clientId: string]: number;
  };
};

const storage = new MMKV({id: 'offline-id-map-v1'});
const KEY = 'ID_MAP';

function readMap(): IdMap {
  const raw = storage.getString(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as IdMap;
  } catch {
    return {};
  }
}

function writeMap(map: IdMap) {
  storage.set(KEY, JSON.stringify(map));
}

export function registerServerId(
  entity: EntityKey,
  clientId: string,
  id: number,
) {
  const map = readMap();
  const key = String(entity);
  if (!map[key]) map[key] = {};
  map[key][clientId] = id;
  writeMap(map);
}

export function getServerId(
  entity: EntityKey,
  clientId: string,
): number | null {
  const map = readMap();
  const key = String(entity);
  return map[key]?.[clientId] ?? null;
}
