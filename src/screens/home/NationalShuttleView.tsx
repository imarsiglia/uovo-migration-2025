import {useNavigation} from '@react-navigation/native';
import {memo, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useGetEastCoastDropoff,
  useGetEastCoastPickup,
  useGetInventoryEastCoastDropoff,
  useGetInventoryEastCoastPickup,
  useGetInventoryUniqueRouteDropoff,
  useGetInventoryUniqueRoutePickup,
  useGetInventoryWestCoastDropoff,
  useGetInventoryWestCoastPickup,
  useGetLocationPlaces,
  useGetUniqueRouteDropoff,
  useGetUniqueRoutePickup,
  useGetWestCoastDropoff,
  useGetWestCoastPickup,
} from '@api/hooks/HooksNationalShuttle';
// import {SendBOLBottomSheet} from '../../components/bottomSheets/SendBOLBottomSheet';


// import {useNationalShuttleContext} from '../../provider/NationalShuttleContext';
// import {useTabHomeContext} from '../../provider/TabHomeContext';
// import {useUserContext} from '../../provider/UserContext';
import {isInternet} from '../../utils/internet';
// import InventoryViewNationalShuttle from '../../components/nationalShuttle/InventoryViewNationalShuttle';
import {EmptyCard} from '@components/commons/cards/EmptyCard';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import CardNationalShuttle, {
  NationalShuttleItemType,
} from '@components/jobqueu/CardNationalShuttle';
import {getFormattedDate} from '@utils/functions';
import {CustomSwitch} from '@components/commons/switch/CustomSwitch';
import { BottomSheetSelectInput } from '@components/commons/inputs/BottomSheetSelectInput';
import { useDebounce } from '@hooks/useDebounce';
import useGeneralStore from '@store/general';
import { DatePickerCalendar } from '@components/commons/inputs/DatePickerCalendar';
import { CustomInputText } from '@components/commons/inputs/CustomInputText';
import useNationalShuttleStore from '@store/nationalShuttle';
import { NATIONAL_SHUTTLE_TYPE } from '@api/contants/constants';
import { COLORS } from '@styles/colors';

const filterTypes = [
  {
    id: NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP,
    label: 'East Coast Pickup',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.EAST_COAST_DROPOFF,
    label: 'East Coast Dropoff',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.WEST_COAST_PICKUP,
    label: 'West Coast Pickup',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.WEST_COAST_DROPOFF,
    label: 'West Coast Dropoff',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_PICKUP,
    label: 'Unique Route Pickup',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_DROPOFF,
    label: 'Unique Route Dropoff',
  },
];

type FilterType = {
  type: string;
  woNumber: string;
  date: Date;
  serviceLocation: string | null;
};

type FilterTypeKeys = keyof FilterType;

const NationalShuttleViewCmp = () => {
  const {navigate} = useNavigation();
  const [list, setList] = useState<NationalShuttleItemType[]>([]);
  const {inventoryList, setInventoryList, setFetchInventory, isInventoryMode, setIsInventoryMode} =
    useNationalShuttleStore();
    

  // const [inventoryList, setInventoryList] = useState<NSItemListType[]>([]);

  //send BOL
  const [isVisibleSendBOL, setIsVisibleSendBOL] = useState(false);
  const [jobDetail, setJobDetail] = useState<any>({});
  const [canFetchJobQueue, setCanFetchJobQueue] = useState(false);

  const activeTab = useGeneralStore(d => d.activeTab)

  const [filter, setFilter] = useState<FilterType>({
    type: NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP,
    woNumber: '',
    date: new Date(),
    serviceLocation: '-1',
  });

  const filterWoNumber = useDebounce(filter.woNumber);

  const {data: locationPlaces, isLoading: isLoadingLocationPlaces} =
    useGetLocationPlaces();

  const {refetch: getEastCoastPickup, isFetching: isFetchingEastCoast} =
    useGetEastCoastPickup(
      `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
        filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
      }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
    );

  const {refetch: getWestCoastPickup, isFetching: isFetchingWestCoastPickup} =
    useGetWestCoastPickup(
      `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
        filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
      }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
    );

  const {refetch: getWestCoastDropoff, isFetching: isFetchingWestCoastDropoff} =
    useGetWestCoastDropoff(
      `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
        filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
      }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
    );

  const {refetch: getEastCoastDropoff, isFetching: isFetchingEastCoastDropoff} =
    useGetEastCoastDropoff(
      `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
        filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
      }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
    );

  const {
    refetch: getInventoryEastCoastPickup,
    isFetching: isFetchingInventoryEastCoast,
  } = useGetInventoryEastCoastPickup(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const {
    refetch: getInventoryWestCoastPickup,
    isFetching: isFetchingInventoryWestCoastPickup,
  } = useGetInventoryWestCoastPickup(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const {
    refetch: getInventoryWestCoastDropoff,
    isFetching: isFetchingInventoryWestCoastDropoff,
  } = useGetInventoryWestCoastDropoff(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const {
    refetch: getInventoryEastCoastDropoff,
    isFetching: isFetchingInventoryEastCoastDropoff,
  } = useGetInventoryEastCoastDropoff(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  //unique route
  const {
    refetch: getUniqueRoutePickup,
    isFetching: isFetchingUniqueRoutePickup,
  } = useGetUniqueRoutePickup(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const {
    refetch: getUniqueRouteDropoff,
    isFetching: isFetchingUniqueRouteDropoff,
  } = useGetUniqueRouteDropoff(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const {
    refetch: getInventoryUniqueRoutePickup,
    isFetching: isFetchingInventoryUniqueRoutePickup,
  } = useGetInventoryUniqueRoutePickup(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const {
    refetch: getInventoryUniqueRouteDropoff,
    isFetching: isFetchingInventoryUniqueRouteDropoff,
  } = useGetInventoryUniqueRouteDropoff(
    `date=${getFormattedDate(filter.date, 'YYYY-MM-DD')}${
      filter.serviceLocation ? `&location=${filter.serviceLocation}` : ''
    }${filterWoNumber.trim() == '' ? '' : `&wo_number=${filterWoNumber}`}`,
  );

  const onChangeFilter = (value: any, key: FilterTypeKeys) => {
    setFilter({...filter, [key]: value});
  };

  useEffect(() => {
    if (activeTab == 2 && canFetchJobQueue) {
      filterJobs();
    }
  }, [
    filter.date,
    filterWoNumber,
    filter.type,
    filter.serviceLocation,
    isInventoryMode,
  ]);

  useEffect(() => {
    if (!canFetchJobQueue && activeTab == 2) {
      filterJobs().then(() => {
        setCanFetchJobQueue(true);
      });
    }
  }, [activeTab]);

  // useEffect(() => {
  //   if (props.syncro) {
  //     syncro();
  //   }
  // }, [props.syncro]);

  async function syncro() {
    filterJobs();
  }

  async function filterJobs() {
    if (filter?.serviceLocation == '-1') {
      return;
    }
    if (!isInventoryMode) {
      switch (filter.type) {
        case NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP:
          const {data: eastCoastPickup} = await getEastCoastPickup();
          setList(eastCoastPickup);
          break;
        case NATIONAL_SHUTTLE_TYPE.WEST_COAST_PICKUP:
          const {data: westCoastPickup} = await getWestCoastPickup();
          setList(westCoastPickup);
          break;
        case NATIONAL_SHUTTLE_TYPE.EAST_COAST_DROPOFF:
          const {data: eastCoastDropoff} = await getEastCoastDropoff();
          setList(eastCoastDropoff);
          break;
        case NATIONAL_SHUTTLE_TYPE.WEST_COAST_DROPOFF:
          const {data: weastCoastDropoff} = await getWestCoastDropoff();
          setList(weastCoastDropoff);
          break;
        case NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_PICKUP:
          const {data: uniqueRoutePickup} = await getUniqueRoutePickup();
          setList(uniqueRoutePickup);
          break;
        case NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_DROPOFF:
          const {data: uniqueRouteDropoff} = await getUniqueRouteDropoff();
          setList(uniqueRouteDropoff);
          break;
      }
    } else {
      switch (filter.type) {
        case NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP:
          const {data: eastCoastPickup} = await getInventoryEastCoastPickup();
          setInventoryList(eastCoastPickup);
          setFetchInventory(() => getInventoryEastCoastPickup);
          break;
        case NATIONAL_SHUTTLE_TYPE.WEST_COAST_PICKUP:
          const {data: westCoastPickup} = await getInventoryWestCoastPickup();
          setInventoryList(westCoastPickup);
          setFetchInventory(() => getInventoryWestCoastPickup);
          break;
        case NATIONAL_SHUTTLE_TYPE.EAST_COAST_DROPOFF:
          const {data: eastCoastDropoff} = await getInventoryEastCoastDropoff();
          setInventoryList(eastCoastDropoff);
          setFetchInventory(() => getInventoryEastCoastDropoff);
          break;
        case NATIONAL_SHUTTLE_TYPE.WEST_COAST_DROPOFF:
          const {data: weastCoastDropoff} =
            await getInventoryWestCoastDropoff();
          setInventoryList(weastCoastDropoff);
          setFetchInventory(() => getInventoryWestCoastDropoff);
          break;
        case NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_PICKUP:
          const {data: uniqueRoutePickup} =
            await getInventoryUniqueRoutePickup();
          setInventoryList(uniqueRoutePickup);
          break;
        case NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_DROPOFF:
          const {data: uniqueRouteDropoff} =
            await getInventoryUniqueRouteDropoff();
          setInventoryList(uniqueRouteDropoff);
          break;
      }
    }
  }

  const goToTopSheet = async (item: NationalShuttleItemType) => {
    const isConnected = await isInternet();
    let selectedDate = getFormattedDate(filter.date, 'YYYY-MM-DD');
    let scheduleDate = getFormattedDate(
      item.start_date,
      'dddd MMM DD [•] HH:mm A MMMM YYYY',
    );
    // Tuesday Jul 23 • 07:00 AM July 2024
    const indexOf = item.client_name.indexOf(' ');
    // pendiente logica
    // props.dispatch(
    //   TopSheetActions.copyWoName(
    //     item.client_name.substring(indexOf, item.client_name?.length),
    //   ),
    // );
    //@ts-ignore
    navigate('TopSheet', {
      job: item.id,
      wo_name:
        item.wo +
        ' •' +
        item.client_name.substring(indexOf, item.client_name?.length),
      selectedDate: selectedDate,
      formattedDate: scheduleDate,
      refreshStatus: syncro,
      queue: 1,
      offline: !isConnected,
      syncroRequests: (() => {}).bind(this),
    });
  };

  function onInitSignature(idJob: string) {
    setTimeout(() => {
      // props.dispatch(JobActions.copy({id: idJob}));
      //@ts-ignore
      navigate('Signature', {
        refresh: syncro,
      });
    }, 100);
  }

  function onInitEditPieceCount(idJob: string) {
    setTimeout(() => {
      // props.dispatch(JobActions.copy({id: idJob}));
      //@ts-ignore
      navigate('EditBOL');
    }, 100);
  }

  async function onInitSendBOL(job: NationalShuttleItemType) {
    setTimeout(() => {
      setJobDetail(job);
      setIsVisibleSendBOL(true);
    }, 400);
  }

  function showFullList() {
    //@ts-ignore
    navigate('InventoryNS', {
      initialList: inventoryList,
    });
  }

  const customLocationPlaces = useMemo(() => {
    if (locationPlaces?.length > 0) {
      return [
        // {value: null, label: 'All locations'},
        // ...locationPlaces?.map((item) => ({
        //   value: item.id,
        //   label: item.name?.trim(),
        // })),
      ];
    } else {
      return [{value: null, label: 'All locations'}];
    }
  }, [locationPlaces]);

  return (
    <View
      style={{display: 'flex', flexGrow: 1, flex: 0, flexDirection: 'column'}}>
      {isLoadingLocationPlaces && <GeneralLoading />}
      <View
        style={{
          paddingHorizontal: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 10,
        }}>
        <ScrollView
          horizontal
          contentContainerStyle={{gap: 10, paddingBottom: 5, paddingTop: 10}}
          showsHorizontalScrollIndicator={false}>
          {filterTypes.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterType,
                option.id == filter.type ? styles.selectedType : {},
              ]}
              onPress={() => onChangeFilter(option.id, 'type')}>
              <Text
                style={[
                  styles.typeText,
                  option.id == filter.type ? styles.selectedTypeText : {},
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{display: 'flex', flexDirection: 'row', gap: 10}}>
          <View style={{flex: 1}}>
            <DatePickerCalendar
              selectedDate={filter.date}
              onSelectDate={(date) => onChangeFilter(date, 'date')}
              containerStyles={{height: 34}}
              inputTextStyles={{fontSize: 12}}
            />
          </View>
          <View style={{flex: 1}}>
            <BottomSheetSelectInput
              searchable={false}
              options={customLocationPlaces}
              label="Status"
              placeholder="All"
              value={filter.serviceLocation}
              onChange={(val) =>
                onChangeFilter(val, 'serviceLocation')
              }
            />
            {/* <InputSelect
              options={customLocationPlaces}
              value={filter.serviceLocation}
              onSelect={(value) => onChangeFilter(value, 'serviceLocation')}
              // placeholder="All locations"
              containerStyles={{height: 34}}
              inputTextStyles={{fontSize: 12}}
              noSelectablePlaceholder="Select service location"
            /> */}
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <View style={{flex: 1}}>
            <CustomInputText
              placeholder="Search WO number..."
              textAlignVertical="center"
              maxFontSizeMultiplier={1.4}
              style={{
                height: 34,
                fontSize: 12,
                paddingHorizontal: 8,
                paddingVertical: 0,
              }}
              keyboardType="number-pad"
              onChangeText={(text: string) => onChangeFilter(text, 'woNumber')}
            />
          </View>

          <View
            style={{
              flex: 1,
            }}>
            <CustomSwitch
              disabledLabel="Manifest View"
              enabledLabel="Job View"
              isEnabled={isInventoryMode!}
              onToggle={(val) => setIsInventoryMode(val)}
            />
          </View>
        </View>
      </View>

      {(isFetchingEastCoast ||
        isFetchingWestCoastDropoff ||
        isFetchingWestCoastPickup ||
        isFetchingEastCoastDropoff ||
        isFetchingInventoryEastCoast ||
        isFetchingInventoryWestCoastDropoff ||
        isFetchingInventoryWestCoastPickup ||
        isFetchingInventoryEastCoastDropoff ||
        isFetchingUniqueRoutePickup ||
        isFetchingUniqueRouteDropoff ||
        isFetchingInventoryUniqueRoutePickup ||
        isFetchingInventoryUniqueRouteDropoff) && (
        <ActivityIndicator size="small" color={COLORS.primary} />
      )}

      {filter?.serviceLocation == '-1' ? (
        <View style={{marginTop: 10}}>
          <EmptyCard text="Select a Route, Date, and Service Location above to view results." />
        </View>
      ) : !isInventoryMode ? (
        <FlatList
          contentContainerStyle={{gap: 20, padding: 10, paddingBottom: 250}}
          style={{marginBottom: 20}}
          data={list}
          ListEmptyComponent={<EmptyCard text="No jobs found" />}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item, index}) => (
            <CardNationalShuttle
              key={index}
              item={item}
              goToTopsheet={() => goToTopSheet(item)}
              onInitSignature={() => onInitSignature(item.id)}
              onInitEditPieceCount={() => onInitEditPieceCount(item.id)}
              onInitSendBOL={() => onInitSendBOL(item)}
            />
          )}
        />
      ) : (
        <></>
        // <InventoryViewNationalShuttle
        //   onShowFullList={showFullList}
        //   list={inventoryList}
        // />
      )}

      {/* <SendBOLBottomSheet
        visible={isVisibleSendBOL}
        handleVisible={setIsVisibleSendBOL}
        idJob={jobDetail?.id}
        jobDetail={jobDetail}
        onFinishSendBol={syncro}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  filterType: {
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    height: 27,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  typeText: {
    color: '#757575',
    fontSize: 14,
  },
  selectedType: {
    backgroundColor: COLORS.primary,
  },
  selectedTypeText: {
    color: 'white',
  },
});

export const NationalShuttleView = memo(NationalShuttleViewCmp);
