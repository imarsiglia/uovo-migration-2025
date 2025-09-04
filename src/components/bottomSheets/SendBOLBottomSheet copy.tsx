import {useSendEmailBOL} from '@api/hooks/HooksJobServices';
import { JobDetailType, JobType, NSJobType } from '@api/types/Jobs';
import {RBSheetRef} from '@components/commons/bottomsheets/ImageOptionSheet';
import { Label } from '@components/commons/text/Label';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {isEmail} from '@utils/functions';
import {showToastMessage} from '@utils/toast';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  InteractionManager,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import Modal from 'react-native-modal';
import RBSheet from 'react-native-raw-bottom-sheet';

type PeopleEmail = {
  id?: number;
  type?: string;
  name?: string;
  phone?: string;
  email: string;
  checked?: boolean;
  valid?: boolean;
};

type Props = {
  // idJob: number;
  handleVisible: (val: boolean) => void;
  visible: boolean;
  onFinishSendBol?: () => void;
  jobDetail?: NSJobType | JobDetailType
};

export const SendBOLBottomSheet = ({
  jobDetail,
  handleVisible,
  visible = false,
  onFinishSendBol,
}: Props) => {
  const [emails, setEmails] = useState<PeopleEmail[]>([]);
  const [emailChipText, setEmailChipText] = useState('');
  const [others, setOthers] = useState<PeopleEmail[]>([]);
  const [showResendBol, setShowResendBol] = useState(false);
  const [messageErrorBol, setMessageErrorBol] = useState('');
  const [buttonConfirmModal, setButtonConfirmModal] = useState<{
    confirmColor?: string;
    confirmText?: string;
    confirmFontSize?: number;
    cancelColor?: string;
    cancelFontSize?: number;
    forceSignature?: boolean;
  }>({});

  // const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {mutateAsync} = useSendEmailBOL();
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const refRbsSheet = useRef<RBSheetRef | null>(null);

  // -------- helpers ----------
  const resetAll = useCallback(() => {
    setEmails([]);
    setEmailChipText('');
    setOthers([]);
  }, []);

  const openSheetSafely = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => refRbsSheet.current?.open());
    });
  }, []);

  const initSelectedEmails = useCallback(() => {
    const list: PeopleEmail[] = [];
    // Shipper
    if (jobDetail?.shipper_email) {
      const parts = jobDetail.shipper_email.split(';').map(s => s.trim()).filter(Boolean);
      parts.forEach((em, i) => {
        list.push({
          id: list.length + 1,
          type: 'Shipper',
          name: jobDetail.shipper_name,
          phone: jobDetail.shipper_phone,
          email: em,
          checked: false,
        });
      });
    }
    // Consignee (prop como viene en tu store)
    if (jobDetail?.consigne_eemail) {
      const parts = jobDetail.consigne_eemail.split(';').map(s => s.trim()).filter(Boolean);
      parts.forEach((em) => {
        list.push({
          id: list.length + 1,
          type: 'Consignee',
          name: jobDetail.consignee_name,
          phone: jobDetail.consignee_phone,
          email: em,
          checked: false,
        });
      });
    }

    setEmails(list);
    openSheetSafely();
  }, [jobDetail, openSheetSafely]);

  // Abre/cierra en función de `visible`, y reintenta abrir si jobDetail llega tarde
  useEffect(() => {
    // Alert.alert(JSON.stringify(visible))
    if (visible) {
      // Alert.alert("abrir")
      setTimeout(() => {
         refRbsSheet.current?.open()
        //  refRbsSheet.current?.close()
      }, 2000);
     
      // resetAll();
      // initSelectedEmails();
    } else {
      Alert.alert("cerrar")
      refRbsSheet.current?.close();
    }
  }, [visible, initSelectedEmails, resetAll]);

  // -------- UI actions ----------
  function checkEmail(item: PeopleEmail) {
    const index = emails.findIndex((x) => x.id === item.id);
    if (index === -1) return;
    const next = [...emails];
    next[index] = {...next[index], checked: !next[index].checked};
    setEmails(next);
  }

  function removeEmail(index: number) {
    setOthers((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }

  function checkExistingEmail(email: string) {
    const t = email.trim();
    return !t || others.some((item) => item.email === t);
  }

  function checkEmailText(text: string) {
    const raw = text ?? '';
    if (raw.includes(' ') && raw.trim() !== '') {
      const parts = raw.split(' ')
        .map((s) => s.trim())
        .filter(Boolean);

      setOthers((prev) => {
        const next = [...prev];
        parts.forEach((element) => {
          const exists = next.some((x) => x.email === element);
          if (!exists) {
            next.push({email: element, valid: isEmail(element)});
          }
        });
        return next;
      });
      setEmailChipText('');
    } else {
      setEmailChipText(raw.trim());
    }
  }

  function onSubmitEmail() {
    const t = emailChipText.trim();
    if (!t) return;
    const parts = t.includes(' ')
      ? t.split(' ').map((s) => s.trim()).filter(Boolean)
      : [t];

    setOthers((prev) => {
      const next = [...prev];
      parts.forEach((element) => {
        const exists = next.some((x) => x.email === element);
        if (!exists) {
          next.push({email: element, valid: isEmail(element)});
        }
      });
      return next;
    });
    setEmailChipText('');
  }

  async function sendBOL(force: boolean, forceSignature?: boolean) {
    if (force || forceSignature) setShowResendBol(false);

    const selectedEmails = emails.filter((x) => x.checked);
    const hasValidOthers = others.some((x) => x.valid === true);

    if (selectedEmails.length === 0 && !hasValidOthers) {
      showToastMessage(
        'You have not selected any email, please select at least one or write a valid email',
      );
      return;
    }

    // cierra sheet desde el hijo también
    handleVisible(false);

    setTimeout(async () => {
      const mapped = selectedEmails.map((x) => x.email);
      const othersValid = others.filter((x) => x.valid).map((x) => x.email);
      const destinationEmails = mapped.concat(othersValid);

      loadingWrapperPromise(
        mutateAsync({
          idJob: jobDetail?.id!,
          destination: destinationEmails,
          force_send: force,
          force_send_signature_count: forceSignature,
        })
          .then((response: any) => {
            // Aquí puedes manejar el resultado; el código original
            // tenía varios paths comentados (409/499). Conserva tu lógica.
            // Ejemplo de éxito:
            // showDialog({ modalVisible: true, type: 'success', ... })
          })
          .catch(() => {}),
      );
    }, 500);
  }

  return (
    <>
      {/* @ts-ignore */}
      <RBSheet
        ref={refRbsSheet}
        // @ts-ignore
        closeOnDragDown={true}
        closeOnPressMask={false}
        openDuration={250}
        closeDuration={250}
        animationType="slide"
        onClose={() => handleVisible(false)}
        customStyles={{
          container: {
            paddingHorizontal: 20,
            borderTopStartRadius: 10,
            borderTopEndRadius: 10,
            height: 400,
          },
          wrapper: {
            backgroundColor: '#eeeeee5e',
          },
          draggableIcon: {
            backgroundColor: 'gray',
            width: 100,
          },
        }}>
          <Label>Hola</Label>
      </RBSheet>

      {/* Modal de reenvío / confirmación */}
      <Modal isVisible={showResendBol} style={{alignItems: 'center'}}>
        <View style={GLOBAL_STYLES.modalClockOutHorizontal}>
          <View style={GLOBAL_STYLES.bodyModalClockOut}>
            <Text
              style={[
                GLOBAL_STYLES.descModalClockOut,
                {fontWeight: 'bold', fontSize: 16},
              ]}>
              {messageErrorBol}
            </Text>
          </View>

          <View style={[GLOBAL_STYLES.containerOptionsModalClockOutHorizontal]}>
            <TouchableHighlight
              onPress={() => setShowResendBol(false)}
              underlayColor="#08141F21"
              style={[GLOBAL_STYLES.btnOptionModalClockOutHorizontal]}>
              <Text
                style={[
                  GLOBAL_STYLES.optionModalClockOutHorizontal,
                  buttonConfirmModal?.cancelColor
                    ? {
                        color: buttonConfirmModal?.cancelColor,
                        fontSize: buttonConfirmModal?.cancelFontSize,
                      }
                    : {},
                ]}>
                Cancel
              </Text>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() =>
                sendBOL(
                  !buttonConfirmModal.forceSignature,
                  buttonConfirmModal.forceSignature,
                )
              }
              underlayColor="#08141F21"
              style={[
                GLOBAL_STYLES.btnOptionModalClockOutHorizontal,
                {borderStartWidth: 1, borderLeftColor: '#08141F21'},
              ]}>
              <Text
                adjustsFontSizeToFit
                style={[
                  GLOBAL_STYLES.optionModalClockOutHorizontal,
                  GLOBAL_STYLES.bold,
                  buttonConfirmModal?.confirmColor
                    ? {
                        color: buttonConfirmModal?.confirmColor,
                        fontSize: buttonConfirmModal?.confirmFontSize,
                      }
                    : {},
                ]}>
                {buttonConfirmModal?.confirmText ?? 'Continue'}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    marginBottom: 60,
  },
  grayText: {
    color: 'gray',
    opacity: 0.9,
  },
  textInfo: {
    paddingLeft: 3,
    height: 15,
    fontSize: 12,
    color: '#464646',
    opacity: 0.66,
    marginBottom: 5,
  },
  containerOptionCheck: {
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  emailFieldStyle: {
    borderColor: '#959595',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 10,
    marginLeft: 10,
  },
});
