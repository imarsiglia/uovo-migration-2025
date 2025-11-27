import {useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

import {useGetLocationNotes} from '@api/hooks/HooksJobServices';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationNotes'>;
export const LocationNotesScreen = (props: Props) => {
  const {navigate, goBack} = useCustomNavigation();
  const {
    params: {idJob, type},
  } = props.route;

  const {data: notes, isLoading} = useGetLocationNotes({
    idJob,
    type,
  });

  const onInitNewLocation = useCallback(() => {
    navigate(RoutesNavigation.SaveLocationNotes, {
      type,
      idJob,
    });
  }, []);

  return (
    <View style={[styles.container]}>
      {isLoading && <GeneralLoading />}

      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <TouchableOpacity onPress={() => goBack()}>
            <View style={styles.backBtn}>
              <Icon
                name="chevron-left"
                color="#959595"
                type="light"
                size={15}
              />
              <Text style={styles.backBtnText}>Top sheet</Text>
            </View>
          </TouchableOpacity>

          <View style={GLOBAL_STYLES.row}>
            <TouchableOpacity
              onPress={onInitNewLocation}
              style={GLOBAL_STYLES.btnOptTop}>
              <Icon name="plus" color="white" type="solid" size={15} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[GLOBAL_STYLES.lateralPadding, GLOBAL_STYLES.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Location notes
          </Text>
        </View>
      </View>

      <MinRoundedView />

      <ScrollView style={styles.scrollNotifications}>
        <View style={styles.containerNotification}>
          <View style={styles.viewNotification}>
            <Text style={styles.letterNotification}>Notes</Text>
            <View style={styles.viewDescNotification}>
              <Text style={[styles.titleNotification]}>
                {notes && notes.trim() ? notes.trim() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  scrollNotifications: {
    flex: 1,
    paddingTop: 20,
    marginBottom: 5,
  },
  containerNotification: {
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 15,
  },
  viewNotification: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  letterNotification: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  viewDescNotification: {
    paddingLeft: 0,
    paddingRight: 10,
    marginTop: 10,
  },
  titleNotification: {
    color: 'black',
    fontSize: 14,
  },
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
  },
  btnOptTop: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    width: 27,
    padding: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topsheet: {
    color: '#3a3a3a',
  },
});
