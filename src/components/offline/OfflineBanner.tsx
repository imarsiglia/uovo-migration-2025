import {useOnline} from '@hooks/useOnline';
import {Text, View} from 'react-native';

export const OfflineBanner = () => {
  const {online} = useOnline();
  if (online) return null;
  return (
    <View style={{padding: 8, backgroundColor: '#FFDD57'}}>
      <Text>Sin conexión a Internet</Text>
    </View>
  );
};
