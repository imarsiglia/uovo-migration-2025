import {Icons} from '@assets/icons/icons';
import React, {useState, useRef, useEffect} from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {COLORS} from '@styles/colors';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  containerStyle?: any;
  iconStyle?: any;
} & TextInputProps;

const SearchInput = ({
  onChange,
  onSubmit,
  containerStyle,
  iconStyle,
  ...rest
}: Props) => {
  const inputRef = useRef<TextInput | null>(null);
  const [value, setValue] = useState(rest.value);
  const [isTyping, setIsTyping] = useState(false);
  // @ts-ignore
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (newValue: string) => {
    setIsTyping(true);
    setValue(newValue);

    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      setIsTyping(false);
      if (onChange) {
        onChange(newValue);
      }
    }, 800); // Debounce time

    setTimerId(newTimerId);
  };

  const handleClear = () => {
    setValue('');
    if (onChange) {
      onChange('');
    }
  };

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        {...rest}
        value={value}
        onChangeText={handleInputChange}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      <View style={styles.iconsContainer}>
        {value?.length! > 0 && (
          <PressableOpacity onPress={handleClear} style={styles.iconButton}>
            <Icons.Close fontSize={13} color={'white'} />
          </PressableOpacity>
        )}
        {isTyping ? (
          <ActivityIndicator size="small" color="#888" />
        ) : (
          <PressableOpacity
            onPress={() => {
              inputRef.current?.focus();
              if (onSubmit) onSubmit();
            }}>
            <Icon name="search" size={16} color="#959595" type="light" />
          </PressableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.5,
    backgroundColor: COLORS.white,
    fontSize: 10,
    height: 40,
    padding: 0,
    paddingLeft: 10,
    borderBottomWidth: 0.5,
  },
  input: {
    flex: 1,
    color: '#000',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 2.5,
    backgroundColor: COLORS.placeholderInput,
    borderRadius: 100,
  },
});

export default SearchInput;
