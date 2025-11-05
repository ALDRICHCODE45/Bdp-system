export type CreateUserDto = {
  email: string;
  name: string;
  password: string;

  roles: string[];
};
