import { useNetInfo } from "@react-native-community/netinfo";

export function useOnline() {
  const { isConnected, isInternetReachable } = useNetInfo();
  // isInternetReachable puede ser undefined al inicio, trátalo como "desconocido"
  const online = !!isConnected && isInternetReachable !== false;
  return { online, isConnected: !!isConnected, isInternetReachable };
}