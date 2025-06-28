import { DocType } from "../../model/user";

export interface RegisterUserPort {
  execute(dto: {
    email: string;
    password: string;
    fullName: string;
    documentType: DocType;
    document: string;
  }): Promise<{ userId: string }>;
}