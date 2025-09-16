import { QUERY_KEYS } from '@api/contants/constants';
import {
  useAddInventoryItem,
  useSearchFullInventory,
  useSearchInventoryItem,
} from '@api/hooks/HooksInventoryServices';
import { MinimalInventoryType } from '@api/types/Inventory';
import { CustomAutocomplete } from '@components/commons/autocomplete/CustomAutocomplete';
import { BackButton } from '@components/commons/buttons/BackButton';
import { RoundedButton } from '@components/commons/buttons/RoundedButton';
import { BottomSheetSelectInput } from '@components/commons/inputs/BottomSheetSelectInput';
import { GeneralLoading } from '@components/commons/loading/GeneralLoading';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import HeaderInventoryAdd from '@components/inventory/HeaderInventoryAdd';
import RowInventoryAdd from '@components/inventory/RowInventoryAdd';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import { useRefreshIndicator } from '@hooks/useRefreshIndicator';
import { loadingWrapperPromise } from '@store/actions';
import useInventoryStore from '@store/inventory';
import { useModalDialogStore } from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { showErrorToastMessage, showToastMessage } from '@utils/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet
} from 'react-native';
import { IAutocompleteDropdownRef } from 'react-native-autocomplete-dropdown';
import Icon from 'react-native-fontawesome-pro';

const CRITERIA_LIST = [
  {name: 'ID', id: 'id'},
  {name: 'Client Ref ID', id: 'ref'},
  {name: 'Title', id: 'title'},
  {name: 'Artist name', id: 'artist'},
];

export const AddInventoryScreen = () => {
  const {id} = useTopSheetStore((d) => d.jobDetail!);
  const [type, setType] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const itemRef = useRef<IAutocompleteDropdownRef | null>(null);
  const {goBack} = useCustomNavigation();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {topSheetFilter, inventoryFilter, orderFilter, orderType} =
    useInventoryStore();

  const [showTable, setShowTable] = useState(false);

  const {data: autocompleteItems} = useSearchInventoryItem({
    idJob: id,
    type,
    filter,
  });

  const {
    data: inventoryList,
    refetch,
    isRefetching,
  } = useSearchFullInventory({
    idJob: id,
    type,
    filter: selectedFilter,
    enabled: false,
  });

  const {mutateAsync: addInventoryAsync} = useAddInventoryItem();

  const {hardRefreshMany} = useRefreshIndicator([
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: id,
        filter: topSheetFilter,
        orderFilter,
        orderType,
      },
    ],
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: id,
        filter: inventoryFilter,
        orderFilter,
        orderType,
      },
    ],
  ]);

  useEffect(() => {
    setFilter('');
    if (itemRef?.current) {
      itemRef.current.setInputText('');
      itemRef.current.clear();
    }
  }, [type]);

  const addItemSearch = () => {
    Keyboard.dismiss();
    refetch().then(() => {
      setShowTable(true);
    });
  };

  const onCheckItem = (query: string) => {
    setFilter(query?.trim());
  };

  const onInitAdd = (item: MinimalInventoryType) => {
    showDialog({
      modalVisible: true,
      type: 'info',
      cancelable: true,
      message: (
        <Wrapper style={[styles.bodyModalClockOut, {paddingHorizontal: 0}]}>
          <Label style={styles.titleModalClockOut}>
            Do you want to add this item to inventory?
          </Label>
        </Wrapper>
      ),
      onConfirm: () => {
        showDialog({
          modalVisible: false,
        });
        loadingWrapperPromise(
          addInventoryAsync({
            idJob: id,
            idInventory: item.inventory_id!,
          })
            .then((d) => {
              if (d) {
                hardRefreshMany();
                showToastMessage('Item added successfully');
                goBack();
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
  };

  const closeAutocomplete = useCallback(() => {
    if (itemRef?.current) {
      itemRef.current.close();
    }
  }, [itemRef?.current]);

  return (
    <Wrapper style={[styles.container]}>
      <Wrapper style={[styles.container]}>
        <Wrapper
          style={[
            GLOBAL_STYLES.containerBtnOptTop,
            {backgroundColor: 'white'},
          ]}>
          <BackButton onPress={goBack} />

          <Wrapper style={[styles.lateralPadding]}>
            <Label
              style={[
                GLOBAL_STYLES.title,
                GLOBAL_STYLES.bold,
                styles.topsheet,
              ]}>
              New Item
            </Label>
          </Wrapper>

          <Wrapper style={[styles.lateralPadding, {width: 50}]}></Wrapper>
        </Wrapper>

        <MinRoundedView />

        <Wrapper
          style={{
            display: 'flex',
            flexDirection: 'row',
            paddingHorizontal: 10,
            gap: 10,
            paddingTop: 10,
            alignItems: 'center',
          }}>
          <Wrapper style={{flex: 0.3}}>
            <BottomSheetSelectInput
              onChange={(val) => setType(val as string)}
              placeholder="Select an option"
              options={CRITERIA_LIST}
              label="Select an option"
              snapPoints={['95%']}
              searchable={false}
              containerStyle={{
                borderColor: '#d0d0d0',
                borderRadius: 10,
                borderWidth: 0.5,
              }}
              value={type}
            />
          </Wrapper>

          <Wrapper style={{flex: 0.7}}>
            <CustomAutocomplete
              dataSet={
                autocompleteItems?.map((x) => ({
                  id: x,
                  title: x,
                }))!
              }
              textInputProps={{
                placeholder: 'Search an item',
              }}
              controller={(c) => {
                itemRef.current = c;
              }}
              onChangeText={onCheckItem}
              onFocus={() => {
                closeAutocomplete();
                itemRef.current!.open();
              }}
              onClear={() => {
                setFilter('');
              }}
              onSelectItem={(item) => setSelectedFilter(item?.id!)}
            />
          </Wrapper>

          <RoundedButton
            style={[
              {
                width: 30,
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                minHeight: 0,
              },
            ]}
            onPress={addItemSearch}
            icon={<Icon name="search" size={16} color="#959595" />}
          />
        </Wrapper>

        {showTable && (
          <Wrapper style={[styles.containerTable]}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{width: '100%'}}
              style={[
                styles.table,
                {elevation: 0.5, borderRadius: 12, borderColor: '#d0d0d0'},
              ]}>
              <Wrapper style={[GLOBAL_STYLES.alignItems, styles.containerList]}>
                <HeaderInventoryAdd />

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
                      onAddItem={() => onInitAdd(item)}
                      onCheck={() => {}}
                    />
                  )}
                  keyExtractor={(item) => item.inventory_id?.toString()!}
                  refreshing={isRefetching}
                  onRefresh={refetch}
                />
              </Wrapper>
            </ScrollView>
          </Wrapper>
        )}
      </Wrapper>
      {isRefetching && <GeneralLoading />}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
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
    marginTop: 10,
    flex: 1,
    shadowColor: '#00000050',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30.14,
    elevation: 5,
    paddingBottom: 10,
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
