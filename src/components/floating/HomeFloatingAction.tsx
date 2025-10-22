import {Icons} from '@assets/icons/icons';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {IconNode} from '@rneui/base';
import {SpeedDial} from '@rneui/themed';
import {useAuth} from '@store/auth';
import useGeneralStore from '@store/general';
import {useModalDialogStore} from '@store/modals';
import {COLORS} from '@styles/colors';
import {closeSessionOnGoogle, getDeviceInfo} from '@utils/functions';
import {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';

export const HomeFloatingAction = () => {
  const [open, setOpen] = useState(false);
  const {resetTo, navigate} = useCustomNavigation();
  const clearSession = useAuth((d) => d.clearSession);
  const {isFilterActive, setFilterActive} = useGeneralStore();
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const onCloseFab = useCallback(() => {
    setOpen(false);
  }, []);

  const showAbout = useCallback(() => {
    showDialog({
      modalVisible: true,
      type: 'info',
      message: `ABOUT\n\nUOVO APP\nVerion ${getDeviceInfo().buildNumber}`,
      confirmBtnLabel: 'OK',
      cancelable: false,
    });
    onCloseFab();
  }, []);

  const logout = useCallback(() => {
    onCloseFab();
    showDialog({
      modalVisible: true,
      type: 'info',
      message: 'Are you sure you want to logout?',
      confirmBtnLabel: 'Yes, logout',
      cancelBtnLabel: 'Cancel',
      cancelable: true,
      onConfirm: () => {
        clearSession();
        closeSessionOnGoogle();
        resetTo(RoutesNavigation.Login);
      },
    });
  }, []);

  const goToHelpDesk = useCallback(() => {
    navigate(RoutesNavigation.HelpDesk);
    onCloseFab();
  }, []);

  const goToAccount = useCallback(() => {
    navigate(RoutesNavigation.Account);
    onCloseFab();
  }, []);

  const toggleFilter = useCallback(() => {
    setFilterActive(!isFilterActive);
    onCloseFab();
  }, [isFilterActive]);

  return (
    <SpeedDial
      isOpen={open}
      icon={<Icons.GridHomex3 fontSize={25} color={COLORS.white} />}
      openIcon={<Icons.Close fontSize={25} color={COLORS.white} />}
      onOpen={() => setOpen(!open)}
      onClose={() => setOpen(!open)}
      color={isFilterActive ? 'green' : COLORS.tertearyDark}
      overlayColor="#00000040"
      style={{
        paddingBottom: 15,
      }}>
      <CustomSpeedDialoAction
        title="Show active jobs"
        icon={<Icons.Filter fontSize={20} color={COLORS.white} />}
        onPress={toggleFilter}
      />
      <CustomSpeedDialoAction
        title="Account"
        icon={<Icons.UserSolid fontSize={21} color={COLORS.white} />}
        onPress={goToAccount}
      />
      <CustomSpeedDialoAction
        title="Help Desk"
        icon={<Icons.Question fontSize={15} color={COLORS.white} />}
        onPress={goToHelpDesk}
      />
      <CustomSpeedDialoAction
        title="About"
        icon={
          <Icons.EllipsisVertical
            fontSize={15}
            color={COLORS.white}
            style={{transform: [{rotate: '90deg'}]}}
          />
        }
        onPress={showAbout}
      />
      <CustomSpeedDialoAction
        title="Logout"
        icon={<Icons.Logout fontSize={22} color={COLORS.white} />}
        onPress={logout}
      />
    </SpeedDial>
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

type CustomSpeedDialoActionProps = {
  title: string;
  icon: IconNode;
  onPress: () => void;
};

export const CustomSpeedDialoAction = ({
  title,
  icon,
  onPress,
}: CustomSpeedDialoActionProps) => (
  <SpeedDial.Action
    color={COLORS.tertearyDark}
    icon={icon}
    title={title}
    onPress={onPress}
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
);
