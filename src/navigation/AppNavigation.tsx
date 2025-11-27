import {NavigationContainer} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {enableScreens} from 'react-native-screens';
// import {connect} from 'react-redux';
// import * as UserActions from '../actions/user';
// import Splash from '../screens/splash';
// import {fetchData} from '../utils/fetch';
//Screens
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import ConfirmPhoto from '../components/general/ConfirmPhoto';
// import AddLabor from '../screens/addLabor';
// import AddLocationNote from '../screens/addLocationNote';
// import AddMaterials from '../screens/addMaterials';
// import Attachments from '../screens/attachments';
// import ClientLocations from '../screens/clientLocations';
// import EditImage from '../screens/editImage';
// import Images from '../screens/images';
// import ItemDetail from '../screens/itemDetail';
// import ReportMaterialsItemDetail from '../screens/itemDetails/reportMaterials';
// import LaborReport from '../screens/laborReport';
// import LocationNotes from '../screens/locationNotes';

// import ReportMaterials from '../screens/reportMaterials';
// import Reports from '../screens/reports';
// import Signature from '../screens/signature';
// import TakeImages from '../screens/takeImages';

// import VisualizePdf from '../screens/visualizePdf';
// import VisualizePhoto from '../screens/visualizePhoto';

//Condition report
// import {GeneralModal} from '../components/general/GeneralModal';
// import OfflineComponentSync from '../components/offline/OfflineComponentSync';
// import OfflineCompSecondSync from '../components/offline/OfflineCompSecondSync';
// import ConditionSides from '../screens/conditionReport/ConditionSides';
// import Gallery from '../screens/conditionReport/Gallery';
// import GalleryDetail from '../screens/conditionReport/GalleryDetail';
// import PhotoCapture from '../screens/conditionReport/PhotoCapture';
// import PhotoCaptureZoom from '../screens/conditionReport/PhotoCaptureZoom';
// import PhotoCaptureZoomEdit from '../screens/conditionReport/PhotoCaptureZoomEdit';
// import PhotoDetail from '../screens/conditionReport/PhotoDetail';
// import PhotoView from '../screens/conditionReport/PhotoView';
// import PhotoZoom from '../screens/conditionReport/PhotoZoom';
// import ZoomScreen from '../screens/conditionReport/ZoomScreen';
// import {isInternet} from '../utils/internet';
// import {
//   TOKEN_KEY_STORAGE,
//   USER_INFO_KEY_STORAGE,
//   getFromStorage,
//   saveToStorage,
// } from '../utils/storage';

//national shuttle
import {useRefreshToken} from '@api/hooks/HooksAuthentication';
import {Splash} from '@components/splash/Splash';
import {CustomStatusBar} from '@components/statusbar/CustomStatusBar';
import {LoginEmailScreen} from '@screens/auth/LoginEmailScreen';
import {ContactScreen} from '@screens/contact/ContactScreen';
import {HelpDeskScreen} from '@screens/contact/HelpDeskScreen';
import {EditImageScreen} from '@screens/editImage/EditImageScreen';
import {HomeScreen} from '@screens/home/HomeScreen';
import {useAuth} from '@store/auth';
import {getDeviceInfo} from '@utils/functions';
import {isInternet} from '@utils/internet';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RootStackParamList, RoutesNavigation} from './types';
import {AccountScreen} from '@screens/account/AccountScreen';
import Icon, {configureFontAwesomePro} from 'react-native-fontawesome-pro';
import {TopsheetScreen} from '@screens/topsheet/TopsheetScreen';
import {ReportIssueScreen} from '@screens/location/ReportIssueScreen';
import {LocationNotesScreen} from '@screens/location/LocationNotesScreen';
import {SaveLocationNoteScreen} from '@screens/location/SaveLocationNoteScreen';
import {DigitalIdScreen} from '@screens/digitalid/DigitalIdScreen';
import {VisualizeBolScreen} from '@screens/bol/VisualizeBolScreen';
import {SignaturesScreen} from '@screens/signatures/SignaturesScreen';
import {TakeSignatureScreen} from '@screens/signatures/TakeSignatureScreen';
import {NotesScreen} from '@screens/notes/NotesScreen';
import {SaveNoteScreen} from '@screens/notes/SaveNoteScreen';
import {ReportMaterialsScreen} from '@screens/reportmaterials/ReportMaterialsScreen';
import {SaveReportMaterialScreen} from '@screens/reportmaterials/SaveReportMaterialScreen';
import BaseImageScreen from '@screens/commons/BaseImageScreen';
import {WoAttachmentScreen} from '@screens/woattachments/WoAttachmentScreen';
import {EditPieceCountScreen} from '@screens/piececount/EditPieceCountScreen';
import {LaborReportScreen} from '@screens/laborreport/LaborReportScreen';
import {AddLaborReportScreen} from '@screens/laborreport/AddLaborReportScreen';
import {ModalDialog} from '@components/commons/modals/ModalDialog';
import {ModalLoading} from '@components/commons/modals/ModalLoading';
import {PortalHost} from '@gorhom/portal';
import {InventoryScreen} from '@screens/inventory/InventoryScreen';
import {AddInventoryScreen} from '@screens/inventory/AddInventoryScreen';
import {ItemDetailScreen} from '@screens/inventory/ItemDetailScreen';
import {TakeDimensionsScreen} from '@screens/inventory/TakeDimensions';
import {ReportsScreen} from '@screens/reports/ReportsScreen';
import {ConditionReportScreen} from '@screens/reports/ConditionReportScreen';
import {ConditionCheckScreen} from '@screens/reports/ConditionCheckScreen';
import {EditProfileScreen} from '@screens/profile/EditProfileScreen';
import CallPhoneSheet from '@components/bottomSheets/CallPhoneSheet';
import {navigationRef} from '@utils/navigationService';
import {InventoryNSScreen} from '@screens/nationalshuttle/InventoryNSScreen';
import {OfflineBanner} from '@components/offline/OfflineBanner';
import {ModalOffline} from '@components/offline/ModalOffline';
import {ImagesScreen} from '@screens/images/ImagesScreen';
import TaskPhotoCarouselScreen from '@screens/commons/TaskPhotoCarouselScreen';
import {SaveImagesScreen} from '@screens/images/SaveImagesScreen';
import {GalleryCondition} from '@screens/reports/photos/GalleryConditionScreen';
import {PhotoDetailCondition} from '@screens/reports/photos/PhotoDetailConditionScreen';
import PhotoCaptureZoomEdit from '@screens/reports/photos/PhotoCaptureZoomEdit';
import ZoomScreen from '@screens/reports/photos/ZoomScreen';
import {COLORS} from '@styles/colors';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BackButton} from '@components/commons/buttons/BackButton';
import {ConditionSides} from '@screens/reports/photos/ConditionSidesScreen';
import PhotoCapture from '@screens/reports/photos/PhotoCapture';
import PhotoCaptureZoom from '@screens/reports/photos/PhotoCaptureZoom';
import TaskPhotoViewerScreen from '@screens/commons/TaskPhotoViewerScreen';

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

  return (
    <>
      {/* {loading == true && <Splash />} */}
      {!isSuccess && !isError && !isLoaded && <Splash />}
      {(isSuccess || isLoaded) && (
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
            screenOptions={{headerShown: false}}>
            <Stack.Screen
              name={RoutesNavigation.Login}
              component={LoginScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.EditProfile}
              component={EditProfileScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.ContactUs}
              component={ContactScreen}
            />
            <Stack.Screen name={RoutesNavigation.Home} component={HomeScreen} />
            <Stack.Screen
              name={RoutesNavigation.Topsheet}
              component={TopsheetScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.EditImage}
              component={EditImageScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.LoginEmail}
              component={LoginEmailScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.HelpDesk}
              component={HelpDeskScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.Account}
              component={AccountScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.ReportIssue}
              component={ReportIssueScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.LocationNotes}
              component={LocationNotesScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.SaveLocationNotes}
              component={SaveLocationNoteScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.DigitalId}
              component={DigitalIdScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.VisualizeBOL}
              component={VisualizeBolScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.Signatures}
              component={SignaturesScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.TakeSignature}
              component={TakeSignatureScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.Notes}
              component={NotesScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.SaveNote}
              component={SaveNoteScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.ReportMaterials}
              component={ReportMaterialsScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.SaveReportMaterials}
              component={SaveReportMaterialScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.WoAttachment}
              component={WoAttachmentScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.EditPieceCount}
              component={EditPieceCountScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.LaborReport}
              component={LaborReportScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.AddLaborReport}
              component={AddLaborReportScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.Inventory}
              component={InventoryScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.AddInventory}
              component={AddInventoryScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.ItemDetail}
              component={ItemDetailScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.TakeDimensions}
              component={TakeDimensionsScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.InventoryNationalShuttle}
              component={InventoryNSScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.Images}
              component={ImagesScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.SaveImages}
              component={SaveImagesScreen}
            />
            {/* condition report / condition check */}
            <Stack.Screen
              name={RoutesNavigation.Reports}
              component={ReportsScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.ConditionReport}
              component={ConditionReportScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.ConditionCheck}
              component={ConditionCheckScreen}
            />
            <Stack.Screen
              name={RoutesNavigation.GalleryCondition}
              component={GalleryCondition}
            />
            <Stack.Screen
              name={RoutesNavigation.PhotoDetailCondition}
              component={PhotoDetailCondition}
            />

            <Stack.Screen
              name={RoutesNavigation.ZoomScreen}
              component={ZoomScreen}
              // @ts-ignore
              options={({navigation}) => ({
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.bgWhite,
                },
                headerTitleStyle: {
                  color: COLORS.titleColor,
                },
                headerLeft: () => (
                  <BackButton
                    style={{marginLeft: -10}}
                    title="Back"
                    onPress={navigation.goBack}
                  />
                ),
                headerBackTitleStyle: {
                  color: COLORS.gray,
                },
                headerBackTitle: 'Sisa',
              })}

              // options={{
              //   headerShown: true,
              //   headerStyle: {
              //     backgroundColor: COLORS.bgWhite,
              //   },
              //   headerTitleStyle: {
              //     color: COLORS.titleColor,
              //   },
              //   headerBackImageSource: (
              //     <Icon
              //       name="chevron-left"
              //       color={COLORS.gray}
              //       type="light"
              //       size={15}
              //     />
              //   ),
              //   headerBackTitleStyle: {
              //     color: COLORS.gray
              //   }
              // }}
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
              component={ConditionSides}
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
              component={TaskPhotoViewerScreen}
            />
          </Stack.Navigator>
          <ModalDialog />
          <ModalLoading />
          <PortalHost name="root" />
          <CallPhoneSheet />
          <OfflineBanner />
          <ModalOffline />
        </NavigationContainer>
        // <OfflineComponentSync />
        // <OfflineCompSecondSync />
      )}
    </>
  );
};
