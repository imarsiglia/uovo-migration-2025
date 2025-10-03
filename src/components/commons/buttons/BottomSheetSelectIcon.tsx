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
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {CustomPressable} from '../pressable/CustomPressable';
import {Label} from '../text/Label';
import {Wrapper} from '../wrappers/Wrapper';
import {useCustomInsetBottom} from '@hooks/useCustomInsetBottom';

// ---- Types ----
export type Primitive = string | number | boolean | null | undefined;

export interface BottomSheetSelectIconRef {
  open: () => void;
  close: () => void;
  clearDraft: () => void;
}

export interface BottomSheetSelectIconProps<T extends Record<string, any>> {
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
  triggerComponent: React.ReactNode;
  triggerStyle?: StyleProp<ViewStyle>;
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
function _BottomSheetSelectIcon<T extends Record<string, any>>(
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
    triggerComponent,
    triggerStyle,
  }: BottomSheetSelectIconProps<T>,
  ref: React.Ref<BottomSheetSelectIconRef>,
) {
  const insetBottom = useCustomInsetBottom();
  const modalRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState('');

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

          {multiple ? (
            <Wrapper
              style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked ? <Label style={styles.checkboxIcon}>✓</Label> : null}
            </Wrapper>
          ) : (
            <Wrapper style={[styles.radio, checked && styles.radioChecked]}>
              {checked ? <Label style={styles.radioIcon}>✓</Label> : null}
            </Wrapper>
          )}
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
        hitSlop={8}
        style={({pressed}) => [triggerStyle, pressed && {opacity: 0.75}]}
        accessibilityRole="button"
        accessibilityLabel={label || 'Abrir selector'}>
        {triggerComponent}
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
            <Wrapper style={[styles.footer, {paddingBottom: !!insetBottom ? insetBottom : 10}]}>
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

export const BottomSheetSelectIcon = memo(
  forwardRef(_BottomSheetSelectIcon),
) as <T extends Record<string, any>>(
  p: BottomSheetSelectIconProps<T> & {
    ref?: React.Ref<BottomSheetSelectIconRef>;
  },
) => React.ReactNode;

// ---- Styles ----
const styles = StyleSheet.create({
  disabled: {opacity: 0.5},

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
  radio: {
    width: 22,
    height: 22,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  radioChecked: {
    backgroundColor: COLORS.tertearyDark,
    borderColor: COLORS.tertearyDark,
  },
  radioIcon: {
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
