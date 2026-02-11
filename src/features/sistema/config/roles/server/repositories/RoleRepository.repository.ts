import { Role } from "@prisma/client";
import { CreateRoleDto } from "../dtos/CreateRoleDto.dto";
import { UpdateRoleDto } from "../dtos/UpdateRoleDto.dto";

export interface RoleRepository {
  getAll(): Promise<Role[]>;
  getAllWithPermissions(): Promise<Array<Role & { permissions: Array<{ permission: import("@prisma/client").Permission }> }>>;
  findById(data: { id: string }): Promise<Role | null>;
  findByIdWithPermissions(data: { id: string }): Promise<(Role & { permissions: Array<{ permission: import("@prisma/client").Permission }> }) | null>;
  findByName(data: { name: string }): Promise<Role | null>;
  create(data: CreateRoleDto): Promise<Role>;
  update(data: UpdateRoleDto): Promise<Role>;
  delete(data: { id: string }): Promise<void>;
  hasUsers(data: { id: string }): Promise<boolean>;
  getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: Role[]; totalCount: number }>;
}
