import { PrismaClient } from "@prisma/client";
import { PermissionRepository } from "./PermissionRepository.repository";

export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAll(): Promise<import("@prisma/client").Permission[]> {
    return await this.prisma.permission.findMany({
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    });
  }

  async findById(data: { id: string }): Promise<import("@prisma/client").Permission | null> {
    return await this.prisma.permission.findUnique({
      where: { id: data.id },
    });
  }

  async findByName(data: { name: string }): Promise<import("@prisma/client").Permission | null> {
    return await this.prisma.permission.findUnique({
      where: { name: data.name },
    });
  }

  async findByResource(data: { resource: string }): Promise<import("@prisma/client").Permission[]> {
    return await this.prisma.permission.findMany({
      where: { resource: data.resource },
      orderBy: { action: "asc" },
    });
  }

  async findByRoleId(data: { roleId: string }): Promise<import("@prisma/client").Permission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: data.roleId },
      include: { permission: true },
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  async createMany(data: {
    permissions: Array<{ name: string; resource: string; action: string; description?: string }>;
  }): Promise<{ count: number }> {
    return await this.prisma.permission.createMany({
      data: data.permissions,
      skipDuplicates: true,
    });
  }

  async assignToRole(data: { roleId: string; permissionIds: string[] }): Promise<void> {
    const { roleId, permissionIds } = data;

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  async removeFromRole(data: { roleId: string; permissionIds: string[] }): Promise<void> {
    const { roleId, permissionIds } = data;

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  }

  async syncRolePermissions(data: { roleId: string; permissionIds: string[] }): Promise<void> {
    const { roleId, permissionIds } = data;

    // Eliminar todos los permisos actuales del rol
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Asignar los nuevos permisos
    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }
  }
}

