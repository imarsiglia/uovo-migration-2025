import React from 'react';
import {Image, ImageProps} from 'react-native';

type Props = ImageProps;
export const CustomImage = (props: Props) => {
  return <Image {...props} />;
};
