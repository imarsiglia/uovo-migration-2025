// BottomSheetSelectInputContext.tsx
import React from 'react';
import { View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';

import { getInputIdFormContext } from '@utils/functions';
import { InputErrorMsg } from './InputErrorMsg';

import {
  BottomSheetSelectInput,
  BottomSheetSelectInputProps,
} from '../inputs/BottomSheetSelectInput';

type Props<T extends Record<string, any>> = Omit<
  BottomSheetSelectInputProps<T>,
  'value' | 'onChange'
> & {
  /** Nombre del campo en el form */
  currentId: string;
  /** Ocultar el mensaje de error */
  isErrorHidden?: boolean;
  /** Callback opcional con los items seleccionados (además de guardar el valor en el form) */
  onChangeSelectedItems?: (items: T[]) => void;
};

/** Normaliza el value del form a lo que espera el select */
function normalizeFormValue(
  raw: unknown,
  multiple: boolean,
): string[] | string | null {
  if (multiple) {
    if (Array.isArray(raw)) return raw.map(String);
    if (raw == null || raw === '') return [];
    return [String(raw)];
  }
  // single
  if (Array.isArray(raw)) return (raw[0] != null ? String(raw[0]) : null);
  if (raw == null || raw === '') return null;
  return String(raw);
}

export function BottomSheetSelectInputContext<T extends Record<string, any>>(
  {
    currentId,
    isErrorHidden,
    onChangeSelectedItems,
    multiple = false,
    containerStyle,
    ...rest
  }: Props<T>,
) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorForField = getInputIdFormContext(errors, currentId);
  const hasError = Boolean(errorForField);

  return (
    <View>
      <Controller
        control={control}
        name={currentId}
        render={({ field: { value, onChange, onBlur } }) => {
          const safeValue = normalizeFormValue(value, multiple);

          return (
            <BottomSheetSelectInput<T>
              {...(rest as BottomSheetSelectInputProps<T>)}
              multiple={multiple}
              value={safeValue as any}
              onChange={(val, selectedItems) => {
                // Guarda SOLO el valor en el form
                onChange(val);
                // Y si necesitas los objetos, te los paso aparte
                onChangeSelectedItems?.(selectedItems);
              }}
              // si quieres marcar touched al confirmar, tu BottomSheetSelectInput
              // ya llama onChange al confirmar; aquí añadimos onBlur al cerrar,
              // opcionalmente podrías exponer un prop/hook para llamarlo justo al confirmar
              // y pasarlo desde aquí.
              containerStyle={[
                containerStyle,
                hasError && { borderColor: 'red' },
              ]}
            />
          );
        }}
      />

      {/* <InputErrorMsg
        message={errorForField?.message}
        isHidden={isErrorHidden}
      /> */}
    </View>
  );
}
