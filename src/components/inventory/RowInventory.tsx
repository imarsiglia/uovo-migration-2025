import * as React from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {COLUMNS_WIDTH as ROW_COLUMNS_WIDTH} from './HeaderInventory';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {Label} from '@components/commons/text/Label';
import {InputCheck} from '@components/commons/inputs/InputCheck';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BooleanStringType} from '@generalTypes/general';
import {UserType} from '@api/types/User';
import ItemSkeleton from '@components/skeletons/ItemSkeleton';
import {INVENTORY_STATUS_TYPES} from '@api/contants/constants';

const ROW_INVENTORY_MIN_SUBSTRACT = 3;
export const COLUMNS_WIDTH = {
  CHECK: ROW_COLUMNS_WIDTH.CHECK,
  ID: ROW_COLUMNS_WIDTH.ID - ROW_INVENTORY_MIN_SUBSTRACT,
  ID_DISABLED: ROW_COLUMNS_WIDTH.ID_DISABLED - ROW_INVENTORY_MIN_SUBSTRACT,
  ALT_ID: ROW_COLUMNS_WIDTH.ALT_ID - ROW_INVENTORY_MIN_SUBSTRACT,
  CLIENT_REF: ROW_COLUMNS_WIDTH.CLIENT_REF - ROW_INVENTORY_MIN_SUBSTRACT,
  LOCATION: ROW_COLUMNS_WIDTH.LOCATION - ROW_INVENTORY_MIN_SUBSTRACT,
  DIMENSIONS: ROW_COLUMNS_WIDTH.DIMENSIONS - ROW_INVENTORY_MIN_SUBSTRACT,
  PACKING_DETAILS:
    ROW_COLUMNS_WIDTH.PACKING_DETAILS - ROW_INVENTORY_MIN_SUBSTRACT,
  TITLE: ROW_COLUMNS_WIDTH.TITLE - ROW_INVENTORY_MIN_SUBSTRACT,
  ARTIST: ROW_COLUMNS_WIDTH.ARTIST - ROW_INVENTORY_MIN_SUBSTRACT,
  STATUS: ROW_COLUMNS_WIDTH.STATUS - ROW_INVENTORY_MIN_SUBSTRACT,
  CONDITION: ROW_COLUMNS_WIDTH.CONDITION - ROW_INVENTORY_MIN_SUBSTRACT,
  DELETE: ROW_COLUMNS_WIDTH.DELETE - ROW_INVENTORY_MIN_SUBSTRACT,
};

type Props = {
  id: string;
  clientInvDisplay: string;
  clientRef: string;
  location: string;
  artistName: string;
  packingDetailsDisplay: string;
  status: string;
  actions?: boolean | null;
  checked?: boolean;
  disabled: boolean;
  viewDetail: () => void;
  onCheck: () => Promise<Boolean>;
  packedHeight: string;
  packedLength: string;
  packedWidth: string;
  hasConditionReport: BooleanStringType;
  hasConditionCheck: BooleanStringType;
  user: UserType | null;
  showSecondaryId?: boolean;
  id2?: string | null;
  deleteBtn?: () => void;
};

const RowInventory = ({
  id,
  clientInvDisplay,
  clientRef,
  location,
  artistName,
  packingDetailsDisplay,
  status,
  actions,
  checked,
  disabled,
  viewDetail,
  onCheck,
  packedHeight,
  packedLength,
  packedWidth,
  hasConditionReport,
  hasConditionCheck,
  user,
  showSecondaryId,
  id2,
  deleteBtn,
}: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = React.useState(false);

  const checkViewDetail = () => {
    viewDetail();
  };

  function onCheckItem() {
    setLoading(true);
    onCheck()
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }

  return (
    <Wrapper style={styles.container}>
      {loading && <ItemSkeleton />}
      {!loading && (
        <Wrapper style={[GLOBAL_STYLES.row]}>
          {actions && (
            <Wrapper
              style={[
                styles.columnCheckBox,
                status
                  ?.toUpperCase()
                  .includes(INVENTORY_STATUS_TYPES.COMPLETED_BY) ||
                (status
                  ?.toUpperCase()
                  .includes(INVENTORY_STATUS_TYPES.LOCKED_BY) &&
                  !status
                    ?.toUpperCase()
                    ?.includes(
                      INVENTORY_STATUS_TYPES.LOCKED_BY +
                        ' ' +
                        (user?.user_name + ' ' + user?.user_last_name)
                          .toUpperCase()
                          .trim(),
                    ))
                  ? styles.opacitied
                  : null,
              ]}>
              <InputCheck
                checked={checked}
                onPress={onCheckItem}
                disabled={disabled}
              />
            </Wrapper>
          )}

          <PressableOpacity
            style={styles.containerColumn}
            onPress={checkViewDetail}>
            <Label
              style={[
                styles.column,
                {
                  width: actions ? COLUMNS_WIDTH.ID : COLUMNS_WIDTH.ID_DISABLED,
                  minWidth: actions
                    ? COLUMNS_WIDTH.ID
                    : COLUMNS_WIDTH.ID_DISABLED,
                  maxWidth: actions
                    ? COLUMNS_WIDTH.ID
                    : COLUMNS_WIDTH.ID_DISABLED,
                },
              ]}
              allowFontScaling={false}>
              {id}
            </Label>
          </PressableOpacity>

          {showSecondaryId && (
            <PressableOpacity
              style={styles.containerColumn}
              onPress={() => checkViewDetail()}>
              <Label
                style={[
                  styles.column,
                  {
                    width: COLUMNS_WIDTH.ALT_ID,
                    minWidth: COLUMNS_WIDTH.ALT_ID,
                    maxWidth: COLUMNS_WIDTH.ALT_ID,
                  },
                ]}
                allowFontScaling={false}>
                {id2}
              </Label>
            </PressableOpacity>
          )}

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.column,
                {
                  width: COLUMNS_WIDTH.CLIENT_REF,
                  minWidth: COLUMNS_WIDTH.CLIENT_REF,
                  maxWidth: COLUMNS_WIDTH.CLIENT_REF,
                },
              ]}
              allowFontScaling={false}>
              {clientRef}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.columnLocation,
                {
                  width: COLUMNS_WIDTH.LOCATION,
                  minWidth: COLUMNS_WIDTH.LOCATION,
                  maxWidth: COLUMNS_WIDTH.LOCATION,
                },
              ]}
              allowFontScaling={false}>
              {location}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.columnLocation,
                {
                  width: COLUMNS_WIDTH.DIMENSIONS,
                  minWidth: COLUMNS_WIDTH.DIMENSIONS,
                  maxWidth: COLUMNS_WIDTH.DIMENSIONS,
                  fontSize: 12,
                },
              ]}
              allowFontScaling={false}>
              {packedHeight != null ? packedHeight : '-'} x{' '}
              {packedLength != null ? packedLength : '-'} x{' '}
              {packedWidth != null ? packedWidth : '-'}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.column,
                {
                  width: COLUMNS_WIDTH.PACKING_DETAILS,
                  minWidth: COLUMNS_WIDTH.PACKING_DETAILS,
                  maxWidth: COLUMNS_WIDTH.PACKING_DETAILS,
                },
              ]}
              allowFontScaling={false}>
              {packingDetailsDisplay}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.column,
                {
                  width: COLUMNS_WIDTH.TITLE,
                  minWidth: COLUMNS_WIDTH.TITLE,
                  maxWidth: COLUMNS_WIDTH.TITLE,
                },
              ]}
              allowFontScaling={false}>
              {clientInvDisplay}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.column,
                {
                  width: COLUMNS_WIDTH.ARTIST,
                  minWidth: COLUMNS_WIDTH.ARTIST,
                  maxWidth: COLUMNS_WIDTH.ARTIST,
                },
              ]}
              allowFontScaling={false}>
              {artistName}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={styles.containerColumn}
            onPress={() => checkViewDetail()}>
            <Label
              style={[
                styles.columnStatus,
                {
                  width: COLUMNS_WIDTH.STATUS,
                  minWidth: COLUMNS_WIDTH.STATUS,
                  maxWidth: COLUMNS_WIDTH.STATUS,
                },
              ]}
              allowFontScaling={false}>
              {status == null ? 'Pending' : status}
            </Label>
          </PressableOpacity>

          <PressableOpacity
            style={[
              {
                width: COLUMNS_WIDTH.CONDITION,
                minWidth: COLUMNS_WIDTH.CONDITION,
                maxWidth: COLUMNS_WIDTH.CONDITION,
              },
            ]}
            onPress={() => checkViewDetail()}>
            <Wrapper style={[GLOBAL_STYLES.row, styles.containerCondition]}>
              <Wrapper style={{width: 20}}>
                {hasConditionCheck != '0' && (
                  <Icon name="check" type="solid" size={12} color="#46bd73" />
                )}
              </Wrapper>

              <Label
                style={[
                  styles.columnCondition,
                  {color: hasConditionCheck != '0' ? '#46bd73' : '#959595'},
                ]}
                allowFontScaling={false}>
                check
              </Label>
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.row, styles.containerCondition]}>
              <Wrapper style={{width: 20}}>
                {hasConditionReport != '0' && (
                  <Icon name="check" type="solid" size={12} color="#46bd73" />
                )}
              </Wrapper>
              <Label
                style={[
                  styles.columnCondition,
                  {color: hasConditionReport != '0' ? '#46bd73' : '#959595'},
                ]}
                allowFontScaling={false}>
                report
              </Label>
            </Wrapper>
          </PressableOpacity>

          {isConfirmDelete ? (
            <Wrapper
              style={[
                styles.containerColumn,
                {
                  width: COLUMNS_WIDTH.DELETE,
                  minWidth: COLUMNS_WIDTH.DELETE,
                  maxWidth: COLUMNS_WIDTH.DELETE,
                },
              ]}>
              <Wrapper
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingHorizontal: 10,
                }}>
                <PressableOpacity onPress={() => setIsConfirmDelete(false)}>
                  <Label style={{color: '#333'}} allowFontScaling={false}>
                    Cancel
                  </Label>
                </PressableOpacity>
                <PressableOpacity onPress={deleteBtn}>
                  <Label style={{color: '#FF6C6C'}} allowFontScaling={false}>
                    Yes
                  </Label>
                </PressableOpacity>
              </Wrapper>
            </Wrapper>
          ) : (
            deleteBtn && (
              <PressableOpacity
                style={[
                  styles.containerColumn,
                  styles.btnDeleteItem,
                  {
                    width: COLUMNS_WIDTH.DELETE,
                    minWidth: COLUMNS_WIDTH.DELETE,
                    maxWidth: COLUMNS_WIDTH.DELETE,
                  },
                ]}
                onPress={() => setIsConfirmDelete(true)}>
                <Label
                  style={{color: 'white', fontSize: 13}}
                  allowFontScaling={false}>
                  Remove
                </Label>
                <Icon name="trash-alt" size={17} color="white" />
              </PressableOpacity>
            )
          )}
        </Wrapper>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#d0d0d0',
    flexDirection: 'row',
    minHeight: 40,
    width: '100%',
  },
  column: {
    fontSize: 12,
    color: '#464646',
    textAlign: 'center',
  },
  containerColumn: {
    borderRightWidth: 1,
    borderRightColor: '#d0d0d0',
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  columnCondition: {
    textAlign: 'center',
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnCheckBox: {
    borderRightWidth: 1,
    borderRightColor: '#d0d0d0',
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    width: COLUMNS_WIDTH.CHECK,
    minWidth: COLUMNS_WIDTH.CHECK,
    maxWidth: COLUMNS_WIDTH.CHECK,
  },
  columnLocation: {
    textAlign: 'center',
    fontSize: 10,
    color: '#464646',
    textAlignVertical: 'center',
  },
  columnStatus: {
    textAlign: 'center',
    fontSize: 12,
    color: '#464646',
    textAlignVertical: 'center',
    textTransform: 'capitalize',
  },
  opacitied: {
    opacity: 0.4,
  },
  containerCondition: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDeleteItem: {
    backgroundColor: '#FF6C6C',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
  },
});

export default RowInventory;
