import MinRoundedView from '@components/commons/view/MinRoundedView';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import Orientation from 'react-native-orientation-locker';
import RNPickerSelect from 'react-native-picker-select';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'TakeDimensions'>;
export const TakeDimensionsScreen = (props: Props) => {
  const [dimensions, setDimensions] = useState({
    idInventory: null,
    additional_info: '',
    packed_height: '0',
    packed_length: '0',
    packed_width: '0',
    un_packed_height: '0',
    un_packed_length: '0',
    un_packed_width: '0',
    weight: '0',
    current_packing_detail_id: '',
    current_packing_detail: '',
  });

  const {item} = props.route.params;

  const [packingDetailList, setPackingDetailList] = useState([]);

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // var item = props.route.params.item;
    // setDimensions({
    //   idInventory: item.id,
    //   additional_info: !item.additional_info ? '' : item.additional_info,
    //   packed_height: !item.packed_height ? '0' : item.packed_height,
    //   packed_length: !item.packed_length ? '0' : item.packed_length,
    //   packed_width: !item.packed_width ? '0' : item.packed_width,
    //   un_packed_height: !item.unpacked_height ? '0' : item.unpacked_height,
    //   un_packed_length: !item.unpacked_length ? '0' : item.unpacked_length,
    //   un_packed_width: !item.unpacked_width ? '0' : item.unpacked_width,
    //   weight: !item.weight ? '0' : item.weight,
    //   current_packing_detail_id: !item.current_packing_detail_id
    //     ? ''
    //     : item.current_packing_detail_id,
    //   current_packing_detail: !item.current_packing_detail
    //     ? ''
    //     : item.current_packing_detail.toUpperCase(),
    // });
    // var otherOptionPd = props.packingDetails.find(
    //   x => x.name.toUpperCase() == 'OTHER',
    // );
    // var tempPackingDetailList = props.packingDetails.filter(
    //   x => x.name.toUpperCase() != 'OTHER',
    // );
    // tempPackingDetailList.push(otherOptionPd);
    // tempPackingDetailList.forEach(element => {
    //   (element.value = element.id), (element.label = element.name);
    // });
    // setPackingDetailList(tempPackingDetailList);
  }, []);

  React.useEffect(() => {
    return () => {
      // Orientation.lockToLandscape();
      Orientation.lockToPortrait();
    };
  }, []);

  const updateItemValues = (dimensionsTemp: any) => {
    // props.route.params.updateItem({
    //   ...props.route.params.item,
    //   additional_info: dimensionsTemp.additional_info.trim(),
    //   packed_height: dimensionsTemp.packed_height.trim(),
    //   packed_length: dimensionsTemp.packed_length.trim(),
    //   packed_width: dimensionsTemp.packed_width.trim(),
    //   unpacked_height: dimensionsTemp.un_packed_height.trim(),
    //   unpacked_length: dimensionsTemp.un_packed_length.trim(),
    //   unpacked_width: dimensionsTemp.un_packed_width.trim(),
    //   weight: dimensionsTemp.weight,
    //   current_packing_detail_id: dimensionsTemp.current_packing_detail_id,
    //   current_packing_detail: dimensionsTemp.current_packing_detail,
    //   packing_details_display: dimensionsTemp.current_packing_detail,
    // });
    // props.navigation.goBack();
  };

  const updateItem = async () => {
    // Keyboard.dismiss();
    // var testDecimal = /^\d+((\.|\,)\d{1,5})?$/;
    // if (
    //   (testDecimal.test(dimensions.packed_height.trim()) ||
    //     dimensions.packed_height.trim() == '') &&
    //   (testDecimal.test(dimensions.packed_length.trim()) ||
    //     dimensions.packed_length.trim() == '') &&
    //   (testDecimal.test(dimensions.packed_width.trim()) ||
    //     dimensions.packed_width.trim() == '') &&
    //   (testDecimal.test(dimensions.un_packed_height.trim()) ||
    //     dimensions.un_packed_height.trim() == '') &&
    //   (testDecimal.test(dimensions.un_packed_length.trim()) ||
    //     dimensions.un_packed_length.trim() == '') &&
    //   (testDecimal.test(dimensions.un_packed_width.trim()) ||
    //     dimensions.un_packed_width.trim() == '') &&
    //   (testDecimal.test(dimensions.weight.trim()) ||
    //     dimensions.weight.trim() == '')
    // ) {
    //   setLoading(true);
    //   var dimensionsTemp = dimensions;
    //   dimensionsTemp.packed_height =
    //     dimensionsTemp.packed_height.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.packed_height.trim().replace(',', '.');
    //   dimensionsTemp.packed_length =
    //     dimensionsTemp.packed_length.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.packed_length.trim().replace(',', '.');
    //   dimensionsTemp.packed_width =
    //     dimensionsTemp.packed_width.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.packed_width.trim().replace(',', '.');
    //   dimensionsTemp.un_packed_height =
    //     dimensionsTemp.un_packed_height.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.un_packed_height.trim().replace(',', '.');
    //   dimensionsTemp.un_packed_length =
    //     dimensionsTemp.un_packed_length.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.un_packed_length.trim().replace(',', '.');
    //   dimensionsTemp.un_packed_width =
    //     dimensionsTemp.un_packed_width.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.un_packed_width.trim().replace(',', '.');
    //   dimensionsTemp.weight =
    //     dimensionsTemp.weight.trim() == ''
    //       ? '0'
    //       : dimensionsTemp.weight.trim().replace(',', '.');
    //   dimensionsTemp.packing_detail = dimensionsTemp.current_packing_detail_id;
    //   var tempCurrentPackingDetail = '';
    //   if (dimensionsTemp.current_packing_detail_id != '') {
    //     var tempObjectPackingDetail = packingDetailList.filter(
    //       (x) => x.id == dimensionsTemp.current_packing_detail_id,
    //     )[0];
    //     if (tempObjectPackingDetail) {
    //       tempCurrentPackingDetail = tempObjectPackingDetail.label;
    //     }
    //   }
    //   dimensionsTemp.current_packing_detail =
    //     dimensionsTemp.current_packing_detail_id == ''
    //       ? ''
    //       : tempCurrentPackingDetail;
    //   var urlRequest = 'resources/inventory/detail/update';
    //   var bodyRequest = dimensionsTemp;
    //   const isConnected = await isInternet();
    //   if (isConnected) {
    //     const response = await fetchData.Post(urlRequest, dimensionsTemp);
    //     if (response.ok) {
    //       if (response.data.message == 'SUCCESS') {
    //         updateItemValues(dimensionsTemp);
    //       } else {
    //         Toast.show('Error while saving dimensions', Toast.LONG, [
    //           'UIAlertController',
    //         ]);
    //         setLoading(false);
    //       }
    //     } else {
    //       Toast.show('Error while saving dimensions', Toast.LONG, [
    //         'UIAlertController',
    //       ]);
    //       setLoading(false);
    //     }
    //   } else {
    //     var keyName = REQUEST_TAKE_DIMENSIONS_KEY_STORAGE + props.jobDetail.id;
    //     var jsonRequest = {
    //       url: urlRequest,
    //       body: bodyRequest,
    //       time: new Date().getTime(),
    //       name: keyName,
    //       job: props.jobDetail.id,
    //       idInventory: dimensionsTemp.idInventory,
    //     };
    //     await saveToStorageOffline(keyName, JSON.stringify(jsonRequest));
    //     updateItemValues(dimensionsTemp);
    //   }
    // } else {
    //   Toast.show('Please, enter valid values for dimensions', Toast.LONG, [
    //     'UIAlertController',
    //   ]);
    // }
  };

  return (
    <View style={[styles.container]}>
      {loading && (
        <View style={GLOBAL_STYLES.backgroundLoading}>
          <ActivityIndicator size="large" color={'#487EFD'} />
        </View>
      )}

      <View style={[GLOBAL_STYLES.bgwhite, GLOBAL_STYLES.containerBtnOptTop]}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <View style={styles.backBtn}>
            <Icon name="chevron-left" color="#959595" type="light" size={15} />
            <Text style={styles.backBtnText}>Inventory detail</Text>
          </View>
        </TouchableOpacity>

        <View style={[GLOBAL_STYLES.lateralPadding, styles.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, {fontSize: 20}]}>
            Take dimensions
          </Text>
        </View>

        <View style={{width: '10%'}}></View>
      </View>

      <MinRoundedView />

      <ScrollView style={{marginTop: 10}} keyboardShouldPersistTaps="handled">
        <View style={{paddingLeft: 30, paddingRight: 30}}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
              alignItems: 'center',
            }}>
            <Text style={styles.boldTextLg}>Dimensions</Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{width: '48%'}}>
              <View style={[styles.row, styles.containerSubtitle]}>
                <Text style={styles.normalText}>Unpacked</Text>
              </View>

              <View
                style={[
                  styles.containerItemDetail,
                  {alignContent: 'center', alignItems: 'center'},
                ]}>
                <Text>Height</Text>
                <TextInput
                  value={dimensions.un_packed_height}
                  maxLength={10}
                  multiline={true}
                  numberOfLines={1}
                  onChangeText={(text) =>
                    setDimensions({...dimensions, un_packed_height: text})
                  }
                  style={[styles.inputDimensions]}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.containerItemDetail]}>
                <Text>Length</Text>
                <TextInput
                  value={dimensions.un_packed_length}
                  maxLength={10}
                  multiline={true}
                  numberOfLines={1}
                  onChangeText={(text) =>
                    setDimensions({...dimensions, un_packed_length: text})
                  }
                  style={styles.inputDimensions}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.containerItemDetail]}>
                <Text>Width</Text>
                <TextInput
                  value={dimensions.un_packed_width}
                  maxLength={10}
                  multiline={true}
                  numberOfLines={1}
                  onChangeText={(text) =>
                    setDimensions({...dimensions, un_packed_width: text})
                  }
                  style={styles.inputDimensions}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{width: '48%'}}>
              <View style={[styles.row, styles.containerSubtitle]}>
                <Text style={styles.normalText}>Packed</Text>
              </View>

              <View style={[styles.containerItemDetail]}>
                <Text>Height</Text>
                <TextInput
                  value={dimensions.packed_height}
                  maxLength={10}
                  multiline={true}
                  numberOfLines={1}
                  onChangeText={(text) =>
                    setDimensions({...dimensions, packed_height: text})
                  }
                  style={styles.inputDimensions}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.containerItemDetail]}>
                <Text>Length</Text>
                <TextInput
                  value={dimensions.packed_length}
                  maxLength={10}
                  multiline={true}
                  numberOfLines={1}
                  onChangeText={(text) =>
                    setDimensions({...dimensions, packed_length: text})
                  }
                  style={styles.inputDimensions}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.containerItemDetail]}>
                <Text>Width</Text>
                <TextInput
                  value={dimensions.packed_width}
                  maxLength={10}
                  multiline={true}
                  numberOfLines={1}
                  onChangeText={(text) =>
                    setDimensions({...dimensions, packed_width: text})
                  }
                  style={styles.inputDimensions}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={[{alignItems: 'flex-start'}]}>
            <View
              style={{
                marginTop: 5,
                borderTopWidth: 1,
                borderColor: '#F7F5F4',
                width: '100%',
              }}>
              <View style={{width: '48%'}}>
                <View style={[styles.containerItemDetail]}>
                  <Text>Weight</Text>
                  <TextInput
                    value={dimensions.weight}
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    onChangeText={(text) =>
                      setDimensions({...dimensions, weight: text})
                    }
                    style={styles.inputDimensions}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View
              style={{
                marginTop: 10,
                borderTopWidth: 1,
                borderColor: '#F7F5F4',
                width: '100%',
              }}>
              <View style={[styles.containerItemDetailAdditionalInfo]}>
                <Text>Additional info</Text>
              </View>
              <View style={{marginTop: 10}}>
                <TextInput
                  value={dimensions.additional_info}
                  multiline={true}
                  numberOfLines={1}
                  placeholder="(Optional)"
                  placeholderTextColor="#d0d0d0"
                  onChangeText={(text) =>
                    setDimensions({...dimensions, additional_info: text})
                  }
                  style={styles.inputAdditionalInfo}
                />
              </View>
            </View>

            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                borderTopWidth: 1,
                borderColor: '#F7F5F4',
                width: '100%',
              }}>
              <View style={[styles.containerItemDetailAdditionalInfo]}>
                <Text>Packing detail</Text>
              </View>

              <View style={{marginTop: 10}}>
                {/* <RNPickerSelect
                  key={(index) => index.toString()}
                  items={packingDetailList}
                  onValueChange={(value) =>
                    setDimensions({
                      ...dimensions,
                      current_packing_detail_id: value,
                    })
                  }
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
                  value={dimensions.current_packing_detail_id}
                  useNativeAndroidPickerStyle={false}
                  textInputProps={{}}
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
                /> */}
              </View>
            </View>
          </View>

          <View style={{marginTop: 20, marginBottom: 20}}>
            <TouchableOpacity
              style={styles.btnSaveInfo}
              onPress={() => updateItem()}>
              <Icon name="save" type="solid" size={14} color="white" />
              <Text style={styles.textSaveInfo}>Save info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* {Platform.OS == 'ios' && <KeyboardSpacer />} */}
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
    borderRadius: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerItemDetailAdditionalInfo: {
    borderRadius: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
  },
  normalText: {
    fontSize: 14,
    color: '#3C424A',
  },
  boldTextLg: {
    fontSize: 16,
    color: '#3C424A',
    fontWeight: 'bold',
  },
  titleCentered: {
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
  },
  containerSubtitle: {
    borderBottomWidth: 1,
    paddingBottom: 5,
    borderBottomColor: '#F7F5F4',
  },
  inputDimensions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EFF0F2',
    borderRadius: 10,
    width: 90,
    height: 43,
    textAlign: 'center',
    color: 'gray',
    paddingTop: 10,
  },
  inputAdditionalInfo: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EFF0F2',
    borderRadius: 10,
    height: 58,
    paddingLeft: 10,
    color: 'gray',
  },
  btnSaveInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: 250,
    backgroundColor: '#1155CC',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  textSaveInfo: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    // color: 'black',
    paddingRight: 15, // to ensure the text is never behind the icon
    width: '100%',
    height: 40,
    color: '#3C424A',
    opacity: 0.53,
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    // color: 'black',
    paddingRight: 15, // to ensure the text is never behind the icon
    width: '100%',
    height: 40,
    color: '#3C424A',
    opacity: 0.53,
    backgroundColor: 'white',
  },
});
