import {
  FILTER_WO_ACTIVE,
  JOB_QUEUE_FILTER_LIST,
  JOBQUEUE_CLIENT,
  JOBQUEUE_ORDER_BY_TYPES,
  JOBQUEUE_START_DATE,
  JOBQUEUE_STATUS,
  JOBQUEUE_WO_NUMBER,
  JOBQUEUE_WOTYPE,
  PAUSED_STATUS,
  STARTED_STATUS,
  WO_DEFAULT_NAME,
  WO_TYPE_PLACEHOLDER,
} from '@api/contants/constants';
import {
  useGetLocationPlaces,
  useGetWoStatusList,
  useGetWoTypeList,
} from '@api/hooks/HooksGeneralServices';
import {useGetJobQueue} from '@api/hooks/HooksJobServices';
import {FormattedJobType} from '@api/types/Jobs';
import {BottomSheetSelectIcon} from '@components/commons/buttons/BottomSheetSelectIcon';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BottomSheetSelectInput} from '@components/commons/inputs/BottomSheetSelectInput';
import SearchInput from '@components/commons/inputs/SearchInput';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {PlaceholderCard} from '@components/timeline/PlaceholderCard';
import {TimelineCard} from '@components/timeline/TimelineCard';
import {FAIconType} from '@generalTypes/general';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import { RoutesNavigation } from '@navigation/types';
import {useAuth} from '@store/auth';
import useGeneralStore from '@store/general';
import {useJobQueueStore} from '@store/jobqueue';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {
  getDeviceTimeZone,
  getFormattedDate,
  getFormattedDateWithTimezone,
} from '@utils/functions';
import {memo, useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

let timezone = new Date().getTimezoneOffset() / 60;

export const JobQueueViewCmp = () => {
  const {activeTab, isFilterActive} = useGeneralStore();
  const {online} = useOnline();
  const sessionUser = useAuth((d) => d.user);
  const {
    onChangeValueByType,
    getValueByType,
    orderBy,
    setOrderBy,
    serviceLocation,
    setServiceLocation,
    CLIENT,
    START_DATE,
    STATUS,
    WOTYPE,
    WO_NUMBER,
  } = useJobQueueStore();

  const {navigate} = useCustomNavigation()

  const filter = useMemo(() => {
    return getValueByType(orderBy);
  }, [getValueByType, CLIENT, START_DATE, STATUS, WOTYPE, WO_NUMBER, orderBy]);

  const [datePickerVisibility, setDatePickerVisibility] = useState(false);

  const {data: woStatusList} = useGetWoStatusList();
  const {data: woTypeList} = useGetWoTypeList();
  const {data: locationPlaces, isLoading: isLoadingLocationPlaces} =
    useGetLocationPlaces();

  const flatlistJobQ = useRef(null);

  const {
    data: jobqueueLista,
    isLoading: isLoadingJobQueue,
    isRefetching: isRefetchingJobQueue,
    refetch,
  } = useGetJobQueue({
    orderBy,
    place: serviceLocation,
    filter: !isFilterActive ? filter : FILTER_WO_ACTIVE,
  });

  const hideDatePicker = useCallback(() => {
    setDatePickerVisibility(false);
  }, []);

  const showDatePicker = useCallback(() => {
    setDatePickerVisibility(true);
  }, []);

  const getFormattedDateFilter = useMemo(() => {
    if (!filter) {
      return 'Start Date';
    }
    return getFormattedDateWithTimezone(filter, 'MMM DD [•] YYYY');
  }, [START_DATE]);

  const handleConfirm = useCallback((date: Date | null) => {
    hideDatePicker();
    onChangeValueByType(
      date?.toString() ?? new Date().toString(),
      JOBQUEUE_START_DATE,
    );
  }, []);

  async function goToTopSheet(item: any) {
    // navigate('TopSheet', {
    //   job: item.id,
    //   wo_name: item.formatted_wo_name,
    //   selectedDate: undefined,
    //   formattedDate: item.formattedDateDetail,
    //   refreshStatus: function () {
    //     onRefreshJobQueue();
    //   }.bind(this),
    //   queue: 1,
    //   offline: !isConnected,
    //   syncroRequests: (() => {}).bind(this),
    // });
    // props.dispatch(TopSheetActions.copyWoName(item.formatted_client_name));
  }

  const handleItemPress = useCallback((id: string) => {
    console.log(id)
    navigate(RoutesNavigation.Topsheet, {
      id,
      queue: 1
    })
  }, []);

  const formattedItems = useMemo(() => {
    if (!jobqueueLista?.length) return [];

    const base = isFilterActive
      ? jobqueueLista.filter((job) =>
          job.crew?.some(
            (c) =>
              c.id_user === sessionUser!.user_id &&
              (c.status === STARTED_STATUS || c.status === PAUSED_STATUS),
          ),
        )
      : jobqueueLista;

    // Simplemente formateamos las propiedades y no agrupamos por fecha
    return base.map((job) => ({
      ...job,
      __dateFmt: getFormattedDate(job.scheduled_on, 'dddd MMM[.] DD'),
      statusOwn: job.crew?.some(
        (x) => x.id_user === sessionUser?.user_id && x.status === PAUSED_STATUS,
      ),
      formattedName: `${job.wo_order} • ${job.client_name?.substring(
        job.client_name.indexOf(' '),
      )}`,
    })) as FormattedJobType[];
  }, [jobqueueLista, isFilterActive, sessionUser?.user_id]);

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<FormattedJobType>) =>
      item.type == WO_TYPE_PLACEHOLDER ? (
        <PlaceholderCard
          title_instructions={item.instructions}
          instructions={item.wo_title}
          date={item.__dateFmt}
          crUpdate={item.cr_update}
          scheduled_on={item.scheduled_on}
          status={item.wo_status ?? WO_DEFAULT_NAME}
          jobQueue={true}
          paused={item.paused}
          prepped={item.prepped}
        />
      ) : (
        <>
          <TimelineCard
            id={item.id}
            name={item.formattedName!}
            paused={item.paused}
            prepped={item.prepped}
            statusOwn={item.statusOwn}
            date={item.__dateFmt!}
            bolSended={item.bol_sended}
            crUpdate={item.cr_update}
            icon={item.icon}
            iconColor={item.icon_color}
            iconType={item.icon_type as FAIconType}
            instructions={item.instructions}
            item={item.total_items}
            manager={item.account_manager_name}
            onPress={handleItemPress}
            signatureBolCount={item.signature_bol_count}
            status={item.wo_status ?? WO_DEFAULT_NAME}
            title_instructions={item.wo_title}
            wo_type={item.job_type_desc}
            jobQueue={true}
            isFilterActive={isFilterActive}
            isOnline={online}
          />
        </>
      ),
    [handleItemPress, isFilterActive, online],
  );

  const keyExtractor = useCallback(
    (item: FormattedJobType) => item.id.toString(),
    [],
  );

  const refetchJobQueue = useCallback(() => {
    refetch();
  }, []);

  const selectedDate = useMemo(() => {
    return new Date(getValueByType(JOBQUEUE_START_DATE) ?? Date.now());
  }, [START_DATE]);

  return (
    <Wrapper style={[GLOBAL_STYLES.containerTabContent, styles.container]}>
      <Wrapper style={styles.containerFilterHeader}>
        <Wrapper style={{paddingHorizontal: 10, position: "relative" }}>
          <BottomSheetSelectInput
            options={locationPlaces ?? []}
            label="Search places"
            placeholder="Service location"
            idKey="name"
            value={serviceLocation}
            multiple
            onChange={(val, items) => setServiceLocation(val as string[])}
          />
        </Wrapper>

        <Wrapper style={styles.containerInputFilter}>
          <Wrapper style={[styles.containerInputSearch]}>
            {orderBy == JOBQUEUE_STATUS && (
              <BottomSheetSelectInput
                searchable={false}
                options={woStatusList}
                label="Status"
                placeholder="All"
                value={filter as string}
                onChange={(val) =>
                  onChangeValueByType(val as string, JOBQUEUE_STATUS)
                }
              />
            )}

            {orderBy == JOBQUEUE_CLIENT && (
              <SearchInput
                returnKeyType="search"
                placeholder="Client"
                value={filter as string}
                onChange={(val) =>
                  onChangeValueByType(val as string, JOBQUEUE_CLIENT)
                }
                onSubmit={refetchJobQueue}
              />
            )}

            {orderBy == JOBQUEUE_WOTYPE && (
              <BottomSheetSelectInput
                searchable={false}
                options={woTypeList}
                label="WO Type"
                placeholder="All"
                value={filter as string}
                onChange={(val) =>
                  onChangeValueByType(val as string, JOBQUEUE_WOTYPE)
                }
              />
            )}

            {orderBy == JOBQUEUE_START_DATE && (
              <>
                <Wrapper style={[GLOBAL_STYLES.inputDate, styles.inputDate]}>
                  <PressableOpacity
                    style={[
                      styles.selectableInputDate,
                      {
                        width: filter != '' && filter != null ? '90%' : '100%',
                      },
                    ]}
                    onPress={() => showDatePicker()}>
                    <Label style={{color: '#959595'}}>
                      {getFormattedDateFilter}
                    </Label>
                    <Icon
                      containerStyle={{paddingRight: 5}}
                      name="angle-down"
                      color="#959595"
                      size={16}
                    />
                  </PressableOpacity>
                  {filter && (
                    <PressableOpacity
                      onPress={() => handleConfirm(null)}
                      style={[styles.clearInputDate, {width: '10%'}]}>
                      <Icon
                        containerStyle={{}}
                        name="times-circle"
                        color="#959595"
                        type="solid"
                        size={16}
                      />
                    </PressableOpacity>
                  )}
                </Wrapper>
                {datePickerVisibility && (
                  <DateTimePickerModal
                    date={selectedDate}
                    isVisible={datePickerVisibility}
                    mode="date"
                    timeZoneName={getDeviceTimeZone()}
                    // timeZoneOffsetInMinutes={+10 * 60}
                    onConfirm={(val) => handleConfirm(val)}
                    onCancel={() => hideDatePicker()}
                  />
                )}
              </>
            )}

            {orderBy == JOBQUEUE_WO_NUMBER && (
              <SearchInput
                keyboardType="number-pad"
                returnKeyType="search"
                placeholder="WO Number"
                value={filter as string}
                onChange={(val) =>
                  onChangeValueByType(val as string, JOBQUEUE_WO_NUMBER)
                }
                onSubmit={refetchJobQueue}
              />
            )}
          </Wrapper>
          <BottomSheetSelectIcon
            onChange={(val) => setOrderBy(val as string)}
            options={JOB_QUEUE_FILTER_LIST}
            value={orderBy}
            label="Filter by"
            searchable={false}
            triggerComponent={<Icon name="bars" type="solid" size={20} />}
            triggerStyle={styles.containerBtnFilter}
          />
        </Wrapper>

        <Wrapper style={styles.containerFilteredBy}>
          <Wrapper style={[GLOBAL_STYLES.row, {gap: 5}]}>
            <Icon name="sort-amount-down-alt" color="gray" size={12} />
            <Label style={styles.filteredBy}>Filtered by:</Label>
            <Label style={styles.filterByText}>
              {serviceLocation?.length == 0 ? '' : 'SERVICE LOCATION, '}
              {JOBQUEUE_ORDER_BY_TYPES[orderBy]}
            </Label>

            {isRefetchingJobQueue && (
              <ActivityIndicator
                color="#1155cc"
                size="small"
                style={{marginLeft: 10}}
              />
            )}
          </Wrapper>
        </Wrapper>
      </Wrapper>

      {(isLoadingJobQueue || isLoadingLocationPlaces) && (
        <Wrapper style={GLOBAL_STYLES.backgroundLoading}>
          <ActivityIndicator size="large" color={'#487EFD'} />
        </Wrapper>
      )}

      <FlatList
        ref={flatlistJobQ}
        data={formattedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onRefresh={refetchJobQueue}
        refreshing={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true} // (solo en Android)
        updateCellsBatchingPeriod={50}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flex: 1,
    flexGrow: 1,
    backgroundColor: '#fafafa',
    width: '100%',
  },
  containerInputFilter: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  containerInputSearch: {
    width: '85%',
    height: 40,
  },
  inputDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
  },
  selectableInputDate: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    justifyContent: 'space-between',
    width: '90%',
  },
  clearInputDate: {
    paddingRight: 5,
    width: '10%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerBtnFilter: {
    width: '15%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerFilteredBy: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    paddingTop: 10,
  },
  filteredBy: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'gray',
  },
  filterByText: {
    fontSize: 11,
    color: 'gray',
    textTransform: 'capitalize',
  },
  containerFilterHeader: {
    paddingVertical: 10,
    gap: 5,
  },
});

export const JobQueueView = memo(JobQueueViewCmp);
