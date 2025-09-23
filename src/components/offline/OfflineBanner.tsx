import {useOnline} from '@hooks/useOnline';
import {Text, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const OfflineBanner = () => {
  const {online} = useOnline();
  if (online) return null;
  return (
    <View
      style={{
        padding: 10,
        position: 'absolute',
        backgroundColor: '#FFDD57',
        zIndex: 100,
        borderRadius: 100,
        flexDirection: "row",
        gap: 5,
        left: 5,
        bottom: 5,
      }}>
        <Icon name='signal-slash' color='black' size={13}/>
      <Text style={{fontSize: 12}}>Lost connection</Text>
    </View>
  );
};
