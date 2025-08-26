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