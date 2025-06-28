import { RegisterUserUseCase } from '../../../src/application/usecase/RegisterUserUseCase';
import { DocType, User } from '../../../src/domain/model/user';

describe('RegisterUserUseCase', () => {
    const validDto = {
        email: 'user@domain.com',
        password: 'strongPass1',
        fullName: 'Test User',
        documentType: DocType.CC,
        document: '12345678'
    };

    let userRepo: {
        findByEmailOrDocument: jest.Mock;
        save: jest.Mock;
    };
    let hasher: {
        hash: jest.Mock;
    };
    let uc: RegisterUserUseCase;

    beforeEach(() => {
        userRepo = {
            findByEmailOrDocument: jest.fn(),
            save: jest.fn().mockResolvedValue(undefined)
        };
        hasher = {
            hash: jest.fn().mockResolvedValue('hashedPwd')
        };
        uc = new RegisterUserUseCase(userRepo as any, hasher as any);
    });

    it('Ya existe usuario con mismo email', async () => {
        const existing = User.create({
            email: validDto.email,
            passwordHash: "$2b$10$nSYNpFAV9OYdlVl3hr6u7uThvC04pNEhUdFA4uu7q8hHT4uI2IGbO",
            fullName: 'X',
            documentType: validDto.documentType,
            document: 'DIFFERENT'
        });
        userRepo.findByEmailOrDocument.mockResolvedValue(existing);

        await expect(uc.execute(validDto))
            .rejects
            .toThrow('Ya existe un usuario con el correo ingresado');
        expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('Ya existe usuario con mismo documento', async () => {
        const existing = User.create({
            email: 'other@d.com',
            passwordHash: "$2b$10$nSYNpFAV9OYdlVl3hr6u7uThvC04pNEhUdFA4uu7q8hHT4uI2IGbO",
            fullName: 'X',
            documentType: validDto.documentType,
            document: validDto.document
        });
        userRepo.findByEmailOrDocument.mockResolvedValue(existing);

        await expect(uc.execute(validDto))
            .rejects
            .toThrow('Ya existe un usuario con el documento ingresado');
        expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('guarda y retorna userId si todo es válido', async () => {
        userRepo.findByEmailOrDocument.mockResolvedValue(null);

        const result = await uc.execute(validDto);

        expect(hasher.hash).toHaveBeenCalledWith(validDto.password);
        expect(userRepo.save).toHaveBeenCalledTimes(1);

        const savedUser = userRepo.save.mock.calls[0][0] as User;
        expect(savedUser.email).toBe(validDto.email);
        expect(savedUser.fullName).toBe(validDto.fullName);
        expect(savedUser.documentType).toBe(validDto.documentType);
        expect(savedUser.document).toBe(validDto.document);

        expect(result).toHaveProperty('userId', savedUser.id);
    });
});