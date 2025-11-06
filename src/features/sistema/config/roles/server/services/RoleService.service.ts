import { RoleRepository } from "../repositories/RoleRepository.repository";
import { CreateRoleDto } from "../dtos/CreateRoleDto.dto";
import { UpdateRoleDto } from "../dtos/UpdateRoleDto.dto";
import { Err, Ok } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";
import { toRoleDto, toRoleDtoArray } from "../mappers/roleMapper";

export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAll() {
    const roles = await this.roleRepository.getAll();
    return Ok(toRoleDtoArray(roles));
  }

  async getAllWithPermissions() {
    const roles = await this.roleRepository.getAllWithPermissions();
    return Ok(toRoleDtoArray(roles));
  }

  async getByIdWithPermissions(id: string) {
    const role = await this.roleRepository.findByIdWithPermissions({ id });
    if (!role) {
      return Err(new ConflictError("ROL_NO_ENCONTRADO", "El rol no existe"));
    }
    return Ok(toRoleDto(role));
  }

  async create(createRoleDto: CreateRoleDto) {
    const exists = await this.roleRepository.findByName({
      name: createRoleDto.name,
    });

    if (exists) {
      return Err(
        new ConflictError("ROL_EXISTENTE", "El nombre del rol ya está en uso")
      );
    }

    const role = await this.roleRepository.create(createRoleDto);
    return Ok(toRoleDto(role));
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findById({ id: updateRoleDto.id });

    if (!role) {
      return Err(new ConflictError("ROL_NO_ENCONTRADO", "El rol no existe"));
    }

    // Verificar si el nombre ya existe en otro rol
    const existingRole = await this.roleRepository.findByName({
      name: updateRoleDto.name,
    });

    if (existingRole && existingRole.id !== updateRoleDto.id) {
      return Err(
        new ConflictError(
          "ROL_EXISTENTE",
          "El nombre del rol ya está en uso por otro rol"
        )
      );
    }

    const updatedRole = await this.roleRepository.update(updateRoleDto);
    return Ok(toRoleDto(updatedRole));
  }

  async delete(id: string) {
    const role = await this.roleRepository.findById({ id });

    if (!role) {
      return Err(new ConflictError("ROL_NO_ENCONTRADO", "El rol no existe"));
    }

    // Verificar si el rol tiene usuarios asociados
    const hasUsers = await this.roleRepository.hasUsers({ id });

    if (hasUsers) {
      return Err(
        new ConflictError(
          "ROL_EN_USO",
          "No se puede eliminar el rol porque tiene usuarios asociados"
        )
      );
    }

    await this.roleRepository.delete({ id });
    return Ok(true);
  }
}
