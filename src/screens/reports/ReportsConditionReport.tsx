import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  Keyboard,
} from 'react-native';
import Icon, {configureFontAwesomePro} from 'react-native-fontawesome-pro';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Toast from 'react-native-simple-toast';
import Modal from 'react-native-modal';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import ReportItemList from '@components/reports/ReportItemList';
import useReportStore from '@store/reports';

export const ReportsConditionReport = () => {
//   const [loading, setLoading] = useState(true);
  //   const [list, setList] = useState([]);
  const [fullList, setfullList] = useState([]);
  const [filter, setfilter] = useState('');

  const list = useReportStore((d) => d.conditionReportList);

  useEffect(() => {
    // setList(props.list);
    // setfullList(props.list);
    // setLoading(false);

    // const mmsubscribe = props.navigation.addListener('state', (e) => {
    //   if (e != undefined) {
    //     if (
    //       e.data.state.index &&
    //       e.data.state.routes &&
    //       e.data.state.routes.length > 2 &&
    //       e.data.state.routes[2].state
    //     ) {
    //       props.changeIndex(e.data.state.routes[2].state.index);
    //     }
    //   }
    // });
  }, []);

  //   useEffect(() => {
  //     return () => {
  //       props.navigation.removeListener('state');
  //     };
  //   }, []);

  const initEdit = (item: any) => {
    // navigate('ConditionReport', {
    //   fromReports: true,
    //   refresh: props.refresh,
    //   condition: item,
    // });
  };

  return (
    <View style={[styles.container]}>
      {/* {loading && <GeneralLoading />} */}

      {/* <MinRoundedView /> */}

      <ScrollView style={styles.scrollNotifications}>
        {list?.map((item, index) => {
          return (
            <ReportItemList
              key={index}
              id={item.id_inventory}
              name={item.name}
              clientRef={item.client_ref}
              partial={item.partial}
              onEdit={() => initEdit(item)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flex: 1,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  scrollNotifications: {
    flex: 1,
    paddingTop: 10,
    marginBottom: 5,
  },
});
