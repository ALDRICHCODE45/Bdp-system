import { Role } from "@prisma/client";
import { CreateRoleDto } from "../dtos/CreateRoleDto.dto";
import { UpdateRoleDto } from "../dtos/UpdateRoleDto.dto";

export interface RoleRepository {
  getAll(): Promise<Role[]>;
  findById(data: { id: string }): Promise<Role | null>;
  findByName(data: { name: string }): Promise<Role | null>;
  create(data: CreateRoleDto): Promise<Role>;
  update(data: UpdateRoleDto): Promise<Role>;
  delete(data: { id: string }): Promise<void>;
  hasUsers(data: { id: string }): Promise<boolean>;
}
