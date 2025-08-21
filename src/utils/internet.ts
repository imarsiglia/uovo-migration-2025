import NetInfo from '@react-native-community/netinfo';

export const isInternet = async () => {
  const {isConnected, isInternetReachable} = await NetInfo.fetch();
  return !!isConnected && isInternetReachable !== false;
};
