import { UserWithRoles } from "../mappers/userMapper";

type CreateUserArgs = {
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
};

export interface UserRepository {
  create(data: CreateUserArgs): Promise<UserWithRoles>;
  findByEmail(data: { email: string }): Promise<boolean>;
  findByEmailWithPassword(data: { email: string }): Promise<UserWithRoles | null>;
  getAllUsers(): Promise<UserWithRoles[]>;
}
