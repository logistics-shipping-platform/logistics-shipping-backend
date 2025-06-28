import { DocType } from "../../../../domain/model/user";

export class RegisterUserDTO {
  public readonly email: string;
  public readonly password: string;
  public readonly fullName: string;
  public readonly documentType: DocType;
  public readonly document: string;

  constructor(data: any) {
    const { email, password, fullName, documentType, document } = data;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ((typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255)) {
      throw new Error('Email inválido');
    }

    if (typeof password !== 'string' || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    if (typeof fullName !== 'string' || fullName.trim() === '') {
      throw new Error('fullName es obligatorio');
    }
    if (fullName.length > 255) {
      throw new Error('fullName no puede tener más de 255 caracteres');
    }
    if (typeof document !== 'string' || document.trim() === '') {
      throw new Error('document es obligatorio');
    }
    if (document.length > 50) {
      throw new Error('document no puede tener más de 50 caracteres');
    }

    if (typeof documentType !== 'string' || documentType.trim() === '') {
      throw new Error('documentType es obligatorio');
    }

    if (!Object.values(DocType).includes(data.documentType)) {
      throw new Error(
        `documentType inválido. Debe ser uno de: ${Object.values(DocType).join(', ')}`
      );
    }

    this.email = email.trim().toLowerCase();
    this.password = password;
    this.fullName = fullName.trim();
    this.documentType = DocType[documentType as keyof typeof DocType];
    this.document = document.trim();
  }
}