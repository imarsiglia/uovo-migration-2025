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

export type TaskJobItemType = {
  id: number;
  name: string;
  description: string;
  note: string | null;
  uuid: string;
};

export type JobDetailType = {
  account_manager_email: string | null;
  account_manager_name: string | null;
  account_manager_office_phone: string | null;
  account_manager_phone: string | null;
  bol_notes: string;
  cancelled: boolean;
  carrier_address: string;
  carrier_contact_name: string | null;
  carrier_contact_phone: string;
  carrier_name: string;
  carrier_phone: string;
  client_category: string;
  client_id: number;
  client_location: string;
  client_name: string;
  client_phone: string;
  consigne_eemail: string | null;
  consignee_address: string;
  consignee_address_formated: string;
  consignee_comments: string | null;
  consignee_name: string;
  consignee_phone: string;
  crew: CrewMemberType[];
  current_clock_in: ClockinStatusType | null;
  deadline: string | null;
  description: string;
  end_date: string | null;
  estimation_duration: number;
  file_counter: number;
  id: number;
  job_id: string;
  job_type_desc: string;
  job_type_uuid: string;
  mat_visible_to_sf: boolean;
  netsuite_id: string;
  netsuite_order: string;
  planned_effort: number;
  schedule_priority: string | null;
  schedule_state: string;
  scheduled_on: string;
  scheduler_block: string;
  service_location: string;
  shipper_address: string;
  shipper_address_formated: string;
  shipper_comments: string;
  shipper_email: string;
  shipper_name: string;
  shipper_phone: string;
  show_secondary_inv_id: boolean;
  start_after: string | null;
  start_date: string;
  tasks_list: TaskJobItemType[];
  use_bol: boolean;
  uuid: string;
  wo_status: string;
  wo_title: string;
};

export type ClockinStatusType = {
  added_manually: number;
  clock_in: Date;
  clock_out: Date;
  confirmed: null;
  id: number;
  id_job: number;
  id_user: number;
  labor_code: LaborCodeType;
  status: string;
  user_name: null;
  worked_hour: string;
};

export type LaborCodeType = {
  activo: number;
  description: string;
  fieldaware_uuid: string;
  id: number;
  name: string;
  wo_status_update: string;
};
