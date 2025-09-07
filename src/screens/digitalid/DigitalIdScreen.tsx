import {useGetQrUser} from '@api/hooks/HooksGeneralServices';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '@store/auth';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {showToastMessage} from '@utils/toast';
import {useCallback, useMemo, useState} from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import Modal from 'react-native-modal';

const idBadge = require('@assets/idbadge/bgid-badge.png');

type Props = NativeStackScreenProps<RootStackParamList, 'DigitalId'>;
export const DigitalIdScreen = (props: Props) => {
  const [qrOpened, setQrOpened] = useState(false);

  const user = useAuth((d) => d.user);
  const {person, member} = props.route.params;

  const {data: qrCode, refetch, isRefetching} = useGetQrUser();

  const getQrCode = useCallback(() => {
    refetch()
      .then((d) => {
        if (d.data) {
          setQrOpened(true);
        } else {
          showToastMessage('QR Code not available');
        }
      })
      .catch(() => showToastMessage('Error while retreiving QR Code'));
  }, [refetch]);

  const isSelf = !member || (member && user?.user_id === person?.id_user);

  const displayName = useMemo(
    () =>
      member
        ? `${person?.name} ${person?.lastname}`
        : `${user?.user_name ?? ''} ${user?.user_last_name ?? ''}`.trim(),
    [
      member,
      person?.name,
      person?.lastname,
      user?.user_name,
      user?.user_last_name,
    ],
  );

  const isLeader = useMemo(
    () => (member ? !!person?.leader : !!user?.leader),
    [member, person?.leader, user?.leader],
  );

  const avatarBase64 = useMemo(
    () => (member ? person?.photo : user?.user_photo),
    [member, person?.photo, user?.user_photo],
  );

  const initials = useMemo(() => {
    const n = (member ? person?.name : user?.user_name)?.[0] ?? 'T';
    const l = (member ? person?.lastname : user?.user_last_name)?.[0] ?? 'R';
    return `${n}${l}`.toUpperCase();
  }, [
    member,
    person?.name,
    person?.lastname,
    user?.user_name,
    user?.user_last_name,
  ]);

  return (
    <>
      <View style={[{flexGrow: 1, height: '100%', backgroundColor: '#fbfbfb'}]}>
        {isRefetching && <GeneralLoading />}
        <View>
          <ImageBackground
            resizeMode="stretch"
            source={idBadge}
            style={{width: '100%', height: 300}}>
            <View
              style={[
                {
                  backgroundColor: 'white',
                  paddingBottom: 15,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                  <View
                    style={{
                      flexDirection: 'row',
                      opacity: 0.8,
                      paddingLeft: 10,
                      paddingRight: 5,
                      height: 40,
                      alignContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Icon
                      name="chevron-left"
                      color="#959595"
                      type="light"
                      size={15}
                    />
                    <Text
                      style={{
                        color: '#959595',
                        fontSize: 18,
                        paddingBottom: 1,
                      }}>
                      Back
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  GLOBAL_STYLES.lateralPadding,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Text
                  style={[
                    GLOBAL_STYLES.title,
                    GLOBAL_STYLES.bold,
                    styles.title,
                  ]}>
                  Digital ID
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 20,
                backgroundColor: 'white',
                alignSelf: 'center',
                justifyContent: 'center',
                borderWidth: 2.5,
                left: 10,
                width: 90,
                height: 90,
                borderRadius: 100,
                position: 'absolute',
                bottom: -40,
                borderColor: 'white',
                opacity: 1,
              }}>
              {avatarBase64 ? (
                <Image
                  resizeMode="cover"
                  style={styles.avatarImg}
                  source={{uri: `data:image/png;base64,${avatarBase64}`}} // png como default
                />
              ) : (
                <View style={styles.imageBgAvatar}>
                  <Text style={styles.nameAvatar}>{initials}</Text>
                </View>
              )}
            </View>
          </ImageBackground>

          <Text style={[GLOBAL_STYLES.bold, styles.name]}>{displayName}</Text>
          <View style={styles.leaderBadge}>
            <Text style={styles.leaderText}>
              {isLeader ? 'Team leader' : ''}
            </Text>
          </View>

          {isSelf && (
            <TouchableOpacity onPress={getQrCode} style={styles.qrFab}>
              <View style={styles.qrFabInner}>
                <Icon name="qrcode" color="white" size={30} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={{paddingHorizontal: 30, marginTop: 10}}>
          <View style={[GLOBAL_STYLES.lateralPadding, styles.containerInfo]}>
            <Icon name="mobile-alt" color="#979797" type="solid" size={20} />
            <Text style={styles.textInfo}>
              {member
                ? person?.name + ' ' + person?.lastname
                : user?.user_name + ' ' + user?.user_last_name}
            </Text>
          </View>

          {(!member || (member && user?.user_id == person?.id_user)) && (
            <View style={[GLOBAL_STYLES.lateralPadding, styles.containerInfo]}>
              <Icon name="envelope" color="#979797" type="solid" size={20} />
              <Text style={styles.textInfo}>{user?.user_mail}</Text>
            </View>
          )}

          <View style={[GLOBAL_STYLES.lateralPadding, styles.containerInfo]}>
            <Icon name="phone" color="#979797" type="solid" size={20} />
            <Text style={styles.textInfo}>
              {member
                ? person?.phone ?? 'No phone'
                : user?.user_phone ?? 'No phone'}
            </Text>
          </View>

          <View style={[GLOBAL_STYLES.lateralPadding, styles.containerInfo]}>
            <Icon
              name="map-marker-alt"
              color="#979797"
              type="solid"
              size={20}
            />
            <Text style={styles.textInfo}>
              Queens Plaza 41-54 22nd St. Long Island City, NY 11101
            </Text>
          </View>
        </View>
      </View>

      {qrOpened && (
        <Modal
          isVisible={qrOpened}
          onBackdropPress={() => setQrOpened(false)}
          useNativeDriver>
          <View style={styles.containerQR}>
            {qrCode ? (
              <Image
                style={{width: 220, height: 200}}
                source={{uri: `data:image/png;base64,${qrCode}`}}
              />
            ) : (
              <Text style={{marginVertical: 40}}>QR not available</Text>
            )}
            <Text style={styles.youtQR}>Your QR Code</Text>
            <TouchableOpacity
              onPress={() => setQrOpened(false)}
              style={styles.closeBtn}>
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </>
  );
};

const AVATAR = 90;

const styles = StyleSheet.create({
  title: {color: '#3a3a3a'},
  name: {
    alignSelf: 'center',
    marginTop: 10,
    color: COLORS.primary,
    fontSize: 17,
  },
  leaderBadge: {
    backgroundColor: '#3C424A',
    marginTop: 10,
    alignItems: 'center',
  },
  leaderText: {color: 'white', fontSize: 12},

  avatarWrap: {
    marginTop: 20,
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    position: 'absolute',
    bottom: -40,
    borderColor: 'white',
  },
  avatarImg: {width: AVATAR - 5, height: AVATAR - 5, borderRadius: AVATAR / 2},

  qrFab: {position: 'absolute', bottom: -10, right: 10},
  qrFabInner: {
    backgroundColor: '#F1A43E',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
    paddingTop: 5,
    paddingBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  containerQR: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  youtQR: {
    marginTop: 20,
    fontSize: 17,
    color: '#3C424A',
    fontWeight: 'bold',
  },
  textInfo: {
    paddingLeft: 20,
    color: '#414141DE',
  },
  containerInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
    paddingTop: 5,
    paddingBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    alignItems: 'center',
    borderRadius: 20,
  },
  closeTxt: {
    color: 'white',
    fontSize: 15,
  },
  imageBgAvatar: {
    width: 85,
    height: 85,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  nameAvatar: {
    fontSize: 35,
    color: 'white',
  },
});
