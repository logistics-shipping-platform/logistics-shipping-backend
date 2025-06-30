import { Server as IOServer } from 'socket.io';
import http, { createServer } from 'http';
import { SocketIONotificationAdapter } from '../../../../src/adapter/outbound/messaging/SocketIONotificationAdapter';
import { ShipmentState } from '../../../../src/domain/model/shipment';


jest.mock('socket.io', () => {
    return {
        Server: jest.fn().mockImplementation(() => ({
            to: jest.fn(() => ({ emit: jest.fn() })),
            on: jest.fn()
        }))
    };
});

const mockShipmentRepo = {
    findChangedSince: jest.fn(() => Promise.resolve([{ id: '1', state: ShipmentState.DELIVERED }])),
    updateState: jest.fn(() => Promise.resolve()),
    findById: jest.fn(),
    findAllByUserIdPaginated: jest.fn(),
    create: jest.fn()
};

const mockChangeStateUC = {
    execute: jest.fn(() => Promise.resolve())
} as any;

describe('SocketIONotificationAdapter', () => {
    let server: http.Server;
    let adapter: SocketIONotificationAdapter;

    beforeEach(() => {
        server = createServer();
        adapter = new SocketIONotificationAdapter(server);
    });

    it('Debe iniciar el servidor Socket.IO con las opciones correctas', () => {
        expect(IOServer).toHaveBeenCalledWith(server, expect.objectContaining({
            path: '/ws',
            cors: { origin: '*' }
        }));
    });

    it('debe llamar a emit en publish', () => {
        const mockEmit = jest.fn();
        const mockTo = jest.fn(() => ({ emit: mockEmit }));

        jest.spyOn(adapter.getIo(), 'to').mockImplementation(mockTo as any);

        const channel = 'test-channel';
        const payload = { foo: 'bar' };

        adapter.publish(channel, payload);

        expect(mockTo).toHaveBeenCalledWith(channel);
        expect(mockEmit).toHaveBeenCalledWith('update', payload);
    });

    it('debe suscribir sockets al canal en la conexión', () => {
        const mockOn = jest.fn();
        adapter.getIo().on = mockOn;

        adapter.onConnection();

        expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('debe llamar a shipmentRepo.findChangedSince y changeStateUC.execute en startShipmentWatcher', async () => {
        jest.useFakeTimers();

        adapter.startShipmentWatcher(mockShipmentRepo, mockChangeStateUC, 1000);

        jest.advanceTimersByTime(1000);

        await Promise.resolve(); // flush microtasks

        expect(mockShipmentRepo.findChangedSince).toHaveBeenCalled();
        expect(mockShipmentRepo.updateState).toHaveBeenCalledWith('1', 'DELIVERED', expect.any(Date));

        jest.useRealTimers();
    });

    it('debe suscribir sockets al canal en el evento subscribe', () => {
        const mockSocket = { on: jest.fn(), join: jest.fn() };
        const mockIo = {
            on: jest.fn((event, cb) => {
                if (event === 'connection') {
                    cb(mockSocket);
                }
            })
        };
        (adapter as any).io = mockIo;

        adapter.onConnection();

        const subscribeCallback = mockSocket.on.mock.calls.find(call => call[0] === 'subscribe')[1];
        subscribeCallback('test-channel');

        expect(mockSocket.join).toHaveBeenCalledWith('test-channel');
    });
});
