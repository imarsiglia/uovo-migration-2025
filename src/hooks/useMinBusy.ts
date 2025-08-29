import { useEffect, useRef, useState } from 'react';

/** Mantiene `true` al menos `minMs` desde que se activa. 
 *  Si termina antes, simula la carga hasta cumplir el mínimo.
 */
export function useMinBusy(isActive: boolean, minMs = 1000) {
  const [busy, setBusy] = useState(false);
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const now = Date.now();

    // Al activarse: muestra busy y define/actualiza la fecha mínima de ocultar
    if (isActive) {
      if (!busy) setBusy(true);
      const newDeadline = now + minMs;
      if (deadlineRef.current == null || newDeadline > deadlineRef.current) {
        deadlineRef.current = newDeadline;
      }
      return; // mientras esté activo, no armamos timers de apagado
    }

    // Al desactivarse: espera hasta cumplir el mínimo antes de ocultar
    if (busy) {
      const remaining = (deadlineRef.current ?? 0) - now;
      if (remaining > 0) {
        timerRef.current && clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setBusy(false);
          deadlineRef.current = null;
          timerRef.current = null;
        }, remaining);
      } else {
        setBusy(false);
        deadlineRef.current = null;
      }
    }

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [isActive, busy, minMs]);

  return busy;
}
