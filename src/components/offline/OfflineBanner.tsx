import {Text, View} from 'react-native';
import {useOnline} from 'src/hooks/useOnline';

const OfflineBanner = () => {
  const {online} = useOnline();
  if (online) return null;
  return (
    <View style={{padding: 8, backgroundColor: '#FFDD57'}}>
      <Text>Sin conexión a Internet</Text>
    </View>
  );
};
