import {useCallback, useMemo, useState} from 'react';
import {SpeedDial} from '@rneui/themed';
import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';
import {Alert, StyleSheet} from 'react-native';
import {
  closeSessionOnGoogle,
  getDeviceInfo,
  showAlertDialogWithOptions,
} from '@utils/functions';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useAuth} from '@store/auth';
import {RoutesNavigation} from '@navigation/types';

export const HomeFloatingAction = () => {
  const [open, setOpen] = useState(false);
  const {resetTo, navigate} = useCustomNavigation();
  const clearSession = useAuth((d) => d.clearSession);

  const onCloseFab = useCallback(() => {
    setOpen(false);
  }, []);

  const showAbout = useCallback(() => {
    Alert.alert('ABOUT', '\nUOVO APP \nVersion ' + getDeviceInfo().buildNumber);
    onCloseFab();
  }, []);

  const logout = useCallback(() => {
    showAlertDialogWithOptions(() => {
      clearSession();
      closeSessionOnGoogle();
      resetTo(RoutesNavigation.Login);
    });
    onCloseFab();
  }, []);

  const goToHelpDesk = useCallback(() => {
    navigate(RoutesNavigation.HelpDesk);
    onCloseFab();
  }, []);

  const goToAccount = useCallback(() => {
    navigate(RoutesNavigation.Account);
    onCloseFab();
  }, []);

  return (
    <SpeedDial
      isOpen={open}
      icon={<Icons.GridHomex3 fontSize={25} color={COLORS.white} />}
      openIcon={<Icons.Close fontSize={25} color={COLORS.white} />}
      onOpen={() => setOpen(!open)}
      onClose={() => setOpen(!open)}
      color={COLORS.tertearyDark}
      overlayColor="#00000040">
      <SpeedDial.Action
        color={COLORS.tertearyDark}
        icon={<Icons.Filter fontSize={20} color={COLORS.white} />}
        title="Show active jobs"
        onPress={() => console.log('Add Something')}
        titleStyle={styles.title}
        style={styles.buttonActionStyle}
        buttonStyle={{
          marginVertical: 0,
        }}
        containerStyle={{
          marginVertical: 0,
        }}
        iconContainerStyle={{
          marginVertical: 0,
        }}
      />
      <SpeedDial.Action
        color={COLORS.tertearyDark}
        icon={<Icons.UserSolid fontSize={21} color={COLORS.white} />}
        title="Account"
        onPress={goToAccount}
        titleStyle={styles.title}
        style={styles.buttonActionStyle}
        buttonStyle={{
          marginVertical: 0,
        }}
        containerStyle={{
          marginVertical: 0,
        }}
        iconContainerStyle={{
          marginVertical: 0,
        }}
      />
      <SpeedDial.Action
        color={COLORS.tertearyDark}
        icon={<Icons.Question fontSize={15} color={COLORS.white} />}
        title="Help Desk"
        onPress={goToHelpDesk}
        titleStyle={styles.title}
        style={styles.buttonActionStyle}
      />
      <SpeedDial.Action
        color={COLORS.tertearyDark}
        icon={
          <Icons.EllipsisVertical
            fontSize={15}
            color={COLORS.white}
            style={{transform: [{rotate: '90deg'}]}}
          />
        }
        title="About"
        onPress={showAbout}
        titleStyle={styles.title}
        style={styles.buttonActionStyle}
      />
      <SpeedDial.Action
        color={COLORS.tertearyDark}
        icon={<Icons.Logout fontSize={22} color={COLORS.white} />}
        title="Logout"
        onPress={logout}
        titleStyle={styles.title}
        style={styles.buttonActionStyle}
      />
    </SpeedDial>
    //    <FloatingAction
    //              onClose={() => setFloating(false)}
    //              onOpen={() => setFloating(!floating)}
    //              animated
    //              color={activeFilter ? 'green' : COLORS.terceary}
    //              actionsPaddingTopBottom={0}
    //              dismissKeyboardOnPress
    //              overlayColor="#FFFFFF70"
    //              shadow={{
    //                shadowOpacity: 0.1,
    //                shadowRadius: 0,
    //                shadowOffset: {height: 2, width: 0},
    //              }}
    //              floatingIcon={
    //                !floating ? (
    //                  <Icon color="white" size={26} name="th" type="solid" />
    //                ) : (
    //                  <Icon color="white" size={26} name="times" type="solid" />
    //                )
    //              }
    //              actions={[
    //                {
    //                  name: 'active_jobs',
    //                  text: activeFilter ? 'Show all jobs' : 'Show active jobs',
    //                  color: COLORS.terceary,
    //                  icon: <Icon name="filter" size={15} color="white" type="solid" />,
    //                  animated: true,
    //                  tintColor: 'red',
    //                },
    //                {
    //                  name: 'account',
    //                  text: 'Account',
    //                  color: COLORS.terceary,
    //                  icon: <Icon name="user" size={15} color="white" type="solid" />,
    //                },
    //                {
    //                  name: 'help_desk',
    //                  text: 'Help Desk',
    //                  color: COLORS.terceary,
    //                  icon: (
    //                    <Icon name="question" size={15} color="white" type="solid" />
    //                  ),
    //                },
    //              ]}
    //              onPressItem={onPressMenuAction}
    //            />
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    marginVertical: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  buttonActionStyle: {
    marginVertical: 0,
    paddingVertical: 0,
  },
});
