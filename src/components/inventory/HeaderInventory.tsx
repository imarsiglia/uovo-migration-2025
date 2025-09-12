import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {InputCheck} from '@components/commons/inputs/InputCheck';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {INVENTORY_ORDER_TYPE} from '@generalTypes/general';
import useInventoryStore from '@store/inventory';
import {useCallback, useMemo} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const COLUMNS_WIDTH = {
  CHECK: 40,
  ID: 90,
  ID_DISABLED: 80,
  ALT_ID: 90,
  CLIENT_REF: 100,
  LOCATION: 140,
  DIMENSIONS: 110,
  PACKING_DETAILS: 140,
  TITLE: 130,
  ARTIST: 120,
  STATUS: 100,
  CONDITION: 90,
  DELETE: 120,
};

type ColumnSortProps = {
  filterType: string;
  propStyles: StyleProp<ViewStyle>;
  columnName: string;
};

type Props = {
  id: string;
  clientInvDisplay: string;
  clientRef: string;
  location: string;
  artistName: string;
  packingDetailsDisplay: string;
  dimensions: string;
  status: string;
  disabled: boolean;
  condition: string;
  showCheck: boolean;
  checked?: boolean;
  onCheckAll: () => void;
  showSecondaryId?: boolean;
  deleteBtn?: string;
};

const HeaderInventory = ({
  id,
  clientInvDisplay,
  clientRef,
  location,
  artistName,
  packingDetailsDisplay,
  dimensions,
  status,
  disabled,
  condition,
  showCheck,
  checked,
  onCheckAll,
  showSecondaryId,
  deleteBtn
}: Props) => {
  const {orderFilter, orderType, setOrderFilter, setOrderType} =
    useInventoryStore();

  const ColumnSort = ({
    filterType,
    propStyles,
    columnName,
  }: ColumnSortProps) => {
    const marked = useMemo(() => {
      return (
        orderFilter == filterType ||
        (orderFilter != null && orderFilter == filterType)
      );
    }, [orderFilter, orderFilter, filterType]);

    return (
      <PressableOpacity
        style={[styles.containerColumn, propStyles]}
        onPress={() => sort({filterType})}>
        <Label
          style={[styles.column, marked ? {color: '#00D3ED'} : {}]}
          allowFontScaling={false}>
          {columnName}
        </Label>

        {!marked ? (
          <Icon name="sort" size={14} type="solid" color="black" />
        ) : (
          <Wrapper
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
            <Wrapper style={{position: 'absolute', top: -11}}>
              <Icon
                name="caret-up"
                size={14}
                type="solid"
                color={
                  orderType == INVENTORY_ORDER_TYPE.DESC ? '#03d3ed' : 'black'
                }
              />
            </Wrapper>
            <Wrapper style={{position: 'absolute', bottom: -11}}>
              <Icon
                name="caret-down"
                size={14}
                type="solid"
                color={
                  orderType == INVENTORY_ORDER_TYPE.ASC ? '#03d3ed' : 'black'
                }
              />
            </Wrapper>
          </Wrapper>
        )}
      </PressableOpacity>
    );
  };

  const sort = useCallback(
    ({filterType}: {filterType: string}) => {
      setOrderFilter(filterType);
      if (
        orderFilter == filterType ||
        (orderFilter != null && orderFilter == filterType)
      ) {
        if (orderType == INVENTORY_ORDER_TYPE.DESC) {
          setOrderType(INVENTORY_ORDER_TYPE.ASC);
        } else {
          setOrderType(INVENTORY_ORDER_TYPE.DESC);
        }
      } else {
        setOrderType(INVENTORY_ORDER_TYPE.ASC);
      }
    },
    [orderFilter, orderType],
  );

  return (
    <Wrapper style={styles.container}>
      {!disabled && showCheck && (
        <Wrapper
          style={[
            styles.columnCheckBox,
            {
              width: COLUMNS_WIDTH.CHECK,
              minWidth: COLUMNS_WIDTH.CHECK,
              maxWidth: COLUMNS_WIDTH.CHECK,
            },
          ]}>
          <InputCheck onPress={onCheckAll} checked={checked} />
        </Wrapper>
      )}

      {!disabled && !showCheck && (
        <Wrapper
          style={[
            styles.containerColumn,
            {
              width: COLUMNS_WIDTH.CHECK,
              maxWidth: COLUMNS_WIDTH.CHECK,
              minWidth: COLUMNS_WIDTH.CHECK,
            },
          ]}
        />
      )}

      <ColumnSort
        filterType="clientinv"
        columnName={id}
        propStyles={{
          width: disabled ? COLUMNS_WIDTH.ID_DISABLED : COLUMNS_WIDTH.ID,
          maxWidth: disabled ? COLUMNS_WIDTH.ID_DISABLED : COLUMNS_WIDTH.ID,
          minWidth: disabled ? COLUMNS_WIDTH.ID_DISABLED : COLUMNS_WIDTH.ID,
        }}
      />

      {showSecondaryId == true && (
        <ColumnSort
          filterType="clientinv2"
          columnName="ALT ID"
          propStyles={{
            width: COLUMNS_WIDTH.ALT_ID,
            maxWidth: COLUMNS_WIDTH.ALT_ID,
            minWidth: COLUMNS_WIDTH.ALT_ID,
          }}
        />
      )}

      <ColumnSort
        filterType="clientref"
        columnName={clientRef}
        propStyles={{
          width: COLUMNS_WIDTH.CLIENT_REF,
          maxWidth: COLUMNS_WIDTH.CLIENT_REF,
          minWidth: COLUMNS_WIDTH.CLIENT_REF,
        }}
      />

      <ColumnSort
        filterType="fromlocationDisplay"
        columnName={location}
        propStyles={{
          width: COLUMNS_WIDTH.LOCATION,
          maxWidth: COLUMNS_WIDTH.LOCATION,
          minWidth: COLUMNS_WIDTH.LOCATION,
        }}
      />

      <ColumnSort
        filterType="dimensions"
        columnName={dimensions}
        propStyles={{
          width: COLUMNS_WIDTH.DIMENSIONS,
          maxWidth: COLUMNS_WIDTH.DIMENSIONS,
          minWidth: COLUMNS_WIDTH.DIMENSIONS,
        }}
      />

      <ColumnSort
        filterType="packingDetailsDisplay"
        columnName={packingDetailsDisplay}
        propStyles={{
          width: COLUMNS_WIDTH.PACKING_DETAILS,
          maxWidth: COLUMNS_WIDTH.PACKING_DETAILS,
          minWidth: COLUMNS_WIDTH.PACKING_DETAILS,
        }}
      />

      <ColumnSort
        filterType="clientinvDisplay"
        columnName={clientInvDisplay}
        propStyles={{
          width: COLUMNS_WIDTH.TITLE,
          maxWidth: COLUMNS_WIDTH.TITLE,
          minWidth: COLUMNS_WIDTH.TITLE,
        }}
      />

      <ColumnSort
        filterType="artist"
        columnName={artistName}
        propStyles={{
          width: COLUMNS_WIDTH.ARTIST,
          maxWidth: COLUMNS_WIDTH.ARTIST,
          minWidth: COLUMNS_WIDTH.ARTIST,
        }}
      />

      <ColumnSort
        filterType="status"
        columnName={status}
        propStyles={{
          width: COLUMNS_WIDTH.STATUS,
          maxWidth: COLUMNS_WIDTH.STATUS,
          minWidth: COLUMNS_WIDTH.STATUS,
        }}
      />

      <ColumnSort
        filterType="condition"
        columnName={condition}
        propStyles={{
          width: COLUMNS_WIDTH.CONDITION,
          maxWidth: COLUMNS_WIDTH.CONDITION,
          minWidth: COLUMNS_WIDTH.CONDITION,
          ...deleteBtn ? {} : {borderRightWidth: 0}
        }}
      />

      {deleteBtn && (
        <Wrapper
          style={[
            styles.containerColumn,
            {
              width: COLUMNS_WIDTH.DELETE,
              maxWidth: COLUMNS_WIDTH.DELETE,
              minWidth: COLUMNS_WIDTH.DELETE,
            },
          ]}>
          <Label style={[styles.column]} allowFontScaling={false}>
            {deleteBtn}
          </Label>
        </Wrapper>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 35,
    width: '100%',
  },
  column: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.66,
    color: '#464646',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerColumn: {
    height: '100%',
    borderRightColor: '#d0d0d0',
    borderRightWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  columnCheckBox: {
    borderRightWidth: 1,
    borderRightColor: '#d0d0d0',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeaderInventory;
