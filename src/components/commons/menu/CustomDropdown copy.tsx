import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const PADDING = 8;
const {width: SW, height: SH} = Dimensions.get('window');

type CustomDropdownType = {
  button: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  children?:
    | React.ReactNode
    | ((api: { close: () => void }) => React.ReactNode);
};

const CustomDropdown = ({
  button,
  children,
  buttonStyle,
}: CustomDropdownType) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [openKey, setOpenKey] = useState(0);
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
        setOpenKey((k) => k + 1);
        opacity.value = 0;
        translateY.value = 20;
        setModalVisible(true);
        // setModalVisible(true);
        // openModal();
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

  const computedTop = Math.max(
    PADDING,
    Math.min(
      buttonLayout.y - (menuLayout.height),
      SH - menuLayout.height - PADDING,
    ),
  );

  const computedLeft = Math.max(
    PADDING,
    Math.min(
      buttonLayout.x + buttonLayout.width / 2 - menuLayout.width / 2 - 20,
      SW - menuLayout.width - PADDING,
    ),
  );

  const renderChildren = React.useMemo(() => {
  if (typeof children === 'function') {
    return (children as (api: { close: () => void }) => React.ReactNode)({
      close: closeModal,
    });
  }
  return children;
}, [children, closeModal]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeModal();
      };
    }, [closeModal]),
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={toggleModal}
        style={buttonStyle}>
        {button}
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
        useNativeDriver
        onModalShow={openModal}
        onModalHide={() => {
          setMenuLayout({x: 0, y: 0, width: 0, height: 0});
        }}>
        <View style={styles.backdrop} pointerEvents="box-none">
          <Animated.View
            key={openKey}
            style={[
              styles.menuContainer,
              animatedStyle,
              {
                top: computedTop,
                left: computedLeft,
              },
            ]}>
            <View
              ref={menuRef}
              style={styles.menu}
              onLayout={(event) => {
                setMenuLayout(event.nativeEvent.layout);
              }}>
              {renderChildren}
            </View>
            <View style={styles.triangle}></View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
  },
  backdrop: {
    flex: 1,
  },
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
});

export default CustomDropdown;
