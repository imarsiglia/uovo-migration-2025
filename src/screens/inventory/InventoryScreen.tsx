import {
  FINALIZED_STATUS,
  GLOBAL_FONT_SIZE_MULTIPLIER_XS,
  INVENTORY_STATUS_TYPES,
  PAUSED_STATUS,
  QUERY_KEYS,
  STARTED_STATUS,
} from '@api/contants/constants';
import {
  useDeleteItem,
  useGetJobInventory,
  usePrepareInventory,
  useUpdateAllInventoryStatus,
  useUpdateInventoryStatus,
} from '@api/hooks/HooksInventoryServices';
import {JobInventoryType} from '@api/types/Inventory';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {RoundedButton} from '@components/commons/buttons/RoundedButton';
import {SpinningIcon} from '@components/commons/spin/SpinningIcon';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import HeaderInventory from '@components/inventory/HeaderInventory';
import RowInventory from '@components/inventory/RowInventory';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RoutesNavigation} from '@navigation/types';
import {useFocusEffect} from '@react-navigation/native';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import useInventoryStore from '@store/inventory';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {lockToLandscape, lockToPortrait} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, TextInput} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const InventoryScreen = () => {
  const refsearch = useRef<TextInput | null>(null);
  const {goBack, navigate} = useCustomNavigation();
  const sessionUser = useAuth((d) => d.user);
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {
    orderFilter,
    orderType,
    topSheetFilter,
    inventoryFilter,
    setInventoryFilter,
  } = useInventoryStore();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {online} = useOnline();

  const [tempFilter, setTempFilter] = useState<string | undefined>('');
  const [showFilter, setShowFilter] = useState(false);

  const {hardRefreshMany} = useRefreshIndicator([
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: jobDetail?.id,
        filter: topSheetFilter,
        orderFilter,
        orderType,
      },
    ],
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: jobDetail?.id,
        filter: inventoryFilter,
        orderFilter,
        orderType,
      },
    ],
  ]);

  const {data: inventory, isRefetching} = useGetJobInventory({
    idJob: jobDetail?.id!,
    filter: inventoryFilter,
    orderFilter,
    orderType,
  });

  const refetchAll = useCallback(() => {
    return hardRefreshMany();
  }, [hardRefreshMany, jobDetail?.id, topSheetFilter, orderFilter, orderType]);

  const {mutateAsync: updateInventoryStatus} = useUpdateInventoryStatus();
  const {
    mutateAsync: updateAllInventoryStatus,
    isPending: isPendingAllInventory,
  } = useUpdateAllInventoryStatus();

  const {mutateAsync: prepareInventory, isPending: isPendingPrep} =
    usePrepareInventory();

  const {mutateAsync: deleteInventory, isPending: isPendingDelete} =
    useDeleteItem();

  useFocusEffect(() => {
    lockToLandscape();
  });

  useEffect(() => {
    return () => {
      lockToPortrait();
    };
  }, []);

  const allChecked = useMemo(() => {
    return inventory?.every((x) =>
      x.status?.toUpperCase()?.includes(INVENTORY_STATUS_TYPES.LOCKED_BY),
    );
  }, [inventory]);

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
      status: mStatus!,
    }).then(async () => {
      refetchAll();
    });
  }, [jobDetail?.id, inventory, updateAllInventoryStatus, refetchAll]);

  const onViewDetail = useCallback((item: JobInventoryType) => {
    navigate(RoutesNavigation.ItemDetail, {
      id: item.id,
      fromInventory: true,
    });
  }, []);

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
          status: mStatus!,
        });
        await refetchAll();
      }
      return Promise.resolve(true);
    },
    [isInventoryDisabled, sessionUser, updateInventoryStatus, refetchAll],
  );

  const status = useMemo(() => {
    return jobDetail?.current_clock_in?.status ?? jobDetail?.wo_status;
  }, [jobDetail?.current_clock_in, jobDetail?.wo_status]);

  const isDisabled = useMemo(() => {
    return status == FINALIZED_STATUS;
  }, [status]);

  const search = useCallback(() => {
    setInventoryFilter(tempFilter?.trim());
    setShowFilter(false);
  }, [tempFilter]);

  const cancelSearch = useCallback(() => {
    setShowFilter(false);
    if (refsearch.current) {
      refsearch.current.blur();
    }
  }, [setShowFilter, refsearch?.current]);

  const onBack = useCallback(() => {
    if (showFilter) {
      cancelSearch();
    } else {
      goBack();
    }
  }, [showFilter, goBack, cancelSearch]);

  const initSearch = useCallback(() => {
    setShowFilter(true);
    setTempFilter(inventoryFilter);
    setTimeout(() => {
      if (refsearch.current) {
        refsearch.current.blur();
        refsearch.current.focus();
      }
    }, 200);
  }, [setInventoryFilter, setShowFilter, setTempFilter, refsearch?.current]);

  const clearFilter = useCallback(() => {
    setTempFilter('');
    setInventoryFilter('');
  }, [setTempFilter, setInventoryFilter]);

  const searched = useMemo(() => {
    return inventoryFilter?.trim()?.length! > 0;
  }, [inventoryFilter]);

  const onDeleteItem = useCallback(
    (item: JobInventoryType) => {
      loadingWrapperPromise(
        deleteInventory({
          id: item?.id,
        })
          .then((d) => {
            if (d) {
              showToastMessage('Item removed successfully');
              refetchAll();
            } else {
              showErrorToastMessage(
                'An error occurred while removing inventory',
              );
            }
          })
          .catch(() => {
            showErrorToastMessage('An error occurred while removing inventory');
          }),
      );
    },
    [deleteInventory, refetchAll],
  );

  const initPrepped = useCallback(() => {
    showDialog({
      modalVisible: true,
      type: 'info',
      cancelable: true,
      message: (
        <Wrapper
          style={[GLOBAL_STYLES.bodyModalClockOut, {paddingHorizontal: 0}]}>
          <Label style={GLOBAL_STYLES.titleModalClockOut}>
            PREP INVENTORY?
          </Label>
          <Label style={GLOBAL_STYLES.descModalClockOut}>
            Are you sure you want to prep the inventory?
          </Label>
        </Wrapper>
      ),
      onConfirm: () => {
        showDialog({
          modalVisible: false,
        });
        loadingWrapperPromise(
          prepareInventory({
            idJob: jobDetail?.id!,
          })
            .then((d) => {
              if (d) {
                showToastMessage('Inventory prepped successfully');
                refetchAll();
              } else {
                showErrorToastMessage(
                  'An error occurred while preparing inventory',
                );
              }
            })
            .catch(() => {
              showErrorToastMessage(
                'An error occurred while preparing inventory',
              );
            }),
        );
      },
    });
  }, [showDialog, prepareInventory, jobDetail?.id]);

  const onInitAdd = useCallback(() => {
    navigate(RoutesNavigation.AddInventory);
  }, [navigate]);

  const {pillStyle, textStyle, label} = useMemo(() => {
    if (!online) {
      return {
        pillStyle: [styles.containerState, styles.offline],
        textStyle: [styles.statusText, styles.text_offline],
        label: 'Offline',
      };
    }
    if (status === PAUSED_STATUS) {
      return {
        pillStyle: [styles.containerState, styles.paused],
        textStyle: [styles.statusText, styles.paused_text],
        label: status,
      };
    }
    if (status === FINALIZED_STATUS) {
      return {
        pillStyle: [styles.containerState, styles.finished],
        textStyle: [styles.statusText, styles.finished_text],
        label: status,
      };
    }
    return {
      pillStyle: [styles.containerState, styles.inProgress],
      textStyle: [styles.statusText, styles.inProgress_text],
      label: status,
    };
  }, [online, status]);

  const isAltIdVisible = useMemo(() => {
    return inventory?.some(
      (x) => !!x.clientinv2 && x.clientinv2.trim().length > 0,
    );
  }, [inventory]);

  const isClientRefVisible = useMemo(() => {
    return inventory?.some(
      (x) => !!x.clientref && x.clientref.trim().length > 0,
    );
  }, [inventory]);

  return (
    <Wrapper style={styles.container}>
      <Wrapper
        style={[
          styles.headerContainer,
          {justifyContent: showFilter ? 'flex-start' : 'space-between'},
        ]}>
        <Wrapper style={[GLOBAL_STYLES.row, {gap: 5}]}>
          <BackButton
            title={showFilter ? 'Cancel' : 'Topsheet'}
            onPress={onBack}
          />
          {!showFilter && (
            <RoundedButton
              onPress={onInitAdd}
              disabled={isDisabled}
              label="Add"
              style={{minHeight: 27}}
              icon={<Icon name="plus" color={COLORS.white} size={14} />}
              labelProps={{
                maxFontSizeMultiplier: GLOBAL_FONT_SIZE_MULTIPLIER_XS,
              }}
            />
          )}
        </Wrapper>

        {showFilter && (
          <Wrapper style={styles.containerInputSearch}>
            <TextInput
              ref={refsearch}
              numberOfLines={1}
              style={styles.inputSearch}
              value={tempFilter}
              returnKeyType="search"
              onChangeText={setTempFilter}
              onSubmitEditing={search}
              selectTextOnFocus={true}
              maxLength={40}
              allowFontScaling={false}
            />
            <PressableOpacity
              onPress={() => search()}
              style={{
                alignSelf: 'center',
                position: 'absolute',
                right: 10,
              }}>
              <Icon name="search" color="#959595" type="solid" size={15} />
            </PressableOpacity>
          </Wrapper>
        )}

        {!showFilter && (
          <Wrapper style={GLOBAL_STYLES.row}>
            <Label
              style={[
                GLOBAL_STYLES.title,
                GLOBAL_STYLES.bold,
                styles.topsheet,
                {fontSize: 27},
              ]}
              allowFontScaling={false}>
              Inventory
            </Label>
            <Wrapper style={pillStyle}>
              <Label
                style={textStyle}
                maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_XS}>
                {label}
              </Label>
            </Wrapper>
          </Wrapper>
        )}

        <Wrapper style={GLOBAL_STYLES.row}>
          {!showFilter && (
            <>
              <PressableOpacity
                onPress={initPrepped}
                disabled={isDisabled}
                style={[styles.btnPlay, {opacity: isDisabled ? 0.3 : 1}]}>
                <Icon name="check" type="solid" color="white" size={14} />
                <Label
                  style={styles.textPlay}
                  maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_XS}>
                  Prepped
                </Label>
              </PressableOpacity>

              <PressableOpacity
                onPress={refetchAll}
                style={[GLOBAL_STYLES.btnOptTop]}>
                <SpinningIcon
                  color={COLORS.white}
                  size={14}
                  spin={isRefetching || isPendingPrep || isPendingAllInventory}
                />
              </PressableOpacity>

              <PressableOpacity
                onPress={() => initSearch()}
                style={GLOBAL_STYLES.btnOptTop}>
                <Icon name="search" color="white" type="solid" size={15} />
              </PressableOpacity>
            </>
          )}
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      {searched && (
        <Wrapper style={[GLOBAL_STYLES.row, {padding: 10}]}>
          <Label allowFontScaling={false}>Filter: </Label>
          <PressableOpacity
            style={[GLOBAL_STYLES.row, styles.tagFilter]}
            onPress={clearFilter}>
            <Label style={styles.textFilter} allowFontScaling={false}>
              "{inventoryFilter?.trim()}"
            </Label>
            <Icon name="times-circle" type="solid" color="white" size={12} />
          </PressableOpacity>
        </Wrapper>
      )}

      <ScrollView
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        horizontal>
        <Wrapper>
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
            deleteBtn="Delete"
            hasImage="Has image"
            isAltIdVisible={isAltIdVisible}
            isClientRefVisible={isClientRefVisible}
          />

          {inventory && (
            <FlatList
              data={inventory}
              renderItem={({item, index}) => (
                <RowInventory
                  key={index}
                  id={item.clientinv}
                  id2={item.clientinv2}
                  showSecondaryId={jobDetail?.show_secondary_inv_id}
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
                  disabled={isInventoryDisabled}
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
                  onCheck={() => onCheckItem(item)}
                  viewDetail={() => onViewDetail(item)}
                  hasConditionReport={item.has_condition_report}
                  hasConditionCheck={item.has_condition_check}
                  user={sessionUser}
                  deleteBtn={() => onDeleteItem(item)}
                  hasImage={!!item.netsuite_image}
                  isAltIdVisible={isAltIdVisible}
                  isClientRefVisible={isClientRefVisible}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  btnPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 27,
    width: 120,
  },
  textPlay: {
    color: 'white',
    paddingLeft: 5,
    fontSize: 15,
    opacity: 0.9,
  },
  topsheet: {
    color: '#3a3a3a',
  },
  containerState: {
    marginLeft: 5,
    borderRadius: 50,
    padding: 3,
    paddingLeft: 12,
    paddingRight: 12,
  },
  text_offline: {
    color: 'white',
  },
  inProgress: {
    backgroundColor: '#DFFAF4',
  },
  inProgress_text: {
    color: '#50E3C2',
  },
  paused: {
    backgroundColor: '#F7F5F4',
  },
  paused_text: {
    color: '#959595',
  },
  finished: {
    backgroundColor: '#FFDCDC',
  },
  finished_text: {
    color: '#FF6161',
  },
  offline: {
    backgroundColor: 'black',
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
    marginRight: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  inputSearch: {
    width: '90%',
    color: '#959595',
    fontSize: 14,
    padding: 0,
    alignItems: 'center',
    textAlign: 'left',
  },
  containerInputSearch: {
    opacity: 1,
    borderRadius: 5,
    height: 25,
    paddingHorizontal: 10,
    borderWidth: 0.3,
    borderColor: '#959595',
    flexDirection: 'row',
    marginLeft: 10,
    width: '50%',
    maxWidth: '50%',
  },
  statusText: {
    fontSize: 12,
  },
});
