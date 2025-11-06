import { PermissionDto } from "@/features/sistema/config/permissions/types/PermissionDto.dto";

export type RoleDto = {
  id: string;
  name: string;
  permissions?: PermissionDto[];
  createdAt: Date;
  updatedAt: Date;
};

