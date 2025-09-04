import {useSendEmailBOL} from '@api/hooks/HooksJobServices';
import {RBSheetRef} from '@components/commons/bottomsheets/ImageOptionSheet';
import {IndicatorLoading} from '@components/commons/loading/IndicatorLoading';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {isEmail} from '@utils/functions';
import {showToastMessage} from '@utils/toast';
import {useEffect, useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
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

export const SendBOLBottomSheet = ({
  handleVisible,
  visible = false,
  onFinishSendBol,
}: {
  handleVisible: (val: boolean) => void;
  visible: boolean;
  onFinishSendBol?: () => void;
}) => {
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
  const jobDetail = useTopSheetStore((d) => d.jobDetail);

  const refRbsSheet = useRef<RBSheetRef | null>(null);

  const {mutateAsync} = useSendEmailBOL();
  const showDialog = useModalDialogStore((d) => d.showVisible);

  useEffect(() => {
    if (visible) {
      resetAll();
      initSelectedEmails();
    } else {
      if (refRbsSheet?.current) {
        refRbsSheet.current.close();
      }
    }
  }, [visible]);

  function resetAll() {
    setEmails([]);
    setEmailChipText('');
    setOthers([]);
  }

  function initSelectedEmails() {
    var newList = [];
    if (jobDetail?.shipper_email) {
      const split_shipper_emails = jobDetail.shipper_email.split(';');
      for (let i = 0; i < split_shipper_emails.length; i++) {
        newList.push({
          id: i + 1,
          type: 'Shipper',
          name: jobDetail.shipper_name,
          phone: jobDetail.shipper_phone,
          email: split_shipper_emails[i],
          checked: false,
        });
      }
    }
    if (jobDetail?.consigne_eemail) {
      const split_consigne_eemail = jobDetail.consigne_eemail.split(';');
      for (let i = 0; i < split_consigne_eemail.length; i++) {
        newList.push({
          id: newList.length + 1,
          type: 'Consignee',
          name: jobDetail.consignee_name,
          phone: jobDetail.consignee_phone,
          email: split_consigne_eemail[i],
          checked: false,
        });
      }
    }

    setEmails(newList);
    if (refRbsSheet?.current) {
      refRbsSheet.current.open();
    }
  }

  function checkEmail(item: PeopleEmail) {
    var index = emails.findIndex((x) => x.id == item.id);
    var newList = [...emails];
    newList[index] = {...newList[index], checked: !newList[index].checked};
    setEmails(newList);
  }

  function removeEmail(index: number) {
    var emailsTemp = [...others];
    emailsTemp.splice(index, 1);
    setOthers(emailsTemp);
  }

  function checkEmailText(text: string) {
    if (text.includes(' ') && text != '') {
      if (isEmail(text.trim())) {
        if (!checkExistingEmail(text.trim())) {
          others.push({email: text.trim(), valid: true});
        }
      } else {
        var splitedText = text.split(' ');
        splitedText.forEach((element) => {
          if (element.trim() != '' && !checkExistingEmail(text.trim())) {
            others.push({email: element, valid: false});
          }
        });
      }
      setEmailChipText('');
    } else {
      setEmailChipText(text.trim());
    }
  }

  function checkExistingEmail(email: string) {
    if (email.trim() == '') {
      return true;
    }
    return others.some((item) => item.email == email.trim());
  }

  function onSubmitEmail() {
    if (emailChipText.trim() != '') {
      if (isEmail(emailChipText.trim())) {
        if (!checkExistingEmail(emailChipText.trim())) {
          others.push({email: emailChipText.trim(), valid: true});
        }
      } else {
        var splitedText = emailChipText.split(' ');
        splitedText.forEach((element) => {
          if (
            element.trim() != '' &&
            !checkExistingEmail(emailChipText.trim())
          ) {
            others.push({email: element, valid: false});
          }
        });
      }
      setEmailChipText('');
    } else {
      setEmailChipText(emailChipText.trim());
    }
  }

  async function sendBOL(force: boolean, forceSignature?: boolean) {
    if (force || forceSignature) {
      setShowResendBol(false);
    }

    var selectedEmails = emails.filter((x) => x.checked);
    var emailsValidos =
      others.length > 0 && others.some((x) => x.valid == true);
    if (selectedEmails.length == 0 && !emailsValidos) {
      showToastMessage(
        'You have not selected any email, please select at least one or write a valid email',
      );
      return;
    }

    handleVisible(false);

    setTimeout(async () => {
      var mappedEmails = selectedEmails.map((x) => x.email);
      var othersEmails = others
        .filter((x) => x.valid == true)
        .map((x) => x.email);
      var destinationEmails = mappedEmails.concat(othersEmails);

      loadingWrapperPromise(
        mutateAsync({
          idJob: jobDetail?.id!,
          destination: destinationEmails,
          force_send: force,
          force_send_signature_count: forceSignature,
        })
          .then((response: any) => {
            console.log("response")
            console.log(JSON.stringify(response))
            // if (response.ok) {
            //   if (response.data.message == 'SUCCESS') {
            //     showDialog({
            //       modalVisible: true,
            //       type: 'success',
            //       message: 'BOL sent successfully',
            //       cancelable: false,
            //       onConfirm: () => {
            //         if (onFinishSendBol) {
            //           onFinishSendBol();
            //         }
            //       },
            //     });
            //   } else {
            //     showDialog({
            //       modalVisible: true,
            //       type: 'info',
            //       message: response.data.message,
            //       cancelable: false,
            //       onConfirm: () => {
            //         if (onFinishSendBol) {
            //           onFinishSendBol();
            //         }
            //       },
            //     });
            //     setTimeout(() => {
            //       Alert.alert(response.data.message);
            //     }, 300);
            //   }
            // } else {
            //   setButtonConfirmModal({});
            //   if (response.error?.response?.status == 409) {
            //     setMessageErrorBol(response.error.response.data.message);
            //     setTimeout(() => {
            //       setShowResendBol(true);
            //     }, 500);
            //   } else if (response.error?.response?.status == 499) {
            //     setMessageErrorBol(response.error.response.data.message);
            //     setButtonConfirmModal({
            //       confirmColor: 'red',
            //       confirmText: 'Send anyway\n(not recommended)',
            //       confirmFontSize: 12,
            //       cancelColor: '#808080',
            //       cancelFontSize: 14,
            //       forceSignature: true,
            //     });
            //     setTimeout(() => {
            //       setShowResendBol(true);
            //     }, 500);
            //   }
            // }
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
        <ScrollView style={styles.gridContainer}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              marginTop: 5,
            }}>
            <Text style={[styles.grayText, styles.textInfo, {fontSize: 13}]}>
              Select emails to send
            </Text>
          </View>
          {emails.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={[GLOBAL_STYLES.row, styles.containerOptionCheck]}
                onPress={() => checkEmail(item)}>
                <View>
                  <Text style={GLOBAL_STYLES.bold}>{item.type}</Text>
                  <Text style={GLOBAL_STYLES.bold}>{item.name}</Text>
                  <View style={GLOBAL_STYLES.row}>
                    {item.phone != null && item.phone != '' && (
                      <Text style={styles.grayText}>{item.phone + ' - '}</Text>
                    )}

                    <Text style={styles.grayText}>{item.email}</Text>
                  </View>
                </View>
                <View>
                  {item.checked && (
                    <Icon name="check" type="solid" color="#00D3ED" size={18} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <View
            style={{
              marginLeft: 4,
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
              width: '100%',
              marginBottom: 20,
            }}>
            <View>
              <Text style={[GLOBAL_STYLES.bold, {flex: 0.2}]}>Other</Text>
            </View>
            <View style={[styles.emailFieldStyle, {flex: 0.7}]}>
              {others.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: item.valid ? '#00d3ed' : 'red',
                      alignSelf: 'flex-start',
                      display: 'flex',
                      justifyContent: 'center',
                      flex: 0.5,
                      borderRadius: 20,
                      flexDirection: 'row',
                      margin: 3,
                      padding: 5,
                    }}>
                    <Text
                      style={{
                        marginRight: 5,
                        color: 'white',
                        fontSize: 11,
                      }}>
                      {item.email}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeEmail(index)}
                      style={{alignSelf: 'center'}}>
                      <Icon name="times" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  padding: 5,
                  fontSize: 11,
                  color: 'black',
                }}
                value={emailChipText}
                onChangeText={(text) => checkEmailText(text)}
                onSubmitEditing={() => onSubmitEmail()}
              />
            </View>
          </View>
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            paddingBottom: 30,
            right: 0,
            paddingRight: 20,
          }}>
          <View style={GLOBAL_STYLES.row}>
            <TouchableOpacity
              style={{padding: 10}}
              onPress={() => handleVisible(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{marginLeft: 30, padding: 10}}
              onPress={() => sendBOL(false)}>
              <Text>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>

      {/* modal para confirmar reenvío de bol */}
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
