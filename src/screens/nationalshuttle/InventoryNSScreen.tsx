import { useDeleteItem } from '@api/hooks/HooksInventoryServices';
import { NSItemListType } from '@api/types/Jobs';
import { DebouncedTouchableOpacity } from '@components/commons/buttons/DebouncePressableOpacity';
import { EmptyCard } from '@components/commons/cards/EmptyCard';
import { GeneralLoading } from '@components/commons/loading/GeneralLoading';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import {
  COLUMN_HEADER_HEIGHT,
  COLUMN_WIDTH,
  ColumnHeaderNS,
  NSInventoryStyles,
  RowNS,
} from '@components/nationalshuttle/InventoryViewNationalShuttle';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import { RootStackParamList, RoutesNavigation } from '@navigation/types';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadingWrapperPromise } from '@store/actions';
import { useModalDialogStore } from '@store/modals';
import useNationalShuttleStore from '@store/nationalShuttle';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { lockToLandscape, lockToPortrait, sortList } from '@utils/functions';
import { showErrorToastMessage, showToastMessage } from '@utils/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'InventoryNationalShuttle'
>;
export const InventoryNSScreen = (props: Props) => {
  const {goBack, navigate} = useCustomNavigation();

  const showDialog = useModalDialogStore((d) => d.showVisible);

  const {inventoryList, setInventoryList, fetchInventory} =
    useNationalShuttleStore();

  const [initialList, setInitialList] = useState<NSItemListType[] | undefined>(
    inventoryList,
  );

  const [loading, setLoading] = useState(false);

  const {mutateAsync: deleteInventory, isPending: isPendingDelete} =
    useDeleteItem();

  const [filteredList, setFilteredList] = useState<NSItemListType[]>();

  const [sortField, setSortField] = useState<{
    field: keyof NSItemListType;
    asc: boolean;
  } | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  //filtro
  const refsearch = useRef<TextInput>(null);
  const [showFilter, setShowFilter] = useState(false);
  const translateYTopbar = useSharedValue(0);
  const translateYSearchbar = useSharedValue(-300);
  const [tempFilter, setTempFilter] = useState('');
  const [filter, setFilter] = useState('');

  const isFocused = useIsFocused();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    filterInventory();
  }, [initialList]);

  useEffect(() => {
    if (isLoaded && sortField) {
      setFilteredList(sortList(filteredList, sortField.field, sortField.asc));
    }
  }, [sortField, filteredList, setFilteredList]);

  useEffect(() => {
    if (isLoaded) {
      toggleComponent();
    }
  }, [showFilter, isLoaded]);

  useEffect(() => {
    if (isFocused) {
      lockToLandscape();
    }
    return () => {
      lockToPortrait();
    };
  }, [isFocused]);

  const filterList = useCallback(
    (array: any[] | undefined, searchValue: string) => {
      return array?.filter((item) => {
        return Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchValue.toLowerCase()),
        );
      });
    },
    [],
  );

  const filterInventory = useCallback(() => {
    if (filter.trim().length == 0) {
      if (sortField) {
        setFilteredList(sortList(initialList, sortField.field, sortField.asc));
      } else {
        setFilteredList(initialList);
      }
    } else {
      if (sortField) {
        setFilteredList(
          sortList(
            filterList(initialList, filter.trim()),
            sortField.field,
            sortField.asc,
          ),
        );
      } else {
        setFilteredList(filterList(initialList, filter.trim()));
      }
    }
  }, [initialList, filter, sortField, setFilteredList, filterList]);

  useEffect(() => {
    if (isLoaded) {
      filterInventory();
    }
  }, [filterInventory, isLoaded]);

  const search = useCallback(() => {
    setFilter(tempFilter);
  }, [tempFilter, setFilter]);

  const clear = useCallback(() => {
    setFilter('');
  }, [setFilter]);

  function onSort(field: keyof NSItemListType) {
    if (sortField?.field == field) {
      setSortField({...sortField, asc: !sortField.asc});
    } else {
      setSortField({field, asc: true});
    }
  }

  function cancelFilter() {
    setShowFilter(false);
  }

  function openFilter() {
    if (filter.trim().length > 0) {
      setTempFilter(filter);
    } else {
      setTempFilter('');
    }
    setShowFilter(true);
  }

  const toggleComponent = useCallback(() => {
    if (!showFilter) {
      translateYSearchbar.value = withTiming(-300, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      translateYTopbar.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      setTimeout(() => {
        if (refsearch.current) {
          refsearch.current.blur();
        }
      }, 300);
    } else {
      translateYTopbar.value = withTiming(-300, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      translateYSearchbar.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      setTimeout(() => {
        if (refsearch.current) {
          refsearch.current.blur();
          refsearch.current.focus();
        }
      }, 300);
    }
  }, [showFilter]);

  const topbarStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateYTopbar.value}],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateYSearchbar.value}],
  }));

  const syncro = useCallback(async () => {
    try {
      if (fetchInventory) {
        setLoading(true);
        const {data: dataList} = await fetchInventory();
        setInitialList([...dataList]);
        setLoading(false);
        if (setInventoryList) {
          setInventoryList(dataList);
        }
      }
    } catch (e) {
      setLoading(false);
    }
  }, [fetchInventory, setLoading, setInitialList, setInventoryList]);

  const onInitDelete = useCallback(
    (item: NSItemListType) => {
      showDialog({
        modalVisible: true,
        cancelable: true,
        message: `Are you sure you want to remove this item?\n${item.clientinv_display}`,
        onConfirm: () => {
          loadingWrapperPromise(
            deleteInventory({
              id: item?.id,
            })
              .then((d) => {
                if (d) {
                  showToastMessage('Item removed successfully');
                  syncro();
                } else {
                  showErrorToastMessage(
                    'An error occurred while removing inventory',
                  );
                }
              })
              .catch(() => {
                showErrorToastMessage(
                  'An error occurred while removing inventory',
                );
              }),
          );
        },
      });
    },
    [showDialog, deleteInventory, syncro],
  );

  const goToTopSheet = useCallback(
    (item: NSItemListType) => {
      navigate(RoutesNavigation.Topsheet, {
        id: item.plain_id_job.toString(),
        queue: 1,
        nsItemId: item.id,
      });
    },
    [navigate],
  );

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <View style={styles.header}>
        <Animated.View style={[styles.topBarStatic, topbarStyle]}>
          <TouchableOpacity
            style={[styles.containerRightButtons]}
            onPress={goBack}>
            <Icon name="chevron-left" color="#959595" type="light" size={15} />
            <Text style={styles.backBtnText}>Home</Text>
          </TouchableOpacity>

          <Text
            style={[
              GLOBAL_STYLES.title,
              GLOBAL_STYLES.bold,
              {color: '#3A3A3A', fontSize: 27},
            ]}>
            Inventory
          </Text>

          <View style={styles.containerRightButtons}>
            <DebouncedTouchableOpacity
              style={styles.rightButton}
              debounceTime={500}
              onPress={syncro}>
              <Icon name="sync" size={15} color="white" type="solid" />
            </DebouncedTouchableOpacity>

            <DebouncedTouchableOpacity
              debounceTime={500}
              style={styles.rightButton}
              onPress={openFilter}>
              <Icon name="search" size={15} color="white" type="solid" />
            </DebouncedTouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.containerFilter, searchStyle]}>
          <TouchableOpacity
            style={[styles.containerRightButtons]}
            onPress={cancelFilter}>
            <Icon name="chevron-left" color="#959595" type="light" size={15} />
            <Text style={styles.backBtnText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.containerTextInput}>
            <TextInput
              ref={refsearch}
              numberOfLines={1}
              style={styles.textInput}
              value={tempFilter}
              returnKeyType="search"
              onChangeText={(text) => setTempFilter(text)}
              onSubmitEditing={search}
              selectTextOnFocus={true}
              maxLength={80}
            />
            <TouchableOpacity
              onPress={search}
              style={styles.containerBtnSearch}>
              <Icon name="search" color="#959595" type="solid" size={15} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {filter.trim() != '' && (
        <View style={styles.containerTagSearch}>
          <Text>Filter: </Text>
          <TouchableOpacity
            style={[GLOBAL_STYLES.row, styles.tagFilter]}
            onPress={() => clear()}>
            <Text style={styles.textFilter}>"{filter.trim()}"</Text>
            <Icon name="times-circle" type="solid" color="white" size={12} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[NSInventoryStyles.containerTable]}>
        {loading && <GeneralLoading />}

        <ScrollView
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          horizontal>
          <View>
            <View style={{flexDirection: 'row'}}>
              <ColumnHeaderNS
                text={`ID`}
                style={{width: COLUMN_WIDTH.id, height: COLUMN_HEADER_HEIGHT}}
                onSort={onSort}
                field="id"
                sortField={sortField!}
              />

              {COLUMNS.map((item) => (
                <ColumnHeaderNS
                  key={item.field}
                  text={item.text}
                  style={{
                    width: item.width,
                    height: COLUMN_HEADER_HEIGHT,
                  }}
                  field={item.field as keyof NSItemListType}
                  onSort={onSort}
                  sortField={sortField!}
                />
              ))}
            </View>

            <ScrollView
              bounces={false}
              alwaysBounceHorizontal={false}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              contentContainerStyle={{minHeight: 250}}>
              {filteredList?.map((item) => (
                <RowNS
                  key={item.id}
                  item={item}
                  onDelete={() => onInitDelete(item)}
                  isFullList
                  onPress={() => goToTopSheet(item)}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {(!filteredList || filteredList?.length == 0) && (
          <View
            style={{
              width: '100%',
              position: 'absolute',
              zIndex: -1,
              top: 60,
            }}>
            <EmptyCard text="No items found" />
          </View>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      height: 2,
      width: 1,
    },
    elevation: 1,
    borderBottomStartRadius: 5,
    borderBottomEndRadius: 5,
  },
  topBarStatic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    position: 'absolute',
    paddingHorizontal: 10,
  },
  containerRightButtons: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  rightButton: {
    width: 27,
    height: 27,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
  },
  containerFilter: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  containerTextInput: {
    borderRadius: 5,
    height: 25,
    paddingHorizontal: 10,
    borderWidth: 0.3,
    borderColor: '#959595',
    flexDirection: 'row',
    marginLeft: 10,
    width: '60%',
  },
  textInput: {
    width: '90%',
    color: '#959595',
    fontSize: 14,
    padding: 0,
    alignItems: 'center',
    textAlign: 'left',
  },
  containerBtnSearch: {
    alignSelf: 'center',
    position: 'absolute',
    right: 10,
  },
  tagFilter: {
    borderRadius: 50,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#495057',
  },
  textFilter: {
    color: 'white',
    fontSize: 12,
  },
  containerTagSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

const COLUMNS = [
  {text: 'WO number', field: 'wo_number', width: COLUMN_WIDTH.woNumber},
  {text: 'Client Ref', field: 'clientref', width: COLUMN_WIDTH.clientRef},
  {
    text: 'Location',
    field: 'fromlocation_display',
    width: COLUMN_WIDTH.location,
  },
  {text: 'Dimensions', field: 'packed_height', width: COLUMN_WIDTH.dimensions},
  {
    text: 'Packing Details',
    field: 'packing_details_display',
    width: COLUMN_WIDTH.packingDetails,
  },
  {text: 'ID-alt', field: 'clientinv', width: COLUMN_WIDTH.idAlt},
  {text: 'Title', field: 'clientinv_display', width: COLUMN_WIDTH.title},
  {text: 'Artist name', field: 'artist', width: COLUMN_WIDTH.artistName},
  // {text: 'Status', field: 'status', width: COLUMN_WIDTH.status},
  {
    text: 'Condition',
    field: 'has_condition_check',
    width: COLUMN_WIDTH.condition,
  },
  {text: 'Remove', field: null, width: COLUMN_WIDTH.remove},
];
