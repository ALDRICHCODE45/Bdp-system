import { Permission } from "@prisma/client";
import { PermissionDto } from "../../types/PermissionDto.dto";

export function toPermissionDto(permission: Permission): PermissionDto {
  return {
    id: permission.id,
    name: permission.name,
    resource: permission.resource,
    action: permission.action,
    description: permission.description,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}

export function toPermissionDtoArray(permissions: Permission[]): PermissionDto[] {
  return permissions.map(toPermissionDto);
}

