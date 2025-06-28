export interface TokenServicePort {
  generate(payload: Record<string, any>): Promise<string>;
  verify(token: string): Promise<Record<string, any> | null> ;
}