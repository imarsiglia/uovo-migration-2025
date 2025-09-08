import {showErrorToastMessage} from '@utils/toast';
import {FieldErrors, useFormContext} from 'react-hook-form';
import {RoundedButton, RoundedButtonProps} from '../buttons/RoundedButton';
import {forwardRef, Ref} from 'react';
import {View} from 'react-native';

type Props = RoundedButtonProps & {
  onSubmit: (data: any) => void;
  onInvalid?: () => void;
  /** Si es true, muestra el primer error del formulario en un toast */
  showValidationError?: boolean;
};

function findFirstError(
  errors: FieldErrors<any>,
  parentPath = '',
): {path: string; message?: string} | null {
  if (!errors) return null;

  // Itera claves en orden de inserción (JS mantiene el orden de keys de objetos normales)
  for (const key of Object.keys(errors)) {
    const err: any = (errors as any)[key];
    if (!err) continue;

    const path = parentPath ? `${parentPath}.${key}` : key;

    // Caso 1: error directo con message
    if (typeof err.message !== 'undefined' && err.message !== null) {
      return {path, message: String(err.message)};
    }

    // Caso 2: arrays de errores (ej. campos de FieldArray)
    if (Array.isArray(err)) {
      for (let i = 0; i < err.length; i++) {
        const nested = err[i];
        if (!nested) continue;
        // mensaje directo en el índice
        if (nested?.message) {
          return {path: `${path}[${i}]`, message: String(nested.message)};
        }
        // recursivo dentro del índice
        const found = findFirstError(
          nested as FieldErrors<any>,
          `${path}[${i}]`,
        );
        if (found) return found;
      }
      continue;
    }

    // Caso 3: objeto anidado (sub-form)
    if (typeof err === 'object') {
      const found = findFirstError(err as FieldErrors<any>, path);
      if (found) return found;
    }
  }

  return null;
}

export const ButtonSubmit = forwardRef(
  (
    {onSubmit, onInvalid, showValidationError, ...restProps}: Props,
    ref: Ref<View>,
  ) => {
    const {handleSubmit} = useFormContext();

    return (
      <RoundedButton
        ref={ref}
        {...restProps}
        onPress={handleSubmit(onSubmit, (errors) => {
          // Ejecuta callback personalizado si existe
          if (onInvalid) {
            onInvalid();
          }

          if (showValidationError) {
            const first = findFirstError(errors);
            const msg = first?.message ?? 'Please, complete required fields';

            showErrorToastMessage(msg);
          } else if (!onInvalid) {
            showErrorToastMessage('Please, complete required fields');
          }
        })}
      />
    );
  },
);
