import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '@styles/colors';
import React, { useCallback, useRef, useState } from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type DropdownMenuType = {
  title: string;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  icon?: React.ReactElement;
  children?: React.ReactNode;
};

const CustomMenu = ({
  title,
  buttonStyle,
  buttonTextStyle,
  icon,
  children,
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

  const openModal = useCallback(() => {
    opacity.value = withTiming(1, {
      duration: 300,
    });
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [opacity, translateY]);

  const closeModal = useCallback(() => {
    opacity.value = withTiming(0, {
      duration: 300,
    });
    translateY.value = withTiming(20, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    setTimeout(() => setModalVisible(false), 300);
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
      opacity: opacity.value,
    };
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeModal();
      };
    }, [closeModal]),
  );

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
                {children}
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
    backgroundColor: 'yellow',
    position: 'relative',
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
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    marginTop: -10,
    // marginHorizontal: 2
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuTitle: {
    textAlign: 'center',
    fontSize: 15,
  },
});

export default CustomMenu;
