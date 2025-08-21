import type {UserType} from '@api/types/user';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../storage/mmkv';

// (Opcional) Auto-logout por expiración JWT
// import jwtDecode from "jwt-decode";

type AuthState = {
  token: string | null;
  user: UserType | null;
  setSession: (token: string, user: UserType) => void;
  clearSession: () => void;
};

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const useAuth = create<AuthState>()(
  persist(
    (set, _) => ({
      token: null,
      user: null,

      setSession: (token, user) => {
        // (Opcional) si quieres auto-logout por exp:
        // try {
        //   const { exp } = jwtDecode<{ exp: number }>(token);
        //   if (exp) {
        //     const ms = exp * 1000 - Date.now();
        //     if (logoutTimer) clearTimeout(logoutTimer);
        //     if (ms > 0) {
        //       logoutTimer = setTimeout(() => get().clearSession(), ms);
        //     } else {
        //       // ya vencido
        //       return set({ token: null, user: null });
        //     }
        //   }
        // } catch {}

        set({token, user});
      },

      clearSession: () => {
        console.log("clearSession")
        if (logoutTimer) clearTimeout(logoutTimer);
        logoutTimer = null;
        set({token: null, user: null});
      },
    }),
    {
      name: 'auth', // clave en MMKV
      storage: createJSONStorage(() => zustandMMKVStorage),

      // ⬇️ Si quieres persistir SOLO el token, descomenta esto:
      // partialize: (s) => ({ token: s.token }),

      // ⬇️ Por defecto persistimos token + user:
      partialize: (s) => ({token: s.token, user: s.user}),

      // control de versiones/migraciones por si cambias el shape
      version: 1,
      // migrate: async (persisted, version) => persisted as any,
    },
  ),
);

// Accesor "no-hook" para usar fuera de React
export const authState = {
  get token() {
    return useAuth.getState().token;
  },
  get user() {
    return useAuth.getState().user;
  },
  set(token: string, user: UserType) {
    useAuth.getState().setSession(token, user);
  },
  clear() {
    useAuth.getState().clearSession();
  },
};
