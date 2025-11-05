import { UserWithRoles } from "../mappers/userMapper";

type CreateUserArgs = {
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
};

type UpdateUserArgs = {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  roles: string[];
  isActive: boolean;
};

export interface UserRepository {
  create(data: CreateUserArgs): Promise<UserWithRoles>;
  update(data: UpdateUserArgs): Promise<UserWithRoles>;
  findByEmail(data: { email: string }): Promise<boolean>;
  findByEmailWithPassword(data: {
    email: string;
  }): Promise<UserWithRoles | null>;
  findById(data: { id: string }): Promise<UserWithRoles | null>;
  getAllUsers(): Promise<UserWithRoles[]>;
}
