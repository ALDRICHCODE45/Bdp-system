import type { RegistroHoraEntity } from "../repositories/RegistroHoraRepository.repository";
import type { RegistroHoraDto } from "../dtos/RegistroHoraDto.dto";

export function toRegistroHoraDto(entity: RegistroHoraEntity): RegistroHoraDto {
  return {
    id: entity.id,
    usuarioId: entity.usuarioId,
    usuarioNombre: entity.usuario.name ?? "",
    usuarioEmail: entity.usuario.email ?? "",
    equipoJuridicoId: entity.equipoJuridicoId,
    equipoJuridicoNombre: entity.equipoJuridico.nombre,
    clienteJuridicoId: entity.clienteJuridicoId,
    clienteJuridicoNombre: entity.clienteJuridico.nombre,
    asuntoJuridicoId: entity.asuntoJuridicoId,
    asuntoJuridicoNombre: entity.asuntoJuridico.nombre,
    socioId: entity.socioId,
    socioNombre: entity.socio.nombre,
    horas: Number(entity.horas),
    descripcion: entity.descripcion ?? null,
    ano: entity.ano,
    semana: entity.semana,
    editable: entity.editable,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toRegistroHoraDtoArray(
  entities: RegistroHoraEntity[]
): RegistroHoraDto[] {
  return entities.map(toRegistroHoraDto);
}
