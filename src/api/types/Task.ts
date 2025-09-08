export type SignatureType = {
  id: string;
  print_name: string;
  type: string;
  signature_data: string;
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
  id: number;
  id_inventory: number;
  id_job: number;
  id_material: IdReportMaterialType;
  id_user: number;
  modified: boolean;
  quantity: number;
  updated_date: string;
  user_info: UserInfoReportMaterialType;
};

export type HistoryReportMaterialType = {
  date_of_event: string;
  display_name: string;
  id_event: number;
  operation_desc: string;
  quantity: number;
};