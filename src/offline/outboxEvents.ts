// src/offline/outboxEvents.ts

/**
 * Sistema de eventos simple para notificar cambios en la cola de sincronización
 * Sin dependencias externas, solo usando callbacks
 */
type QueueChangeListener = () => void;

class OutboxEventEmitter {
  private listeners: Set<QueueChangeListener> = new Set();
  
  /**
   * Suscribirse a cambios en la cola
   */
  subscribe(listener: QueueChangeListener): () => void {
    this.listeners.add(listener);
    
    // Retorna función para desuscribirse
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notifica a todos los listeners que la cola cambió
   */
  notifyQueueChanged() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('[OutboxEvents] Error in listener:', error);
      }
    });
  }
  
  /**
   * Notifica que se agregó un item
   */
  notifyItemAdded(entity: string, idJob?: number) {
    if (__DEV__) {
      console.log('[OutboxEvents] Item added:', entity, idJob);
    }
    this.notifyQueueChanged();
  }
  
  /**
   * Notifica que un item fue actualizado
   */
  notifyItemUpdated(entity: string, idJob?: number) {
    if (__DEV__) {
      console.log('[OutboxEvents] Item updated:', entity, idJob);
    }
    this.notifyQueueChanged();
  }
  
  /**
   * Notifica que un item fue procesado
   */
  notifyItemProcessed(entity: string, idJob?: number) {
    if (__DEV__) {
      console.log('[OutboxEvents] Item processed:', entity, idJob);
    }
    this.notifyQueueChanged();
  }
  
  /**
   * Obtiene el número actual de listeners (útil para debug)
   */
  getListenerCount(): number {
    return this.listeners.size;
  }
}

// Instancia singleton
export const outboxEvents = new OutboxEventEmitter();

// Para debug en desarrollo
if (__DEV__) {
  // Log cada minuto cuántos componentes están escuchando
  setInterval(() => {
    const count = outboxEvents.getListenerCount();
    if (count > 0) {
      console.log(`[OutboxEvents] Active listeners: ${count}`);
    }
  }, 60000);
}