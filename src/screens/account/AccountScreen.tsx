import {Icons} from '@assets/icons/icons';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {useAuth} from '@store/auth';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {
  closeSessionOnGoogle,
  showAlertDialogWithOptions,
} from '@utils/functions';
import {useCallback} from 'react';
import {Image, StyleSheet} from 'react-native';

export const AccountScreen = () => {
  const clearSession = useAuth((d) => d.clearSession);
  const user = useAuth((d) => d.user);
  const {resetTo, goBack, navigate} = useCustomNavigation();

  const initLogout = useCallback(() => {
    showAlertDialogWithOptions(() => {
      clearSession();
      // removeAllStorageOffline();
      closeSessionOnGoogle();
      resetTo(RoutesNavigation.Login);
    });
  }, []);

  if (!user) {
    return undefined;
  }

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={styles.container}>
        <Wrapper style={[{backgroundColor: COLORS.white}]}>
          <PressableOpacity onPress={goBack} style={styles.header}>
            <Icons.AngleLeft fontSize={15} />
            <Label style={styles.headerTitle}>Home</Label>
          </PressableOpacity>

          <Wrapper style={[styles.GLOBAL_STYLES, styles.containerTitle]}>
            <Label
              style={[
                GLOBAL_STYLES.title,
                GLOBAL_STYLES.bold,
                {color: COLORS.titleColor},
              ]}>
              Account
            </Label>
          </Wrapper>
        </Wrapper>

        <MinRoundedView />

        <Wrapper style={styles.containerProfilePhoto}>
          {!user.user_photo && (
            <Wrapper style={styles.avatar}>
              <Label style={styles.avatarText}>
                {user.user_name[0]}
                {user.user_last_name[0]}
              </Label>
            </Wrapper>
          )}
          {user.user_photo && (
            <Image
              resizeMode="cover"
              style={styles.userPhoto}
              source={{
                uri: 'data:image/jpeg;base64,' + user.user_photo,
              }}
            />
          )}
        </Wrapper>

        <Label style={[GLOBAL_STYLES.bold, styles.username]}>
          {user.user_name} {user.user_last_name}
        </Label>
        <Label style={[styles.center, styles.email]}>{user.user_mail}</Label>

        <PressableOpacity
          style={[
            GLOBAL_STYLES.lateralPadding,
            styles.containerOption,
            {marginTop: 30},
          ]}
          onPress={() => navigate('EditProfile', {fromprofile: true})}>
          <Wrapper style={styles.containerOptionLabel}>
            <Icons.AddressCard fontSize={22} />
            <Label style={styles.textOption}>My Profile</Label>
          </Wrapper>
          <Icons.AngleDown
            fontSize={20}
            style={{transform: [{rotate: '-90deg'}]}}
          />
        </PressableOpacity>

        <PressableOpacity
          style={[
            GLOBAL_STYLES.lateralPadding,
            styles.containerOption,
            {marginTop: 10},
          ]}
          onPress={() => navigate('DigitalId', {member: false})}>
          <Wrapper style={styles.containerOptionLabel}>
            <Icons.IdBadge fontSize={22} />
            <Label style={styles.textOption}>Digital ID</Label>
          </Wrapper>
          <Icons.AngleDown
            fontSize={20}
            style={{transform: [{rotate: '-90deg'}]}}
          />
        </PressableOpacity>

        <PressableOpacity
          style={[
            GLOBAL_STYLES.lateralPadding,
            styles.containerOption,
            {marginTop: 10},
          ]}
          onPress={initLogout}>
          <Wrapper style={styles.containerOptionLabel}>
            <Icons.Logout fontSize={22} />
            <Label style={styles.textOption}>Logout</Label>
          </Wrapper>
          <Icons.AngleDown
            fontSize={20}
            style={{transform: [{rotate: '-90deg'}]}}
          />
        </PressableOpacity>
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
  },
  center: {
    alignSelf: 'center',
  },
  containerOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 10,
  },
  containerOptionLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 10,
    paddingRight: 5,
    height: 40,
    alignContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.gray,
    fontSize: 18,
    paddingBottom: 1,
  },
  containerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 118,
    height: 118,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
  },
  userPhoto: {
    width: 118,
    height: 118,
    borderRadius: 100,
  },
  textOption: {
    color: COLORS.inputTextColor,
  },
  containerProfilePhoto: {
    marginTop: 20,
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: 120,
    height: 120,
    borderRadius: 100,
    borderColor: '#cecece',
    opacity: 1,
  },
  email: {
    color: '#cecece',
    lineHeight: 14,
    fontSize: 13,
  },
  username: {
    alignSelf: 'center',
    color: '#3a3a3a',
    fontSize: 17,
  },
});
