import {Icons} from '@assets/icons/icons';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar as StatusBarComponent} from 'react-native-scrollable-navigation-bar';
import SimpleToast from 'react-native-simple-toast';

const logotipo = require('../../assets/logotipo/logotipo.png');

export const LoginEmailScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const {goBack} = useCustomNavigation();

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  function onSubmitEmail() {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }

  function onSubmitPassword() {
    if (email.trim() != '' && password.trim() != '') {
      onLogin();
    }
  }

  async function onLogin() {
    setLoading(true);
    if (email.trim() != '' && password.trim() != '') {
      const timeZone = RNLocalize.getTimeZone();

      //   const response = await fetchData.Post(
      //     'resources/loginalter',
      //     {
      //       username: email,
      //       password: password,
      //       timeZone,
      //       ...getDeviceInfo(),
      //     },
      //     false,
      //     'Invalid credentials',
      //   );

      //   if (response.ok && response.data.message == 'SUCCESS') {
      //     const userInfo = response.data.body;
      //     await saveToStorage(TOKEN_KEY_STORAGE, userInfo.token);
      //     props.dispatch(UserActions.copy(userInfo));
      //     var userString = JSON.stringify(userInfo);
      //     await saveToStorage(USER_INFO_KEY_STORAGE, userString);
      //     if (userInfo.user_updated === 0) {
      //       props.navigation.replace('EditProfile');
      //     } else {
      //       props.navigation.replace('Home');
      //     }
      //   }
    } else {
      SimpleToast.show('Please, enter your credentials', SimpleToast.SHORT);
    }
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Wrapper style={{backgroundColor: '#003fac', flex: 1}}>
        <View style={styles.content}>
          <View
            style={[
              GLOBAL_STYLES.containerBtnOptTop,
              {position: 'absolute', left: 0, top: 5},
            ]}>
            <TouchableOpacity onPress={goBack}>
              <View style={styles.backBtn}>
                <Icons.AngleLeft fontSize={15} color={COLORS.white} />
                <Text style={styles.backBtnText}>Back</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{paddingHorizontal: 30}}>
            <Image
              style={{width: '75%', height: 60}}
              resizeMode="contain"
              source={logotipo}
            />
          </View>

          <View style={{paddingHorizontal: 30, gap: 20, top: '-10%'}}>
            <View>
              <Text style={styles.inputTitle}>Email</Text>
              <TextInput
                ref={emailInputRef}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={email}
                returnKeyType="next"
                onSubmitEditing={onSubmitEmail}
                onChangeText={(text) => setEmail(text)}
                maxLength={50}
              />
            </View>

            <View>
              <Text style={styles.inputTitle}>Password</Text>
              <View
                style={[
                  styles.input,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 0,
                  },
                ]}>
                <TextInput
                  ref={passwordInputRef}
                  secureTextEntry={!passwordVisible}
                  editable={!loading}
                  style={[
                    styles.input,
                    {
                      height: 40,
                      flex: 1,
                      fontSize: 16,
                      marginHorizontal: -10,
                      borderWidth: 0,
                    },
                  ]}
                  returnKeyType="send"
                  maxLength={30}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  onSubmitEditing={onSubmitPassword}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={{
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                  }}>
                  {/* <Icon
                    name={!passwordVisible ? 'eye' : 'eye-slash'}
                    size={20}
                    color="#003fac"
                    type="regular"
                  /> */}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{paddingHorizontal: 30}}>
            {/* <Button
              disabled={loading}
              loadingProps={{color: '#003fac'}}
              loading={loading}
              buttonStyle={styles.button}
              titleStyle={styles.buttonTitle}
              title="Sign in"
              onPress={() => onLogin()}
            /> */}
          </View>
        </View>
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
    color: '#1155cc',
    fontSize: 14,
    fontWeight: '400',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#efefef',
    color: '#242424',
    paddingLeft: 10,
    height: 40,
    borderRadius: 100,
    fontSize: 16,
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
