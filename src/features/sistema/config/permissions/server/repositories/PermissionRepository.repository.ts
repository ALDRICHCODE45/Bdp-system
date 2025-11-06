import { Permission } from "@prisma/client";

export interface PermissionRepository {
  getAll(): Promise<Permission[]>;
  findById(data: { id: string }): Promise<Permission | null>;
  findByName(data: { name: string }): Promise<Permission | null>;
  findByResource(data: { resource: string }): Promise<Permission[]>;
  findByRoleId(data: { roleId: string }): Promise<Permission[]>;
  createMany(data: { permissions: Array<{ name: string; resource: string; action: string; description?: string }> }): Promise<{ count: number }>;
  assignToRole(data: { roleId: string; permissionIds: string[] }): Promise<void>;
  removeFromRole(data: { roleId: string; permissionIds: string[] }): Promise<void>;
  syncRolePermissions(data: { roleId: string; permissionIds: string[] }): Promise<void>;
}

