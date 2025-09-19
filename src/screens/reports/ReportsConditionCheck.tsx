import {ReportResumeType} from '@api/types/Inventory';
import ReportItemList from '@components/reports/ReportItemList';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import useReportStore from '@store/reports';
import {useCallback, useEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

export const ReportsConditionCheck = () => {
  const {navigate} = useCustomNavigation();
  const list = useReportStore((d) => d.conditionCheckList);

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
      navigate(RoutesNavigation.ConditionCheck, {
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
