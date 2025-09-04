import React, {useEffect, useState} from 'react';
// import {
//   existRequestConditionPhotosOffline,
//   existRequestConditionPhotosOfflineSubtype,
//   existRequestInventoryOffline,
//   existRequestOffline,
//   getAllValuesFrom2Offline,
// } from '../../utils/storage';
import Icon from 'react-native-fontawesome-pro';
import {StyleSheet} from 'react-native';

type Props = {
  offline?: string[];
  idJob: number;
  idInventory?: number;
  conditionType?: string;
  reportType?: string;
  reportSubType?: string;
  size?: number;
};
const OfflineValidation = ({
  offline,
  idJob,
  idInventory,
  conditionType,
  reportType,
  reportSubType,
  size = 16,
}: Props) => {
  const [existe, setExiste] = useState(false);

  useEffect(() => {
    checkExists();
  }, []);

  const checkExists = async () => {
    // if (reportSubType) {
    //   const isSome = await existRequestConditionPhotosOfflineSubtype(
    //     offline,
    //     idJob,
    //     idInventory,
    //     conditionType,
    //     reportType,
    //     reportSubType,
    //   );
    //   setExiste(isSome);
    // } else if (reportType) {
    //   const isSome = await existRequestConditionPhotosOffline(
    //     offline,
    //     idJob,
    //     idInventory,
    //     conditionType,
    //     reportType,
    //   );
    //   setExiste(isSome);
    // } else if (idInventory) {
    //   const isSome = await existRequestInventoryOffline(
    //     offline,
    //     idJob,
    //     idInventory,
    //   );
    //   setExiste(isSome);
    // } else {
    //   const isSome = await existRequestOffline(offline, idJob);
    //   setExiste(isSome);
    // }
  };
  return (
    existe && (
      <Icon
        name={'exclamation-triangle'}
        type="solid"
        color={'red'}
        size={size}
        style={styles.icon}
      />
    )
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
});

export default OfflineValidation;
