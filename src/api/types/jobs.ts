
export type CrewMemberType = {
  id_user: number;
  lastname: string;
  leader: boolean;
  name: string;
  phone: string;
  photo: string | null;
  status: string | null;
};

export type JobType = {
  account_manager_email: string;
  account_manager_name: string;
  account_manager_phone: string;
  bol_sended: boolean;
  client_category: string;
  client_name: string;
  client_phone: string;
  cr_update: boolean;
  crew: CrewMemberType[];
  day_number: string;
  day_of_week: string;
  hour: string;
  icon: string;
  icon_color: string;
  icon_type: string;
  id: string;
  instructions: string;
  job_type_desc: string;
  job_type_uuid: string;
  laborcode: string | null;
  paused: boolean;
  prepped: boolean;
  scheduled_on: string; // ISO date string
  signature_bol_count: number;
  status: string | null;
  total_items: number;
  type: string;
  wo_order: string;
  wo_status: string;
  wo_title: string;
  headcount: number;
};

export type NSJobType = {
  account_manager_email: string | null;
  account_manager_name: string | null;
  account_manager_phone: string | null;
  bol_sended: boolean;
  client_category: string;
  client_name: string;
  client_phone: string;
  consigne_eemail: string | null;
  consignee_name: string;
  consignee_phone: string;
  cr_update: boolean;
  day_of_week: number;
  id: number;
  instructions: string;
  job_type_desc: string;
  job_type_uuid: string;
  load_status: string;
  prepped: boolean;
  shipper_email: string;
  shipper_name: string;
  shipper_phone: string;
  signature_bol_count: number;
  start_date: string;
  wo: string;
  wo_status: string; 
  wo_title: string;
};

export type FormattedJobType = JobType & {
  __dateFmt?: string;
  statusOwn?: boolean;
  formattedName?: string;
};

export enum LOAD_STATUS_NS {
  UNLOADED = 'UNLOADED',
  LOADED = 'LOADED',
  NOITEMS = 'NOITEMS',
  INPROGRESS = 'INPROGRESS',
}

export type NSItemListType = {
  additional_info: string;
  art_type: string;
  art_type_id: string;
  artist: string;
  artist_id: string;
  child_parent_count: string;
  clientinv: string;
  clientinv2: string;
  clientinv_display: string;
  clientref: string;
  current_packing_detail: string;
  current_packing_detail_id: string;
  edition: string;
  fromlocation: string;
  fromlocation_display: string;
  has_condition_check: string;
  has_condition_report: string;
  id: number;
  load_status: LOAD_STATUS_NS;
  medium: string;
  medium_id: string;
  must_update: number;
  packed_cubit_foot: string;
  packed_height: string;
  packed_length: string;
  packed_square_foot: string;
  packed_width: string;
  packing_details_display: string;
  plain_id_job: number;
  provenance: string;
  status: string;
  unpacked_cubit_foot: string;
  unpacked_height: string;
  unpacked_length: string;
  unpacked_square_foot: string;
  unpacked_width: string;
  url: string;
  weight: string;
  wo_number: string;
  year: string;
};