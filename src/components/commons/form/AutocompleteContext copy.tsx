import {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  AutocompleteDropdownItem,
  IAutocompleteDropdownProps,
} from 'react-native-autocomplete-dropdown';
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import {CustomAutocomplete} from '../autocomplete/CustomAutocomplete';
import {COLORS} from '@styles/colors';
import { Alert } from 'react-native';

type AnyItem = AutocompleteDropdownItem & Record<string, any>;

// util para leer errores con nombre anidado "a.b.c"
const getByPath = (obj: any, path: string) =>
  path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);

export type CustomAutocompleteContextProps<TField extends FieldValues> = Omit<
  IAutocompleteDropdownProps,
  'onSelectItem' | 'initialValue'
> & {
  /** Nombre del campo en el form (guardará el item completo por defecto) */
  name: FieldPath<TField>;
  /** Control opcional si no usas FormProvider */
  control?: Control<TField>;
  /** Extrae el id que representa visualmente al item (default: item.id) */
  getItemId?: (item: AnyItem | null | undefined) => string | undefined;
  /**
   * Transforma el item seleccionado a lo que vas a guardar en el form
   * default: guarda el item completo
   */
  mapToFormValue?: (item: AnyItem | null) => any;
  /**
   * Si el valor del form no es el item completo, cómo obtener el id para
   * que el dropdown muestre el seleccionado.
   * default: value?.id
   */
  getIdFromFormValue?: (value: any) => string | undefined;
};

export function AutocompleteContext<TField extends FieldValues>({
  name,
  control: controlProp,
  getItemId = (item) => (item?.id != null ? String(item.id) : undefined),
  mapToFormValue = (item) => item, // ← guarda el item completo por defecto
  getIdFromFormValue = (v) => (v?.id != null ? String(v.id) : undefined),
  //   @ts-ignore
  onSelectItem,
  inputContainerStyle,
  ...rest
}: CustomAutocompleteContextProps<TField>) {
  const formCtx = useFormContext<TField>();
  const control = controlProp ?? formCtx.control;
  const dropdownRef = useRef<any>(null);

  const {field} = useController({name, control});

  // id visual que debe ver el Autocomplete (derivado del valor del form)
  const selectedId = useMemo(
    () => getIdFromFormValue(field.value),
    [field.value, getIdFromFormValue],
  );

  // Si el valor del form cambia externamente, sincroniza la UI del dropdown
  useEffect(() => {
    if (selectedId != null) {
      dropdownRef.current?.setItem?.(selectedId);
    } else {
      // limpia selección si valor es null/undefined
      dropdownRef.current?.clear?.();
    }
  }, [selectedId]);

  const handleSelect = useCallback(
    (item: AnyItem | null) => {
      // 1) Guarda en el form (por defecto, el item completo)
      field.onChange(mapToFormValue(item));
      // 2) Encadena callback externo si lo pasaron
      onSelectItem?.(item ?? null);
    },
    [field, mapToFormValue, onSelectItem],
  );

  // detecta error (soporta rutas con punto)
  const hasError = !!getByPath(formCtx.formState.errors, String(name));

  const initialValue = useMemo(() => selectedId, [selectedId]);

  return (
    <CustomAutocomplete
      ref={dropdownRef}
      {...rest}
      // Para que el dropdown se pinte con el valor actual
      initialValue={initialValue}
      onSelectItem={handleSelect}
      inputContainerStyle={[
        inputContainerStyle,
        hasError && {borderColor: COLORS.error, borderWidth: 1},
      ]}
      // Si el usuario limpia manualmente, borra el valor del form también
      onClear={() => field.onChange(null)}
      useFilter={false}
    />
  );
}
