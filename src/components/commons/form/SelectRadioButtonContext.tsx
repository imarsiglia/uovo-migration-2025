// SelectRadioButtonContext.tsx
import {JSX, memo, useMemo} from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import {
  SelectRadioButton,
  SelectRadioButtonProps,
} from '../inputs/SelectRadioButton';

/**
 * Componente con react-hook-form (usa useController para eficiencia).
 * Reutiliza SelectRadioButton. No cambia estilos/props de presentación.
 */
export type SelectRadioButtonContextProps<
  TOption,
  TField extends FieldValues,
> = Omit<SelectRadioButtonProps<TOption>, 'value' | 'onChange'> & {
  /** Nombre del campo en el formulario */
  currentId: FieldPath<TField>;
  /** Control opcional si no quieres depender del FormProvider */
  control?: Control<TField>;
  /** defaultValue si el form no lo tiene definido */
  defaultValue?: string | null;
};

function _SelectRadioButtonContext<TOption, TField extends FieldValues>({
  currentId,
  control: controlProp,
  defaultValue = null,
  ...rest
}: SelectRadioButtonContextProps<TOption, TField>) {
  const ctx = useFormContext<TField>();
  const control = controlProp ?? ctx.control;

  const {field} = useController<TField, FieldPath<TField>>({
    name: currentId,
    control,
    defaultValue: defaultValue as any,
  });

  // Evita recrear onChange
  const onChange = useMemo(() => (id: string) => field.onChange(id), [field]);

  return (
    <SelectRadioButton<TOption>
      {...(rest as any)}
      value={field.value as any}
      onChange={onChange}
    />
  );
}

export const SelectRadioButtonContext = memo(_SelectRadioButtonContext) as <
  TOption,
  TField extends FieldValues,
>(
  p: SelectRadioButtonContextProps<TOption, TField>,
) => JSX.Element;
