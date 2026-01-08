import {showErrorToastMessage} from '@utils/toast';
import {FieldErrors, useFormContext} from 'react-hook-form';
import {RoundedButton, RoundedButtonProps} from '../buttons/RoundedButton';
import {forwardRef, useImperativeHandle} from 'react';

export type ButtonSubmitRef = {
  submit: () => void;
};

type Props = RoundedButtonProps & {
  onSubmit: (data: any) => void;
  onInvalid?: () => void;
  showValidationError?: boolean;
};

export function findFirstError(
  errors: FieldErrors<any>,
  parentPath = '',
): {path: string; message?: string} | null {
  if (!errors) return null;

  for (const key of Object.keys(errors)) {
    const err: any = (errors as any)[key];
    if (!err) continue;

    const path = parentPath ? `${parentPath}.${key}` : key;

    if (typeof err.message !== 'undefined' && err.message !== null) {
      return {path, message: String(err.message)};
    }

    if (Array.isArray(err)) {
      for (let i = 0; i < err.length; i++) {
        const nested = err[i];
        if (!nested) continue;

        if (nested?.message) {
          return {path: `${path}[${i}]`, message: String(nested.message)};
        }

        const found = findFirstError(
          nested as FieldErrors<any>,
          `${path}[${i}]`,
        );
        if (found) return found;
      }
      continue;
    }

    if (typeof err === 'object') {
      const found = findFirstError(err as FieldErrors<any>, path);
      if (found) return found;
    }
  }

  return null;
}

export const ButtonSubmit = forwardRef<ButtonSubmitRef, Props>(
  ({onSubmit, onInvalid, showValidationError, ...restProps}, ref) => {
    const {handleSubmit} = useFormContext();

    const submit = handleSubmit(onSubmit, (errors) => {
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
    });

    useImperativeHandle(ref, () => ({
      submit,
    }));

    return <RoundedButton {...restProps} onPress={submit} />;
  },
);

ButtonSubmit.displayName = 'ButtonSubmit';
