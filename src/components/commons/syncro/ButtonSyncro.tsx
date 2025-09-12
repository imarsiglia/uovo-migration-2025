import React from 'react';
import {PressableOpacity} from '../buttons/PressableOpacity';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {COLORS} from '@styles/colors';
import {SpinningIcon} from '../spin/SpinningIcon';
import {StyleSheet} from 'react-native';

type Props = {
  isRefetching?: boolean;
  onPress: () => void;
};

export const ButtonSyncro = ({isRefetching, onPress}: Props) => {
  return (
    <PressableOpacity
      disabled={isRefetching}
      onPress={onPress}
      style={[styles.btnSync, {backgroundColor: COLORS.primary}]}>
      <SpinningIcon size={17} spin={isRefetching} />
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  btnSync: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
