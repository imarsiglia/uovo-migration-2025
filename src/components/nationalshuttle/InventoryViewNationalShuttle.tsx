import {useNavigation} from '@react-navigation/native';
import {memo, ReactNode, useCallback, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

import {getFormattedDate, getItemColorStatus} from '../../utils/functions';
import {isInternet} from '../../utils/internet';
import useNationalShuttleStore from '@store/nationalShuttle';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {STATUS_NATIONAL_SHUTTLE} from '@api/contants/constants';
import {EmptyCard} from '@components/commons/cards/EmptyCard';
import {CustomPressable} from '@components/commons/pressable/CustomPressable';
import {COLORS} from '@styles/colors';
import { NSItemListType } from '@api/types/Jobs';

export const COLUMN_HEADER_HEIGHT = 35;

export const COLUMN_WIDTH = {
  id: 90,
  idAlt: 80,
  woNumber: 110,
  clientRef: 100,
  location: 170,
  dimensions: 130,
  title: 200,
  artistName: 150,
  packingDetails: 150,
  status: 100,
  condition: 100,
  remove: 90,
};

type Props = {
  list?: NSItemListType[];
  onShowFullList: () => void;
};

const _InventoryViewNationalShuttle = ({
  list,
  onShowFullList,
  ...rest
}: Props) => {
  const {navigate} = useNavigation();
  const {fetchInventory, setInventoryList} = useNationalShuttleStore();

  const [isLoading, setIsLoading] = useState(false);

  const goToTopSheet = useCallback(async (item: NSItemListType) => {
    setIsLoading(true);
    const isConnected = await isInternet();
    // const response = await fetchData.Get(
    //   `resources/job/topsheet?idjob=${item.plain_id_job}&queue=1`,
    // );
    // if (response.data?.body) {
    //   const jobDetail = response.data?.body as JobDetailType;

    //   let selectedDate = getFormattedDate(
    //     jobDetail.start_date,
    //     'YYYY-MM-DD',
    //   );
    //   let scheduleDate = getFormattedDate(
    //     jobDetail.start_date,
    //     'dddd MMM DD [•] HH:mm A MMMM YYYY',
    //   );
    //   // Tuesday Jul 23 • 07:00 AM July 2024
    //   const indexOf = jobDetail.client_name.indexOf(' ');

    //   //@ts-ignore
    //   // rest.dispatch(
    //   //   TopSheetActions.copyWoName(
    //   //     jobDetail.client_name.substring(
    //   //       indexOf,
    //   //       jobDetail.client_name?.length,
    //   //     ),
    //   //   ),
    //   // );
    //   //@ts-ignore
    //   navigate('TopSheet', {
    //     job: jobDetail.id,
    //     wo_name:
    //       jobDetail.wo_title +
    //       ' •' +
    //       jobDetail.client_name.substring(
    //         indexOf,
    //         jobDetail.client_name?.length,
    //       ),
    //     selectedDate: selectedDate,
    //     formattedDate: scheduleDate,
    //     refreshStatus: refreshStatus.bind(this),
    //     queue: 1,
    //     offline: !isConnected,
    //     syncroRequests: (() => {}).bind(this),
    //     nsItem: item,
    //   });

    //   setIsLoading(false);
    // }
  }, []);

  async function refreshStatus() {
    if (fetchInventory) {
      //@ts-ignore
      const {data: dataList} = await fetchInventory();
      if (setInventoryList) {
        setInventoryList(dataList);
      }
    }
  }

  return (
    <>
      {isLoading && <GeneralLoading />}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingBottom: 10,
          paddingTop: 3,
        }}>
        <TouchableOpacity
          onPress={onShowFullList}
          style={NSInventoryStyles.showFullList}>
          <Text
            style={NSInventoryStyles.showFullListText}
            allowFontScaling={false}>
            Show full list
          </Text>
          <Icon name="table" color="white" type="solid" size={16} />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
          <ColorLabel
            label="Loaded"
            color={STATUS_NATIONAL_SHUTTLE.LOADED.color}
          />
          <ColorLabel
            label="Unloaded"
            color={STATUS_NATIONAL_SHUTTLE.UNLOADED.color}
          />
          <ColorLabel
            label="Child Object"
            color={STATUS_NATIONAL_SHUTTLE.DEFAULT.color}
          />
        </View>
      </View>

      <View style={NSInventoryStyles.containerTable}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          horizontal>
          <View>
            <View style={{flexDirection: 'row'}}>
              <ColumnHeaderNS
                text={`ID`}
                style={{width: COLUMN_WIDTH.id, height: COLUMN_HEADER_HEIGHT}}
              />

              <ColumnHeaderNS
                text={`WO number`}
                style={{
                  width: COLUMN_WIDTH.woNumber,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Client Ref`}
                style={{
                  width: COLUMN_WIDTH.clientRef,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Location`}
                style={{
                  width: COLUMN_WIDTH.location,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Dimensions`}
                style={{
                  width: COLUMN_WIDTH.dimensions,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Packing details`}
                style={{
                  width: COLUMN_WIDTH.packingDetails,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Alt ID`}
                style={{
                  width: COLUMN_WIDTH.idAlt,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Title`}
                style={{
                  width: COLUMN_WIDTH.title,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Artist name`}
                style={{
                  width: COLUMN_WIDTH.artistName,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
              <ColumnHeaderNS
                text={`Condition`}
                style={{
                  width: COLUMN_WIDTH.condition,
                  height: COLUMN_HEADER_HEIGHT,
                }}
              />
            </View>

            <ScrollView
              bounces={false}
              alwaysBounceHorizontal={false}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              contentContainerStyle={{minHeight: 200}}>
              {list?.map((item, mIndex) => (
                <RowNS
                  key={mIndex}
                  item={item}
                  onPress={() => goToTopSheet(item)}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {(!list || list?.length == 0) && (
          <View
            style={{
              width: Dimensions.get('screen').width,
              position: 'absolute',
              zIndex: -1,
              top: 60,
            }}>
            <EmptyCard text="No items found" />
          </View>
        )}
      </View>
    </>
  );
};

export const ColumnHeaderNS = ({
  text,
  style,
  field,
  onSort,
  sortField,
}: {
  text: string;
  style?: StyleProp<ViewStyle>;
  field?: keyof NSItemListType;
  onSort?: (val: keyof NSItemListType) => void;
  sortField?: {field: keyof NSItemListType; asc: boolean};
}) => (
  <CustomPressable
    disabled={!field || onSort == undefined}
    onPress={onSort && field ? () => onSort(field) : undefined}
    style={[
      NSInventoryStyles.containerColumn,
      {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
      },
      style,
    ]}>
    <Text
      style={[NSInventoryStyles.columnText, field ? {} : {width: '100%'}]}
      allowFontScaling={false}>
      {text}
    </Text>
    {field && <SortComponent sortField={sortField!} field={field} />}
  </CustomPressable>
);

export const ColumnNS = ({
  text,
  style,
  onPress,
}: {
  text: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
}) => (
  <CustomPressable
    onPress={onPress}
    style={[NSInventoryStyles.containerColumn, style]}>
    <Text style={NSInventoryStyles.columnText} allowFontScaling={false}>
      {text}
    </Text>
  </CustomPressable>
);

export const ColumnWithChildrenNS = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <View style={[NSInventoryStyles.containerColumn, style]}>{children}</View>
);

export const RowNS = ({
  item,
  onDelete,
  isFullList = false,
  onPress,
}: {
  item: NSItemListType;
  onDelete?: () => void;
  isFullList?: boolean;
  onPress: () => void;
}) => {
  return (
    <View style={{flexDirection: 'row'}}>
      <ColumnNS
        key={item.id}
        text={`${item.clientinv}`}
        style={{
          width: COLUMN_WIDTH.id,
          borderLeftWidth: 5,
          borderLeftColor: getItemColorStatus(item.load_status),
        }}
        onPress={onPress}
      />

      <ColumnNS
        text={item.wo_number}
        style={{width: COLUMN_WIDTH.woNumber}}
        onPress={onPress}
      />
      <ColumnNS
        text={item.clientref}
        style={{width: COLUMN_WIDTH.clientRef}}
        onPress={onPress}
      />
      <ColumnNS
        text={item.fromlocation_display}
        style={{width: COLUMN_WIDTH.location}}
        onPress={onPress}
      />
      <ColumnNS
        text={`${item.packed_height ?? '-'} x ${item.packed_length ?? '-'} x ${
          item.packed_width ?? '-'
        }`}
        style={{width: COLUMN_WIDTH.dimensions}}
        onPress={onPress}
      />
      <ColumnNS
        text={item.packing_details_display}
        style={{width: COLUMN_WIDTH.packingDetails}}
        onPress={onPress}
      />
      <ColumnNS
        text={item.clientinv2}
        style={{width: COLUMN_WIDTH.idAlt}}
        onPress={onPress}
      />
      <ColumnNS
        text={item.clientinv_display}
        style={{width: COLUMN_WIDTH.title}}
        onPress={onPress}
      />
      <ColumnNS
        text={item.artist}
        style={{width: COLUMN_WIDTH.artistName}}
        onPress={onPress}
      />
      <ColumnWithChildrenNS style={{width: COLUMN_WIDTH.condition}}>
        <CustomPressable
          style={NSInventoryStyles.containerCheck}
          onPress={onPress}>
          {item.has_condition_check == '1' ? (
            <Icon name="check" size={10} color="#38E669" type="solid" />
          ) : (
            <View style={NSInventoryStyles.emptyCheck} />
          )}
          <Text style={NSInventoryStyles.columnText} allowFontScaling={false}>
            Check
          </Text>
        </CustomPressable>
        <CustomPressable
          style={NSInventoryStyles.containerCheck}
          onPress={onPress}>
          {item.has_condition_report != '1' ? (
            <Icon name="check" size={10} color="#38E669" type="solid" />
          ) : (
            <View style={NSInventoryStyles.emptyCheck} />
          )}
          <Text style={NSInventoryStyles.columnText} allowFontScaling={false}>
            Report
          </Text>
        </CustomPressable>
      </ColumnWithChildrenNS>
      {isFullList && (
        <ColumnWithChildrenNS
          style={{
            width: COLUMN_WIDTH.remove,
            backgroundColor: '#FE4F4F',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}>
          <CustomPressable
            style={[
              NSInventoryStyles.containerCheck,
              {width: '100%', display: 'flex', height: '100%'},
            ]}
            onPress={onDelete}>
            <Text
              style={[NSInventoryStyles.columnText, {color: 'white'}]}
              allowFontScaling={false}>
              Remove
            </Text>
            <Icon name="trash" color="white" size={15} type="solid" />
          </CustomPressable>
        </ColumnWithChildrenNS>
      )}
    </View>
  );
};

const SortComponent = ({
  field,
  sortField,
}: {
  field: keyof NSItemListType;
  sortField: {field: keyof NSItemListType; asc: boolean};
}) => {
  return (
    <View>
      <Icon
        name="caret-up"
        color={
          sortField && sortField.field == field && !sortField.asc
            ? COLORS.secondary
            : 'black'
        }
        type="solid"
        size={14}
        containerStyle={{top: 4}}
      />
      <Icon
        name="caret-down"
        color={
          sortField && sortField.field == field && sortField.asc
            ? COLORS.secondary
            : 'black'
        }
        type="solid"
        size={14}
        containerStyle={{top: -4}}
      />
    </View>
  );
};

export const NSInventoryStyles = StyleSheet.create({
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
  containerTable: {
    marginHorizontal: 10,
    borderTopStartRadius: 8,
    borderWidth: 1,
    borderTopEndRadius: 8,
    borderRadius: 8,
    borderColor: '#DDDDDD',
    overflow: 'hidden',
    flex: 1,
    marginBottom: 20,
    position: 'relative',
  },
  containerColumn: {
    backgroundColor: 'white',
    width: 71,
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#DDDDDD',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingHorizontal: 5,
  },
  headerColumnText: {
    fontSize: 12,
    color: '#696969',
    textAlign: 'center',
  },
  columnText: {
    fontSize: 12,
    color: '#696969',
    textAlign: 'center',
  },
  emptyCheck: {
    width: 10,
  },
  containerCheck: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const ColorLabel = ({color, label}: {color: string; label: string}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
    <View
      style={{
        width: 13,
        height: 13,
        borderRadius: 100,
        backgroundColor: color,
      }}
    />
    <Text style={{fontSize: 10, color: '#404040'}} allowFontScaling={false}>
      {label}
    </Text>
  </View>
);

export const InventoryViewNationalShuttle = memo(_InventoryViewNationalShuttle);
