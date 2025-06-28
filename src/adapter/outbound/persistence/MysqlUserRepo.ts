import { UserRepositoryPort } from '../../../domain/port/outbound';
import {
    User
} from '../../../domain/model/user';

interface RawUser {
    id: string;
    email: string;
    passwordHash: string;
}

export class MySQLUserRepo implements UserRepositoryPort {
    private readonly users: RawUser[] = [
        {
            id: '1',
            email: 'danieltu1026@gmail.com',
            passwordHash: '$2b$10$nSYNpFAV9OYdlVl3hr6u7uThvC04pNEhUdFA4uu7q8hHT4uI2IGbO'
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

        return new User(
            row.id,
            row.email,
            row.passwordHash
        );
    }
}