import { forwardRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  AutocompleteDropdown,
  IAutocompleteDropdownProps
} from 'react-native-autocomplete-dropdown';

export type CustomAutocompleteProps = IAutocompleteDropdownProps & {
  /** Si pasas true, no aplica los estilos por defecto del input */
  bareInputStyle?: boolean;
};

export const CustomAutocomplete = forwardRef<any, CustomAutocompleteProps>(
  ({ bareInputStyle, textInputProps, inputContainerStyle, suggestionsListTextStyle, ...rest }, ref) => {
    const mergedTextInputProps = useMemo(
      () => ({
        style: [styles.autocompleteText, textInputProps?.style],
        ...textInputProps,
      }),
      [textInputProps],
    );

    return (
      <AutocompleteDropdown
        ref={ref}
        clearOnFocus={false}
        closeOnBlur={false}
        closeOnSubmit={false}
        suggestionsListMaxHeight={300}
        debounce={400}
        showChevron={false}
        {...rest}
        textInputProps={mergedTextInputProps}
        inputContainerStyle={[!bareInputStyle && styles.inputSearch, inputContainerStyle]}
        suggestionsListTextStyle={[{ fontSize: 14, fontWeight: 'normal' }, suggestionsListTextStyle]}
      />
    );
  },
);

const styles = StyleSheet.create({
  autocompleteText: {
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 12,
    color: '#3C424A',
  },
  inputSearch: {
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.3,
    backgroundColor: 'white',
    paddingLeft: 10,
    height: 40,
    justifyContent: 'center',
  },
});