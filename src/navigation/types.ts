import {CrewMemberType} from '@api/types/Jobs';
import {NoteType, ReportMaterialType} from '@api/types/Task';
import {ImageType} from '@generalTypes/images';
import { Base64ImageCarouselProps } from '@screens/commons/BaseImageScreen';

// 👉 Constantes reutilizables (sin strings mágicos)
export const RoutesNavigation = {
  Home: 'Home',
  ContactUs: 'ContactUs',
  Login: 'Login',
  EditProfile: 'EditProfile',
  EditImage: 'EditImage',
  LoginEmail: 'LoginEmail',
  HelpDesk: 'HelpDesk',
  Account: 'Account',
  Topsheet: 'Topsheet',
  ReportIssue: 'ReportIssue',
  LocationNotes: 'LocationNotes',
  SaveLocationNotes: 'SaveLocationNotes',
  DigitalId: 'DigitalId',
  VisualizePdf: 'VisualizePdf',
  Signatures: 'Signatures',
  TakeSignature: 'TakeSignature',
  Notes: 'Notes',
  SaveNote: 'SaveNote',
  ReportMaterials: 'ReportMaterials',
  SaveReportMaterials: 'SaveReportMaterials',
  WoAttachment: 'WoAttachment',
  BaseImageScreen: 'BaseImageScreen',
  EditPieceCount: 'EditPieceCount'
} as const;

// Union de nombres de ruta: "Home" | "ContactUs" | ...
export type RouteName =
  (typeof RoutesNavigation)[keyof typeof RoutesNavigation];

// Param list del Stack (usa las constantes)
export type RootStackParamList = {
  [RoutesNavigation.Home]: undefined;
  [RoutesNavigation.ContactUs]: {
    editedImage?: any;
    photos?: any;
  };
  [RoutesNavigation.Login]: undefined;
  [RoutesNavigation.EditProfile]: undefined;
  [RoutesNavigation.EditImage]: {
    photo: any;
    photos?: any;
  };
  [RoutesNavigation.LoginEmail]: undefined;
  [RoutesNavigation.HelpDesk]: undefined;
  [RoutesNavigation.Account]: undefined;
  [RoutesNavigation.Topsheet]: {
    id: string;
    queue: number;
  };
  [RoutesNavigation.ReportIssue]: {
    type: string;
    idJob: number;
    editedImage?: ImageType;
  };
  [RoutesNavigation.LocationNotes]: {
    type: string;
    idJob: number;
  };
  [RoutesNavigation.SaveLocationNotes]: {
    type: string;
    idJob: number;
  };
  [RoutesNavigation.DigitalId]: {
    member?: boolean;
    person?: CrewMemberType;
  };
  [RoutesNavigation.VisualizePdf]: undefined;
  [RoutesNavigation.Signatures]: undefined;
  [RoutesNavigation.TakeSignature]: {
    name: string;
    type: string;
    forceSend?: boolean;
    changed?: number;
  };
  [RoutesNavigation.Notes]: undefined;
  [RoutesNavigation.SaveNote]: {
    item?: NoteType;
  };
  [RoutesNavigation.ReportMaterials]: undefined;
  [RoutesNavigation.SaveReportMaterials]: {
    item?: ReportMaterialType
  };
  [RoutesNavigation.BaseImageScreen]: Base64ImageCarouselProps,
  [RoutesNavigation.WoAttachment]: undefined,
  [RoutesNavigation.EditPieceCount]: undefined
};

export const TopSheetRoutesNavigation = {
  Resume: {
    name: 'ResumeTopSheet',
    label: 'Resume',
  },
  Location: {
    name: 'LocationTopSheet',
    label: 'Location',
  },
  Inventory: {
    name: 'InventoryTopSheet',
    label: 'Inventory',
  },
  Tasks: {
    name: 'TasksTopSheet',
    label: 'Tasks',
  },
  Team: {
    name: 'TeamTopSheet',
    label: 'Team',
  },
} as const;
