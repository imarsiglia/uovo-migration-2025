import {QUERY_KEYS} from '@api/contants/constants';
import {
  useGetHistoryReportMaterials,
  useGetReportMaterials,
  useRegisterReportMaterials,
} from '@api/hooks/HooksTaskServices';
import {HistoryReportMaterialType, ReportMaterialType} from '@api/types/Task';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {CollapsibleItem} from '@components/commons/collapsible/CollapsibleItem';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {Column, ColumnHeader} from '@components/reportmaterials/Table';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RoutesNavigation} from '@navigation/types';
import {useIsFocused} from '@react-navigation/native';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getFormattedDate} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {Fragment, useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {useOnline} from '@hooks/useOnline';
import {useQueryClient} from '@tanstack/react-query';
import {
  offlineDeleteOneOfflineReportMaterial,
  offlineUpsertMaterialsList,
} from '@features/materials/offline';
// import OfflineValidation from '../components/offline/OfflineValidation';

export const ReportMaterialsScreen = () => {
  const [itemExpanded, setItemExpanded] = useState<number | undefined>(
    undefined,
  );
  const [detailList, setDetailList] = useState<any[]>([]);
  const {navigate, goBack} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.REPORT_MATERIALS, {idJob}],
    [QUERY_KEYS.TASK_COUNT, {idJob}],
  ]);

  const qc = useQueryClient();
  const {online} = useOnline();
  const materialsQueryKey = [QUERY_KEYS.REPORT_MATERIALS, {idJob}];

  const {
    data: materials,
    isLoading,
    isRefetching,
    refetch,
  } = useGetReportMaterials({idJob});

  const {mutateAsync: removeMaterialAsync} = useRegisterReportMaterials();

  const deleteMaterial = useCallback(
    (item: ReportMaterialType) => {
      showDialog({
        modalVisible: true,
        type: 'warning',
        message: (
          <Wrapper style={styles.bodyModalClockOut}>
            <Label style={styles.titleModalClockOut}>Delete?</Label>
            <Label style={styles.subtitleModalClockOut}>
              Name: {item?.id_material?.name}
            </Label>
            <Label style={styles.subtitleModalClockOut}>
              Unit type: {item?.id_material?.unit}
            </Label>
            <Label style={styles.subtitleModalClockOut}>
              Quantity: {item.quantity}
            </Label>
            <Label style={styles.descModalClockOut}>
              Are you sure you want to delete the current material?
            </Label>
          </Wrapper>
        ),
        cancelable: true,
        onConfirm: () => {
          const filtered = (materials ?? []).filter((x) => {
            if (x.id != null && item.id != null) return x.id !== item.id;
            if (x.clientId != null && item.clientId != null)
              return x.clientId !== item.clientId;
            return true;
          });

          if (online) {
            loadingWrapperPromise(
              removeMaterialAsync({idJob, list: filtered})
                .then((ok) => {
                  if (ok) {
                    refetchAll();
                    showToastMessage('Material deleted successfully');
                  } else {
                    showErrorToastMessage(
                      'Error while removing material, try again',
                    );
                  }
                })
                .catch(() =>
                  showErrorToastMessage('Error while removing material'),
                ),
            );
          } else {
            // OFFLINE: cache optimista + encolar update por LISTA
            qc.setQueryData<any[] | undefined>(materialsQueryKey, filtered);
            if (item.id) {
              offlineUpsertMaterialsList({
                idJob,
                list: filtered.filter((x) => !!x.id),
              });
            } else {
              offlineDeleteOneOfflineReportMaterial({
                idJob,
                clientId: item.clientId!,
              });
            }
            showToastMessage('Queued deletion for sync (offline)');
          }
        },
      });
    },
    [
      online,
      showDialog,
      materials,
      removeMaterialAsync,
      refetchAll,
      offlineDeleteOneOfflineReportMaterial,
      offlineUpsertMaterialsList,
    ],
  );

  function onSelectCollapse(itemId: number) {
    if (itemExpanded == itemId) {
      setItemExpanded(undefined);
      return;
    }
    setItemExpanded(itemId);
  }

  return (
    <Wrapper
      style={[styles.container, {display: 'flex', flexDirection: 'column'}]}>
      {(isLoading || isRefetching) && <GeneralLoading />}

      <Wrapper style={GLOBAL_STYLES.bgwhite}>
        <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
          <PressableOpacity onPress={goBack}>
            <Wrapper style={styles.backBtn}>
              <Icon
                name="chevron-left"
                color="#959595"
                type="light"
                size={15}
              />
              <Label style={styles.backBtnText}>Tasks</Label>
            </Wrapper>
          </PressableOpacity>

          <Wrapper style={{flexDirection: 'row'}}>
            <PressableOpacity
              onPress={() => navigate(RoutesNavigation.SaveReportMaterials)}
              style={styles.btnOptTopSend}>
              <Label style={{color: 'white'}}>Send</Label>
            </PressableOpacity>
          </Wrapper>
        </Wrapper>

        <Wrapper
          style={[
            styles.lateralPadding,
            styles.row,
            {justifyContent: 'space-between'},
          ]}>
          <Wrapper style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Label
              style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold]}
              allowFontScaling={false}>
              Report materials
            </Label>
            {/* <OfflineValidation
                idJob={props.jobDetail.id}
                offline={[MATERIAL_OFFLINE_VALIDATION]}
              /> */}
          </Wrapper>

          <Wrapper
            style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <PressableOpacity
              onPress={() => refetch()}
              style={styles.btnOptTop}>
              <Icon name="sync" color="white" type="solid" size={15} />
            </PressableOpacity>

            <PressableOpacity
              onPress={() => navigate(RoutesNavigation.SaveReportMaterials)}
              style={styles.btnOptTop}>
              <Icon name="plus" color="white" type="solid" size={15} />
            </PressableOpacity>
          </Wrapper>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />

      <Wrapper
        style={{
          marginTop: 20,
          marginHorizontal: 10,
          borderTopStartRadius: 8,
          borderWidth: 1,
          borderTopEndRadius: 8,
          borderRadius: 8,
          borderColor: '#DDDDDD',
          overflow: 'hidden',
          flex: 1,
          marginBottom: 10,
        }}>
        <Wrapper style={{flexDirection: 'row'}}></Wrapper>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Wrapper style={{flexDirection: 'row'}}>
            <ScrollView
              horizontal
              bounces={false}
              alwaysBounceHorizontal={false}
              showsHorizontalScrollIndicator={false}
              overScrollMode="never">
              <Wrapper>
                <Wrapper style={{flexDirection: 'row'}}>
                  <ColumnHeader
                    text={`Name`}
                    style={{
                      width: 180,
                      paddingHorizontal: 20,
                      alignItems: 'left',
                      fontWeight: 'bold',
                    }}
                  />
                  <ColumnHeader text={`Units type`} style={{width: 80}} />
                  <ColumnHeader text={`Qty`} style={{width: 50}} />
                  <ColumnHeader text={`User`} style={{width: 120}} />
                  <ColumnHeader
                    text={`Date`}
                    style={{width: 100, minWidth: 100}}
                  />
                </Wrapper>

                {materials
                  ?.map((item) => ({
                    id: item.id ?? item.clientId,
                    name: item?.id_material?.name,
                    unitType: item?.id_material?.unit,
                    quantity: item.quantity,
                    user: `${item.user_info?.user_name} ${item.user_info?.user_last_name}`,
                    timestamp: getFormattedDate(
                      item.updated_date,
                      'MM/DD/YYYY',
                    ),
                  }))
                  ?.map((objeto) => Object.values(objeto))
                  ?.map((item: any[]) => {
                    return (
                      <AccordionItem
                        key={`${item[0]}`}
                        item={item}
                        expanded={itemExpanded == item[0]}
                        onSelectCollapse={() => onSelectCollapse(item[0])}
                        detailList={detailList}
                      />
                    );
                  })}
              </Wrapper>
            </ScrollView>
            <Wrapper style={{}}>
              <ColumnHeader text={`Actions`} style={{width: 80}} />
              {materials?.map((item, index) => (
                <Fragment key={index}>
                  <Wrapper
                    key={index}
                    style={[
                      styles.column,
                      {
                        width: 80,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                      },
                    ]}>
                    <PressableOpacity
                      style={{marginRight: 10}}
                      onPress={() =>
                        navigate(RoutesNavigation.SaveReportMaterials, {item})
                      }>
                      <Icon
                        name="edit"
                        color={COLORS.terteary}
                        size={18}
                        type="solid"
                      />
                    </PressableOpacity>

                    <PressableOpacity onPress={() => deleteMaterial(item)}>
                      <Icon
                        name="trash"
                        color={COLORS.terteary}
                        size={16}
                        type="solid"
                      />
                    </PressableOpacity>
                  </Wrapper>

                  <Wrapper
                    style={{
                      backgroundColor: 'white',
                    }}>
                    <CollapsibleItem
                      collapsed={(item.id ?? item.clientId) != itemExpanded}>
                      <Wrapper
                        style={{
                          height:
                            40 *
                            (detailList && detailList?.length > 0
                              ? detailList.length
                              : 1),
                        }}></Wrapper>
                    </CollapsibleItem>
                  </Wrapper>
                </Fragment>
              ))}
            </Wrapper>
          </Wrapper>

          {materials
            ?.map((item) => ({
              id: item?.id_material?.id,
              job: item.id_job,
              idItem: item.id ?? item.clientId,
            }))
            ?.map((item, index) => (
              <AccordionAux
                key={index}
                item={item}
                index={index}
                expanded={item.idItem == itemExpanded}
                onLoadData={setDetailList}
                refreshing={isRefetching}
              />
            ))}
        </ScrollView>
      </Wrapper>
    </Wrapper>
  );
};

type AccordionItemProps = {
  item: any[];
  expanded: boolean;
  onSelectCollapse: () => void;
  detailList: any[];
};

const AccordionItem = ({
  item,
  expanded,
  onSelectCollapse,
  detailList,
}: AccordionItemProps) => {
  return (
    <>
      <PressableOpacity
        style={{flexDirection: 'row', overflow: 'visible'}}
        onPress={onSelectCollapse}>
        {item.slice(1)?.map((subitem, index) => (
          <Column
            key={index}
            text={subitem}
            style={
              index == 0
                ? {
                    width: 180,
                    paddingHorizontal: 20,
                    alignItems: 'left',
                  }
                : index == 1
                ? {width: 80, paddingHorizontal: 10}
                : index == 2
                ? {width: 50, paddingHorizontal: 10}
                : index == 3
                ? {width: 120, paddingHorizontal: 10}
                : index == 4
                ? {width: 100, minWidth: 100, paddingHorizontal: 5}
                : {}
            }
          />
        ))}
      </PressableOpacity>

      <Wrapper
        style={{
          backgroundColor: 'white',
        }}>
        <CollapsibleItem collapsed={!expanded}>
          <Wrapper
            style={{
              height:
                40 *
                (detailList && detailList?.length > 0 ? detailList.length : 1),
            }}></Wrapper>
        </CollapsibleItem>
      </Wrapper>
    </>
  );
};

type AuxItemType = {
  id?: number;
  job?: number;
  idItem?: number | string;
};

type AccordionAuxProps = {
  item: AuxItemType;
  index: number;
  expanded: boolean;
  onLoadData: (data: any[]) => void;
  refreshing: boolean;
};
const AccordionAux = ({
  item,
  index,
  expanded,
  onLoadData,
  refreshing,
}: AccordionAuxProps) => {
  const [detailList, setDetailList] = useState<HistoryReportMaterialType[]>([]);
  const isFocused = useIsFocused();

  const {refetch} = useGetHistoryReportMaterials({
    idJob: item.job!,
    id: item.id!,
    enabled: expanded,
  });

  useEffect(() => {
    if (expanded) {
      getData();
    }
  }, [expanded, isFocused, refreshing]);

  async function getData() {
    refetch()
      .then((d) => {
        if (d.data) {
          setDetailList(d.data);
          onLoadData(d.data);
        }
      })
      .catch(() => {});
  }

  return (
    <>
      <Wrapper
        style={{
          width: '100%',
          backgroundColor: '#F7F7F7',
          position: 'absolute',
          top: 85 + index * 50,
        }}>
        <CollapsibleItem collapsed={!expanded}>
          {detailList && detailList?.length > 0 ? (
            <Wrapper
              style={{
                alignItems: 'center',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: '#DDDDDD',
              }}>
              {detailList?.map((item, index) => (
                <Fragment key={index}>
                  <Wrapper
                    key={index}
                    style={{
                      flexDirection: 'row',
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Wrapper style={{width: 120, alignItems: 'center'}}>
                      <Label style={styles.detailText}>
                        {item.display_name}
                      </Label>
                    </Wrapper>

                    <Wrapper style={{width: 80, alignItems: 'center'}}>
                      <Label
                        style={[
                          styles.detailText,
                          {textTransform: 'capitalize'},
                        ]}>
                        {item.operation_desc}
                      </Label>
                    </Wrapper>

                    <Wrapper style={{width: 50, alignItems: 'center'}}>
                      <Label style={styles.detailText}>{item.quantity}</Label>
                    </Wrapper>

                    <Wrapper
                      style={{width: 100, minWidth: 100, alignItems: 'center'}}>
                      <Label style={styles.detailText}>
                        {getFormattedDate(item.date_of_event, 'MM/DD/YYYY')}
                      </Label>
                    </Wrapper>
                  </Wrapper>

                  {index < detailList.length - 1 && (
                    <Wrapper
                      style={{
                        height: 1,
                        width: '95%',
                        backgroundColor: '#DDDDDD',
                      }}></Wrapper>
                  )}
                </Fragment>
              ))}
            </Wrapper>
          ) : (
            <Wrapper
              style={{
                flexDirection: 'row',
                height: 40,
                alignItems: 'center',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: '#DDDDDD',
              }}>
              <Label style={styles.detailText}></Label>
            </Wrapper>
          )}
        </CollapsibleItem>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  containerItemDetail: {
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F7F5F4',
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
  },
  btnOptTopSend: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    paddingHorizontal: 25,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalClockOut: {
    borderRadius: 20,
    width: '100%',
    backgroundColor: 'white',
  },
  bodyModalClockOut: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleModalClockOut: {
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  subtitleModalClockOut: {
    color: '#3C424A',
    marginBottom: 0,
    textAlign: 'center',
  },
  descModalClockOut: {
    color: '#707070',
    marginTop: 20,
    textAlign: 'center',
  },
  optionModalClockOut: {
    fontSize: 15,
    color: COLORS.primary,
  },
  btnOptionModalClockOut: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#08141F21',
  },
  containerOptionModalClockout: {
    borderBottomLeftRadius: 20,
    borderRightWidth: 1,
    borderRightColor: '#08141F21',
  },
  containerOptionsModalClockOut: {
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#08141F21',
    marginTop: 20,
  },
  borderFull: {
    borderTopWidth: 1,
    borderTopColor: '#08141F21',
  },
  column: {
    backgroundColor: 'white',
    width: 71,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
    borderBottomWidth: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#707070',
  },
});
