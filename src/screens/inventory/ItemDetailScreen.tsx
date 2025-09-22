import {useCallback, useEffect} from 'react';
import {
  BackHandler,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {lockToPortrait} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {COLORS} from '@styles/colors';
import TaskOne from '@components/inventory/TaskOne';
import useTopSheetStore from '@store/topsheet';
import {
  useDeleteItem,
  useGetInventoryItemDetail,
} from '@api/hooks/HooksInventoryServices';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  RootStackParamList,
  RoutesNavigation,
  TopSheetRoutesNavigation,
} from '@navigation/types';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {ButtonSyncro} from '@components/commons/syncro/ButtonSyncro';
import {JobInventoryType} from '@api/types/Inventory';
import CustomDropdown from '@components/commons/menu/CustomDropdown';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {BackButton} from '@components/commons/buttons/BackButton';
import {useModalDialogStore} from '@store/modals';
import {loadingWrapperPromise} from '@store/actions';

var itemLoaded = false;

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetail'>;
export const ItemDetailScreen = (props: Props) => {
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const isJobQueue = useTopSheetStore((d) => d.isJobQueue);
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {goBack, navigate, goBackToIndex} = useCustomNavigation();

  const {mutateAsync: deleteItemAsync} = useDeleteItem();

  const {id, fromInventory, isNS} = props.route.params;

  const {
    data: currentItem,
    isLoading,
    isRefetching,
    refetch,
  } = useGetInventoryItemDetail({
    id,
  });
  useEffect(() => {
    lockToPortrait();
    // async function init() {
    //   Orientation.lockToPortrait();
    //   setItemDetail(props.route.params.itemDetail);
    //   start = '0';
    //   getItemDetail();
    // }
    // init();
  }, []);

  const goToBack = useCallback(() => {
    if (!isNS) {
      goBack();
    } else {
      goBackToIndex(2);
    }
    return true;
    // if (props.route.params.nsItem) {
    //   props.navigation.pop(2);
    // } else {
    //   props.navigation.goBack();
    // }
    // return true; // <- ¡esto es crucial!
    // }, [props.navigation, props.route.params]);
  }, [goBack]);

  // useFocusEffect(
  useCallback(() => {
    BackHandler.addEventListener('hardwareBackPress', goToBack);
    return () =>
      // @ts-ignore
      BackHandler.removeEventListener('hardwareBackPress', goToBack);
  }, [goToBack]);

  const navigateToParent = () => {
    // hideReportPick();
    // let mItemInventory;
    // if (props.inventory) {
    //   mItemInventory = props.inventory.data?.find(
    //     (x) => x.id == itemDetail.parent_id,
    //   );
    // }
    // const screen = 'ItemDetail';
    // props.navigation.navigate({
    //   name: screen,
    //   key: `${screen}-parent-${itemDetail.parent}`,
    //   params: {
    //     itemDetail: mItemInventory
    //       ? mItemInventory
    //       : {id: itemDetail.parent_id},
    //     goToTasks: props.route.params.goToTasks,
    //     fromtopsheet: props.route.params.fromtopsheet,
    //     parent: true,
    //   },
    // });
  };

  const updateItemDetail = async (item: JobInventoryType) => {
    // setItemDetail(item);
    // if (!props.route.params.fromtopsheet) {
    //   var tempInventoryArray = {...props.inventory};
    //   var mItemInventory = tempInventoryArray.data?.filter(
    //     (x) => x.id == item.id,
    //   )[0];
    //   if (mItemInventory) {
    //     var mIndex = tempInventoryArray.data.findIndex((x) => x.id == item.id);
    //     tempInventoryArray.data[mIndex] = {...item};
    //     props.dispatch(InventoryActions.copy(tempInventoryArray));
    //   }
    // }
    // var stringTempInventory = await getFromStorageOffline(
    //   INVENTORY_KEY_STORAGE + props.jobDetail.id,
    // );
    // if (stringTempInventory) {
    //   var tempInventoryArray = JSON.parse(stringTempInventory);
    //   var mItemInventory = tempInventoryArray.data?.filter(
    //     (x) => x.id == item.id,
    //   )[0];
    //   if (mItemInventory) {
    //     var mIndex = tempInventoryArray.data.findIndex((x) => x.id == item.id);
    //     tempInventoryArray.data[mIndex] = {...item};
    //     props.dispatch(InventoryActions.copy(tempInventoryArray));
    //     await saveToStorageOffline(
    //       INVENTORY_KEY_STORAGE + props.jobDetail.id,
    //       JSON.stringify(tempInventoryArray),
    //     );
    //   }
    // }
    // var tempResumeInventoryArray = {...props.inventoryResume};
    // var mItemInventoryResume = tempResumeInventoryArray.data?.filter(
    //   (x) => x.id == item.id,
    // )[0];
    // if (mItemInventoryResume) {
    //   var mIndex = tempResumeInventoryArray.data.findIndex(
    //     (x) => x.id == item.id,
    //   );
    //   tempResumeInventoryArray.data[mIndex] = {...item};
    //   props.dispatch(InventoryActions.copyResume(tempResumeInventoryArray));
    // }
    // var stringTempInventoryResume = await getFromStorageOffline(
    //   RESUME_INVENTORY_KEY_STORAGE + props.jobDetail.id,
    // );
    // if (stringTempInventoryResume) {
    //   var tempInventoryArray = JSON.parse(stringTempInventoryResume);
    //   var mItemInventory = tempInventoryArray.data?.filter(
    //     (x) => x.id == item.id,
    //   )[0];
    //   if (mItemInventory) {
    //     var mIndex = tempInventoryArray.data.findIndex((x) => x.id == item.id);
    //     tempInventoryArray.data[mIndex] = {...item};
    //     props.dispatch(InventoryActions.copy(tempInventoryArray));
    //     await saveToStorageOffline(
    //       RESUME_INVENTORY_KEY_STORAGE + props.jobDetail.id,
    //       JSON.stringify(tempInventoryArray),
    //     );
    //   }
    // }
  };

  type RowItemDetailProps = {
    title: string;
    description?: string;
    hideBorder?: boolean;
  };
  const rowItemDetail = useCallback(
    ({title, description, hideBorder}: RowItemDetailProps) => {
      return (
        <View
          style={[
            styles.row,
            styles.rowItemDetail,
            {borderBottomWidth: hideBorder ? 0 : 0.3},
          ]}>
          <View style={styles.leftColumn}>
            <Text style={[styles.lightText, styles.minVerticalPadding]}>
              {title ? title : 'N/A'}
            </Text>
          </View>
          <View style={styles.rightColumn}>
            <Text style={styles.normalText}>
              {description ? description : 'N/A'}
            </Text>
          </View>
        </View>
      );
    },
    [],
  );

  const goToTasks = useCallback(() => {
    if (jobDetail) {
      if (fromInventory) {
        goBackToIndex(1);
      }
      goBack();
      navigate(RoutesNavigation.Topsheet, {
        id: jobDetail?.id?.toString(),
        queue: isJobQueue,
        screen: TopSheetRoutesNavigation.Tasks.name,
      } as never);
    }
  }, [fromInventory, goBackToIndex, goBack, navigate, isJobQueue, jobDetail]);

  // const goToTasks = async () => {
  // props.route.params.goToTasks();
  // if (props.route.params.parent) {
  //   props.navigation.goBack();
  // }
  // if (props.route.params.fromtopsheet) {
  //   props.navigation.goBack();
  // } else {
  //   props.navigation.pop(2);
  // }
  // Orientation.lockToPortrait();
  // };

  const goToNetsuite = (url?: string) => {
    if (url && url != '') {
      try {
        Linking.openURL(url);
      } catch (error) {
        showToastMessage('Could not open URL');
      }
    } else {
      showErrorToastMessage('Invalid URL');
    }
  };

  const deleteItem = async () => {
    if (id) {
      showDialog({
        modalVisible: true,
        cancelable: true,
        type: 'warning',
        message: 'Are you sure you want to remove this item?',
        onConfirm: () => {
          loadingWrapperPromise(
            deleteItemAsync({
              id,
            })
              .then((d) => {
                if (d) {
                  showToastMessage('Item removed successfully');
                  goToBack();
                } else {
                  showErrorToastMessage('An error occurred while adding item');
                }
              })
              .catch(() => {
                showErrorToastMessage('An error occurred while adding item');
              }),
          );
        },
      });
    }
  };

  const onInitTakeDimensions = useCallback(() => {
    if (currentItem)
      navigate(RoutesNavigation.TakeDimensions, {
        item: currentItem,
      });
  }, [currentItem]);

  const onInitConditionReport = useCallback(() => {
    navigate(RoutesNavigation.ConditionReport, {
      item: currentItem,
    });
  }, [navigate, currentItem]);

  const onInitConditionCheck = useCallback(() => {
    navigate(RoutesNavigation.ConditionCheck, {
      item: currentItem,
    });
  }, [navigate, currentItem]);

  return (
    <View style={[styles.container]}>
      {isLoading && <GeneralLoading />}

      <View
        style={[{backgroundColor: 'white'}, GLOBAL_STYLES.containerBtnOptTop]}>
        {/* <TouchableOpacity onPress={goToBack}>
          <View style={styles.backBtn}>
            <Icon name="chevron-left" color="#959595" type="light" size={15} />
            <Text style={styles.backBtnText}>
              {props.route.params.nsItem || props.route.params.parent
                  ? 'Back'
                  : props.route.params.fromtopsheet
                  ? 'Tasks'
                  : 'Inventory'}
            </Text>
          </View>
        </TouchableOpacity> */}
        <BackButton
          title={fromInventory ? 'Inventory' : isNS ? 'Back' : 'Tasks'}
          onPress={goToBack}
        />

        <View style={[GLOBAL_STYLES.lateralPadding, styles.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, {fontSize: 20}]}>
            Inventory Detail
          </Text>
        </View>

        <View style={{flexDirection: 'row', width: 40}}>
          <ButtonSyncro isRefetching={isRefetching} onPress={refetch} />
        </View>
      </View>

      <MinRoundedView />

      <ScrollView style={{marginTop: 10}}>
        <View style={{paddingHorizontal: 10}}>
          <View style={[styles.containerItemDetail]}>
            {rowItemDetail({
              title: 'ID',
              description: currentItem?.clientinv,
            })}
            {rowItemDetail({
              title: 'Client Ref ID',
              description: currentItem?.clientref,
            })}
            {rowItemDetail({
              title: 'Location',
              description: currentItem?.fromlocation_display,
            })}

            {rowItemDetail({
              title: 'Dimensions',
              description: `${currentItem?.packed_height} x ${currentItem?.packed_length} x ${currentItem?.packed_width}`,
            })}

            {rowItemDetail({
              title: 'Title',
              description: currentItem?.clientinv_display,
            })}

            {rowItemDetail({
              title: 'Artist',
              description:
                !!currentItem?.artist && currentItem?.artist != 'null'
                  ? currentItem?.artist
                  : '',
            })}

            {rowItemDetail({
              title: 'Packing detail',
              description: currentItem?.packing_details_display,
            })}

            {rowItemDetail({
              title: 'Art type',
              description: currentItem?.art_type,
            })}

            {rowItemDetail({
              title: 'Additional info',
              description: currentItem?.additional_info,
            })}

            {rowItemDetail({
              title: 'Weight',
              description: currentItem?.weight,
            })}

            <View
              style={[
                styles.row,
                styles.rowItemDetail,
                {borderBottomWidth: 0},
              ]}>
              <View style={styles.leftColumn}>
                <Text style={[styles.lightText, styles.minVerticalPadding]}>
                  Parent
                </Text>
              </View>
              <View style={styles.rightColumn}>
                {currentItem?.parent ? (
                  currentItem?.parent_id ? (
                    // Parent on WO
                    <TouchableOpacity onPress={() => navigateToParent()}>
                      <Text
                        style={[
                          styles.normalText,
                          {
                            color: COLORS.primary,
                            textDecorationLine: 'underline',
                          },
                        ]}>
                        {currentItem?.parent}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // Parent not on WO
                    <Text style={[styles.normalText]}>
                      {currentItem?.parent} (Parent not on WO)
                    </Text>
                  )
                ) : (
                  <Text style={styles.normalText}>N/A</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={{marginTop: 15, paddingHorizontal: 10}}>
          <TaskOne
            name="Take dimensions"
            icon="ruler"
            color="#3ABD6C"
            light={true}
            onPress={onInitTakeDimensions}
            // offline={[TAKE_DIMENSION_OFFLINE_VALIDATION]}
            // idJob={props.jobDetail.id}
            // idInventory={props.route.params.itemDetail.id}
          />

          <CustomDropdown
            button={
              <TaskOne
                name="Reports"
                icon="clipboard-list"
                color="#E9DC18"
                light={true}
                pointerEvents="none"
              />
            }>
            {({close}) => (
              <View style={[styles.modalRp]}>
                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor="#DDDDDD"
                  style={[
                    styles.containerOptionPickReport,
                    styles.borderBottom,
                  ]}
                  onPress={() => {
                    close();
                    onInitConditionReport();
                  }}>
                  <Text style={[styles.optionReport]}>Condition Report</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor="#DDDDDD"
                  style={[styles.containerOptionPickReport]}
                  onPress={() => {
                    close();
                    onInitConditionCheck();
                  }}>
                  <Text style={[styles.optionReport]}>Condition Check</Text>
                </TouchableHighlight>
              </View>
            )}
          </CustomDropdown>

          <TaskOne
            name="Tasks"
            icon="file-invoice"
            color="#eb5d22"
            light={true}
            onPress={() => goToTasks()}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 5,
              marginBottom: 20,
            }}>
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.row,
                styles.btnGoToNetsuite,
                {alignSelf: 'flex-start', marginTop: 10, width: '50%'},
              ]}
              onPress={() => goToNetsuite(currentItem?.url)}>
              <Text style={{color: 'white', fontSize: 13, marginRight: 10}}>
                Go to Netsuite
              </Text>
              <Icon name="globe-americas" size={17} color="white" />
            </TouchableOpacity>
            {true && (
              <TouchableOpacity
                style={[
                  GLOBAL_STYLES.row,
                  styles.btnDeleteItem,
                  {alignSelf: 'flex-start', marginTop: 10, width: '50%'},
                ]}
                onPress={deleteItem}>
                <Text style={{color: 'white', fontSize: 13, marginRight: 10}}>
                  Remove
                </Text>
                <Icon name="trash-alt" size={17} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  containerItemDetail: {
    backgroundColor: 'white',
    borderWidth: 0.3,
    borderColor: '#dcdcdc',
    padding: 10,
    borderRadius: 20,
  },
  rowItemDetail: {
    borderBottomWidth: 0.3,
    borderBottomColor: '#ececec',
  },
  leftColumn: {
    paddingVertical: 5,
    width: '30%',
    paddingLeft: 0,
    alignSelf: 'center',
    alignItems: 'flex-start',
    borderEndWidth: 0.3,
    borderEndColor: '#ececec',
    justifyContent: 'center',
  },
  rightColumn: {
    paddingVertical: 5,
    width: '65%',
    paddingLeft: 5,
  },
  minVerticalPadding: {
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingHorizontal: 5,
    height: 40,
    alignItems: 'center',
  },
  lightText: {
    opacity: 0.8,
    fontWeight: 'bold',
    color: '#3C424A',
    fontSize: 13,
    textAlign: 'right',
  },
  normalText: {
    color: '#3C424A',
    fontSize: 13,
    fontWeight: '400',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#3C424A',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    borderLeftColor: 'transparent',
  },
  modalRp: {
    width: '100%',
    backgroundColor: 'white',
    height: 95,
    borderRadius: 15,
    paddingBottom: 25,
  },
  containerOptionPickReport: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 50,
    alignContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
  },
  optionReport: {
    color: '#3C424A',
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  /*btnGoToNetsuite: {
        justifyContent: "space-between", width: "55%", backgroundColor: "#1155cc", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 10, alignSelf: "center"
    },*/
  btnGoToNetsuite: {
    justifyContent: 'space-between',
    backgroundColor: '#1155cc',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnDeleteItem: {
    justifyContent: 'space-between',
    backgroundColor: '#FF6C6C',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalClockOut: {
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 20,
  },
  bodyModalClockOut: {
    padding: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleModalClockOut: {
    color: '#000000',
    marginBottom: 10,
    fontSize: 19,
    textAlign: 'center',
  },
  containerOptionsModalClockOut: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  optionModalClockOut: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  btnOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    justifyContent: 'center',
    backgroundColor: '#1155CC',
    height: 33,
    width: 100,

    shadowColor: '#1155CC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.7,
    shadowRadius: 6.14,
    elevation: 10,
  },
});
