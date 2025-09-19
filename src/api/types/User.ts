
// Helpers opcionales (por claridad; puedes omitirlos si no los necesitas)
type ISODateTimeString = string; // ej: "2021-03-05T22:13:13"
type Base64String = string;      // ej: "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBD..."

export interface UserFilter {
  filter: string;
  order_by: string;
  place: string[];
}

export interface UserProfile {
  profile_code: string;
  profile_id: number;
  profile_name: string;
  profile_type: string; // en tu ejemplo es "A"
}

export interface UserType {
  employeeinternal_id: number | null;

  filter: UserFilter;

  // El nombre viene así en tu JSON ("profileprofile_id"), lo respetamos
  profileprofile_id: UserProfile;

  time_zone: string; // ej: "America/Bogota"
  token: string;

  user_app_version: string | null;
  user_date_passowrd_change: ISODateTimeString | null; // (nota: la key tiene un typo en "password")
  user_fieldaware_role: string; // ej: "Dispatcher"
  user_first_login: ISODateTimeString; // ej: "2021-03-05T22:13:13"
  user_id: number;
  user_last_name: string;
  user_mail: string;
  user_model: string | null;
  user_name: string;
  // Puede venir null; a veces estos IDs son string en ERPs, lo dejamos flexible
  user_netsuite_id: string | number | null;
  user_phone: string;
  user_phone_prefix: number;
  user_photo?: Base64String | null; // JPEG base64
  user_platform: string | null;
  user_recovery_code: string | null;
  user_ses_type: string; // ej: "Manual"
  // Desconocido en tu muestra; permitimos number|string|null por compatibilidad
  user_status: number | string | null;
  user_updated: number; // en tu muestra es 1
  user_uuid: string;
  user_version: string | number | null;
}
