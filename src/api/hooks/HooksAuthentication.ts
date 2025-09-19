// import { opportunityServices } from "@/api/services/opportunityServices";
// import useUserStore from "@/store/store";
// import { KEYS_REACT_QUERY, SESSIONSTORAGE_KEYS } from "@/utils/constants";
// import { OportunidadType } from "@/utils/types";
import {useMutation, useQueryClient} from '@tanstack/react-query';
// import { getItemFromSessionStorage } from "@this/shared-components/src/utils/functions";
// import { showErrorToast } from "@this/shared-components/src/utils/toastHelper";
// import { useCallback } from "react";
// import { useUpdateQueryData } from "./useUpdateQueryData";
import {authServices} from '@api/services/authServices';

export const useLogin = () => {
  return useMutation({
    mutationFn: authServices.login,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: authServices.refreshToken,
  });
};

export const useRegularLogin = () => {
  return useMutation({
    mutationFn: authServices.regularLogin,
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: authServices.updateUser,
  });
};
