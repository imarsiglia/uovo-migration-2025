import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {COLORS} from '@styles/colors';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomPressable} from '../pressable/CustomPressable';
import {Label} from '../text/Label';
import {Wrapper} from '../wrappers/Wrapper';

// ---- Types ----
export type Primitive = string | number | boolean | null | undefined;

export interface BottomSheetSelectInputRef {
  open: () => void;
  close: () => void;
  clearDraft: () => void;
}

export interface BottomSheetSelectInputProps<T extends Record<string, any>> {
  label?: string;
  options: T[];
  /** Controlled value: id (single) o ids (multiple) */
  value?: string | string[] | null;
  /** Permitir selección múltiple */
  multiple?: boolean;
  /** onChange se dispara SOLO al confirmar */
  onChange: (value: string | string[] | null, selectedItems: T[]) => void;
  /** Clave que identifica el id del item (default: 'id') */
  idKey?: keyof T;
  /** Clave de etiqueta para mostrar (default: 'name') */
  labelKey?: keyof T;
  /** Placeholder cuando no hay selección */
  placeholder?: string;
  /** Puntos de anclaje del BottomSheet (default: ['50%', '95%']) */
  snapPoints?: Array<string | number>;
  /** Habilitar buscador por nombre */
  searchable?: boolean;
  /** Deshabilitar input */
  disabled?: boolean;
  /** Texto del botón confirmar */
  confirmText?: string;
  /** Texto del botón cancelar */
  cancelText?: string;
  maxItemsToShow?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputTextStyle?: StyleProp<TextStyle>;
}

// ---- Utils ----
const normalizeStr = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

function ensureArray(v?: string | string[] | null): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function useDraftSelection(
  initial: string[],
  deps: any[] = [],
): [
  Set<string>,
  (id: string, multi: boolean) => void,
  () => void,
  (ids: string[] | Set<string>) => void,
] {
  const [draft, setDraft] = useState<Set<string>>(new Set(initial));

  // reset cuando cambie la dependencia (al abrir)
  useEffect(() => setDraft(new Set(initial)), deps);

  const toggle = useCallback((id: string, multi: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (multi) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setDraft(new Set(initial)), [initial]);

  const setMany = useCallback((ids: string[] | Set<string>) => {
    setDraft(new Set(Array.isArray(ids) ? ids : Array.from(ids)));
  }, []);

  return [draft, toggle, reset, setMany];
}

// ---- Component ----
function _BottomSheetSelectInput<T extends Record<string, any>>(
  {
    label,
    options,
    value,
    multiple = false,
    onChange,
    idKey = 'id' as keyof T,
    labelKey = 'name' as keyof T,
    placeholder = 'Select...',
    snapPoints = ['60%', '95%'],
    searchable = true,
    disabled = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    maxItemsToShow = 2,
    containerStyle,
    inputTextStyle,
  }: BottomSheetSelectInputProps<T>,
  ref: React.Ref<BottomSheetSelectInputRef>,
) {
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState('');
  const [footerH, setFooterH] = useState(0);

  // Normaliza value controlado
  const selected = ensureArray(value);

  // Estado de selección temporal (solo se confirma con botón)
  const [draft, toggle, resetDraft, setDraftMany] = useDraftSelection(
    selected,
    [options, value],
  );

  // Memo de opciones filtradas
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = normalizeStr(query.trim());
    return options.filter((o) =>
      normalizeStr(String(o[labelKey] ?? '')).includes(q),
    );
  }, [options, query, searchable, labelKey]);

  // Etiqueta a mostrar en el input
  const selectedLabel = useMemo(() => {
    if (!selected.length) return placeholder;
    if (!multiple) {
      const item = options.find((o) => String(o[idKey]) === selected[0]);
      return (item?.[labelKey] as Primitive) ?? placeholder;
    }
    // multiple: muestra conteo y primeros nombres
    const names: string[] = [];
    for (const id of selected) {
      const item = options.find((o) => String(o[idKey]) === id);
      if (item && item[labelKey] != null) names.push(String(item[labelKey]));
      if (names.length >= maxItemsToShow) break;
    }
    const more = selected.length - names.length;
    return more > 0 ? `${names.join(', ')} +${more}` : names.join(', ');
  }, [selected, options, idKey, labelKey, multiple, placeholder]);

  const open = useCallback(() => {
    // Al abrir, sincroniza borrador con el value controlado actual
    setDraftMany(selected);
    setQuery('');
    modalRef.current?.present();
  }, [selected, setDraftMany]);

  const close = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  const confirm = useCallback(() => {
    const ids = Array.from(draft);
    const chosenItems = options.filter((o) => ids.includes(String(o[idKey])));
    const out = multiple ? ids : ids[0] ?? null;
    onChange(out, chosenItems);
    close();
  }, [draft, options, idKey, multiple, onChange, close]);

  const cancel = useCallback(() => {
    resetDraft();
    close();
  }, [resetDraft, close]);

  useImperativeHandle(ref, () => ({open, close, clearDraft: resetDraft}), [
    open,
    close,
    resetDraft,
  ]);

  const keyExtractor = useCallback((item: T) => String(item[idKey]), [idKey]);

  const renderItem = useCallback(
    ({item}: {item: T}) => {
      const id = String(item[idKey]);
      const name = String(item[labelKey] ?? '');
      const checked = draft.has(id);
      return (
        <CustomPressable
          onPress={() => toggle(id, multiple)}
          style={({pressed}) => [styles.row, pressed && styles.rowPressed]}>
          <Label numberOfLines={1} style={styles.rowLabel}>
            {name}
          </Label>
          <Wrapper style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked ? <Label style={styles.checkboxIcon}>✓</Label> : null}
          </Wrapper>
        </CustomPressable>
      );
    },
    [draft, idKey, labelKey, multiple, toggle],
  );

  return (
    <>
      <CustomPressable
        disabled={disabled}
        onPress={open}
        style={({pressed}) => [
          styles.input,
          containerStyle,
          disabled && styles.disabled,
          pressed && styles.inputPressed,
        ]}>
        <Label
          numberOfLines={1}
          style={[
            styles.inputText,
            inputTextStyle,
            !selected.length && styles.placeholderText,
          ]}>
          {selectedLabel ?? label}
        </Label>
        <Wrapper style={{minWidth: 5}}>
          <Icon name="angle-down" type="light" color={COLORS.gray} size={22} />
        </Wrapper>
      </CustomPressable>

      <BottomSheetModal
        ref={modalRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false} // usando % en snapPoints => mejor mantener fijo
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        handleStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        // Footer FIJO SIEMPRE VISIBLE
        footerComponent={(props) => (
          <BottomSheetFooter {...props}>
            <Wrapper
              onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
              style={[styles.footer, {paddingBottom: insets.bottom + 10}]}>
              <CustomPressable
                onPress={cancel}
                style={({pressed}) => [
                  styles.btn,
                  styles.btnGhost,
                  pressed && styles.btnPressed,
                ]}>
                <Label style={[styles.btnText, styles.btnGhostText]}>
                  {cancelText}
                </Label>
              </CustomPressable>
              <CustomPressable
                onPress={confirm}
                style={({pressed}) => [
                  styles.btn,
                  styles.btnPrimary,
                  pressed && styles.btnPressed,
                ]}>
                <Label style={[styles.btnText, styles.btnPrimaryText]}>
                  {confirmText}
                </Label>
              </CustomPressable>
            </Wrapper>
          </BottomSheetFooter>
        )}>
        <Wrapper style={styles.sheetContent}>
          <Wrapper style={styles.header}>
            <Label style={styles.headerTitle}>
              {searchable ? placeholder : label}
            </Label>
            {searchable && (
              <BottomSheetTextInput
                placeholder={label}
                value={query}
                onChangeText={setQuery}
                style={styles.search}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            )}
          </Wrapper>

          <BottomSheetFlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled // importante en Android para scroll anidado
            style={{flex: 1}}
            contentContainerStyle={
              filtered.length === 0
                ? styles.emptyContainer
                : {paddingBottom: footerH + insets.bottom + 8}
            }
            ListEmptyComponent={
              <Label style={styles.emptyText}>No results</Label>
            }
            ListFooterComponentStyle={{}}
          />
        </Wrapper>
      </BottomSheetModal>
    </>
  );
}

export const BottomSheetSelectInput = memo(
  forwardRef(_BottomSheetSelectInput),
) as <T extends Record<string, any>>(
  p: BottomSheetSelectInputProps<T> & {
    ref?: React.Ref<BottomSheetSelectInputRef>;
  },
) => React.ReactNode;

// ---- Styles ----
const styles = StyleSheet.create({
  input: {
    minHeight: 40,
    borderWidth: 0.5,
    borderColor: COLORS.borderInputColor,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputPressed: {opacity: 0.9},
  disabled: {opacity: 0.5},
  inputText: {
    color: COLORS.inputTextColor,
    fontSize: 14,
    flex: 1,
  },
  placeholderText: {color: '#9CA3AF'},

  handle: {borderTopLeftRadius: 16, borderTopRightRadius: 16},
  sheetBg: {backgroundColor: 'white', flex: 1},

  header: {paddingHorizontal: 16, gap: 15, paddingTop: 10},
  headerTitle: {
    fontSize: 17,
    color: COLORS.text,
    textAlign: 'center',
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F2F5',
  },
  rowPressed: {backgroundColor: '#F9FAFB'},
  rowLabel: {fontSize: 16, color: '#111827', flex: 1, paddingRight: 12},
  sheetContent: {flex: 1},
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: COLORS.tertearyDark,
    borderColor: COLORS.tertearyDark,
  },
  checkboxIcon: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'white',
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {opacity: 0.9},
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnGhostText: {color: '#111827'},
  btnPrimary: {backgroundColor: COLORS.primary},
  btnPrimaryText: {color: 'white', fontWeight: '600'},

  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {color: '#6B7280', bottom: '35%'},
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: '#eee',
  },
  btnText: {},
});
