import LottieView from 'lottie-react-native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ProgressBar from './ProgressBar';

type Props = {
  total: number;
  value: number;
};
const ModalSyncroOffline = ({total, value}: Props) => {
  return (
    <View style={styles.containerContent}>
      <LottieView
        style={{width: 250, height: 150}}
        source={require('../../assets/animations/uploading.json')}
        autoPlay
        loop
      />
      <View style={styles.containerProgress}>
        <Text style={styles.textSincro}>Synchronizing...</Text>
        <Text style={styles.textProgress}>
          {value} of {total}
        </Text>
        <ProgressBar value={value} total={total} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerProgress: {
    width: '100%',
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  textSincro: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textProgress: {
    fontSize: 16,
  },
});

export default ModalSyncroOffline;
