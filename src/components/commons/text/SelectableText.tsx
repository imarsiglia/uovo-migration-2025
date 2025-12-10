import {ReactNode} from 'react';
import {
  Platform,
  TextInput,
  Text,
  TextInputProps,
  TextProps,
} from 'react-native';

type props = {
  children: ReactNode;
} & (TextInputProps | TextProps);
export const SelectableText = ({children, ...rest}: props) => {
  return Platform.OS === 'ios' ? (
    <TextInput
      multiline
      scrollEnabled={false}
      editable={false}
      {...rest}
      style={[{paddingBottom: 20}, rest?.style]}>
      {children}
    </TextInput>
  ) : (
    <Text selectable {...rest} style={[{paddingBottom: 20}, rest?.style]}>
      {children}
    </Text>
  );
};
