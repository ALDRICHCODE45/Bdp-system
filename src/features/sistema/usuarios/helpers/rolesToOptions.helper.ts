import type { Option } from "@/core/shared/ui/multiselect";
import type { RoleDto } from "@/features/sistema/config/roles/types/RoleDto.dto";

export const rolesToOptions = (roles: RoleDto[]): Option[] => {
  return roles.map((role) => ({
    value: role.name, // Mantener name para compatibilidad con BD
    label: role.name,
  }));
};

