// AppStateManager.js
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const STORAGE_KEY = '@app_state_v1';
const VERSION_KEY = '@app_version';
const APP_VERSION = '1.0.0'; // Incrementa esto cuando cambies la estructura del estado

const StateContext = createContext();

// Define qué campos deben persistir entre sesiones
const PERSISTENT_FIELDS = ['userPreferences', 'drafts', 'settings'];
// Define qué campos NO deben persistir (se limpian al cerrar la app)
const SESSION_FIELDS = ['formData', 'tempPhotos', 'currentStep'];

// Validador de estado
const validateState = (state) => {
  if (!state || typeof state !== 'object') {
    console.warn('⚠️ Estado inválido, usando estado vacío');
    return {};
  }

  // Valida que los campos tengan el tipo correcto
  const validated = {};
  
  Object.keys(state).forEach(key => {
    try {
      // Aquí puedes agregar validaciones específicas
      if (state[key] !== null && state[key] !== undefined) {
        validated[key] = state[key];
      }
    } catch (error) {
      console.warn(`⚠️ Campo ${key} inválido, omitiendo`);
    }
  });

  return validated;
};

// Reducer para manejar el estado
const stateReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, ...action.payload, isRestored: true };
    case 'UPDATE':
      return { ...state, [action.key]: action.value };
    case 'MERGE':
      return { ...state, ...action.payload };
    case 'CLEAR':
      return { isRestored: true };
    case 'CLEAR_SESSION':
      // Limpia solo campos de sesión
      const cleaned = { ...state };
      SESSION_FIELDS.forEach(field => delete cleaned[field]);
      return cleaned;
    default:
      return state;
  }
};

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, { isRestored: false });
  const saveTimeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const hasErrorRef = useRef(false);

  // Restaurar estado al iniciar
  useEffect(() => {
    const restore = async () => {
      try {
        // Verifica la versión de la app
        const savedVersion = await AsyncStorage.getItem(VERSION_KEY);
        
        if (savedVersion !== APP_VERSION) {
          console.log('🔄 Nueva versión detectada, limpiando estado antiguo');
          await AsyncStorage.multiRemove([STORAGE_KEY, VERSION_KEY]);
          await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);
          dispatch({ type: 'RESTORE', payload: {} });
          return;
        }

        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (saved) {
          const parsed = JSON.parse(saved);
          const validated = validateState(parsed);
          
          // Solo restaura campos que deben persistir
          const toRestore = {};
          PERSISTENT_FIELDS.forEach(field => {
            if (validated[field]) {
              toRestore[field] = validated[field];
            }
          });

          console.log('✅ Estado restaurado:', Object.keys(toRestore));
          dispatch({ type: 'RESTORE', payload: toRestore });
        } else {
          dispatch({ type: 'RESTORE', payload: {} });
        }
      } catch (error) {
        console.error('❌ Error restaurando estado:', error);
        // Si hay error, limpia el storage corrupto
        await AsyncStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'RESTORE', payload: {} });
      }
    };

    restore();
  }, []);

  // Auto-guardar con debounce cuando cambia el estado
  useEffect(() => {
    if (!state.isRestored || hasErrorRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { isRestored, ...dataToSave } = state;
        
        // Solo guarda campos que deben persistir
        const toSave = {};
        PERSISTENT_FIELDS.forEach(field => {
          if (dataToSave[field] !== undefined) {
            toSave[field] = dataToSave[field];
          }
        });

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        console.log('💾 Estado auto-guardado');
      } catch (error) {
        console.error('❌ Error guardando estado:', error);
        hasErrorRef.current = true;
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // Detectar cuando la app se cierra completamente
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // Guardar al ir a background
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('📱 App va a background - guardando estado persistente');
        try {
          const { isRestored, ...dataToSave } = state;
          
          // Solo guarda campos persistentes
          const toSave = {};
          PERSISTENT_FIELDS.forEach(field => {
            if (dataToSave[field] !== undefined) {
              toSave[field] = dataToSave[field];
            }
          });

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch (error) {
          console.error('❌ Error guardando en background:', error);
        }
      }

      // Limpiar campos de sesión al volver (opcional)
      if (
        appStateRef.current.match(/background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App vuelve a foreground');
        // dispatch({ type: 'CLEAR_SESSION' }); // Descomenta si quieres limpiar sesión
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [state]);

  const update = (key, value) => {
    dispatch({ type: 'UPDATE', key, value });
  };

  const merge = (data) => {
    dispatch({ type: 'MERGE', payload: data });
  };

  const clear = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'CLEAR' });
  };

  const clearSession = () => {
    dispatch({ type: 'CLEAR_SESSION' });
  };

  return (
    <StateContext.Provider value={{ state, update, merge, clear, clearSession }}>
      {state.isRestored ? children : null}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState debe usarse dentro de AppStateProvider');
  }
  return context;
};

// Hook para persistir valores automáticamente
export const usePersist = (key, initialValue, options = {}) => {
  const { state, update } = useAppState();
  const { persistent = false } = options; // Define si persiste entre sesiones

  // Agrega el campo a la lista correspondiente si no está
  useEffect(() => {
    if (persistent && !PERSISTENT_FIELDS.includes(key)) {
      PERSISTENT_FIELDS.push(key);
    } else if (!persistent && !SESSION_FIELDS.includes(key)) {
      SESSION_FIELDS.push(key);
    }
  }, [key, persistent]);

  const value = state[key] ?? initialValue;

  const setValue = (newValue) => {
    update(key, newValue);
  };

  return [value, setValue];
};

// Hook para valores que SOLO existen durante la sesión
export const useSession = (key, initialValue) => {
  return usePersist(key, initialValue, { persistent: false });
};

// Hook para valores que DEBEN persistir entre sesiones
export const usePermanent = (key, initialValue) => {
  return usePersist(key, initialValue, { persistent: true });
};