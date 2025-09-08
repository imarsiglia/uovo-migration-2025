import {useGetReportMaterialsInventory} from '@api/hooks/HooksTaskServices';
import {IdReportMaterialType} from '@api/types/Task';
import {CustomAutocomplete} from '@components/commons/autocomplete/CustomAutocomplete';
import {BackButton} from '@components/commons/buttons/BackButton';
import {AutocompleteContext} from '@components/commons/form/AutocompleteContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {SaveReportMaterialSchema} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const SaveReportMaterialScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [query, setQuery] = useState('');
  const [material, setMaterial] = useState<IdReportMaterialType | null>(null);
  const [quantity, setQuantity] = useState('');
  const itemRef = useRef<any>(null);
  const [offlineMaterials, setOfflineMaterials] = useState([]);

  const {goBack} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail);

  const [filter, setFilter] = useState('');

  const {data: inventory} = useGetReportMaterialsInventory({
    idJob,
    filter,
  });

  useEffect(() => {
    // Orientation.lockToPortrait();
    // if (props.route.params && props.route.params.item) {
    //   setMaterials([props.route.params.item.id_material]);
    //   setMaterial(props.route.params.item.id_material);
    //   setQuery(props.route.params.item.id_material.name);
    //   setQuantity(props.route.params.item.quantity.toString());
    // }
    // initMaterials();
  }, []);

  const initMaterials = async () => {
    // var stringMaterials = await getFromStorageOffline(
    //   OFFLINE_MATERIALS_KEY_STORAGE,
    // );
    // if (stringMaterials) {
    //   var jsonMaterials = JSON.parse(stringMaterials);
    //   setOfflineMaterials(jsonMaterials);
    // }
  };

  //   const filter = async (query) => {
  // if (query.length < 1) {
  //   setTimeout(function () {
  //     setMaterials([]);
  //   }, 500);
  //   return;
  // }
  // const isConnected = await isInternet();
  // if (isConnected) {
  //   const response = await fetchData.Get(
  //     'resources/material/query?downloadAll=0&idJob=' +
  //       props.jobDetail.id +
  //       '&filter=' +
  //       query,
  //   );
  //   if (response.ok) {
  //     if (response.data.message == 'SUCCESS') {
  //       setMaterials(response.data.body.data);
  //     }
  //   }
  // } else {
  //   var filteredList = offlineMaterials.filter(
  //     (x) =>
  //       x.visible_to_sf == props.jobDetail.mat_visible_to_sf &&
  //       x.name.toUpperCase().trim().includes(query.toUpperCase().trim()),
  //   );
  //   setMaterials(filteredList);
  // }
  //   };

  const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

  const selectItem = (item: IdReportMaterialType) => {
    console.log(item);
    // var sublist = materials.filter(
    //   (x) => x.name.toUpperCase() == item.name.toUpperCase(),
    // );
    // setMaterials(sublist);
    setMaterial(item);
    // setQuery(item.name);
  };

  const onBlurMaterial = () => {
    // setQuery(material.name ? material.name : '');
    // setMaterials([]);
  };

  const saveMaterial = async () => {
    // Keyboard.dismiss();
    // setLoading(true);
    // var testDecimal = /^\d*((\.|\,)\d{1,2})?$/;
    // var testDecimalInteger = /^\d+((\.|\,)\d{1,2})?$/;
    // var testDecimalNoInteger = /^((\.|\,)\d{1,2})?$/;
    // if (
    //   material.id &&
    //   quantity.trim() != '' &&
    //   testDecimal.test(quantity.trim())
    // ) {
    //   var quantityTemp = quantity.trim().replace(',', '.');
    //   if (testDecimalInteger.test(quantity.trim())) {
    //   } else if (testDecimalNoInteger.test(quantity.trim())) {
    //     quantityTemp = '0' + quantityTemp;
    //   } else {
    //     setLoading(false);
    //     Toast.show('Invalid quantity', Toast.LONG, ['UIAlertController']);
    //     return;
    //   }
    //   const isConnected = await isInternet();
    //   if (isConnected) {
    //     var response;
    //     if (props.route.params && props.route.params.fromlist) {
    //       var sublist = [];
    //       if (props.route.params.item) {
    //         var mItem = props.route.params.item;
    //         var filteredList = props.route.params.list;
    //         filteredList.splice(props.route.params.index, 1);
    //         filteredList.forEach((element) => {
    //           sublist.push({
    //             id: element.id,
    //             idMaterial: element.id_material.id,
    //             quantity: element.quantity,
    //             idUser: element.user_info.user_id,
    //           });
    //         });
    //         sublist.push({
    //           id: mItem.id,
    //           idMaterial: material.id,
    //           quantity: quantityTemp,
    //           idUser: null,
    //         });
    //       } else {
    //         props.route.params.list.forEach((element) => {
    //           sublist.push({
    //             id: element.id,
    //             idMaterial: element.id_material.id,
    //             quantity: element.quantity,
    //             idUser: element.user_info.user_id,
    //           });
    //         });
    //         sublist.push({
    //           id: null,
    //           idMaterial: material.id,
    //           quantity: quantityTemp,
    //           idUser: null,
    //         });
    //       }
    //       response = await fetchData.Post('resources/material/register', {
    //         idJob: props.jobDetail.id,
    //         list: sublist,
    //       });
    //     } else {
    //       response = await fetchData.Post('resources/material/register/one', {
    //         idJob: props.jobDetail.id,
    //         idMaterial: material.id,
    //         quantity: quantityTemp,
    //         idUser: null,
    //       });
    //     }
    //     if (response.ok) {
    //       if (response.data.message == 'SUCCESS') {
    //         if (props.route.params && props.route.params.fromlist) {
    //           props.route.params.refresh();
    //           props.navigation.goBack();
    //         } else {
    //           props.navigation.replace('ReportMaterials');
    //         }
    //         setLoading(false);
    //       } else {
    //         setLoading(false);
    //         Alert.alert('ERROR', 'Error while saving material, try again');
    //       }
    //     } else {
    //       console.log(response);
    //       setLoading(false);
    //       Alert.alert('ERROR', 'Error while saving material, try again');
    //     }
    //   } else {
    //     var savedList = [];
    //     var stringList = await getFromStorageOffline(
    //       MATERIALS_KEY_STORAGE + props.jobDetail.id,
    //     );
    //     if (stringList) {
    //       var jsonList = JSON.parse(stringList);
    //       savedList = [...jsonList];
    //     }
    //     if (props.route.params && props.route.params.item) {
    //       savedList[props.route.params.index] = {
    //         ...savedList[props.route.params.index],
    //         id_material: material,
    //         quantity: quantityTemp,
    //       };
    //     } else {
    //       savedList.push({
    //         id: null,
    //         id_job: props.jobDetail.id,
    //         id_user: props.userInfo.user_id,
    //         id_inventory: null,
    //         id_material: material,
    //         quantity: quantityTemp,
    //       });
    //     }
    //     var sublist = [];
    //     savedList.forEach((element) => {
    //       sublist.push({
    //         id: element.id,
    //         idMaterial: element.id_material.id,
    //         quantity: element.quantity,
    //       });
    //     });
    //     var keyName = REQUEST_MATERIALS_KEY_STORAGE + props.jobDetail.id;
    //     var offlineRequest = {
    //       url: 'resources/material/register',
    //       body: {
    //         idJob: props.jobDetail.id,
    //         list: sublist,
    //       },
    //       time: new Date().getTime(),
    //       name: keyName,
    //       job: props.jobDetail.id,
    //     };
    //     await saveToStorageOffline(keyName, JSON.stringify(offlineRequest));
    //     var stringListSave = JSON.stringify(savedList);
    //     await saveToStorageOffline(
    //       MATERIALS_KEY_STORAGE + props.jobDetail.id,
    //       stringListSave,
    //     );
    //     if (props.route.params.fromlist) {
    //       props.route.params.refresh();
    //       props.navigation.goBack();
    //     } else {
    //       props.navigation.replace('ReportMaterials');
    //     }
    //     Orientation.lockToPortrait();
    //     setLoading(false);
    //   }
    // } else {
    //   setLoading(false);
    //   if (!material.id) {
    //     Toast.show('Must select a material', Toast.LONG, ['UIAlertController']);
    //     return;
    //   }
    //   if (quantity.trim() == '') {
    //     Toast.show('Empty quantity', Toast.LONG, ['UIAlertController']);
    //     return;
    //   }
    //   if (quantity.trim() != '' && !testDecimal.test(quantity.trim())) {
    //     Toast.show('System only allows two decimal numbers', Toast.LONG, [
    //       'UIAlertController',
    //     ]);
    //     return;
    //   }
    //   /*Toast.show('Please, complete the fields', Toast.LONG, [
    //             'UIAlertController',
    //         ]);*/
    // }
  };

  const closeAutocomplete = useCallback(() => {
    if (itemRef.current) {
      itemRef.current.close();
    }
  }, []);

  const checkItem = useCallback(
    (value: string) => {
      setFilter(value.trim());
    },
    [setFilter],
  );

  return (
    <View style={[styles.container]}>
      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton onPress={goBack} />
        </View>

        <View style={[styles.lateralPadding, styles.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Add materials
          </Text>
        </View>
      </View>

      <MinRoundedView />
      <View
        style={{
          paddingTop: 20,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
        <BasicFormProvider schema={SaveReportMaterialSchema}>
          <View style={{paddingBottom: 0, height: 45}}>
            <View style={styles.autocompleteContainer}>
              <AutocompleteContext
                name="material"
                dataSet={inventory?.map((x) => ({
                  ...x,
                  id: x.id.toString(),
                  title: x.name,
                }))}
                textInputProps={{
                  placeholder: 'Search a material',
                }}
                onFocus={() => {
                  closeAutocomplete();
                  itemRef.current.open();
                }}
                onChangeText={checkItem}
              />
              {/* <CustomAutocomplete
                controller={(controller) => {
                  itemRef.current = controller;
                }}
                onFocus={() => {
                  closeAutocomplete();
                  itemRef.current.open();
                }}
                onChangeText={checkItem}
                onSelectItem={(item) =>
                  selectItem(item as undefined as IdReportMaterialType)
                }
                //@ts-ignore
                dataSet={inventory?.map((x) => ({
                  ...x,
                  id: x.id.toString(),
                  title: x.name,
                }))}
                textInputProps={{
                  placeholder: 'Search a material',
                }}
              /> */}
              {/* <Autocomplete
                clearButtonMode="while-editing"
                onBlur={() => onBlurMaterial()}
                scrollEnabled={true}
                placeholder="Search a material"
                placeholderTextColor="#d0d0d0"
                inputContainerStyle={styles.inputSearch}
                style={mstyles.autocompleteText}
                listStyle={{
                  marginLeft: 0,
                  marginRight: 0,
                  borderColor: '#d0d0d0',
                  maxHeight: 170,
                }}
                data={
                  materials.length == 0
                    ? []
                    : materials.length == 1 &&
                      material.id &&
                      comp(query, materials[0].name)
                    ? []
                    : materials
                }
                defaultValue={query}
                onChangeText={(text) => checkMaterial(text)}
                renderItem={({item, i}) => (
                  <TouchableHighlight
                    key={i}
                    onPress={() => selectItem(item)}
                    underlayColor="#d0d0d0"
                    style={{height: 30, justifyContent: 'center'}}>
                    <Text numberOfLines={1}>{item.name}</Text>
                  </TouchableHighlight>
                )}
              /> */}
            </View>
          </View>

          <View style={[styles.lateralPadding, {marginTop: 10}]}>
            <View style={[GLOBAL_STYLES.row, styles.containerFields]}>
              <Text>Units Type:</Text>
              <Text>{material?.unit}</Text>
            </View>
            <View style={[GLOBAL_STYLES.row, styles.containerFields]}>
              <Text>Quantity:</Text>
              <InputTextContext
                currentId="quantity"
                maxLength={10}
                multiline
                numberOfLines={1}
                keyboardType='numeric'
                style={styles.inputDimensions}
              />
              {/* <TextInput
                maxLength={10}
                value={quantity}
                multiline={true}
                numberOfLines={1}
                onChangeText={(text) => setQuantity(text)}
                style={styles.inputDimensions}
                keyboardType="numeric"
              /> */}
            </View>

            <View style={{marginTop: 40, marginBottom: 20}}>
              <ButtonSubmit
                label="Save material"
                icon={<Icon name="save" type="solid" size={16} color="white" />}
                onSubmit={() => {}}
              />
              {/* <TouchableOpacity
                style={styles.btnSaveInfo}
                onPress={() => saveMaterial()}>
                <Icon name="save" type="solid" size={16} color="white" />
                <Text style={styles.textSaveInfo}>Save material</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </BasicFormProvider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    color: '#3C424A',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#959595',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 13,
  },
  containerFields: {
    justifyContent: 'space-between',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
  },
  inputDimensions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    width: 100,
    height: 43,
    textAlign: 'center',
    color: '#3C424A',
    paddingTop: 10,
  },
  btnSaveInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.primary,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  textSaveInfo: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
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
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.3,
    backgroundColor: 'white',
    padding: 10,
    paddingBottom: 0,
    paddingTop: 0,
    height: 40,
    justifyContent: 'center',
  },
});
