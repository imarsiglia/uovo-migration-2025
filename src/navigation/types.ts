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
};
