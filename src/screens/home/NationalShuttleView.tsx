import {memo, useCallback, useEffect, useMemo, useState} from 'react';
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

import {isInternet} from '../../utils/internet';
// import InventoryViewNationalShuttle from '../../components/nationalShuttle/InventoryViewNationalShuttle';
import {EmptyCard} from '@components/commons/cards/EmptyCard';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import CardNationalShuttle from '@components/jobqueu/CardNationalShuttle';
import {getFormattedDate} from '@utils/functions';
import {CustomSwitch} from '@components/commons/switch/CustomSwitch';
import {BottomSheetSelectInput} from '@components/commons/inputs/BottomSheetSelectInput';
import {useDebounce} from '@hooks/useDebounce';
import useGeneralStore from '@store/general';
import {DatePickerCalendar} from '@components/commons/inputs/DatePickerCalendar';
import {CustomInputText} from '@components/commons/inputs/CustomInputText';
import useNationalShuttleStore from '@store/nationalShuttle';
import {
  FILTER_TYPES_ACTIVITY,
  NATIONAL_SHUTTLE_TYPE,
  NationalShuttleType,
} from '@api/contants/constants';
import {COLORS} from '@styles/colors';
import {JobDetailType, NSJobType} from '@api/types/Jobs';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {InventoryViewNationalShuttle} from '@components/nationalshuttle/InventoryViewNationalShuttle';
import {RoutesNavigation} from '@navigation/types';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {SendBOLBottomSheet} from '@components/bottomSheets/SendBOLBottomSheet';
import useTopSheetStore from '@store/topsheet';

type FilterType = {
  type: string;
  woNumber: string;
  date: Date;
  serviceLocation: string | null;
};

type FilterTypeKeys = keyof FilterType;

const NationalShuttleViewCmp = () => {
  const {navigate} = useCustomNavigation();
  const [list, setList] = useState<NSJobType[] | undefined>([]);
  const {
    inventoryList,
    setInventoryList,
    setFetchInventory,
    isInventoryMode,
    setIsInventoryMode,
  } = useNationalShuttleStore();

  //send BOL
  const [isVisibleSendBOL, setIsVisibleSendBOL] = useState(false);
  const [jobDetail, setJobDetail] = useState<NSJobType | null>(null);
  const [canFetchJobQueue, setCanFetchJobQueue] = useState(false);

  const updateJobDetail = useTopSheetStore((d) => d.setJobDetail);

  const activeTab = useGeneralStore((d) => d.activeTab);
  const syncroNS = useGeneralStore((d) => d.syncroNS);

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
    useGetEastCoastPickup({
      date: filter.date,
      location: filter.serviceLocation,
      wo_number: filterWoNumber,
    });

  const {refetch: getWestCoastPickup, isFetching: isFetchingWestCoastPickup} =
    useGetWestCoastPickup({
      date: filter.date,
      location: filter.serviceLocation,
      wo_number: filterWoNumber,
    });

  const {refetch: getWestCoastDropoff, isFetching: isFetchingWestCoastDropoff} =
    useGetWestCoastDropoff({
      date: filter.date,
      location: filter.serviceLocation,
      wo_number: filterWoNumber,
    });

  const {refetch: getEastCoastDropoff, isFetching: isFetchingEastCoastDropoff} =
    useGetEastCoastDropoff({
      date: filter.date,
      location: filter.serviceLocation,
      wo_number: filterWoNumber,
    });

  const {
    refetch: getInventoryEastCoastPickup,
    isFetching: isFetchingInventoryEastCoast,
  } = useGetInventoryEastCoastPickup({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  const {
    refetch: getInventoryWestCoastPickup,
    isFetching: isFetchingInventoryWestCoastPickup,
  } = useGetInventoryWestCoastPickup({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  const {
    refetch: getInventoryWestCoastDropoff,
    isFetching: isFetchingInventoryWestCoastDropoff,
  } = useGetInventoryWestCoastDropoff({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  const {
    refetch: getInventoryEastCoastDropoff,
    isFetching: isFetchingInventoryEastCoastDropoff,
  } = useGetInventoryEastCoastDropoff({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  //unique route
  const {
    refetch: getUniqueRoutePickup,
    isFetching: isFetchingUniqueRoutePickup,
  } = useGetUniqueRoutePickup({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  const {
    refetch: getUniqueRouteDropoff,
    isFetching: isFetchingUniqueRouteDropoff,
  } = useGetUniqueRouteDropoff({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  const {
    refetch: getInventoryUniqueRoutePickup,
    isFetching: isFetchingInventoryUniqueRoutePickup,
  } = useGetInventoryUniqueRoutePickup({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

  const {
    refetch: getInventoryUniqueRouteDropoff,
    isFetching: isFetchingInventoryUniqueRouteDropoff,
  } = useGetInventoryUniqueRouteDropoff({
    date: filter.date,
    location: filter.serviceLocation,
    wo_number: filterWoNumber,
  });

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

  useEffect(() => {
    if (syncroNS) {
      syncro();
    }
  }, [syncroNS]);

  const filterJobs = useCallback(async () => {
    if (filter?.serviceLocation === '-1') return;

    if (!isInventoryMode) {
      const actions: Record<string, () => Promise<void>> = {
        [NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP]: async () => {
          const {data} = await getEastCoastPickup();
          setList(data);
        },
        [NATIONAL_SHUTTLE_TYPE.WEST_COAST_PICKUP]: async () => {
          const {data} = await getWestCoastPickup();
          setList(data);
        },
        [NATIONAL_SHUTTLE_TYPE.EAST_COAST_DROPOFF]: async () => {
          const {data} = await getEastCoastDropoff();
          setList(data);
        },
        [NATIONAL_SHUTTLE_TYPE.WEST_COAST_DROPOFF]: async () => {
          const {data} = await getWestCoastDropoff();
          setList(data);
        },
        [NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_PICKUP]: async () => {
          const {data} = await getUniqueRoutePickup();
          setList(data);
        },
        [NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_DROPOFF]: async () => {
          const {data} = await getUniqueRouteDropoff();
          setList(data);
        },
      };

      await actions[filter.type]?.();
    } else {
      const actions: Record<string, () => Promise<void>> = {
        [NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP]: async () => {
          const {data} = await getInventoryEastCoastPickup();
          setInventoryList(data!);
          setFetchInventory(getInventoryEastCoastPickup);
        },
        [NATIONAL_SHUTTLE_TYPE.WEST_COAST_PICKUP]: async () => {
          const {data} = await getInventoryWestCoastPickup();
          setInventoryList(data!);
          setFetchInventory(getInventoryWestCoastPickup);
        },
        [NATIONAL_SHUTTLE_TYPE.EAST_COAST_DROPOFF]: async () => {
          const {data} = await getInventoryEastCoastDropoff();
          setInventoryList(data!);
          setFetchInventory(getInventoryEastCoastDropoff);
        },
        [NATIONAL_SHUTTLE_TYPE.WEST_COAST_DROPOFF]: async () => {
          const {data} = await getInventoryWestCoastDropoff();
          setInventoryList(data!);
          setFetchInventory(getInventoryWestCoastDropoff);
        },
        [NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_PICKUP]: async () => {
          const {data} = await getInventoryUniqueRoutePickup();
          setInventoryList(data!);
          setFetchInventory(getInventoryUniqueRoutePickup);
        },
        [NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_DROPOFF]: async () => {
          const {data} = await getInventoryUniqueRouteDropoff();
          setInventoryList(data!);
          setFetchInventory(getInventoryUniqueRouteDropoff);
        },
      };

      await actions[filter.type]?.();
    }
  }, [
    filter,
    isInventoryMode,
    setList,
    setInventoryList,
    setFetchInventory,
    getEastCoastPickup,
    getWestCoastPickup,
    getEastCoastDropoff,
    getWestCoastDropoff,
    getUniqueRoutePickup,
    getUniqueRouteDropoff,
    getInventoryEastCoastPickup,
    getInventoryWestCoastPickup,
    getInventoryEastCoastDropoff,
    getInventoryWestCoastDropoff,
    getInventoryUniqueRoutePickup,
    getInventoryUniqueRouteDropoff,
  ]);

  const syncro = useCallback(() => {
    filterJobs();
  }, [filterJobs]);

  const goToTopSheet = async (item: NSJobType) => {
    navigate(RoutesNavigation.Topsheet, {id: item.id.toString(), queue: 1});
  };

  const onInitSignature = useCallback((idJob: number) => {
    // @ts-ignore
    updateJobDetail({
      id: idJob,
    });
    navigate(RoutesNavigation.Signatures);
  }, []);

  const onInitEditPieceCount = useCallback((idJob: number) => {
    //@ts-ignore
    updateJobDetail({
      id: idJob,
    });
    navigate(RoutesNavigation.EditPieceCount);
  }, []);

  const onInitSendBOL = useCallback((job: NSJobType) => {
    setJobDetail(job);
    setIsVisibleSendBOL(true);
  }, []);

  const showFullList = useCallback(() => {
    navigate(RoutesNavigation.InventoryNationalShuttle, {
      initialList: inventoryList,
    });
  }, [navigate]);

  const customLocationPlaces = useMemo(() => {
    return [
      {id: null, name: 'All locations'},
      ...(locationPlaces?.map((item) => ({
        ...item,
        name: item.name?.trim(),
      })) ?? []),
    ];
  }, [locationPlaces]);

  return (
    <Wrapper
      style={{display: 'flex', flexGrow: 1, flex: 0, flexDirection: 'column'}}>
      {isLoadingLocationPlaces && <GeneralLoading />}
      <Wrapper
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
          {FILTER_TYPES_ACTIVITY.map((option, index) => (
            <PressableOpacity
              key={index}
              style={[
                styles.filterType,
                option.id == filter.type ? styles.selectedType : {},
              ]}
              onPress={() => onChangeFilter(option.id, 'type')}>
              <Label
                style={[
                  styles.typeText,
                  option.id == filter.type ? styles.selectedTypeText : {},
                ]}>
                {option.label}
              </Label>
            </PressableOpacity>
          ))}
        </ScrollView>
        <Wrapper style={{display: 'flex', flexDirection: 'row', gap: 10}}>
          <Wrapper style={{flex: 1}}>
            <DatePickerCalendar
              selectedDate={filter.date}
              onSelectDate={(date) => onChangeFilter(date, 'date')}
              containerStyles={{height: 34}}
              inputTextStyles={{fontSize: 12}}
            />
          </Wrapper>
          <Wrapper style={{flex: 1}}>
            <BottomSheetSelectInput
              options={customLocationPlaces}
              snapPoints={['95%']}
              label="Search service location"
              placeholder="Select service location"
              value={filter.serviceLocation}
              onChange={(val) => onChangeFilter(val, 'serviceLocation')}
              containerStyle={{
                minHeight: 34,
              }}
              inputTextStyle={{fontSize: 12}}
            />
          </Wrapper>
        </Wrapper>
        <Wrapper
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <Wrapper style={{flex: 1}}>
            <CustomInputText
              placeholder="Search WO number..."
              textAlignVertical="center"
              maxFontSizeMultiplier={1.4}
              style={{
                height: 34,
                fontSize: 12,
                paddingHorizontal: 8,
                paddingVertical: 0,
                borderWidth: 0.5,
                borderColor: COLORS.borderInputColor,
                borderRadius: 5,
              }}
              keyboardType="number-pad"
              placeholderTextColor={COLORS.inputTextColor}
              onChangeText={(text: string) => onChangeFilter(text, 'woNumber')}
            />
          </Wrapper>

          <Wrapper
            style={{
              flex: 1,
            }}>
            <CustomSwitch
              disabledLabel="Manifest View"
              enabledLabel="Job View"
              isEnabled={isInventoryMode!}
              onToggle={(val) => setIsInventoryMode(val)}
            />
          </Wrapper>
        </Wrapper>
      </Wrapper>

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
        <Wrapper style={{marginTop: 10}}>
          <EmptyCard text="Select a Route, Date, and Service Location above to view results." />
        </Wrapper>
      ) : !isInventoryMode ? (
        <FlatList
          contentContainerStyle={{gap: 20, padding: 10, paddingBottom: 150}}
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
        <InventoryViewNationalShuttle
          onShowFullList={showFullList}
          list={inventoryList}
        />
      )}

      <SendBOLBottomSheet
        visible={isVisibleSendBOL}
        handleVisible={setIsVisibleSendBOL}
        jobDetail={jobDetail!}
        onFinishSendBol={syncro}
      />
    </Wrapper>
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
