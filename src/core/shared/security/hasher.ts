//Patron adaptador para bcrypt
import bcrypt from "bcrypt";

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 10) {}
  async hash(plain: string) {
    return bcrypt.hash(plain, this.rounds);
  }
  async verify(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
