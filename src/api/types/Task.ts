import {OfflineItemType} from '@generalTypes/general';
import {LaborCodeType} from './Jobs';

export type SignatureType = {
  id: number;
  id_job: number;
  print_name: string;
  id_user: number;
  type: string;
  signature_data: string;
  signature_timestamp: string;
  // for offline
  clientId?: string; 
  _pending?: boolean;
};

export type NoteType = {
  id?: number;
  title: string;
  description?: string;
  update_time?: string;
} & OfflineItemType;

export type IdReportMaterialType = {
  id: number;
  active: boolean;
  name: string;
  unit: string;
  uuid: string;
  visible_to_sf: boolean;
};

export type UserInfoReportMaterialType = {
  user_fieldaware_role: string;
  user_id: number;
  user_last_name: string;
  user_name: string;
  user_uuid: string;
};

export type ReportMaterialType = {
  id?: number;
  id_inventory?: number;
  idMaterial?: number;
  id_job?: number;
  id_material?: IdReportMaterialType;
  id_user?: number;
  modified?: boolean;
  quantity?: number;
  updated_date?: string;
  user_info?: UserInfoReportMaterialType;
  idUser?: number | null;
  // offline
  clientId?: string;
  _pending?: boolean;
};

export type HistoryReportMaterialType = {
  date_of_event: string;
  display_name: string;
  id_event: number;
  operation_desc: string;
  quantity: number;
};

export type AttachmentType = {
  id: number;
  name: string;
  url: string;
  file_type: string;
  size: number;
};

export type BolCountType = {
  pbs: string;
  packageCount: number;
  // offline
  clientId?: string;
};

export type LaborReportType = {
  added_manually: number;
  clock_in: string | null;
  clock_out: string | null;
  confirmed: null;
  custom_date_report: null;
  id: number | null;
  id_job: number;
  id_user: number;
  labor_code: LaborCodeType;
  status: string;
  user_name: string;
  worked_hour: null | string;
};

export type EmployeeType = {
  id: string;
  name: string;
};

export type TaskPhotoType = {
  id?: number;
  path?: string;
  photo?: string; // base64 image data
  // for offline
  _fileUri?: string;
  _dirty?: boolean;
  clientId?: string; 
  _pending?: boolean;
  _deleted?: boolean;
  _updated_at?: number;
};

export type TaskImageType = {
  id_job: number;
  id_user: number;
  title: string;
  description: string | undefined;
  update_time: string;
  photos: TaskPhotoType[];
  // for offline
  clientId?: string; 
  _pending?: boolean;
  _deleted?: boolean;
  clientIdEdit?: string; 
  clientIdDelete?: string; 
};
