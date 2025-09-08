export type SignatureType = {
  id: number;
  id_job: number;
  print_name: string;
  id_user: number;
  type: string;
  signature_data: string;
  signature_timestamp: string;
};

export type NoteType = {
  id: number;
  title: string;
  description?: string;
  update_time: string;
};

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
};
