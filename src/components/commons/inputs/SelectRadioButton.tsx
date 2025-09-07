// SelectRadioButton.tsx
import { COLORS } from '@styles/colors';
import {memo, useCallback, useMemo} from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export type OptionLike<T> = T;

export type SelectRadioButtonProps<T> = {
  /** Lista de opciones (cualquier shape) */
  options: OptionLike<T>[];

  /** Valor seleccionado (id) o null */
  value: string | null | undefined;

  /** Callback cuando cambia la selección */
  onChange: (id: string) => void;

  /** Extrae el id de una opción (default: (o as any).id) */
  getOptionId?: (item: T) => string;

  /** Extrae el label de una opción (default: (o as any).label ?? (o as any).name) */
  getOptionLabel?: (item: T) => string;

  /** 'horizontal' | 'vertical' (default: 'vertical') */
  orientation?: 'horizontal' | 'vertical';

  /** Atajo: true => horizontal */
  horizontal?: boolean;

  /** Deshabilitar todo el grupo */
  disabled?: boolean;

  /** Separación entre items (default: 12) */
  gap?: number;

  /** Permitir salto de línea cuando horizontal (default: true) */
  wrap?: boolean;

  /** Estilos */
  containerStyle?: StyleProp<ViewStyle>;
  itemContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  radioOuterStyle?: StyleProp<ViewStyle>;
  radioInnerStyle?: StyleProp<ViewStyle>;

  /** Render de label custom (opcional) */
  renderLabel?: (label: string, item: T, selected: boolean) => React.ReactNode;

  /** testID base (opcional) */
  testID?: string;
};

type Mapped<T> = { id: string; label: string; raw: T };

const defaultGetId = (o: any) => String(o?.id ?? '');
const defaultGetLabel = (o: any) =>
  String(o?.label ?? o?.name ?? '');

const RadioItem = memo(function RadioItem<T>({
  id,
  label,
  selected,
  onPress,
  disabled,
  itemContainerStyle,
  labelStyle,
  radioOuterStyle,
  radioInnerStyle,
  renderLabel,
  orientation,
  testID,
}: {
  id: string;
  label: string;
  selected: boolean;
  onPress: (id: string) => void;
  disabled?: boolean;
  itemContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  radioOuterStyle?: StyleProp<ViewStyle>;
  radioInnerStyle?: StyleProp<ViewStyle>;
  renderLabel?: (label: string) => React.ReactNode;
  orientation: 'horizontal' | 'vertical';
  testID?: string;
}) {
  const handlePress = useCallback(() => {
    if (!disabled) onPress(id);
  }, [disabled, id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{color: 'rgba(0,0,0,0.08)', borderless: false}}
      style={({pressed}) => [
        styles.item,
        orientation === 'horizontal' && styles.itemHorizontal,
        itemContainerStyle,
        disabled && styles.itemDisabled,
        pressed && !disabled && styles.itemPressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{disabled, selected}}
      testID={testID ? `${testID}__item_${id}` : undefined}
    >
      <View style={[styles.radioOuter, radioOuterStyle, selected && styles.radioOuterSelected]}>
        {selected ? <View style={[styles.radioInner, radioInnerStyle]} /> : null}
      </View>
      {renderLabel ? (
        <View style={styles.labelWrapper}>{renderLabel(label)}</View>
      ) : (
        <Text
          style={[styles.label, labelStyle, disabled && styles.labelDisabled]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});

export function SelectRadioButton<T>({
  options,
  value,
  onChange,
  getOptionId = defaultGetId,
  getOptionLabel = defaultGetLabel,
  orientation = 'vertical',
  horizontal,
  disabled,
  gap = 12,
  wrap = true,
  containerStyle,
  itemContainerStyle,
  labelStyle,
  radioOuterStyle,
  radioInnerStyle,
  renderLabel,
  testID,
}: SelectRadioButtonProps<T>) {
  const direction: 'horizontal' | 'vertical' =
    (horizontal ? 'horizontal' : orientation) ?? 'vertical';

  // Mapea opciones una sola vez (mientras options no cambie por referencia)
  const mapped: Mapped<T>[] = useMemo(
    () =>
      (options ?? []).map((raw) => ({
        raw,
        id: getOptionId(raw),
        label: getOptionLabel(raw),
      })),
    [options, getOptionId, getOptionLabel],
  );

  const handleChange = useCallback(
    (id: string) => {
      if (disabled) return;
      if (id !== (value ?? null)) {
        onChange(id);
      }
    },
    [disabled, onChange, value],
  );

  return (
    <View
      style={[
        styles.container,
        direction === 'horizontal' ? styles.row : styles.column,
        direction === 'horizontal' && wrap && {flexWrap: 'wrap'},
        {gap},
        containerStyle,
      ]}
      accessibilityRole="radiogroup"
      testID={testID}
    >
      {mapped.map(({id, label, raw}) => (
        <RadioItem
          key={id}
          id={id}
          label={label}
          selected={id === value}
          onPress={handleChange}
          disabled={disabled}
          itemContainerStyle={itemContainerStyle}
          labelStyle={labelStyle}
          radioOuterStyle={radioOuterStyle}
          radioInnerStyle={radioInnerStyle}
          renderLabel={renderLabel ? (l) => renderLabel(l, raw, id === value) : undefined}
          orientation={direction}
          testID={testID}
        />
      ))}
    </View>
  );
}

// Comparador opcional si lo exportas como memo:
// export const SelectRadioButton = memo(SelectRadioButton) // <- si quieres
// pero al ser genérico T, mantenerlo como función exportada es más simple.

const styles = StyleSheet.create({
  container: {alignItems: 'flex-start'},
  row: {flexDirection: 'row'},
  column: {flexDirection: 'column'},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  itemHorizontal: {marginRight: 0},
  itemDisabled: {opacity: 0.5},
  itemPressed: {opacity: 0.9},
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'white',
  },
  radioOuterSelected: {
    borderColor: COLORS.terteary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.terteary,
  },
  labelWrapper: {maxWidth: '90%'},
  label: {color: COLORS.gray, fontSize: 12, maxWidth: '90%'},
  labelDisabled: {color: '#9CA3AF'},
});
