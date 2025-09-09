import {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  Controller,
  Control,
  FieldValues,
  FieldPath,
  useFormContext,
} from 'react-hook-form';
import {
  IAutocompleteDropdownProps,
  AutocompleteDropdownItem,
} from 'react-native-autocomplete-dropdown';
import {CustomAutocomplete} from '../autocomplete/CustomAutocomplete';
import {COLORS} from '@styles/colors';

type AnyItem = AutocompleteDropdownItem & Record<string, any>;

type DropdownController = {
  close: () => void;
  open: () => void;
  toggle: () => void;
  clear: () => void;
  setInputText: (t: string) => void;
  setItem: (item: {id: string; title?: string} & Record<string, any>) => void;
};

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
  controllerRef?: (c: DropdownController) => void;
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

  const ddCtrlRef = useRef<DropdownController | null>(null);
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
        // Derivados del valor actual (objeto completo)

        // Handlers
        const handleSelect = useCallback(
          (item: AnyItem | null) => {
            typingRef.current = false;
            appliedKeyRef.current = null;
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
            // si había un valor seleccionado, lo limpiamos para no reimponerlo
            if (field.value != null) {
              field.onChange(null);
            }
            onChangeTextProp?.(text);
          },
          [field, onChangeTextProp],
        );

        return (
          <>
            <CustomAutocomplete
              {...rest}
              controller={(c: DropdownController) => {
                ddCtrlRef.current = c;
                controllerRef?.(c);
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
