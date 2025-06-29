import request from 'supertest';
import express from 'express';
import { RegisterUserUseCase } from '../../src/application/usecase';
import { UserController } from '../../src/adapter/inbound/http';
import { DocType } from '../../src/domain/model/user';

describe('UserController (integración)', () => {
    let app: express.Express;

    function buildApp(useCase: Partial<RegisterUserUseCase>) {
        const ctrl = new UserController(useCase as any);
        const server = express();
        server.use(express.json());

        server.post('/api/auth/register', (req, res, next) =>
            ctrl.register(req, res).catch(next)
        );
        return server;
    }

    it('POST /user → 201 y retorna userId en caso exitoso', async () => {
        const fakeUC = {
            execute: jest.fn().mockResolvedValue({ userId: 'abc-123' })
        };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'new@user.com',
                password: 'mypassword',
                fullName: 'Nombre Completo',
                documentType: DocType.CC,
                document: '98765432'
            })
            .expect(201)
            .expect(res => {
                expect(res.body).toEqual({ userId: 'abc-123' });
                expect(fakeUC.execute).toHaveBeenCalledWith({
                    email: 'new@user.com',
                    password: 'mypassword',
                    fullName: 'Nombre Completo',
                    documentType: DocType.CC,
                    document: '98765432'
                });
            });
    });

    it('POST /user → 400 y mensaje de error si el correo no es valido', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'bademail',
                password: 'short',
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si la contraseña es muy corta', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'short',
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si falta el nombre', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'longenoughpassword',
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si el nombre supera los caracteres permitidos', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'longenoughpassword',
                fullName: 'a'.repeat(256),
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si falta el tipo de documento', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'longenoughpassword',
                fullName: 'Nombre Completo',
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si el documento supera los caracteres permitidos', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'longenoughpassword',
                fullName: 'Nombre Completo',
                documentType: DocType.CC,
                document: 'a'.repeat(51)
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si falta el tipo de documento', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'longenoughpassword',
                fullName: 'Nombre Completo',
                document: '12345678'
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de error si el tipo de documento no es valido', async () => {
        const fakeUC = { execute: jest.fn() };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'a@b.com',
                password: 'longenoughpassword',
                fullName: 'Nombre Completo',
                documentType: 'INVALID_TYPE',
                document: '12345678'
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toHaveProperty('error');
                expect(fakeUC.execute).not.toHaveBeenCalled();
            });
    });

    it('POST /user → 400 y mensaje de dominio si UC lanza error', async () => {
        const fakeUC = {
            execute: jest.fn().mockRejectedValue(new Error('Ya existe un usuario'))
        };
        app = buildApp(fakeUC);

        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'dup@user.com',
                password: 'validPass1',
                fullName: 'Dup User',
                documentType: DocType.CC,
                document: '123123'
            })
            .expect(400)
            .expect(res => {
                expect(res.body).toEqual({ error: 'Ya existe un usuario' });
            });
    });
});