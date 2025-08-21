import {CustomPressable} from '@components/commons/pressable/CustomPressable';
import {useLogout} from '@hooks/useLogout';
import React from 'react';
import {Text, View} from 'react-native';

export const HomeScreen = () => {
  const {logout} = useLogout();

  return (
    <View style={{backgroundColor: 'red'}}>
      <Text>HomeScreen</Text>
      <Text>HomeScreen</Text>
      <Text>HomeScreen</Text>
      <Text>HomeScreen</Text>
      <Text>HomeScreen</Text>

      <CustomPressable onPress={logout}>
        <Text>Cerrar sesión</Text>
      </CustomPressable>
    </View>
  );
};
