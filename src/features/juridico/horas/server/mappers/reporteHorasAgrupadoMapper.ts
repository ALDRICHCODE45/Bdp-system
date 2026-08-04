import type { ReporteGrupoDto } from "../dtos/ReporteHorasAgrupadoDto.dto";
import type {
  EntityLabels,
  ReporteAgrupadoGroupRow,
} from "../repositories/ReporteHorasAgrupadoRepository.repository";

/**
 * Mappea una fila cruda del `groupBy` + los labels batch-loaded a un DTO.
 * Sin estado, sin I/O. Validable por inspección.
 */
export function toReporteGrupoDto(
  row: ReporteAgrupadoGroupRow,
  labels: EntityLabels,
): ReporteGrupoDto {
  return {
    usuarioId: row.usuarioId,
    usuarioNombre: labels.usuarios.get(row.usuarioId) ?? "—",
    clienteJuridicoId: row.clienteJuridicoId,
    clienteNombre: labels.clientes.get(row.clienteJuridicoId) ?? "—",
    asuntoJuridicoId: row.asuntoJuridicoId,
    asuntoNombre: labels.asuntos.get(row.asuntoJuridicoId) ?? "—",
    equipoJuridicoId: row.equipoJuridicoId,
    equipoNombre: labels.equipos.get(row.equipoJuridicoId) ?? "—",
    socioId: row.socioId,
    socioNombre: labels.socios.get(row.socioId) ?? "—",
    estadoAsunto: row.estadoAsunto,
    ano: row.ano,
    semana: row.semana,
    horas: roundHoras(row.horas),
  };
}

export function toReporteGrupoDtoArray(
  rows: ReporteAgrupadoGroupRow[],
  labels: EntityLabels,
): ReporteGrupoDto[] {
  return rows.map((row) => toReporteGrupoDto(row, labels));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Los `horas` son `Decimal` (Prisma) o `number` (en JS). Lo redondeamos
 * a 2 decimales para evitar artefactos tipo `1.5000000000000002` en la UI.
 */
function roundHoras(value: number): number {
  return Math.round(value * 100) / 100;
}
