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

export type StickyNoteTranslation = {
  translationX: number;
  translationY: number;
  absoluteX?: number;
  absoluteY?: number;
};

type Position = {
  top: number;
  left: number;
  positionX?: number;
  positionY?: number;
  scale?: number;
};

export type StickyNoteType = {
  id?: number;
  label?: string;
  details?: string;
  width?: number;
  height?: number;
  updating?: boolean;
  position: Position;
  translation?: {top: number; left: number} | null;
  stickyNoteTranslation?: StickyNoteTranslation;
  areaSet?: boolean;
  // TODO
};

export type OverviewReportType = {
  data: {
    photo: {
      uri: string;
      base64: string;
      data?: string;
    };
    notes: StickyNoteType[];
    mainImageTransforms: null;
    screen: {
      width: number;
      height: number;
    };
  };
  idJob: number;
  idJobInventory: number;
  idImg: number;
  reportId: number;
  reportType: ConditionPhotoSideType;
  reportSubType?: string;
  status: number;
};
