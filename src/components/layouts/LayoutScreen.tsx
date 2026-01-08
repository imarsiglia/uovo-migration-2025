import {COLORS} from '@styles/colors';
import React from 'react';
import {SafeAreaView} from 'react-native';

type Props = {
  children: React.ReactNode;
  backgroundColor?: string;
};
export const LayoutScreen = ({
  children,
  backgroundColor = COLORS.white,
}: Props) => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor}}>{children}</SafeAreaView>
  );
};
