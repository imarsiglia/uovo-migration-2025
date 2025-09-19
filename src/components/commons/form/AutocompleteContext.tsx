import { COLORS } from '@styles/colors';
import { useCallback, useMemo, useRef } from 'react';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import {
  AutocompleteDropdownItem,
  IAutocompleteDropdownProps,
  IAutocompleteDropdownRef,
} from 'react-native-autocomplete-dropdown';
import { CustomAutocomplete } from '../autocomplete/CustomAutocomplete';

type AnyItem = AutocompleteDropdownItem & Record<string, any>;

type Props<T extends FieldValues> = Omit<
  IAutocompleteDropdownProps,
  'onSelectItem'
> & {
  name: FieldPath<T>;
  control?: Control<T>;
  /** Deriva id desde el valor del form (por defecto value.id) */
  getIdFromFormValue?: (v: any) => string | undefined;
  /** Deriva label desde el valor del form */
  getLabelFromFormValue?: (v: any) => string | undefined;
  /** Transforma el item seleccionado a lo que guardas en el form (default: item completo) */
  mapToFormValue?: (item: AnyItem | null) => any;
  /** Acceso al controller interno del dropdown */
  controllerRef?: (c: IAutocompleteDropdownRef) => void;
};

export function AutocompleteContext<T extends FieldValues>({
  name,
  control: controlProp,
  getIdFromFormValue = (v) => (v?.id != null ? String(v.id) : undefined),
  getLabelFromFormValue = (v) => v?.title ?? v?.name ?? v?.label,
  mapToFormValue = (item) => item, // guarda el objeto completo
  controllerRef,
  inputContainerStyle,
  ...rest
}: Props<T>) {
  const {control: ctxControl, formState} = useFormContext<T>();
  const control = controlProp ?? ctxControl;

  const ddCtrlRef = useRef<IAutocompleteDropdownRef | null>(null);
  const typingRef = useRef(false); // evita reimponer selección mientras escribe
  const appliedKeyRef = useRef<string | null>(null); // evita re-aplicar lo mismo
  const dataVersion = useMemo(() => {
    const ds = (rest as any).dataSet as AnyItem[] | undefined;
    return Array.isArray(ds) ? ds.map((x) => x?.id).join('|') : '';
  }, [(rest as any).dataSet]);

  return (
    <Controller
      control={control}
      name={name}
      render={({field, fieldState}) => {
        // Handlers
        const handleSelect = useCallback(
          (item: AnyItem | null) => {
            typingRef.current = false;
            appliedKeyRef.current = null;
            // ddCtrlRef?.current?.setInputText(item?.title!);
            field.onChange(mapToFormValue(item));
          },
          [field, mapToFormValue],
        );

        const onChangeTextProp = (rest as any).onChangeText as (
          t: string,
        ) => void | undefined;

        const handleChangeText = useCallback(
          (text: string) => {
            typingRef.current = true;
            // if (field.value != null) {
            //   field.onChange(null);
            // }
            onChangeTextProp?.(text);
          },
          [onChangeTextProp],
        );

        return (
          <>
            <CustomAutocomplete
              {...rest}
              controller={(c) => {
                ddCtrlRef.current = c;
                controllerRef?.(c!);
              }}
              onSelectItem={handleSelect}
              onChangeText={handleChangeText}
              onClear={() => {
                typingRef.current = false;
                appliedKeyRef.current = null;
                field.onChange(null);
              }}
              inputContainerStyle={[
                inputContainerStyle,
                fieldState.error && {borderColor: COLORS.error, borderWidth: 1},
              ]}
              useFilter={false}
            />
          </>
        );
      }}
    />
  );
}
