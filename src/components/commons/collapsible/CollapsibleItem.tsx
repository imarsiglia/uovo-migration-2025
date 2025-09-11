import React = require('react');
import {StyleProp, ViewStyle} from 'react-native';
import Collapsible from 'react-native-collapsible';

type Props = {
  collapsed?: boolean;
  duration?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const CollapsibleItem = ({
  collapsed = true,
  duration = 200,
  children,
  style,
}: Props) => {
  return (
    <Collapsible collapsed={collapsed} duration={duration} style={style}>
      {children}
    </Collapsible>
  );
};
