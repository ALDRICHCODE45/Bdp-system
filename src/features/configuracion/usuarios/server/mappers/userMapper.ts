import type { User, UserRole, Role } from "@prisma/client";
import type { UserDto } from "../dtos/UserDto.dto";

// Tipo para el User de Prisma con las relaciones de roles incluidas
export type UserWithRoles = User & {
  roles: (UserRole & {
    role: Role;
  })[];
};

/**
 * Convierte un usuario del sistema de Prisma (con relaciones) a UserDto
 * @param user - Usuario de Prisma con relaciones de roles incluidas
 * @returns UserDto con los roles como array de strings
 */
export function toUserDto(user: UserWithRoles): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((userRole) => userRole.role.name),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Convierte un array de usuarios de Prisma a UserDto[]
 * @param users - Array de usuarios de Prisma con relaciones de roles incluidas
 * @returns Array de UserDto
 */
export function toUserDtoArray(users: UserWithRoles[]): UserDto[] {
  return users.map(toUserDto);
}
