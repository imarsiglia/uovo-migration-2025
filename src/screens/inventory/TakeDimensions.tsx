import {QUERY_KEYS} from '@api/contants/constants';
import {useGetPackingDetails} from '@api/hooks/HooksGeneralServices';
import {useUpdateInventoryItem} from '@api/hooks/HooksInventoryServices';
import {JobInventoryType} from '@api/types/Inventory';
import {BackButton} from '@components/commons/buttons/BackButton';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {offlineUpdateItemInventory} from '@features/inventory/offline';
import {
  TakeDimensionsSchema,
  TakeDimensionsSchemaType,
} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {
  useUpsertArrayCache,
  useUpsertObjectCache,
} from '@hooks/useToolsReactQueryCache';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import useInventoryStore from '@store/inventory';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {generateUUID} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback} from 'react';
import {Keyboard, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

type Props = NativeStackScreenProps<RootStackParamList, 'TakeDimensions'>;
export const TakeDimensionsScreen = (props: Props) => {
  const {item} = props.route.params;

  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const {goBack} = useCustomNavigation();
  const {data: packingDetails, isLoading} = useGetPackingDetails();
  const {mutateAsync: updateAsync} = useUpdateInventoryItem();

  const {orderFilter, orderType, topSheetFilter, inventoryFilter} =
    useInventoryStore();

  const {hardRefreshMany} = useRefreshIndicator([
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob,
        filter: topSheetFilter,
        orderFilter,
        orderType,
      },
    ],
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob,
        filter: inventoryFilter,
        orderFilter,
        orderType,
      },
    ],
  ]);

  const inventoryQueryKey = [
    QUERY_KEYS.JOB_INVENTORY,
    {idJob, filter: topSheetFilter, orderFilter, orderType},
  ];

  const itemQueryKey = [QUERY_KEYS.INVENTORY_ITEM_DETAIL, {id: item.id}];

  const upsertItem = useUpsertObjectCache<JobInventoryType>(itemQueryKey);
  const upsertInventoryList =
    useUpsertArrayCache<JobInventoryType>(inventoryQueryKey);

  const {refetchAll} = useRefreshIndicator([itemQueryKey]);
  const {online} = useOnline();

  const updateItem = useCallback(
    ({packing_detail, ...rest}: TakeDimensionsSchemaType) => {
      Keyboard.dismiss();
      const packDetailObject = packingDetails?.find(
        (x) => x.id === packing_detail,
      );
      if (packDetailObject) {
        if (online) {
          loadingWrapperPromise(
            updateAsync({
              idInventory: item.id,
              current_packing_detail_id: packing_detail!,
              current_packing_detail: packDetailObject.name,
              ...rest,
            })
              .then((d) => {
                if (d) {
                  refetchAll().finally(() => {
                    refetchAll().finally(() => {
                      hardRefreshMany();
                    });
                  });
                  showToastMessage('Dimensions saved successfully');
                  goBack();
                } else {
                  showErrorToastMessage('Error while saving dimensions');
                }
              })
              .catch((e) => {
                // showErrorToastMessage('Error while saving dimensions');
              }),
          );
        } else {
          const clientId = item?.clientId ?? generateUUID();
          offlineUpdateItemInventory({
            clientId,
            idInventory: item.id,
            current_packing_detail_id: packing_detail!,
            current_packing_detail: packDetailObject.name,
            ...rest,
          }).then(() => {
            const newItem: JobInventoryType = {
              ...item,
              clientId,
              additional_info: rest.additional_info,
              current_packing_detail: packDetailObject.name,
              current_packing_detail_id: packing_detail!,
              packing_details_display: packDetailObject.name,
              packed_height: rest.packed_height,
              packed_length: rest.packed_length,
              packed_width: rest.packed_width,
              unpacked_height: rest.un_packed_height,
              unpacked_length: rest.un_packed_length,
              unpacked_width: rest.un_packed_width,
              weight: rest.weight,
            };
            upsertItem(newItem);
            upsertInventoryList(newItem);
            showToastMessage('Dimensions saved successfully (queued)');
            goBack();
          });
        }
      } else {
        showErrorToastMessage('Packing detail not found');
      }
    },
    [
      updateAsync,
      goBack,
      item,
      packingDetails,
      refetchAll,
      online,
      offlineUpdateItemInventory,
      upsertItem,
    ],
  );

  return (
    <Wrapper style={[styles.container]}>
      {isLoading && <GeneralLoading />}

      <Wrapper
        style={[GLOBAL_STYLES.bgwhite, GLOBAL_STYLES.containerBtnOptTop]}>
        <BackButton title="Inventory detail" onPress={goBack} />

        <Label
          style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, {fontSize: 20}]}
          allowFontScaling={false}>
          Take dimensions
        </Label>

        <Wrapper style={{width: '10%'}}></Wrapper>
      </Wrapper>

      <MinRoundedView />

      <BasicFormProvider
        schema={TakeDimensionsSchema}
        defaultValue={{
          un_packed_height: item?.unpacked_height ?? '0',
          un_packed_length: item?.unpacked_length ?? '0',
          un_packed_width: item?.unpacked_width ?? '0',
          packed_height: item?.packed_height ?? '0',
          packed_length: item?.packed_length ?? '0',
          packed_width: item?.packed_width ?? '0',
          weight: item?.weight ?? '0',
          additional_info: item?.additional_info,
          packing_detail: item?.current_packing_detail_id,
        }}>
        <KeyboardAwareScrollView
          style={{marginTop: 10}}
          keyboardShouldPersistTaps="handled">
          <Wrapper style={{paddingLeft: 30, paddingRight: 30}}>
            <Wrapper
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
              }}>
              <Label style={styles.boldTextLg}>Dimensions</Label>
            </Wrapper>

            <Wrapper
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Wrapper style={{width: '48%'}}>
                <Wrapper style={[styles.row, styles.containerSubtitle]}>
                  <Label style={styles.normalText}>Unpacked</Label>
                </Wrapper>

                <Wrapper
                  style={[
                    styles.containerItemDetail,
                    {alignContent: 'center', alignItems: 'center'},
                  ]}>
                  <Label>Height</Label>
                  <InputTextContext
                    currentId="un_packed_height"
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    keyboardType="numeric"
                    style={styles.inputDimensions}
                  />
                </Wrapper>

                <Wrapper style={[styles.containerItemDetail]}>
                  <Label>Length</Label>
                  <InputTextContext
                    currentId="un_packed_length"
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    keyboardType="numeric"
                    style={styles.inputDimensions}
                  />
                </Wrapper>

                <Wrapper style={[styles.containerItemDetail]}>
                  <Label>Width</Label>
                  <InputTextContext
                    currentId="un_packed_width"
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    keyboardType="numeric"
                    style={styles.inputDimensions}
                  />
                </Wrapper>
              </Wrapper>

              <Wrapper style={{width: '48%'}}>
                <Wrapper style={[styles.row, styles.containerSubtitle]}>
                  <Label style={styles.normalText}>Packed</Label>
                </Wrapper>

                <Wrapper style={[styles.containerItemDetail]}>
                  <Label>Height</Label>
                  <InputTextContext
                    currentId="packed_height"
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    keyboardType="numeric"
                    style={styles.inputDimensions}
                  />
                </Wrapper>

                <Wrapper style={[styles.containerItemDetail]}>
                  <Label>Length</Label>
                  <InputTextContext
                    currentId="packed_length"
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    keyboardType="numeric"
                    style={styles.inputDimensions}
                  />
                </Wrapper>

                <Wrapper style={[styles.containerItemDetail]}>
                  <Label>Width</Label>
                  <InputTextContext
                    currentId="packed_width"
                    maxLength={10}
                    multiline={true}
                    numberOfLines={1}
                    keyboardType="numeric"
                    style={styles.inputDimensions}
                  />
                </Wrapper>
              </Wrapper>
            </Wrapper>

            <Wrapper style={[{alignItems: 'flex-start'}]}>
              <Wrapper
                style={{
                  marginTop: 5,
                  borderTopWidth: 1,
                  borderColor: '#F7F5F4',
                  width: '100%',
                }}>
                <Wrapper style={{width: '48%'}}>
                  <Wrapper style={[styles.containerItemDetail]}>
                    <Label>Weight</Label>
                    <InputTextContext
                      currentId="weight"
                      maxLength={10}
                      multiline={true}
                      numberOfLines={1}
                      keyboardType="numeric"
                      style={styles.inputDimensions}
                    />
                  </Wrapper>
                </Wrapper>
              </Wrapper>

              <Wrapper
                style={{
                  marginTop: 10,
                  borderTopWidth: 1,
                  borderColor: '#F7F5F4',
                  width: '100%',
                }}>
                <Wrapper style={[styles.containerItemDetailAdditionalInfo]}>
                  <Label>Additional info</Label>
                </Wrapper>
                <Wrapper style={{marginTop: 10}}>
                  <InputTextContext
                    currentId="additional_info"
                    placeholder="(Optional)"
                    placeholderTextColor="#d0d0d0"
                    style={styles.inputAdditionalInfo}
                    multiline={true}
                    numberOfLines={1}
                  />
                </Wrapper>
              </Wrapper>

              <Wrapper
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  borderTopWidth: 1,
                  borderColor: '#F7F5F4',
                  width: '100%',
                }}>
                <Wrapper style={[styles.containerItemDetailAdditionalInfo]}>
                  <Label>Packing detail</Label>
                </Wrapper>

                <Wrapper style={{marginTop: 10}}>
                  <BottomSheetSelectInputContext
                    currentId="packing_detail"
                    placeholder="Select an option"
                    label="Search"
                    options={packingDetails ?? []}
                    snapPoints={['95%']}
                    containerStyle={{
                      borderColor: '#EFF0F2',
                      height: 43,
                      borderRadius: 10,
                    }}
                  />
                </Wrapper>
              </Wrapper>
            </Wrapper>

            <Wrapper style={{marginTop: 20, marginBottom: 20}}>
              <ButtonSubmit
                onSubmit={updateItem}
                label="Save info"
                icon={<Icon name="save" type="solid" size={14} color="white" />}
                showValidationError
              />
            </Wrapper>
          </Wrapper>
        </KeyboardAwareScrollView>
      </BasicFormProvider>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
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
  normalText: {
    fontSize: 14,
    color: '#3C424A',
  },
  boldTextLg: {
    fontSize: 16,
    color: '#3C424A',
    fontWeight: 'bold',
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
});
