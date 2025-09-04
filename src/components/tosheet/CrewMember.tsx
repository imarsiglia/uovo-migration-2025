import { CrewMemberType } from '@api/types/Jobs';
import { getColorStatusCrewMember } from '@utils/functions';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import { Swipeable } from 'react-native-gesture-handler';

type Props = {
  onPressProfile: () => void;
  onPressCall: () => void;
  item: CrewMemberType;
  onRemoveUser: () => void;
  currentUser?: any;
};

const CrewMember = ({
  item,
  onPressProfile,
  onPressCall,
  onRemoveUser,
  currentUser,
}: Props) => {

  const rightActions = () => {
    return (
      <>
        {currentUser != item.id_user && !item.leader && (
          <TouchableOpacity
            style={[
              styles.borderRadiusLeft,
              styles.swipeableView,
              styles.backgroundRemove,
            ]}
            onPress={() => onRemoveUser()}>
            <Icon name="trash-alt" size={25} color="white" type="solid" />
          </TouchableOpacity>
        )}

        {currentUser != item.id_user && (
          <TouchableOpacity
            style={[
              item.leader ? styles.borderRadiusLeft : null,
              styles.swipeableView,
              styles.backgroundPhone,
            ]}
            onPress={() => onPressCall()}>
            <Icon name="phone-alt" size={25} color="white" type="solid" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            currentUser != item.id_user ? null : styles.borderRadiusLeft,
            styles.swipeableView,
            styles.backgroundBadge,
          ]}
          onPress={() => onPressProfile()}>
          <Icon name="address-card" size={25} color="white" type="solid" />
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Swipeable renderRightActions={() => rightActions()}>
        <View style={styles.subContainer}>
          <View style={styles.paddingHorizontal}>
            {item.photo && (
              <Image
                style={[
                  styles.image,
                  {borderColor: getColorStatusCrewMember(item.status)},
                ]}
                source={{uri: 'data:image/jpeg;base64,' + item.photo}}
              />
            )}

            {!item.photo && (
              <View
                style={[
                  styles.image,
                  {
                    backgroundColor: '#1155cc',
                    borderColor: getColorStatusCrewMember(item.status),
                  },
                ]}>
                <Text allowFontScaling={false} style={{color: 'white'}}>
                  {item.name ? item.name[0] : 'T'}
                  {item.lastname ? item.lastname[0] : 'R'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.containerName}>
            {item.leader && (
              <View style={styles.teamLeader}>
                <Icon name="check" size={9} color="white" type="solid" />
                <Text style={styles.txtteamLeader} allowFontScaling={false}>
                  Team leader
                </Text>
              </View>
            )}

            <Text style={styles.name} allowFontScaling={false}>
              {item.name ?? 'No name'}
            </Text>
            <Text style={styles.phone} allowFontScaling={false}>
              {item.phone ?? 'No phone'}
            </Text>
          </View>
        </View>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 75,
    borderRadius: 28,
    marginBottom: 10,
    overflow: 'hidden',
  },
  subContainer: {
    height: 75,
    backgroundColor: '#F7F5F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 7,
    paddingBottom: 7,
  },
  borderRadiusLeft: {
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
  },
  swipeableView: {
    height: 75,
    width: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paddingHorizontal: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerName: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  teamLeader: {
    backgroundColor: '#EEA32E',
    borderRadius: 7,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtteamLeader: {
    fontSize: 10,
    color: 'white',
    paddingLeft: 5,
  },
  name: {
    color: '#3C424A',
    fontWeight: 'bold',
    opacity: 0.8,
  },
  phone: {
    color: '#3C424A',
    opacity: 0.6,
  },
  backgroundPhone: {
    backgroundColor: '#BCB0EC',
  },
  backgroundBadge: {
    backgroundColor: '#96DBDB',
  },
  backgroundRemove: {
    backgroundColor: '#FF6C6C',
  },
});

export default CrewMember;
