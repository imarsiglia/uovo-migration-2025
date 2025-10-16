export const CONDITION_TYPES = {
  ConditionReport: 'conditionreport',
  ConditionCheck: 'conditioncheck',
} as const;

export type ConditionType =
  (typeof CONDITION_TYPES)[keyof typeof CONDITION_TYPES];

export const CONDITION_PHOTO_SIDE_TYPE = {
  Front: 'front',
  Back: 'back',
  Detail: 'detail',
  Sides: 'sides',
} as const;

export type ConditionPhotoSideType =
  (typeof CONDITION_PHOTO_SIDE_TYPE)[keyof typeof CONDITION_PHOTO_SIDE_TYPE];

export const CONDITION_PHOTO_SIDE_LABELS: Record<
  ConditionPhotoSideType,
  string
> = {
  front: 'Front',
  back: 'Back',
  detail: 'Details',
  sides: 'Sides',
};

export type ConditionPhotoType = {
  id: number;
  id_sticky_note: number | null;
  is_overview: boolean;
  subtype: string | null;
  thumbnail: string;
  title?: string;
  description?: string;
  type: ConditionPhotoSideType;
  //   offline
  clientId?: string;
};

export type PhotoOverviewType = {
  data: string;
  idImg: number;
  reportId: number;
};

export type PhotoDetailType = {
  description?: string;
  description_sticky_note?: string;
  id: number;
  photo: string;
  sub_type?: string;
  title?: string;
  title_sticky_note?: string;
  type?: ConditionPhotoSideType;
};
