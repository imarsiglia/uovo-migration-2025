import * as React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-fontawesome-pro';

type Props = {};

const HeaderInventoryAdd = (props: Props) => {
  // const [orderBy, setOrderBy] = React.useState('');
  // const [orderType, setOrderType] = React.useState('ASC');

  // React.useEffect(() => {
  //   if (clearOrder) {
  //     setOrderBy('');
  //     setOrderType('ASC');
  //     setClearOrder(false);
  //   }
  // });

  // const BtnSort = ({filterType, marked}) => {
  //   return (
  //     <TouchableOpacity onPress={() => sort(filterType)}>
  //       <Icon
  //         name="sort"
  //         size={14}
  //         type="solid"
  //         style={{padding: 5}}
  //         color={marked == true ? '#03d3ed' : 'black'}></Icon>
  //     </TouchableOpacity>
  //   );
  // };

  // function sort(filterType) {
  //   setOrderBy(filterType);
  //   if (
  //     orderBy == filterType ||
  //     (orderFilter != null && orderFilter == filterType)
  //   ) {
  //     var orderTypeTemp = 'DESC';
  //     if (
  //       orderType == 'DESC' ||
  //       (orderByGlobal != null && orderByGlobal == 'DESC')
  //     ) {
  //       setOrderType('ASC');
  //       orderTypeTemp = 'ASC';
  //     } else {
  //       setOrderType('DESC');
  //       orderTypeTemp = 'DESC';
  //     }
  //     sortBy(orderTypeTemp, filterType);
  //   } else {
  //     setOrderType('ASC');
  //     sortBy('ASC', filterType);
  //   }
  // }

  return (
    <View style={styles.container}>
      {false && (
        <View style={[styles.containerColumn]}>
          <Text style={[styles.column, {width: '10%'}]}> </Text>
        </View>
      )}

      <View style={[styles.containerColumn, {width: '15%'}]}>
        <Text style={[styles.column]}>Inventory ID</Text>
        {/* {sortBy && (
          <BtnSort
            filterType="id"
            marked={
              orderBy == 'id' || (orderFilter != null && orderFilter == 'id')
            }
          />
        )} */}
      </View>

      <View style={[styles.containerColumn, {width: '20%'}]}>
        <Text style={[styles.column]}>Client Ref ID</Text>
        {/* {sortBy && (
          <BtnSort
            filterType="clientref"
            marked={
              orderBy == 'clientref' ||
              (orderFilter != null && orderFilter == 'clientref')
            }
          />
        )} */}
      </View>

      <View style={[styles.containerColumn, {width: '20%'}]}>
        <Text style={[styles.column]}>Artist Name</Text>
        {/* {sortBy && (
          <BtnSort
            filterType="artist"
            marked={
              orderBy == 'artist' ||
              (orderFilter != null && orderFilter == 'artist')
            }
          />
        )} */}
      </View>

      <View style={[styles.containerColumn, {width: '25%'}]}>
        <Text style={[styles.column]}>Title</Text>
        {/* {sortBy && (
          <BtnSort
            filterType="title"
            marked={
              orderBy == 'title' ||
              (orderFilter != null && orderFilter == 'title')
            }
          />
        )} */}
      </View>

      <View
        style={[
          styles.containerColumn,
          styles.containerColumnRight,
          {width: '20%', minWidth: 60},
        ]}>
        <Text style={[styles.column]}>Actions</Text>
      </View>
    </View>
  );
};

HeaderInventoryAdd.propTypes = {
  check: PropTypes.bool,
  showCheck: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 35,
    width: '100%',
    borderTopWidth: 0.5,
    borderStartWidth: 0.5,
    borderEndWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#d0d0d0',
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
  },
  column: {
    textAlign: 'center',
    fontSize: 13,
    opacity: 0.66,
    color: '#575757',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerColumn: {
    height: '100%',
    borderRightColor: '#d9d9d9',
    borderRightWidth: 0.3,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  columnCheckBox: {
    textAlign: 'center',
    fontSize: 12,
    color: '#464646',
    textAlignVertical: 'center',
    borderRightWidth: 0.3,
    borderRightColor: '#d0d0d0',
    height: '100%',
    justifyContent: 'center',
  },
  containerColumnRight: {
    borderRightWidth: 0,
  },
});

export default HeaderInventoryAdd;
