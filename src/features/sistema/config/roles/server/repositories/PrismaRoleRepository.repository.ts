import { PrismaClient } from "@prisma/client";
import { RoleRepository } from "./RoleRepository.repository";
import { CreateRoleDto } from "../dtos/CreateRoleDto.dto";
import { UpdateRoleDto } from "../dtos/UpdateRoleDto.dto";

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAll(): Promise<import("@prisma/client").Role[]> {
    return await this.prisma.role.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getAllWithPermissions(): Promise<Array<import("@prisma/client").Role & { permissions: Array<{ permission: import("@prisma/client").Permission }> }>> {
    return await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(data: {
    id: string;
  }): Promise<import("@prisma/client").Role | null> {
    return await this.prisma.role.findUnique({
      where: { id: data.id },
    });
  }

  async findByIdWithPermissions(data: {
    id: string;
  }): Promise<(import("@prisma/client").Role & { permissions: Array<{ permission: import("@prisma/client").Permission }> }) | null> {
    return await this.prisma.role.findUnique({
      where: { id: data.id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findByName(data: {
    name: string;
  }): Promise<import("@prisma/client").Role | null> {
    return await this.prisma.role.findUnique({
      where: { name: data.name },
    });
  }

  async create(data: CreateRoleDto): Promise<import("@prisma/client").Role> {
    return await this.prisma.role.create({
      data: {
        name: data.name,
      },
    });
  }

  async update(data: UpdateRoleDto): Promise<import("@prisma/client").Role> {
    return await this.prisma.role.update({
      where: { id: data.id },
      data: {
        name: data.name,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.role.delete({
      where: { id: data.id },
    });
  }

  async hasUsers(data: { id: string }): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: { roleId: data.id },
    });
    return count > 0;
  }

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: import("@prisma/client").Role[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;
    const orderBy = params.sortBy
      ? { [params.sortBy]: params.sortOrder || "desc" }
      : { createdAt: "desc" as const };

    const [data, totalCount] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.role.count(),
    ]);

    return { data, totalCount };
  }
}
