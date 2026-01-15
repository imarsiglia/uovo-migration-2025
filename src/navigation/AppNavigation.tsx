import {useRefreshToken} from '@api/hooks/HooksAuthentication';
import CallPhoneSheet from '@components/bottomSheets/CallPhoneSheet';
import {ModalDialog} from '@components/commons/modals/ModalDialog';
import {ModalLoading} from '@components/commons/modals/ModalLoading';
import {LayoutScreen} from '@components/layouts/LayoutScreen';
import {ModalOffline} from '@components/offline/ModalOffline';
import {Splash} from '@components/splash/Splash';
import {CustomStatusBar} from '@components/statusbar/CustomStatusBar';
import {PortalHost} from '@gorhom/portal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AccountScreen} from '@screens/account/AccountScreen';
import {LoginEmailScreen} from '@screens/auth/LoginEmailScreen';
import {VisualizeBolScreen} from '@screens/bol/VisualizeBolScreen';
import BaseImageScreen from '@screens/commons/BaseImageScreen';
import TaskPhotoCarouselScreen from '@screens/commons/TaskPhotoCarouselScreen';
import TaskPhotoViewerScreen from '@screens/commons/TaskPhotoViewerScreen';
import {ContactScreen} from '@screens/contact/ContactScreen';
import {HelpDeskScreen} from '@screens/contact/HelpDeskScreen';
import {DigitalIdScreen} from '@screens/digitalid/DigitalIdScreen';
import {EditImageScreen} from '@screens/editImage/EditImageScreen';
import {EditImageURIScreen} from '@screens/editImage/EditImageURIScreen';
import {HomeScreen} from '@screens/home/HomeScreen';
import {ImagesScreen} from '@screens/images/ImagesScreen';
import {SaveImagesScreen} from '@screens/images/SaveImagesScreen';
import {AddInventoryScreen} from '@screens/inventory/AddInventoryScreen';
import {InventoryScreen} from '@screens/inventory/InventoryScreen';
import {ItemDetailScreen} from '@screens/inventory/ItemDetailScreen';
import {TakeDimensionsScreen} from '@screens/inventory/TakeDimensions';
import {AddLaborReportScreen} from '@screens/laborreport/AddLaborReportScreen';
import {LaborReportScreen} from '@screens/laborreport/LaborReportScreen';
import {LocationNotesScreen} from '@screens/location/LocationNotesScreen';
import {ReportIssueScreen} from '@screens/location/ReportIssueScreen';
import {SaveLocationNoteScreen} from '@screens/location/SaveLocationNoteScreen';
import {InventoryNSScreen} from '@screens/nationalshuttle/InventoryNSScreen';
import {NotesScreen} from '@screens/notes/NotesScreen';
import {SaveNoteScreen} from '@screens/notes/SaveNoteScreen';
import {EditPieceCountScreen} from '@screens/piececount/EditPieceCountScreen';
import {EditProfileScreen} from '@screens/profile/EditProfileScreen';
import {ReportMaterialsScreen} from '@screens/reportmaterials/ReportMaterialsScreen';
import {SaveReportMaterialScreen} from '@screens/reportmaterials/SaveReportMaterialScreen';
import {ConditionCheckScreen} from '@screens/reports/ConditionCheckScreen';
import {ConditionReportScreen} from '@screens/reports/ConditionReportScreen';
import {ConditionSides} from '@screens/reports/photos/ConditionSidesScreen';
import {GalleryCondition} from '@screens/reports/photos/GalleryConditionScreen';
import PhotoCapture from '@screens/reports/photos/PhotoCapture';
import PhotoCaptureZoom from '@screens/reports/photos/PhotoCaptureZoom';
import PhotoCaptureZoomEdit from '@screens/reports/photos/PhotoCaptureZoomEdit';
import {PhotoDetailCondition} from '@screens/reports/photos/PhotoDetailConditionScreen';
import ZoomScreen from '@screens/reports/photos/ZoomScreen';
import {ReportsScreen} from '@screens/reports/ReportsScreen';
import {SignaturesScreen} from '@screens/signatures/SignaturesScreen';
import {TakeSignatureScreen} from '@screens/signatures/TakeSignatureScreen';
import {TopsheetScreen} from '@screens/topsheet/TopsheetScreen';
import {WoAttachmentScreen} from '@screens/woattachments/WoAttachmentScreen';
import {useAuth} from '@store/auth';
import {COLORS} from '@styles/colors';
import {getDeviceInfo} from '@utils/functions';
import {isInternet} from '@utils/internet';
import {navigationRef} from '@utils/navigationService';
import {useEffect, useState} from 'react';
import {configureFontAwesomePro} from 'react-native-fontawesome-pro';
import {enableScreens} from 'react-native-screens';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RootStackParamList, RoutesNavigation} from './types';
import {AppStateProvider} from './AppStateManager';

// LogBox.ignoreLogs([
//   'Non-serializable values were found in the navigation state',
// ]);

enableScreens(true);
const Stack = createNativeStackNavigator<RootStackParamList>();
// @ts-ignore
configureFontAwesomePro();

export const AppNavigation = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const {token, user, setSession, clearSession} = useAuth();
  const {mutateAsync: refreshToken, isSuccess, isError} = useRefreshToken();

  // const [isReady, setIsReady] = useState(false);
  // const [initialState, setInitialState] = useState();

  // useEffect(() => {
  //   const restoreState = async () => {
  //     try {
  //       const savedState = await AsyncStorage.getItem('NAVIGATION_STATE');
  //       const state = savedState ? JSON.parse(savedState) : undefined;
  //       setInitialState(state);
  //     } finally {
  //       setIsReady(true);
  //     }
  //   };

  //   restoreState();
  // }, []);

  useEffect(() => {
    if (token) {
      isInternet().then((isConnected) => {
        if (isConnected) {
          refreshToken(getDeviceInfo())
            .then((data) => {
              setSession(data.token, data);
            })
            .catch((x) => {
              clearSession();
            });
        } else {
          setIsLoaded(true);
        }
      });
    } else {
      setIsLoaded(true);
    }
  }, []);

  // if (!isReady) {
  //   return null;
  // }

  return (
    <>
      {/* {loading == true && <Splash />} */}
      {!isSuccess && !isError && !isLoaded && <Splash />}
      {(isSuccess || isLoaded) && (
        <AppStateProvider>
          <NavigationContainer ref={navigationRef}>
            <CustomStatusBar />
            <Stack.Navigator
              initialRouteName={
                token == null
                  ? RoutesNavigation.Login
                  : user?.user_updated == 0
                  ? RoutesNavigation.EditProfile
                  : RoutesNavigation.Home
              }
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Screen
                name={RoutesNavigation.Login}
                component={withLayout(LoginScreen, COLORS.primary)}
              />
              <Stack.Screen
                name={RoutesNavigation.EditProfile}
                component={withLayout(EditProfileScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.ContactUs}
                component={withLayout(ContactScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Home}
                component={withLayout(HomeScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Topsheet}
                component={withLayout(TopsheetScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.EditImage}
                component={withLayout(EditImageScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.EditImageUri}
                component={withLayout(EditImageURIScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.LoginEmail}
                component={withLayout(LoginEmailScreen, COLORS.primary)}
              />
              <Stack.Screen
                name={RoutesNavigation.HelpDesk}
                component={withLayout(HelpDeskScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Account}
                component={withLayout(AccountScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.ReportIssue}
                component={withLayout(ReportIssueScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.LocationNotes}
                component={withLayout(LocationNotesScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.SaveLocationNotes}
                component={withLayout(SaveLocationNoteScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.DigitalId}
                component={withLayout(DigitalIdScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.VisualizeBOL}
                component={withLayout(VisualizeBolScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Signatures}
                component={withLayout(SignaturesScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.TakeSignature}
                component={withLayout(TakeSignatureScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Notes}
                component={withLayout(NotesScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.SaveNote}
                component={withLayout(SaveNoteScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.ReportMaterials}
                component={withLayout(ReportMaterialsScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.SaveReportMaterials}
                component={withLayout(SaveReportMaterialScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.WoAttachment}
                component={withLayout(WoAttachmentScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.EditPieceCount}
                component={withLayout(EditPieceCountScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.LaborReport}
                component={withLayout(LaborReportScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.AddLaborReport}
                component={withLayout(AddLaborReportScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Inventory}
                component={withLayout(InventoryScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.AddInventory}
                component={withLayout(AddInventoryScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.ItemDetail}
                component={withLayout(ItemDetailScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.TakeDimensions}
                component={withLayout(TakeDimensionsScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.InventoryNationalShuttle}
                component={withLayout(InventoryNSScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.Images}
                component={withLayout(ImagesScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.SaveImages}
                component={withLayout(SaveImagesScreen)}
              />
              {/* condition report / condition check */}
              <Stack.Screen
                name={RoutesNavigation.Reports}
                component={withLayout(ReportsScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.ConditionReport}
                component={withLayout(ConditionReportScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.ConditionCheck}
                component={withLayout(ConditionCheckScreen)}
              />
              <Stack.Screen
                name={RoutesNavigation.GalleryCondition}
                component={withLayout(GalleryCondition)}
              />
              <Stack.Screen
                name={RoutesNavigation.PhotoDetailCondition}
                component={withLayout(PhotoDetailCondition)}
              />

              <Stack.Screen
                name={RoutesNavigation.ZoomScreen}
                component={withLayout(ZoomScreen)}
              />

              <Stack.Screen
                name={RoutesNavigation.PhotoCaptureZoomEdit}
                component={PhotoCaptureZoomEdit}
                options={{headerShown: true}}
              />
              <Stack.Screen
                name={RoutesNavigation.PhotoCaptureZoom}
                component={PhotoCaptureZoom}
                options={{headerShown: true}}
              />
              <Stack.Screen
                name={RoutesNavigation.PhotoCapture}
                component={PhotoCapture}
                options={{headerShown: true}}
              />
              <Stack.Screen
                name={RoutesNavigation.ConditionSides}
                component={withLayout(ConditionSides)}
              />

              {/* visualizar imagenes */}
              <Stack.Screen
                name={RoutesNavigation.BaseImageScreen}
                component={BaseImageScreen}
              />
              <Stack.Screen
                name={RoutesNavigation.TaskPhotoCarouselScreen}
                component={TaskPhotoCarouselScreen}
              />
              <Stack.Screen
                name={RoutesNavigation.TaskPhotoViewerScreen}
                component={withLayout(TaskPhotoViewerScreen)}
              />
            </Stack.Navigator>
            <ModalDialog />
            <ModalLoading />
            <PortalHost name="root" />
            <CallPhoneSheet />
            {/* <OfflineBanner /> */}
            <ModalOffline />
          </NavigationContainer>
        </AppStateProvider>
        // <OfflineComponentSync />
        // <OfflineCompSecondSync />
      )}
    </>
  );
};

const withLayout = <P extends object>(
  Component: React.ComponentType<P>,
  backgroundColor?: string,
) => {
  return (props: P) => (
    <LayoutScreen backgroundColor={backgroundColor}>
      <Component {...props} />
    </LayoutScreen>
  );
};
