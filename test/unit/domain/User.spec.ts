import { hash } from "crypto";
import { DocType, User } from "../../../src/domain/model/user";

describe('User.verifyPassword', () => {
    const props = {
        email: 'a@b.com',
        passwordHash: 'hash123',
        fullName: 'Tester',
        documentType: DocType.CC,
        document: '100200300'
    };
    const user = User.create(props);

    it('Verifica correctamente la contraseña', async () => {
        const fakeHasher = { compare: jest.fn().mockResolvedValue(true), hash: jest.fn() };
        const result = await user.verifyPassword('raw', fakeHasher);
        expect(fakeHasher.compare).toHaveBeenCalledWith('raw', 'hash123');
        expect(result).toBe(true);
    });

    it('Falla en la verificación de la contraseña`', async () => {
        const fakeHasher = { compare: jest.fn().mockResolvedValue(false), hash: jest.fn() };
        const result = await user.verifyPassword('otro', fakeHasher);
        expect(result).toBe(false);
    });
});


describe('User.getPasswordHash (dominio)', () => {
    const props = {
        email: 'a@b.com',
        passwordHash: 'hash123',
        fullName: 'Usuario Test',
        documentType: DocType.CC,
        document: '100200300'
    };
    const user = User.create(props);

    it('Retorna el hash de la contraseña', () => {
        expect(user.getPasswordHash()).toBe('hash123');
    });
});


describe('User.createdAt', () => {
    const props = {
        id: '123',
        email: 'a@b.com',
        passwordHash: 'hash123',
        fullName: 'Usuario Test',
        documentType: DocType.CC,
        document: '100200300',
        createdAt: new Date('2023-10-01T00:00:00Z')
    };
    const user = new User(props);

    it('Retorna la fecha de creación', () => {
        expect(user.getCreatedAt()).toEqual(new Date('2023-10-01T00:00:00Z'));
    });
});