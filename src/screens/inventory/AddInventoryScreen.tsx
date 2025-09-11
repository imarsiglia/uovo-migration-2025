import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Icon, { configureFontAwesomePro } from 'react-native-fontawesome-pro';
import Modal from 'react-native-modal';
import Orientation from 'react-native-orientation-locker';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import HeaderInventoryAdd from '../components/headerInventoryAdd';
import RowInventoryAdd from '../components/rowInventoryAdd';
import mstyles from '../styles/styles';
import { fetchData } from '../utils/fetch';
import { isInternet } from '../utils/internet';

export const AddInventoryScreen = () => {
  //const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [clearOrder, setClearOrder] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [showModal, setShowModal] = useState(false);

  //ADD ITEM FILTER
  const [addItemFilter, setaddItemFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const [creteriaFilter, setCreteriaFilter] = useState('');

  const [query, setQuery] = useState('');
  const [item, setItem] = useState({});
  const [items, setItems] = useState([]);
  const [renderTable, setRenderTable] = useState(false);
  const [hideResultList, setHideResultList] = useState(false);

  const ListItems = [
    {label: 'ID', value: 'id'},
    {label: 'Client Ref ID', value: 'ref'},
    {label: 'Title', value: 'title'},
    {label: 'Artist name', value: 'artist'},
  ];

  const {width, height} = Dimensions.get('window');

  useEffect(() => {
    Orientation.lockToLandscape();
    //addItemFilter(false);
  }, []);

  useEffect(() => {
    return () => {
      props.route.params.refreshResume(false, true);
    };
  }, []);

  const orderBy = (orderType, filterType) => {
    // console.log("order by");
  };

  const onCheckAll = () => {
    // console.log("on check all");
  };

  const fData = () => {
    // console.log("on refresh");
  };

  const onCheckItem = (id, index) => {};

  const agregarItem = async () => {
    Keyboard.dismiss();
    setShowModal(false);
    setLoading(true);
    const response = await fetchData.Post('resources/inventory/netsuite/add', {
      idInventory: selectedId,
      idJob: props.jobDetail.id,
    });
    if (response.ok) {
      if (response.data.message === 'SUCCESS') {
        setLoading(false);
        props.navigation.goBack();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
      Toast.show('An error occurred while adding item', Toast.LONG, [
        'UIAlertController',
      ]);
    }
  };

  const addItemSearch = async () => {
    Keyboard.dismiss();
    const isConnected = await isInternet();
    if (isConnected) {
      setLoading(true);
      const response = await fetchData.Get(
        'resources/inventory/netsuite/search?idjob=' +
          props.jobDetail.id +
          '&filter=' +
          query +
          '&type=' +
          creteriaFilter.trim(),
      );

      if (response.ok) {
        if (response.data.message === 'SUCCESS') {
          setInventoryList(response.data.body.data);
          // console.log("RESPONSE");
          // console.log(JSON.stringify(response.data));
          setLoading(false);
        } else {
          setLoading(false);
          Toast.show('An error occurred while loading inventory', Toast.LONG, [
            'UIAlertController',
          ]);
          // console.log("SERVIDOR NO DISPONIBLE")
        }
      } else {
        setLoading(false);
        Toast.show('An error occurred while loading inventory', Toast.LONG, [
          'UIAlertController',
        ]);
        // console.log("SERVIDOR NO DISPONIBLE 2")
      }
    } else {
      Toast.show('Check your internet connection', Toast.LONG, [
        'UIAlertController',
      ]);
    }
    setRenderTable(true);
    setHideResultList(true);
  };

  const filter = async query => {
    if (query.length < 1) {
      setTimeout(function () {
        setItems([]);
      }, 500);
      return;
    }
    //const response = await fetchData.Get("resources/user/load/employee?query=" + query);
    const response = await fetchData.Get(
      'resources/inventory/netsuite/search/autocomplete?idjob=' +
        props.jobDetail.id +
        '&filter=' +
        query +
        '&type=' +
        creteriaFilter.trim(),
    );
    // console.log(props.jobDetail.id);
    // console.log(query)
    // console.log(creteriaFilter)
    // console.log(response)
    if (response.ok) {
      if (response.data.message == 'SUCCESS') {
        setItems(response.data.body.data);
        // console.log(response.data.body.data)
      }
    }
  };

  const selectItem = id => {
    setSelectedId(id);
    setShowModal(true);
  };

  const checkItem = text => {
    setQuery(text);
    if (text.trim().length > 2) {
      filter(text.trim());
    }
    setHideResultList(false);
    setRenderTable(false);
  };

  const selectItemList = item => {
    //var sublist = items.filter(x => x.toUpperCase() == item.toUpperCase());
    // console.log(items);
    //setItems(sublist);
    setItem(item);
    setQuery(item);
    setRenderTable(true);
    setHideResultList(true);
  };

  const onBlurItem = () => {
    setQuery(item.name ? item.name : '');
    setItems([]);
  };

  const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

  return (
    <SafeAreaView style={mstyles.safeAreaLight}>
      <View>
        <View style={[styles.container]}>
          {loading && (
            <View style={mstyles.backgroundLoading}>
              <ActivityIndicator size="large" color={'#487EFD'} />
            </View>
          )}

          <View
            style={[mstyles.containerBtnOptTop, {backgroundColor: 'white'}]}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <View style={styles.backBtn}>
                <Icon
                  name="chevron-left"
                  color="#959595"
                  type="light"
                  size={15}
                />
                <Text style={styles.backBtnText}>Back</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.lateralPadding]}>
              <Text style={[mstyles.title, mstyles.bold, styles.topsheet]}>
                New Item
              </Text>
            </View>

            <View style={[styles.lateralPadding, {width: 50}]}></View>
          </View>

          <MinRoundedView />

          <View
            style={{
              marginTop: 30,
              height: 45,
              display: 'flex',
              flexDirection: 'row',
              marginLeft: 10,
            }}>
            <View style={{width: '30%', marginRight: 10}}>
              <RNPickerSelect
                items={ListItems}
                value={creteriaFilter}
                onValueChange={value => setCreteriaFilter(value)}
                style={{
                  ...pickerSelectStyles,
                  iconContainer: {
                    top: 13,
                    right: 10,
                  },
                }}
                placeholder={{
                  label: 'Select an option',
                  value: '',
                }}
                fixAndroidTouchableBug={Platform.OS == 'android'}
                useNativeAndroidPickerStyle={false}
                textInputProps={{}}
                key={value => value.toString()}
                Icon={() => {
                  return (
                    <Icon
                      name="angle-down"
                      size={16}
                      color="#959595"
                      style={{}}
                    />
                  );
                }}
              />
            </View>

            <View style={{width: '63%', marginRight: 10, position: 'relative'}}>
              <Autocomplete
                clearButtonMode="while-editing"
                onBlur={() => onBlurItem()}
                defaultValue={query}
                data={items}
                scrollEnabled={true}
                disableFullscreenUI={false}
                onChangeText={(text) => checkItem(text)}
                hideResults={hideResultList}
                listStyle={styles.autocompleteList}
                placeholder="Search an item"
                placeholderTextColor="#d0d0d0"
                inputContainerStyle={styles.inputSearch}
                style={mstyles.autocompleteText}
                renderItem={({item, i}) => (
                  <TouchableHighlight
                    key={i}
                    onPress={() => selectItemList(item)}
                    underlayColor="#d0d0d0"
                    style={{height: 30, justifyContent: 'center'}}>
                    <Text numberOfLines={1}>{item}</Text>
                  </TouchableHighlight>
                )}
                flatListProps={{
                  keyboardShouldPersistTaps: 'always',
                  
                }}
              />
            </View>
            <View style={{width: '7%'}}>
              <TouchableOpacity
                style={mstyles.containerInputSearchIcon}
                onPress={() => addItemSearch()}>
                <Icon name="search" size={16} color="#959595" />
              </TouchableOpacity>
            </View>
          </View>

          {renderTable && (
            <View style={[styles.containerTable]}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{width: '100%'}}
                style={[
                  styles.table,
                  {elevation: 0.5, borderRadius: 12, borderColor: '#d0d0d0'},
                ]}>
                <View style={[mstyles.alignItems, styles.containerList]}>
                  <HeaderInventoryAdd
                    sortBy={orderBy.bind(this)}
                    clearOrder={clearOrder}
                    setClearOrder={setClearOrder.bind(this)}
                    showCheck={
                      inventoryList != null ? inventoryList.length > 0 : false
                    }
                    checked={false}
                    onCheckAll={onCheckAll.bind(this)}
                    orderFilter={orderFilter}
                    orderByGlobal={orderType}
                  />

                  {
                    <FlatList
                      style={styles.rowInventoryContainer}
                      contentContainerStyle={{
                        width: '100%',
                        backgroundColor: 'white',
                        borderBottomStartRadius: 12,
                        borderBottomEndRadius: 12,
                        overflow: 'hidden',
                      }}
                      data={inventoryList}
                      renderItem={({item, index}) => (
                        <RowInventoryAdd
                          key={index}
                          item={item}
                          checked={false}
                          onAddItem={() => selectItem(item.inventory_id)}
                        />
                      )}
                      keyExtractor={(item, index) => index.toString()}
                      onRefresh={fData}
                      refreshing={loadingInventory}
                    />
                  }
                </View>
              </ScrollView>
            </View>
          )}
        </View>
        <Modal
          deviceWidth={Platform.OS == 'android' ? width : null}
          isVisible={showModal}
          style={{width: '100%'}}
          backdropOpacity={0.7}>
          <View style={[styles.modalClockOut]}>
            <View style={styles.bodyModalClockOut}>
              <Text style={styles.titleModalClockOut}>
                Do you want to add this item to inventory?
              </Text>
            </View>

            <View style={[styles.containerOptionsModalClockOut]}>
              <TouchableOpacity
                onPress={() => agregarItem()}
                style={[styles.btnOption, {marginRight: 20}]}>
                <Text style={styles.optionModalClockOut}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.btnOption]}>
                <Text style={[styles.optionModalClockOut]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {loading && (
          <View style={mstyles.backgroundLoading}>
            <ActivityIndicator size="large" color={'#487EFD'} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 0.3,
    borderColor: '#959595',
    borderRadius: 8,
    // color: 'black',
    paddingRight: 15, // to ensure the text is never behind the icon
    width: '100%',
    height: 40,
    color: '#3C424A',
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 0.3,
    borderColor: '#959595',
    borderRadius: 8,
    // color: 'black',
    paddingRight: 15, // to ensure the text is never behind the icon
    width: '100%',
    height: 40,
    color: '#3C424A',
    backgroundColor: 'white',
  },
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#1155cc',
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
  title: {
    color: '#3C424A',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 17,
    fontWeight: 'bold',
  },
  inputText: {
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#959595',
    color: '#3C424A',
    opacity: 0.7,
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  containerTable: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 20,
    //paddingBottom: 10,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30.14,

    elevation: 5,
  },
  table: {
    backgroundColor: 'transparent',
  },
  rowInventoryContainer: {
    overflow: 'hidden',
    shadowColor: 'gray',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20.14,
    elevation: 10,
  },
  modalClockOut: {
    borderRadius: 20,
    width: 400,
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
  },
  optionModalClockOut: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  containerOptionsModalClockOut: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
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
  containerList: {
    backgroundColor: 'white',
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    borderBottomStartRadius: 12,
    borderBottomEndRadius: 12,
    borderWidth: 0.3,
    borderColor: '#d0d0d0',
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  inputSearch: {
    borderColor: '#959595',
    borderRadius: 10,
    borderWidth: 0.3,
    backgroundColor: 'white',
    padding: 10,
    paddingBottom: 0,
    paddingTop: 0,
    height: 40,
    justifyContent: 'center',
  },
  autocompleteList: {
    marginLeft: 0,
    marginRight: 0,
    borderColor: '#d0d0d0',
    maxHeight: 170,
  },
});