import {useGetWoAttachments} from '@api/hooks/HooksTaskServices';
import {BackButton} from '@components/commons/buttons/BackButton';
import SearchInput from '@components/commons/inputs/SearchInput';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {SafeAreaView} from 'react-native-safe-area-context';

export const WoAttachmentScreen = () => {
  const {goBack} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail);
  const {data: list, isLoading} = useGetWoAttachments({
    idJob,
  });

  const [filter, setFilter] = useState('');

  const filteredList = useMemo(() => {
    return list?.filter((x) =>
      x.name.toUpperCase().includes(filter.trim().toUpperCase()),
    );
  }, [filter]);

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) =>
      Alert.alert('Error', 'An error ocurrer while opening file'),
    );
  };

  return (
    <View style={[styles.container]}>
      {isLoading && <GeneralLoading />}

      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton title="Resume" onPress={goBack} />
        </View>

        <View style={[styles.lateralPadding, GLOBAL_STYLES.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            WO Attachments
          </Text>
        </View>
      </View>

      <MinRoundedView />

      <View style={styles.containerSearchQueue}>
        <SearchInput value={filter} onChange={(text) => setFilter(text)} />
      </View>

      <FlatList
        style={styles.scrollNotifications}
        data={filteredList}
        renderItem={({item, index}) => (
          <TouchableOpacity
            style={styles.containerNotification}
            onPress={() => openUrl(item.url)}>
            <View style={styles.viewNotification}>
              <View style={[styles.circleNotification]}>
                <Icon
                  name={
                    item.file_type == 'PDF'
                      ? 'file-pdf'
                      : item.file_type == 'WORD'
                      ? 'file-word'
                      : item.file_type == 'EXCEL'
                      ? 'file-excel'
                      : item.file_type.includes('IMAGE')
                      ? 'file-image'
                      : 'file'
                  }
                  color={
                    item.file_type == 'PDF'
                      ? '#da0000'
                      : item.file_type == 'WORD'
                      ? '#1664C0'
                      : item.file_type == 'EXCEL'
                      ? '#007C02'
                      : item.file_type.includes('IMAGE')
                      ? '#41c3d0'
                      : '#e0e0e0'
                  }
                  type="solid"
                  size={40}
                />
              </View>
              <View style={styles.viewDescNotification}>
                <Text style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
                  {item.name}
                </Text>
                <Text style={styles.subtitleNotification}>
                  {item.size
                    ? item.size > 1000000
                      ? (item.size / 1000000).toFixed(0) + ' MB'
                      : (item.size / 1000).toFixed(0) + ' KB'
                    : 0 + ' KB'}{' '}
                  - {item.file_type}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  containerSearchQueue: {
    marginTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 0,
    height: 45,
  },
  scrollNotifications: {
    flex: 1,
    paddingTop: 10,
    marginBottom: 5,
  },
  containerNotification: {
    marginBottom: 15,
  },
  viewNotification: {
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    borderBottomColor: '#d0d0d0',
    borderBottomWidth: 1,
  },
  circleNotification: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDescNotification: {
    paddingLeft: 10,
    paddingRight: 40,
  },
  titleNotification: {
    color: '#3d424b',
    fontSize: 16,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  subtitleNotification: {
    color: '#000000',
    fontSize: 15,
    flexWrap: 'wrap',
    overflow: 'visible',
    marginTop: 2,
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
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
});
