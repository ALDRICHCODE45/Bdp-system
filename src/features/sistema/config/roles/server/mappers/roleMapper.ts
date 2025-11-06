import { Role } from "@prisma/client";
import { RoleDto } from "../../types/RoleDto.dto";

export function toRoleDto(role: Role): RoleDto {
  return {
    id: role.id,
    name: role.name,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export function toRoleDtoArray(roles: Role[]): RoleDto[] {
  return roles.map(toRoleDto);
}

