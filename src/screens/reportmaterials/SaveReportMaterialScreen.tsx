import {QUERY_KEYS} from '@api/contants/constants';
import {
  useGetReportMaterials,
  useGetReportMaterialsInventory,
  useRegisterOneReportMaterial,
  useRegisterReportMaterials,
} from '@api/hooks/HooksTaskServices';
import {BackButton} from '@components/commons/buttons/BackButton';
import {AutocompleteContext} from '@components/commons/form/AutocompleteContext';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import {
  SaveReportMaterialSchema,
  SaveReportMaterialSchemaType,
} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RootStackParamList} from '@navigation/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {showErrorToastMessage} from '@utils/toast';
import {useCallback, useRef, useState} from 'react';
import {useWatch} from 'react-hook-form';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = NativeStackScreenProps<RootStackParamList, 'SaveReportMaterials'>;
export const SaveReportMaterialScreen = (props: Props) => {
  const itemToEdit = props.route.params?.item;

  const itemRef = useRef<any>(null);

  const {goBack} = useCustomNavigation();
  const {id: idJob} = useTopSheetStore((d) => d.jobDetail!);
  const [filter, setFilter] = useState('');
  const {user_id: idUser} = useAuth((d) => d.user!);
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const {mutateAsync: registerReportMaterials} = useRegisterReportMaterials();
  const {mutateAsync: createNewReportMaterial} = useRegisterOneReportMaterial();
  const {data: materials} = useGetReportMaterialsInventory({
    idJob,
    filter,
  });
  const {data: reportMaterials, isLoading} = useGetReportMaterials({
    idJob,
    enabled: !!itemToEdit,
  });

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob}],
    [QUERY_KEYS.REPORT_MATERIALS, {idJob}],
  ]);

  const confirmSaveMaterial = useCallback(
    (props: SaveReportMaterialSchemaType) => {
      if (itemToEdit) {
        return registerReportMaterials({
          idJob,
          list: [
            ...reportMaterials!
              ?.filter((x) => x.id != itemToEdit.id)
              ?.map((x) => ({
                idMaterial: x.id_material?.id,
                idUser: x.id_user,
                ...x,
              })),
            {
              ...itemToEdit,
              idMaterial: props.material.id,
              quantity: parseFloat(props.quantity),
              idUser: null,
            },
          ],
        });
      } else {
        return createNewReportMaterial({
          idJob,
          idMaterial: props.material.id,
          quantity: parseFloat(props.quantity),
          idUser,
        });
      }
    },
    [
      reportMaterials,
      registerReportMaterials,
      createNewReportMaterial,
      itemToEdit,
    ],
  );

  const saveMaterial = useCallback(
    (props: SaveReportMaterialSchemaType) => {
      showDialog({
        modalVisible: true,
        cancelable: true,
        message: 'Sure do You want to save this material?',
        type: 'info',
        onConfirm: () => {
          showDialog({
            modalVisible: false,
          });
          loadingWrapperPromise(
            confirmSaveMaterial(props)
              .then((d) => {
                if (d) {
                  refetchAll();
                  goBack();
                } else {
                  showErrorToastMessage(
                    'Error while saving material, try again',
                  );
                }
              })
              .catch(() =>
                showErrorToastMessage(
                  'Error while saving material, try again',
                ),
              ),
          );
        },
      });
    },
    [reportMaterials, showDialog, confirmSaveMaterial],
  );

  const closeAutocomplete = useCallback(() => {
    if (itemRef.current) {
      itemRef.current.close();
    }
  }, []);

  const checkItem = useCallback(
    (value: string) => {
      setFilter(value.trim());
    },
    [setFilter],
  );

  if (isLoading) {
    return <></>;
  }

  return (
    <Wrapper style={[styles.container]}>
      <Wrapper style={GLOBAL_STYLES.bgwhite}>
        <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton onPress={goBack} />
        </Wrapper>

        <Wrapper style={[styles.lateralPadding, styles.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}
            allowFontScaling={false}>
            Add materials
          </Label>
        </Wrapper>
      </Wrapper>

      <MinRoundedView />
      <Wrapper
        style={{
          paddingTop: 20,
          paddingHorizontal: 20,
        }}>
        <BasicFormProvider
          schema={SaveReportMaterialSchema}
          defaultValue={{
            material: itemToEdit?.id_material
              ? {
                  ...itemToEdit.id_material,
                  id: itemToEdit.id_material.id.toString(),
                  title: itemToEdit.id_material.name,
                }
              : undefined,
            quantity: itemToEdit?.quantity?.toString(),
          }}>
          <Wrapper style={{paddingBottom: 0, height: 45}}>
            <Wrapper style={styles.autocompleteContainer}>
              <AutocompleteContext
                name="material"
                // ref={itemRef}
                dataSet={materials!?.map((x) => ({
                  ...x,
                  id: x.id.toString(),
                  title: x.name,
                }))}
                textInputProps={{
                  placeholder: 'Search a material',
                }}
                controllerRef={(controller) => {
                  itemRef.current = controller;
                }}
                onChangeText={checkItem}
                initialValue={
                  itemToEdit?.id_material
                    ? {
                        ...itemToEdit.id_material,
                        id: itemToEdit.id_material.id.toString(),
                        title: itemToEdit.id_material.name,
                      }
                    : undefined
                }
                onFocus={() => {
                  closeAutocomplete();
                  itemRef.current.open();
                }}
              />
            </Wrapper>
          </Wrapper>

          <Wrapper style={[styles.lateralPadding, {marginTop: 10}]}>
            <Wrapper style={[GLOBAL_STYLES.row, styles.containerFields]}>
              <Label>Units Type:</Label>
              <TextValueFormContext name="material" />
            </Wrapper>
            <Wrapper style={[GLOBAL_STYLES.row, styles.containerFields]}>
              <Label>Quantity:</Label>
              <InputTextContext
                currentId="quantity"
                maxLength={10}
                multiline
                numberOfLines={1}
                keyboardType="numeric"
                style={styles.inputDimensions}
              />
            </Wrapper>

            <Wrapper style={{marginTop: 40, marginBottom: 20}}>
              <ButtonSubmit
                label="Save material"
                icon={<Icon name="save" type="solid" size={16} color="white" />}
                onSubmit={saveMaterial}
                showValidationError
                // onInvalid={() => Alert.alert("hola")}
              />
            </Wrapper>
          </Wrapper>
        </BasicFormProvider>
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
  },
  btnOptTop: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    width: 27,
    padding: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topsheet: {
    color: '#3a3a3a',
  },
  title: {
    color: '#3C424A',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#959595',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 13,
  },
  containerFields: {
    justifyContent: 'space-between',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
  },
  inputDimensions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    width: 100,
    height: 43,
    textAlign: 'center',
    color: '#3C424A',
    paddingTop: 10,
  },
  btnSaveInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.primary,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  textSaveInfo: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  inputSearch: {
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.3,
    backgroundColor: 'white',
    padding: 10,
    paddingBottom: 0,
    paddingTop: 0,
    height: 40,
    justifyContent: 'center',
  },
});

const TextValueFormContext = ({name}: {name: string}) => {
  const value = useWatch({name});

  return <Label>{value?.unit}</Label>;
};
