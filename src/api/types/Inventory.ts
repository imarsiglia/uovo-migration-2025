import {BooleanStringType} from '@generalTypes/general';

export type JobInventoryType = {
  additional_info?: string | null;
  art_type: string;
  art_type_id: string;
  artist: string;
  artist_id: string;
  child_parent_count: string;
  clientinv: string;
  clientinv2?: string | null;
  clientinv_display: string;
  clientref: string;
  current_packing_detail: string;
  current_packing_detail_id: string;
  edition: string;
  fromlocation: string;
  fromlocation_display: string;
  has_condition_check: BooleanStringType;
  has_condition_report: BooleanStringType;
  id: number;
  medium: string;
  medium_id: string;
  must_update: number;
  netsuite_image: string | null;
  packed_cubit_foot: string;
  packed_height?: string;
  packed_length?: string;
  packed_square_foot: string;
  packed_width?: string;
  packing_details_display: string;
  parent: string;
  parent_url: string;
  plain_id_job: number;
  provenance: null;
  status: string | null;
  unpacked_cubit_foot: string;
  unpacked_height?: string;
  unpacked_length?: string;
  unpacked_square_foot: string;
  unpacked_width?: string;
  url: string;
  weight?: string;
  year: string;
  parent_id?: string;

  // offline
  clientId?: string;
};

export type MinimalInventoryType = {
  artist_name?: string;
  client_ref_id?: string;
  inventory_id?: string;
  title?: string;
};

export type ReportResumeType = {
  client_ref: string;
  id_inventory: number;
  id_job_inventory: number;
  name: string;
  partial?: boolean;
  report_count: number;
  unmanaged?: boolean;
  unmanaged_name?: string | null;
};

type ConditionReportObjectItem = {
  id_condition_report: number;
  text_value: string;
};

type ConditionReportFrameFixturePk = {
  condition_report_frame_fixture_pk: ConditionReportObjectItem;
};

type ConditionReportHangingSystemPk = {
  condition_report_hanging_system_pk: ConditionReportObjectItem;
};

type ConditionReportPackingDetailPk = {
  condition_report_packing_detail_pk: ConditionReportObjectItem;
};

export type ConditionReportType = {
  art_type_name?: string | null;
  artist_name?: string | null;
  condition_artwork?: string | null;
  condition_report_frame_fixture_list: ConditionReportFrameFixturePk[];
  condition_report_hanging_system_list: ConditionReportHangingSystemPk[];
  condition_report_packing_detail_list: ConditionReportPackingDetailPk[];
  date_report: string;
  edition: string;
  frame_height: string;
  frame_length: string;
  frame_width: string;
  id: number;
  id_job: number;
  id_job_inventory: number;
  id_user: number;
  labeled: string;
  medium_name: string;
  other_text: string;
  packed_height: string;
  packed_length: string;
  packed_width: string;
  partial: string;
  place_of_exam: string;
  signature: string;
  title: string;
  un_packed_height: string;
  un_packed_length: string;
  un_packed_width: string;
  unmanaged_name: string;
  unpacked_weight: string;
  weight: string;
  year: string;

  // offline
  clientId?: string;
};

export type TotalPhotoReportType = {
  type: string;
  total: number;
};
