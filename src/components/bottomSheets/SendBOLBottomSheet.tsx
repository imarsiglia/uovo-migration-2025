import {SUCCESS_MESSAGES} from '@api/contants/endpoints';
import {useSendEmailBOL} from '@api/hooks/HooksJobServices';
import {JobDetailType, NSJobType} from '@api/types/Jobs';
import {RBSheetRef} from '@components/commons/bottomsheets/ImageOptionSheet';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import { COLORS } from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {isEmail} from '@utils/functions';
import {showToastMessage} from '@utils/toast';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
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
  jobDetail: NSJobType | JobDetailType;
  handleVisible: (val: boolean) => void;
  visible: boolean;
  onFinishSendBol?: () => void;
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

  const refRbsSheet = useRef<RBSheetRef | null>(null);

  // const {mutateAsync} = useSendEmailBOL();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const closeDialog = useModalDialogStore((d) => d.closeDialog);

  const {mutateAsync: mutateAsync} = useSendEmailBOL({
    onError: (error) => {
      if (error?.status == 409) {
        showDialog({
          modalVisible: true,
          cancelable: false,
          message: error?.response?.data?.message,
          onConfirm: () => {
            closeDialog();
          },
          type: 'warning',
        });
      } else if (error?.status == 499) {
        showDialog({
          modalVisible: true,
          cancelable: true,
          message: error?.response?.data?.message,
          confirmBtnLabel: 'Send anyway\n(not recommended)',
          onConfirm: () => {
            closeDialog();
            sendBOL(true, true);
          },
          type: 'warning',
          buttonLabelStyle: {
            color: 'red',
            fontSize: 13,
          },
        });
      } else {
        showToastMessage('Could not send BOL, try again.');
      }
    },
    onSuccess: (response) => {
      if (response.message === SUCCESS_MESSAGES.SUCCESS) {
        showDialog({
          modalVisible: true,
          type: 'success',
          message: 'BOL sent successfully',
          confirmBtnLabel: 'OK',
          cancelable: false,
          onConfirm: () => {
            if (onFinishSendBol) {
              onFinishSendBol();
            }
          },
        });
      } else {
        showDialog({
          modalVisible: true,
          type: 'info',
          message: response.message,
          cancelable: false,
        });
      }
    },
  });

  function resetAll() {
    setEmails([]);
    setEmailChipText('');
    setOthers([]);
  }

  useEffect(() => {
    if (visible) {
      resetAll();
      initSelectedEmails();
    } else {
      refRbsSheet?.current?.close();
    }
  }, [visible]);

  function initSelectedEmails() {
    const newList = [];
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
    refRbsSheet?.current?.open();
  }

  function checkEmail(item: PeopleEmail) {
    const index = emails.findIndex((x) => x.id == item.id);
    const newList = [...emails];
    newList[index] = {...newList[index], checked: !newList[index].checked};
    setEmails(newList);
  }

  function removeEmail(index: number) {
    const emailsTemp = [...others];
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
        const splitedText = text.split(' ');
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
        const splitedText = emailChipText.split(' ');
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

  const sendBOL = useCallback(
    (force: boolean, forceSignature?: boolean) => {
      const selectedEmails = emails.filter((x) => x.checked);
      const emailsValidos =
        others.length > 0 && others.some((x) => x.valid == true);
      if (selectedEmails.length == 0 && !emailsValidos) {
        showToastMessage(
          'You have not selected any email, please select at least one or write a valid email',
        );
        return;
      }

      handleVisible(false);

      const mappedEmails = selectedEmails.map((x) => x.email);
      const othersEmails = others
        .filter((x) => x.valid == true)
        .map((x) => x.email);
      const destinationEmails = mappedEmails.concat(othersEmails);

      refRbsSheet?.current?.close();

      setTimeout(() => {
        loadingWrapperPromise(
          mutateAsync({
            idJob: jobDetail?.id!,
            destination: destinationEmails,
            force_send: force,
            force_send_signature_count: forceSignature,
          }).catch(() => {}),
        );
      }, 300);
    },
    [emails, others, jobDetail?.id, mutateAsync],
  );

  return (
    <RBSheet
      ref={refRbsSheet}
      openDuration={250}
      closeDuration={250}
      closeOnPressBack={false}
      closeOnPressMask={false}
      draggable={false}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      // dragOnContent
      customStyles={{
        container: {
          paddingHorizontal: 20,
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
          height: 400,
        },
        wrapper: {
          backgroundColor: '#00000070',
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
            paddingTop: 20,
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
    color: COLORS.dark,
    // opacity: 0.66,
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
