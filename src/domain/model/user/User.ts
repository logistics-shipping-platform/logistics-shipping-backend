import { PasswordHasherPort } from "../../port/outbound";
import { DocType } from "./DocType";
import { v4 as uuid } from 'uuid';

export interface UserProps {
  id?: string;
  email: string;
  passwordHash: string;
  fullName: string;
  documentType: DocType;
  document: string;
  createdAt?: Date;
}

export class User {

  private readonly id: string;
  private readonly email: string;
  private passwordHash: string;
  private readonly fullName: string;
  private readonly createdAt: Date;
  private readonly documentType: DocType;
  private readonly document: string;

  constructor(props: UserProps) {
    this.id = props.id ?? uuid();
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.fullName = props.fullName;
    this.documentType = props.documentType;
    this.document = props.document;
    this.createdAt = props.createdAt ?? new Date();
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getFullName(): string {
    return this.fullName;
  }

  getDocumentType(): DocType {
    return this.documentType;
  }

  getDocument(): string {
    return this.document;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Verifica si la contraseña proporcionada coincide con el hash almacenado.
   * @param raw - Contraseña en texto plano a verificar.
   * @param hasher - Instancia de PasswordHasherPort para comparar el hash.
   * @returns {Promise<boolean>} - Retorna true si la contraseña es correcta, false en caso contrario.
   */
  async verifyPassword(
    raw: string,
    hasher: PasswordHasherPort
  ): Promise<boolean> {
    return hasher.compare(raw, this.passwordHash);
  }

  /**
   * Crea una nueva instancia de User con las propiedades proporcionadas.
   * @param props - Propiedades del usuario a crear.
   * @returns {User} - Nueva instancia de User.
   */
  static create(props: Omit<UserProps, 'id' | 'createdAt'>): User {
    return new User(props);
  }

  /**
   * Obtiene el hash de la contraseña del usuario.
   * @returns {string} - El hash de la contraseña.
   */
  getPasswordHash(): string {
    return this.passwordHash;
  }
}