import { UserRepositoryPort } from '../../../domain/port/outbound';
import {
    DocType,
    User
} from '../../../domain/model/user';
import { pool } from '../../../config/MysqlDatabase';

export class MySQLUserRepo implements UserRepositoryPort {

    /**
     * Busca un usuario por su email.
     * @param email - El email del usuario a buscar.
     * @returns Una promesa que resuelve en el usuario encontrado o null si no existe.
     */
    async findByEmail(email: string): Promise<User | null> {

        const sql = `
            SELECT * 
            FROM users 
            WHERE email = ?
            LIMIT 1
        `;
        const [rows] = await pool.query<any[]>(sql, [
            email.toLowerCase()
        ]);
        if (rows.length === 0) return null;
        
        const foundUser = rows[0];

        return new User({
            id: foundUser.id,
            email: foundUser.email,
            passwordHash: foundUser.password_hash,
            fullName: foundUser.full_name,
            documentType: foundUser.document_type,
            document: foundUser.document,
            createdAt: foundUser.created_at
        });
    }

    /**
     * Guarda un usuario en el repositorio.
     * @param user - El usuario a guardar.
     * @returns Una promesa que se resuelve cuando el usuario ha sido guardado.
     */
    async save(user: User): Promise<void> {
        const sql = `
            INSERT INTO users 
                (id, email, password_hash, full_name, document_type, document)
            VALUES (?, ?, ?, ?, ?, ?)
            `;

        await pool.execute(sql, [
            user.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getFullName(),
            user.getDocumentType(),
            user.getDocument()
        ]);
    }
    /**
     * Busca un usuario por su email o documento.
     * @param email - El email del usuario a buscar.
     * @param document - El documento del usuario a buscar.
     * @returns Una promesa que resuelve en el usuario encontrado o null si no existe.
     */
    async findByEmailOrDocument(email: string, document: string): Promise<User | null> {
        const sql = `
            SELECT * 
            FROM users 
            WHERE email = ?
                OR document = ?
            LIMIT 1
        `;

        const [rows] = await pool.query<any[]>(sql, [
            email.toLowerCase(),
            document.trim(),
        ]);
        if (rows.length === 0) return null;

        const foundUser = rows[0];
        return foundUser ? new User({
            id: foundUser.id,
            email: foundUser.email,
            passwordHash: foundUser.password_hash,
            fullName: foundUser.full_name,
            documentType: foundUser.document_type,
            document: foundUser.document,
            createdAt: foundUser.created_at
        }) : null;
    }
}