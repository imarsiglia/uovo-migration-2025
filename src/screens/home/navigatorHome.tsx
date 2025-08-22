import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {FloatingAction} from 'react-native-floating-action';
import Icon, {configureFontAwesomePro} from 'react-native-fontawesome-pro';
import RNRestart from 'react-native-restart';
import {SafeAreaView} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import * as HomeActions from '../actions/home';
import * as InventoryActions from '../actions/inventory';
import {useTabHomeContext} from '../provider/TabHomeContext';
import {useUserContext} from '../provider/UserContext';
import mstyles from '../styles/styles';
import {COLORS, URL_API} from '../utils/constants';
import {fetchData} from '../utils/fetch';
import {removeAllStorageOffline} from '../utils/functions';
import {isInternet} from '../utils/internet';
import {
  getFromStorageOffline,
  IDS_INVENTORY_KEY_STORAGE,
  OFFLINE_MATERIALS_KEY_STORAGE,
  PACKING_DETAILS_KEY_STORAGE,
  removeMultiFromStorage,
  saveToStorageOffline,
  TOKEN_KEY_STORAGE,
  USER_INFO_KEY_STORAGE,
} from '../utils/storage';
import JobQueueView from './home/JobQueueView';
import TimelineView from './home/TimelineView';
import {useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import NationalShuttleView from './home/NationalShuttleView';

const Tab = createMaterialTopTabNavigator();

//@ts-ignore
configureFontAwesomePro('solid');

var versionNumber = DeviceInfo.getVersion();

const NavigatorHome = (props) => {
  const [floating, setFloating] = useState(false);
  const {activeFilter, setActiveFilter} = useUserContext();
  const {activeTab, setActiveTab, timelinePressed, setTimelinePressed} =
    useTabHomeContext();
  const translationX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    createIdsInventory();
    getMaterials();
    getPackingDetails();
  }, []);

  async function createIdsInventory() {
    var stringIdsInventory = await getFromStorageOffline(
      IDS_INVENTORY_KEY_STORAGE,
    );
    if (!stringIdsInventory) {
      saveToStorageOffline(IDS_INVENTORY_KEY_STORAGE, '[]');
    }
  }

  async function getMaterials() {
    const isConnected = await isInternet();
    if (isConnected) {
      const response: any = await fetchData.Get(
        'resources/material/query?downloadAll=1&idJob=&filter=',
      );
      if (response.ok) {
        if (response.data.message == 'SUCCESS') {
          var stringMaterials = JSON.stringify(response.data.body.data);
          await saveToStorageOffline(
            OFFLINE_MATERIALS_KEY_STORAGE,
            stringMaterials,
          );
        }
      }
    }
  }

  async function getPackingDetails() {
    const isConnected = await isInternet();
    if (isConnected) {
      const response: any = await fetchData.Get(
        'resources/conditionreport/load/packingdetail?query=',
      );
      if (response.ok) {
        if (response.data.message == 'SUCCESS') {
          props.dispatch(
            InventoryActions.copyPackingDetails(response.data.body.data),
          );
          var packDetString = JSON.stringify(response.data.body.data);
          await saveToStorageOffline(
            PACKING_DETAILS_KEY_STORAGE,
            packDetString,
          );
        }
      }
    } else {
      var packDetString: string = await getFromStorageOffline(
        PACKING_DETAILS_KEY_STORAGE,
      );
      if (packDetString) {
        var packDetJson = JSON.parse(packDetString);
        props.dispatch(InventoryActions.copyPackingDetails(packDetJson));
      }
    }
  }

  function onPressTab(e: any) {
    setTimeout(()=> {
      setActiveTab(e.data.state.index);
    }, 100)
    if (e.data.state.index == 2) {
      translationX.value = withTiming(0, {duration: 300});
      opacity.value = withTiming(1, {duration: 300});
    } else {
      translationX.value = withTiming(50, {duration: 300});
      opacity.value = withTiming(0, {duration: 300});
    }
    
  }

  function syncro() {
    props.dispatch(HomeActions.syncro());
  }

  function showActiveJobs() {
    setActiveFilter(true);
  }

  function showAllJobs() {
    setActiveFilter(false);
  }

  function navigate(screen, body?: any) {
    props.navigation.navigate(screen, body);
  }

  function goToHelpDesk() {
    navigate('HelpDesk');
  }

  function showAbout() {
    Alert.alert('ABOUT', '\nUOVO APP \nVersion ' + versionNumber);
  }

  function logout() {
    Alert.alert(
      'Logout',
      'Sure want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Yes', onPress: signOut},
      ],
      {cancelable: false},
    );
  }

  async function signOut() {
    try {
      var keysToDelete = [TOKEN_KEY_STORAGE, USER_INFO_KEY_STORAGE];
      await removeMultiFromStorage(keysToDelete);

      removeAllStorageOffline();

      try {
        if (Platform.OS == 'android') {
          await GoogleSignin.revokeAccess();
        }
        await GoogleSignin.signOut();
      } catch (error) {
        // console.error(error);
      }

      RNRestart.Restart();
    } catch (error) {
      console.error(error);
    }
  }

  function onPressMenuAction(name: string) {
    setFloating(false);
    switch (name) {
      case 'active_jobs':
        if (activeFilter) {
          showAllJobs();
        } else {
          showActiveJobs();
        }
        break;
      case 'account':
        navigate('Account');
        break;
      case 'help_desk':
        goToHelpDesk();
        break;
      case 'about':
        showAbout();
        break;
      case 'logout':
        logout();
        break;
    }
  }

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{translateX: translationX.value}],
  //     opacity: opacity.value,
  //     marginLeft: -translationX.value + 4
  //   };
  // });

  return (
    <SafeAreaView style={mstyles.safeAreaLight}>
      <View style={[{flexGrow: 1, backgroundColor: '#fbfbfb'}]}>
        <View style={mstyles.bgwhite}>
          <View style={styles.containerHeader}>
            <Text
              style={styles.titleHeader}
              onLongPress={() => Alert.alert('Server', URL_API)}>
              Home
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                disabled={props.syncro}
                onPress={() => syncro()}
                style={[styles.btnSync, {backgroundColor: '#1155cc'}]}>
                <View style={[mstyles.row]}>
                  {/* <Text style={styles.labelBtnSync}>Sync </Text> */}
                  {props.syncro && (
                    <ActivityIndicator color="white" size="small" />
                  )}
                  {!props.syncro && (
                    <Icon name="sync" color="white" type="solid" size={17} />
                  )}
                </View>
              </TouchableOpacity>

              {/* <Animated.View style={animatedStyle}>
                <TouchableOpacity
                  disabled={activeTab != 2}
                  onPress={() => setIsInventoryMode(!isInventoryMode)}
                  style={[
                    styles.btnSync,
                    {backgroundColor: COLORS.primary, marginLeft: 8},
                  ]}>
                  <View style={[mstyles.row]}>
                    {isInventoryMode ? (
                      <NSJobsIcon color="white" />
                    ) : (
                      <NSInventoryIcon color={'white'} />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View> */}

              {/* {activeTab == 2 ? (
                <TouchableOpacity
                  disabled={activeTab != 2}
                  onPress={() => setIsInventoryMode(!isInventoryMode)}
                  style={[
                    styles.btnSync,
                    {backgroundColor: COLORS.primary, marginLeft: 8},
                  ]}>
                  <View style={[mstyles.row]}>
                    {isInventoryMode ? (
                      <NSJobsIcon color="white" />
                    ) : (
                      <NSInventoryIcon color={'white'} />
                    )}
                  </View>
                </TouchableOpacity>
              ) : null} */}
            </View>
          </View>
        </View>

        <View style={{flex: 1, flexGrow: 1, height: '100%', width: '100%'}}>
          <Tab.Navigator
            initialRouteName="Timeline"
            screenListeners={{
              state: (e) => {
                onPressTab(e);
              },
            }}
            screenOptions={{
              tabBarLabelStyle: {
                fontSize: 14,
                textTransform: 'capitalize',
                flexWrap: 'nowrap',
                paddingHorizontal: 0,
              },
              swipeEnabled: false,
              tabBarInactiveTintColor: 'gray',
              tabBarGap: 0,
              tabBarActiveTintColor: COLORS.secondary,
              tabBarItemStyle: {paddingHorizontal: 0},
              tabBarStyle: {paddingHorizontal: 0, elevation: 1},
              tabBarIndicatorStyle: {backgroundColor: COLORS.secondary},
              tabBarPressColor: "#F0F0F0"
            }}>
            <Tab.Screen
              name="Timeline"
              component={TimelineView}
              options={{tabBarLabel: 'Timeline'}}
              listeners={{
                tabPress: (e) => {
                  if (activeTab == 0 && setTimelinePressed) {
                    setTimelinePressed(!timelinePressed);
                  }
                },
              }}
            />
            <Tab.Screen
              name="JobQueue"
              component={JobQueueView}
              options={{tabBarLabel: 'Job Queue'}}
            />
            <Tab.Screen
              name="NationalShuttle"
              component={NationalShuttleView}
              options={{tabBarLabel: 'National Shuttle'}}
            />
          </Tab.Navigator>
        </View>

        <FloatingAction
          onClose={() => setFloating(false)}
          onOpen={() => setFloating(!floating)}
          animated
          color={activeFilter ? 'green' : COLORS.terceary}
          actionsPaddingTopBottom={0}
          dismissKeyboardOnPress
          overlayColor="#FFFFFF70"
          shadow={{
            shadowOpacity: 0.1,
            shadowRadius: 0,
            shadowOffset: {height: 2, width: 0},
          }}
          floatingIcon={
            !floating ? (
              <Icon color="white" size={26} name="th" type="solid" />
            ) : (
              <Icon color="white" size={26} name="times" type="solid" />
            )
          }
          actions={[
            {
              name: 'active_jobs',
              text: activeFilter ? 'Show all jobs' : 'Show active jobs',
              color: COLORS.terceary,
              icon: <Icon name="filter" size={15} color="white" type="solid" />,
              animated: true,
              tintColor: 'red',
            },
            {
              name: 'account',
              text: 'Account',
              color: COLORS.terceary,
              icon: <Icon name="user" size={15} color="white" type="solid" />,
            },
            {
              name: 'help_desk',
              text: 'Help Desk',
              color: COLORS.terceary,
              icon: (
                <Icon name="question" size={15} color="white" type="solid" />
              ),
            },
            {
              name: 'about',
              text: 'About',
              color: COLORS.terceary,
              icon: (
                <Icon name="ellipsis-h" size={15} color="white" type="solid" />
              ),
            },
            {
              name: 'logout',
              text: 'Logout',
              color: COLORS.terceary,
              icon: (
                <Icon name="sign-out" size={15} color="white" type="solid" />
              ),
            },
          ]}
          onPressItem={onPressMenuAction}
        />

        {activeFilter && (
          <View
            style={[
              styles.floatingInfoFilter,
              {flexDirection: 'row', alignItems: 'center'},
            ]}>
            <Icon name="exclamation" size={15} color="orange" type="solid" />
            <Text allowFontScaling={false} style={{color: '#000000'}}>
              You are currently on a filtered view for paused jobs
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    backgroundColor: '#fbfbfb',
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
  },
  titleHeader: {
    fontWeight: 'bold',
    color: '#3a3a3a',
    fontSize: 30,
  },
  labelBtnSync: {
    color: 'white',
    fontSize: 16,
    marginRight: 2,
  },
  btnSync: {
    backgroundColor: '#1155cc',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingInfoFilter: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#dbdbdb',
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    elevation: 10,
  },
  fullOpacity: {
    zIndex: 1000,
    position: 'absolute',
    backgroundColor: '#d0d0d0',
    opacity: 0.5,
    height: '100%',
    width: '100%',
  },
});

const mapStateToProps = (state) => ({
  syncro: state.syncro,
  userInfo: state.userInfo,
});

export default connect(mapStateToProps)(NavigatorHome);
