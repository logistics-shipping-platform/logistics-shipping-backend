import { NotificationPort, ShipmentRepositoryPort } from "../../../domain/port/outbound";
import { Server as IOServer } from 'socket.io';
import http from 'http';
import { ChangeShipmentStateUseCase } from "../../../application/usecase/shipment/ChangeShipmentStateUseCase";

export class SocketIONotificationAdapter implements NotificationPort {
    private io: IOServer;

    constructor(server: http.Server) {
        this.io = new IOServer(server, {
            path: '/ws',
            cors: { origin: '*' }
        });
    }
    /**
     * Publica un mensaje en un canal específico.
     * @param channel - El canal al que se enviará el mensaje.
     * @param payload - El contenido del mensaje a enviar.
     */
    publish(channel: string, payload: any) {
        console.log(`Publishing to channel: ${channel}`, payload);
        this.io.to(channel).emit('update', payload);
    }

    /**
     * Inicia el servidor Socket.IO y escucha las conexiones entrantes.
     */
    onConnection() {
        this.io.on('connection', socket => {
            socket.on('subscribe', (channel: string) => {
                socket.join(channel);
            });
        });
    }

    /**
     * Inicia un watcher que verifica periódicamente los cambios en los envíos.
     * @param shipmentRepo - Repositorio de envíos para consultar cambios.
     * @param pollIntervalMs - Intervalo de tiempo en milisegundos para verificar cambios.
     */
    startShipmentWatcher(
        shipmentRepo: ShipmentRepositoryPort,
        changeStateUC: ChangeShipmentStateUseCase,
        pollIntervalMs = 5000
    ) {
        let lastCheck = new Date();
        setInterval(async () => {
            
            const shipmentList = await shipmentRepo.findChangedSince(lastCheck);
            for (const shipment of shipmentList) {

                await changeStateUC.execute(shipment.id, shipment.state);
            }

            lastCheck = new Date();
        }, pollIntervalMs);
    }

    getIo() {
        return this.io;
    }
}