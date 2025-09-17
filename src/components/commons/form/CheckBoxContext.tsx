// components/checkbox/CheckBoxContext.tsx
import React, {useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import {Controller, useFormContext} from 'react-hook-form';
import {COLORS} from '@styles/colors';

export type Option = {
  id: string;
  title: string;
};

type Props = {
  currentId: string; // nombre del campo en react-hook-form
  options: Option[];
  columns?: number; // por defecto 1
  /** tamaño del checkbox en px */
  boxSize?: number;
  /** estilo adicional para el contenedor */
  containerStyle?: any;
};

export const CheckBoxContext: React.FC<Props> = ({
  currentId,
  options,
  columns = 1,
  boxSize = 18,
  containerStyle,
}) => {
  const {control} = useFormContext();

  // ancho en porcentaje por columna (string para RN)
  const itemWidth = useMemo(() => `${100 / Math.max(1, columns)}%`, [columns]);

  // Helper to check if an option is in the selected array
  const isSelected = (selected: Option[] | undefined, id: string) =>
    !!selected?.some((s) => s.id === id);

  return (
    <Controller
      control={control}
      name={currentId}
      // No seteamos defaultValue aquí: mejor dejar que venga de useForm defaultValues.
      render={({field: {value, onChange}}) => {
        const selected: Option[] = Array.isArray(value) ? value : [];

        const toggle = (option: Option) => (_e?: GestureResponderEvent) => {
          const exists = selected.some((s) => s.id === option.id);
          let next: Option[];
          if (exists) {
            next = selected.filter((s) => s.id !== option.id);
          } else {
            next = [...selected, option];
          }
          onChange(next);
        };

        return (
          <View style={[styles.wrapper, containerStyle]}>
            {options.map((opt) => {
              const checked = isSelected(selected, opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={toggle(opt)}
                  //@ts-ignore
                  style={[styles.itemContainer, {width: itemWidth}]}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked}}>
                  <View style={styles.itemInner}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          width: boxSize,
                          height: boxSize,
                          borderColor: checked ? COLORS.terteary : COLORS.borderInputColor,
                          backgroundColor: checked
                            ? COLORS.terteary
                            : 'transparent',
                        },
                      ]}>
                      {checked ? <Text style={styles.checkMark}>✓</Text> : null}
                    </View>

                    <Text style={styles.label} numberOfLines={2}>
                      {opt.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemContainer: {
    paddingVertical: 6,
    paddingRight: 8,
    paddingLeft: 0,
  },
  itemInner: {
    flexDirection: 'row',
  },
  checkbox: {
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 12,
  },
  label: {
    flex: 1,
    color: "gray",
    fontSize: 13,
    textAlignVertical: 'center',
    textTransform: 'capitalize',
  },
});

export default CheckBoxContext;
