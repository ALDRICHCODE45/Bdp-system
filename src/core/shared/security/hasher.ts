//Patron adaptador para bcrypt
// Usar importación dinámica para evitar problemas con módulos nativos

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 10) { }

  private async getBcrypt() {
    // Importación dinámica para evitar cargar bcrypt a nivel de módulo
    const bcrypt = await import("bcrypt");
    return bcrypt.default;
  }

  async hash(plain: string) {
    const bcrypt = await this.getBcrypt();
    return bcrypt.hash(plain, this.rounds);
  }

  async verify(plain: string, hash: string) {
    const bcrypt = await this.getBcrypt();
    return bcrypt.compare(plain, hash);
  }
}
