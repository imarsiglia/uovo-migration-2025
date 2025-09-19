import React, {useCallback, useEffect, useState} from 'react';
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
import {ReportResumeType} from '@api/types/Inventory';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';

export const ReportsConditionReport = () => {
  const {navigate} = useCustomNavigation();
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

  const initEdit = useCallback(
    (item: ReportResumeType) => {
      navigate(RoutesNavigation.ConditionReport, {
        fromReports: true,
        report: item,
      });
    },
    [navigate],
  );

  return (
    <View style={[styles.container]}>
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
