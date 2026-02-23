import { Role, Permission } from "@prisma/client";
import { RoleDto } from "../../types/RoleDto.dto";
import { toPermissionDto } from "@/features/sistema/config/permissions/server/mappers/permissionMapper";

type RoleWithPermissions = Role & {
  permissions?: Array<{ permission: Permission }>;
};

export function toRoleDto(role: Role | RoleWithPermissions): RoleDto {
  const baseDto: RoleDto = {
    id: role.id,
    name: role.name,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };

  // Si el rol incluye permisos, mapearlos
  if ("permissions" in role && role.permissions) {
    baseDto.permissions = role.permissions.map((rp) => toPermissionDto(rp.permission));
  }

  return baseDto;
}

export function toRoleDtoArray(roles: (Role | RoleWithPermissions)[]): RoleDto[] {
  return roles.map(toRoleDto);
}

