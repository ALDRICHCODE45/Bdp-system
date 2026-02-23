import { PermissionRepository } from "../repositories/PermissionRepository.repository";
import { Ok } from "@/core/shared/result/result";
import { toPermissionDtoArray } from "../mappers/permissionMapper";

export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async getAll() {
    const permissions = await this.permissionRepository.getAll();
    return Ok(toPermissionDtoArray(permissions));
  }

  async getByResource(resource: string) {
    const permissions = await this.permissionRepository.findByResource({ resource });
    return Ok(toPermissionDtoArray(permissions));
  }

  async getByRoleId(roleId: string) {
    const permissions = await this.permissionRepository.findByRoleId({ roleId });
    return Ok(toPermissionDtoArray(permissions));
  }

  async assignToRole(data: { roleId: string; permissionIds: string[] }) {
    await this.permissionRepository.assignToRole(data);
    return Ok(true);
  }

  async removeFromRole(data: { roleId: string; permissionIds: string[] }) {
    await this.permissionRepository.removeFromRole(data);
    return Ok(true);
  }

  async syncRolePermissions(data: { roleId: string; permissionIds: string[] }) {
    await this.permissionRepository.syncRolePermissions(data);
    return Ok(true);
  }
}

