import { RoutesNavigation } from '@navigation/types';
import { useAuth } from '@store/auth';
import { useCustomNavigation } from './useCustomNavigation';

export const useLogout = () => {
  const {resetTo} = useCustomNavigation();
  const clearSession = useAuth((d) => d.clearSession);

  function logout() {
    clearSession();
    resetTo(RoutesNavigation.Login);
  }

  return {
    logout,
  };
};
