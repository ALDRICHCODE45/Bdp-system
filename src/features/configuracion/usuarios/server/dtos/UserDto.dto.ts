export type UserDto = {
  id: string;
  email: string;
  name: string;
  roles: string[]; // Array de nombres de roles (ej: ["admin", "user", "moderator"])
  createdAt: Date;
  updatedAt: Date;
};
