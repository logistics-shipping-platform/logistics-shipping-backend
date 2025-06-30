export interface NotificationPort {
    
    /**
     * Envía un payload de actualización al canal indicado.
     * @param channel - El canal al que se enviará el payload.
     * @param payload - El payload a enviar.
     */
    publish(channel: string, payload: any): void;
}