import { UserRepositoryPort } from '../../../domain/port/outbound';
import {
    DocType,
    User
} from '../../../domain/model/user';

interface RawUser {
    documentType: DocType;
    document: string;
    createdAt: Date;
    fullName: string;
    id: string;
    email: string;
    passwordHash: string;
}

export class MySQLUserRepo implements UserRepositoryPort {
    private readonly users: RawUser[] = [
        {
            id: '1',
            email: 'danieltu1026@gmail.com',
            passwordHash: '$2b$10$nSYNpFAV9OYdlVl3hr6u7uThvC04pNEhUdFA4uu7q8hHT4uI2IGbO',
            fullName: 'Daniel Tobon',
            documentType: DocType.CC,
            document: '1026267890',
            createdAt: new Date()
        }
    ];

    /**
     * Busca un usuario por su email.
     * @param email - El email del usuario a buscar.
     * @returns Una promesa que resuelve en el usuario encontrado o null si no existe.
     */
    async findByEmail(email: string): Promise<User | null> {
        const row = this.users.find(u => u.email === email.toLowerCase().trim());
        if (!row) return null;

        return new User({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            fullName: row.fullName,
            documentType: row.documentType,
            document: row.document,
            createdAt: row.createdAt
        });
    }

    /**
     * Guarda un usuario en el repositorio.
     * @param user - El usuario a guardar.
     * @returns Una promesa que se resuelve cuando el usuario ha sido guardado.
     */
    async save(user: User): Promise<void> {
        this.users.push({
            id: user.id,
            email: user.email,
            passwordHash: user.getPasswordHash(),
            fullName: user.fullName,
            documentType: user.documentType,
            document: user.document,
            createdAt: user.createdAt
        });
    }
    /**
     * Busca un usuario por su email o documento.
     * @param email - El email del usuario a buscar.
     * @param document - El documento del usuario a buscar.
     * @returns Una promesa que resuelve en el usuario encontrado o null si no existe.
     */
    async findByEmailOrDocument(email: string, document: string): Promise<User | null> {
        const lowerEmail = email.toLowerCase();
        const docTrimmed = document.trim().toLowerCase();
        const foundUser = (
            this.users.find(u =>
                u.email === lowerEmail ||
                u.document.toLowerCase() === docTrimmed
            ) ?? null
        );
        return foundUser ? new User({
            id: foundUser.id,
            email: foundUser.email,
            passwordHash: foundUser.passwordHash,
            fullName: foundUser.fullName,
            documentType: foundUser.documentType,
            document: foundUser.document,
            createdAt: foundUser.createdAt
        }) : null;
    }
}