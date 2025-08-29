
import { COLORS } from '@styles/colors';
import {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

type DropdownMenuType = {
  title: string;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  icon?: React.ReactElement;
  actionList: {title: string; action: () => void}[];
};

const DropdownMenu = ({
  title,
  buttonStyle,
  buttonTextStyle,
  icon,
  actionList,
}: DropdownMenuType) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [menuLayout, setMenuLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const buttonRef = useRef<any>(null);
  const menuRef = useRef(null);
  const isLocked = useRef(false);

  const toggleModal = () => {
    if (isLocked.current) return;

    isLocked.current = true;
    setTimeout(() => {
      isLocked.current = false;
    }, 600);

    if (isModalVisible) {
      closeModal();
    } else {
      // @ts-ignore
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setButtonLayout({x: px, y: py, width, height});
        setModalVisible(true);
        openModal();
      });
    }
  };

  const openModal = () => {
    opacity.value = withTiming(1, {
      duration: 300,
    });
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const closeModal = () => {
    opacity.value = withTiming(0, {
      duration: 300,
    });
    translateY.value = withTiming(20, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    setTimeout(() => setModalVisible(false), 300);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={toggleModal}
        style={[styles.button, buttonStyle]}>
        <Text style={[styles.buttonText, buttonTextStyle]}>{title}</Text>
        {icon}
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        backdropOpacity={0.2}
        style={styles.modal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver>
        <TouchableWithoutFeedback>
          <View style={styles.backdrop}>
            <Animated.View
              style={[
                styles.menuContainer,
                animatedStyle,
                {
                  top: buttonLayout.y - (menuLayout.height + 20),
                  left:
                    buttonLayout.x +
                    buttonLayout.width / 2 -
                    menuLayout.width / 2 -
                    20,
                },
              ]}>
              <View
                ref={menuRef}
                style={styles.menu}
                onLayout={(event) => {
                  setMenuLayout(event.nativeEvent.layout);
                }}>
                {actionList.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setModalVisible(false);
                      if (item.action) {
                        item.action();
                      }
                    }}
                    style={styles.menuItem}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.triangle}></View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 100,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
  },
  modal: {
    flex: 0,
  },
  backdrop: {},
  menuContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{rotate: '180deg'}],
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: -10,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuTitle: {
    textAlign: 'center',
    fontSize: 15,
  },
});

export default DropdownMenu;
