import {useRegularLogin} from '@api/hooks/HooksAuthentication';
import {Icons} from '@assets/icons/icons';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import {InputPasswordContext} from '@components/commons/form/InputPasswordContext';
import {InputTextContext} from '@components/commons/form/InputTextContext';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import {useModalDialogStore} from '@store/modals';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getDeviceInfo} from '@utils/functions';
import {showToastMessage} from '@utils/toast';
import {useRef} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {LoginSchema, LoginSchemaType} from 'src/types/schemas';

const logotipo = require('../../assets/logotipo/logotipo.png');

// tester@uovo.art
// amny.OP8#4_1
// America/Puerto_Rico

export const LoginEmailScreen = () => {
  const {mutateAsync, isPending} = useRegularLogin();
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const passwordInputRef = useRef<TextInput>(null);
  const buttonSubmitRef = useRef<View>(null);

  const setSession = useAuth((d) => d.setSession);

  const {goBack, resetTo} = useCustomNavigation();

  async function onLogin(props: LoginSchemaType) {
    loadingWrapperPromise(
      mutateAsync({
        ...props,
        ...getDeviceInfo(),
      })
        .then((data) => {
          setSession(data.token, data);
          if (data.user_updated === 0) {
            resetTo(RoutesNavigation.EditProfile);
          } else {
            resetTo(RoutesNavigation.Home);
          }
        })
        .catch(() => {
          showDialog({
            modalVisible: true,
            cancelable: false,
            message: 'Invalid credencials',
            type: 'error',
          });
        }),
    );
  }

  function onFocusPassword() {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }

  function onPressSubmit() {
    if (buttonSubmitRef.current) {
      // @ts-ignore
      buttonSubmitRef.current.onPress();
    }
  }
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Wrapper style={{flex: 1}}>
        <BasicFormProvider schema={LoginSchema}>
          <Wrapper style={styles.content}>
            <Wrapper
              style={[
                GLOBAL_STYLES.containerBtnOptTop,
                {position: 'absolute', left: 0, top: 5},
              ]}>
              <PressableOpacity onPress={goBack}>
                <Wrapper style={styles.backBtn}>
                  <Icons.AngleLeft fontSize={15} color={COLORS.white} />
                  <Label style={styles.backBtnText}>Back</Label>
                </Wrapper>
              </PressableOpacity>
            </Wrapper>

            <Wrapper style={{paddingHorizontal: 30}}>
              <Image
                style={{width: '75%', height: 60}}
                resizeMode="contain"
                source={logotipo}
              />
            </Wrapper>

            <Wrapper style={{paddingHorizontal: 30, gap: 20, top: '-10%'}}>
              <InputTextContext
                currentId="username"
                label="Email"
                labelProps={{
                  style: styles.inputTitle,
                }}
                autoFocus
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isPending}
                returnKeyType="next"
                maxLength={50}
                style={styles.input}
                onSubmitEditing={onFocusPassword}
              />
              <InputPasswordContext
                ref={passwordInputRef}
                currentId="password"
                label="Password"
                returnKeyType="send"
                editable={!isPending}
                labelProps={{style: styles.inputTitle}}
                inputProps={{
                  style: styles.input,
                }}
                onSubmitEditing={onPressSubmit}
              />
            </Wrapper>

            <Wrapper style={{paddingHorizontal: 30}}>
              <ButtonSubmit
                ref={buttonSubmitRef}
                label="Sign in"
                onSubmit={onLogin}
                onInvalid={() =>
                  showToastMessage('Please, enter your credentials')
                }
                disabled={isPending}
                style={styles.button}
                labelStyles={styles.buttonTitle}
                loading={isPending}
              />
            </Wrapper>
          </Wrapper>
        </BasicFormProvider>
      </Wrapper>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: 'white',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.8,
  },
  buttonTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '400',
  },
  input: {
    borderRadius: 100,
  },
  inputTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
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
    color: 'white',
    fontSize: 18,
    paddingBottom: 1,
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '15%',
    paddingBottom: '20%',
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
  },
});
