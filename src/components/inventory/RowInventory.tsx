import * as React from 'react';
import {StyleSheet, TextProps} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {Label} from '@components/commons/text/Label';
import {InputCheck} from '@components/commons/inputs/InputCheck';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BooleanStringType} from '@generalTypes/general';
import {UserType} from '@api/types/User';
import ItemSkeleton from '@components/skeletons/ItemSkeleton';
import {
  COLUMNS_WIDTH,
  GLOBAL_FONT_SIZE_MULTIPLIER_MD,
  INVENTORY_STATUS_TYPES,
  ROW_COLUMNS_WIDTH,
} from '@api/contants/constants';

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
  hasImage?: boolean;
  isAltIdVisible?: boolean;
  isClientRefVisible?: boolean;
};

type props = {
  width: number;
  label?: string | null;
  labelProps?: TextProps;
  onPress: () => void;
};

const Column = ({width, label, labelProps, onPress}: props) => (
  <PressableOpacity onPress={onPress} style={[styles.containerColumn, {width}]}>
    <Label
      allowFontScaling={false}
      {...labelProps}
      style={[styles.textColumn, labelProps?.style]}>
      {label}
    </Label>
  </PressableOpacity>
);

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
  hasImage,
  isAltIdVisible,
  isClientRefVisible,
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
        <Wrapper style={{flexDirection: 'row'}}>
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

          <Column
            onPress={checkViewDetail}
            label={id}
            width={
              disabled ? ROW_COLUMNS_WIDTH.ID_DISABLED : ROW_COLUMNS_WIDTH.ID
            }
          />

          {showSecondaryId && isAltIdVisible && (
            <Column
              onPress={checkViewDetail}
              label={id2}
              width={ROW_COLUMNS_WIDTH.ALT_ID}
            />
          )}

          {isClientRefVisible && (
            <Column
              onPress={checkViewDetail}
              label={clientRef}
              width={ROW_COLUMNS_WIDTH.CLIENT_REF}
            />
          )}

          <Column
            onPress={checkViewDetail}
            label={location}
            width={ROW_COLUMNS_WIDTH.LOCATION}
            labelProps={{
              style: {
                fontSize: 10,
              },
            }}
          />

          <Column
            onPress={checkViewDetail}
            label={`${packedHeight ?? '-'} x ${packedLength ?? '-'} x ${
              packedWidth ?? '-'
            }`}
            width={ROW_COLUMNS_WIDTH.DIMENSIONS}
          />

          <Column
            onPress={checkViewDetail}
            label={packingDetailsDisplay}
            width={ROW_COLUMNS_WIDTH.PACKING_DETAILS}
          />

          <Column
            onPress={checkViewDetail}
            label={clientInvDisplay}
            width={ROW_COLUMNS_WIDTH.TITLE}
          />

          <Column
            onPress={checkViewDetail}
            label={artistName}
            width={ROW_COLUMNS_WIDTH.ARTIST}
          />

          <Column
            onPress={checkViewDetail}
            label={status}
            width={ROW_COLUMNS_WIDTH.STATUS}
          />

          <PressableOpacity
            style={[
              styles.containerColumn,
              {
                width: ROW_COLUMNS_WIDTH.CONDITION,
                minWidth: ROW_COLUMNS_WIDTH.CONDITION,
                maxWidth: ROW_COLUMNS_WIDTH.CONDITION,
              },
            ]}
            onPress={checkViewDetail}>
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

          <PressableOpacity
            style={[
              styles.containerColumn,
              {
                width: ROW_COLUMNS_WIDTH.HAS_IMAGE,
                minWidth: ROW_COLUMNS_WIDTH.HAS_IMAGE,
                maxWidth: ROW_COLUMNS_WIDTH.HAS_IMAGE,
                alignItems: 'center',
              },
            ]}
            onPress={checkViewDetail}>
            {hasImage ? (
              <Icon name="check" type="solid" size={12} color="#46bd73" />
            ) : (
              <Icon name="times" type="light" size={13} color="gray" />
            )}
          </PressableOpacity>

          {isConfirmDelete ? (
            <Wrapper
              style={[
                styles.containerColumn,
                {
                  width: ROW_COLUMNS_WIDTH.DELETE,
                  minWidth: ROW_COLUMNS_WIDTH.DELETE,
                  maxWidth: ROW_COLUMNS_WIDTH.DELETE,
                },
              ]}>
              <Wrapper
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingHorizontal: 5,
                }}>
                <PressableOpacity onPress={() => setIsConfirmDelete(false)}>
                  <Label
                    style={{color: '#333'}}
                    maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_MD}>
                    Cancel
                  </Label>
                </PressableOpacity>
                <PressableOpacity onPress={deleteBtn}>
                  <Label
                    style={{color: '#FF6C6C'}}
                    maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_MD}>
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
                    width: ROW_COLUMNS_WIDTH.DELETE,
                    minWidth: ROW_COLUMNS_WIDTH.DELETE,
                    maxWidth: ROW_COLUMNS_WIDTH.DELETE,
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
    borderRightWidth: 0.5,
    borderRightColor: '#d0d0d0',
    justifyContent: 'center',
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
    borderRightWidth: 0.5,
    borderRightColor: '#d0d0d0',
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    width: ROW_COLUMNS_WIDTH.CHECK,
    minWidth: ROW_COLUMNS_WIDTH.CHECK,
    maxWidth: ROW_COLUMNS_WIDTH.CHECK,
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
  textColumn: {
    fontSize: 12,
    color: '#464646',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default RowInventory;
