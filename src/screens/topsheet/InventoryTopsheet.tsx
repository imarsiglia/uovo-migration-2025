import {INVENTORY_STATUS_TYPES, STARTED_STATUS} from '@api/contants/constants';
import {
  useGetJobInventory,
  useUpdateAllInventoryStatus,
  useUpdateInventoryStatus,
} from '@api/hooks/HooksInventoryServices';
import {JobInventoryType} from '@api/types/Inventory';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import SearchInput from '@components/commons/inputs/SearchInput';
import {IndicatorLoading} from '@components/commons/loading/IndicatorLoading';
import {SpinningIcon} from '@components/commons/spin/SpinningIcon';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import HeaderInventory from '@components/inventory/HeaderInventory';
import RowInventory from '@components/inventory/RowInventory';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {useAuth} from '@store/auth';
import useInventoryStore from '@store/inventory';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useCallback, useMemo, useState} from 'react';
import {FlatList, ScrollView, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const InventoryTopsheet = () => {
  const sessionUser = useAuth((d) => d.user);
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {navigate} = useCustomNavigation();
  const {orderFilter, orderType, topSheetFilter, setTopSheetFilter} =
    useInventoryStore();

  const {
    data: inventory,
    isLoading,
    isRefetching,
    refetch,
  } = useGetJobInventory({
    idJob: jobDetail?.id!,
    filter: topSheetFilter,
    orderFilter,
    orderType,
  });

  const {mutateAsync: updateInventoryStatus} = useUpdateInventoryStatus();
  const {
    mutateAsync: updateAllInventoryStatus,
    isPending: isPendingAllInventory,
  } = useUpdateAllInventoryStatus();

  const onCheckAll = useCallback(() => {
    let mStatus: string | null = null;
    if (
      inventory?.length! > 0 &&
      inventory?.every((x) =>
        x.status?.toUpperCase()?.includes(INVENTORY_STATUS_TYPES.LOCKED_BY),
      )
    ) {
      mStatus = null;
    } else {
      mStatus = INVENTORY_STATUS_TYPES.LOCKED_BY;
    }
    updateAllInventoryStatus({
      idJob: jobDetail?.id!,
      status: mStatus,
    }).then(() => {
      refetch();
    });
  }, [jobDetail?.id, inventory, updateAllInventoryStatus]);

  const allChecked = useMemo(() => {
    return inventory?.every((x) =>
      x.status?.toUpperCase()?.includes(INVENTORY_STATUS_TYPES.LOCKED_BY),
    );
  }, [inventory]);

  const onViewDetail = useCallback((item: JobInventoryType) => {
    navigate(RoutesNavigation.ItemDetail, {
      id: item?.id,
    });
  }, []);

  const isInventoryDisabled = useMemo(() => {
    return (
      !jobDetail?.current_clock_in ||
      jobDetail?.current_clock_in?.status != STARTED_STATUS
    );
  }, [jobDetail?.current_clock_in]);

  const isActionsEnabled = useMemo(() => {
    return (
      jobDetail?.current_clock_in &&
      jobDetail?.current_clock_in?.status == STARTED_STATUS
    );
  }, [jobDetail?.current_clock_in]);

  const showFullList = useCallback(() => {
    navigate(RoutesNavigation.Inventory);
  }, [navigate]);

  const onCheckItem = useCallback(
    async (item: JobInventoryType) => {
      if (
        !(
          isInventoryDisabled ||
          item.status
            ?.toUpperCase()
            ?.includes(INVENTORY_STATUS_TYPES.COMPLETED_BY) ||
          (item.status
            ?.toUpperCase()
            ?.includes(INVENTORY_STATUS_TYPES.LOCKED_BY) &&
            !item.status
              ?.toUpperCase()
              ?.includes(
                INVENTORY_STATUS_TYPES.LOCKED_BY +
                  ' ' +
                  (sessionUser?.user_name + ' ' + sessionUser?.user_last_name)
                    .toUpperCase()
                    .trim(),
              ))
        )
      ) {
        let mStatus: string | null;
        const currentStatus = item.status?.toUpperCase().trim() || '';
        if (currentStatus.includes(INVENTORY_STATUS_TYPES.PROCESSING_BY)) {
          mStatus = INVENTORY_STATUS_TYPES.READY_TO_TRANSPORT;
        } else if (currentStatus.includes(INVENTORY_STATUS_TYPES.LOCKED_BY)) {
          mStatus = null;
        } else if (currentStatus === '') {
          mStatus = INVENTORY_STATUS_TYPES.LOCKED_BY;
        } else if (
          currentStatus.includes(INVENTORY_STATUS_TYPES.READY_TO_TRANSPORT)
        ) {
          mStatus = INVENTORY_STATUS_TYPES.PROCESSING_BY;
        } else if (
          currentStatus.includes(INVENTORY_STATUS_TYPES.PROCESSING_BY)
        ) {
          mStatus = INVENTORY_STATUS_TYPES.COMPLETED_BY;
        } else {
          mStatus = INVENTORY_STATUS_TYPES.LOCKED_BY;
        }
        await updateInventoryStatus({
          idInventory: item.id,
          status: mStatus,
        });
        await refetch();
      }
      return Promise.resolve(true);
    },
    [isInventoryDisabled, sessionUser, updateInventoryStatus, refetch],
  );

  if (!jobDetail) {
    return <></>;
  }

  return (
    <Wrapper style={styles.container}>
      <SearchInput
        value={topSheetFilter}
        onChange={(text) => setTopSheetFilter(text)}
        placeholder="Search item"
      />

      <Wrapper style={styles.containerTopButtons}>
        <PressableOpacity style={styles.showFullList} onPress={showFullList}>
          <Label style={styles.showFullListText}>Show full list</Label>
          <Icon name="table" color="white" type="solid" size={16} />
        </PressableOpacity>
        <PressableOpacity
          style={GLOBAL_STYLES.btnOptTop}
          onPress={() => refetch()}>
          <SpinningIcon size={16} spin={isRefetching} />
        </PressableOpacity>
      </Wrapper>

      <Wrapper style={[GLOBAL_STYLES.row, {gap: 10, minHeight: 20}]}>
        <Label style={styles.showingText}>Showing {inventory?.length}</Label>
        {(isRefetching || isPendingAllInventory || isLoading) && (
          <IndicatorLoading
            containerStyle={{alignItems: 'flex-start', alignSelf: 'flex-start'}}
            activityIndicatorProps={{
              color: COLORS.primary,
              size: 'small',
            }}
          />
        )}
      </Wrapper>

      <Wrapper style={[styles.table, {marginBottom: 55}]}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          horizontal
          //   ref={refScroll}
        >
          <Wrapper>
            <Wrapper style={{flexDirection: 'row'}}>
              <HeaderInventory
                id="ID"
                showSecondaryId={jobDetail?.show_secondary_inv_id}
                clientInvDisplay="Title"
                clientRef="Client Ref"
                location="Location"
                artistName="Artist name"
                packingDetailsDisplay="Packing Details"
                dimensions="Dimensions"
                condition="Condition"
                status="Status"
                disabled={isInventoryDisabled}
                showCheck={inventory?.length! > 0}
                checked={allChecked}
                onCheckAll={onCheckAll}
              />
            </Wrapper>

            {inventory && (
              <FlatList
                data={inventory}
                renderItem={({item, index}) => (
                  <RowInventory
                    key={index}
                    id={item.clientinv}
                    id2={item.clientinv2}
                    showSecondaryId={jobDetail.show_secondary_inv_id}
                    clientInvDisplay={item.clientinv_display}
                    clientRef={item.clientref}
                    location={item.fromlocation_display}
                    artistName={
                      item.artist != null && item.artist != 'null'
                        ? item.artist
                        : ''
                    }
                    packingDetailsDisplay={item.packing_details_display}
                    packedHeight={item.packed_height}
                    packedLength={item.packed_length}
                    packedWidth={item.packed_width}
                    status={item.status ?? 'Pending'}
                    checked={
                      !!item.status &&
                      item.status?.trim() != '' &&
                      (item.status
                        ?.toUpperCase()
                        ?.includes(INVENTORY_STATUS_TYPES.LOCKED_BY) ||
                        item.status
                          ?.toUpperCase()
                          ?.includes(INVENTORY_STATUS_TYPES.PROCESSING_BY) ||
                        item.status
                          ?.toUpperCase()
                          ?.includes(INVENTORY_STATUS_TYPES.COMPLETED_BY))
                    }
                    actions={isActionsEnabled}
                    disabled={isInventoryDisabled}
                    onCheck={() => onCheckItem(item)}
                    viewDetail={() => onViewDetail(item)}
                    hasConditionReport={item.has_condition_check}
                    hasConditionCheck={item.has_condition_check}
                    user={sessionUser}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </Wrapper>
        </ScrollView>

        <Wrapper
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 30,
            gap: 5,
            marginBottom: 5,
          }}>
          <Wrapper style={styles.divInfo}>
            <Icon
              name="info"
              color="white"
              type="solid"
              size={9}
              style={styles.iconInfo}
            />
          </Wrapper>
          <Label
            style={[styles.textInfo, {marginTop: 4}]}
            allowFontScaling={false}>
            Swipe to the left to see more columns
          </Label>
        </Wrapper>
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: COLORS.bgWhite,
    flex: 1,
  },
  containerTopButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
  },
  showFullList: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  showFullListText: {
    color: 'white',
    fontSize: 12,
    marginRight: 8,
  },
  showingText: {
    fontSize: 12,
    color: '#464646',
    opacity: 0.66,
  },
  table: {
    marginTop: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#d0d0d0',
    flex: 1,
    overflow: 'hidden',
  },
  divInfo: {
    backgroundColor: '#959595',
    borderRadius: 50,
    justifyContent: 'center',
    width: 18,
    height: 18,
    alignItems: 'center',
  },
  iconInfo: {
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
  },
  textInfo: {
    paddingLeft: 3,
    height: 15,
    fontSize: 12,
    color: '#464646',
    opacity: 0.66,
    marginBottom: 5,
  },
});
