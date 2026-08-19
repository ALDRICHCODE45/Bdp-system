export type DashboardHorasFilters = {
  ano?: number;
  semanaDesde?: number;
  semanaHasta?: number;
  equipoJuridicoId?: string;
  clienteProveedorId?: string;
};

export type DashboardHorasPorEquipoDto = {
  nombre: string;
  horas: number;
  registros: number;
};

export type DashboardHorasPorClienteDto = {
  nombre: string;
  horas: number;
  registros: number;
};

export type DashboardHorasPorAsuntoDto = {
  nombre: string;
  clienteNombre: string;
  horas: number;
  registros: number;
};

export type DashboardHorasPorUsuarioDto = {
  nombre: string;
  email: string;
  horas: number;
  registros: number;
  /** REQ-DH-100: total importe (MXN) earned by this user in the
   *  filtered set. Persisted sum, NOT recomputed. */
  importe: number;
};

export type DashboardHorasPorSemanaDto = {
  semana: number;
  ano: number;
  horas: number;
  registros: number;
};

export type DashboardHorasDto = {
  totalHoras: number;
  totalRegistros: number;
  totalUsuarios: number;
  totalClientes: number;
  horasPorEquipo: DashboardHorasPorEquipoDto[];
  horasPorCliente: DashboardHorasPorClienteDto[];
  horasPorAsunto: DashboardHorasPorAsuntoDto[];
  horasPorUsuario: DashboardHorasPorUsuarioDto[];
  horasPorSemana: DashboardHorasPorSemanaDto[];
  /** REQ-DH-100: total importe summed across all rows in the set. */
  totalImporte: number;
  /** REQ-DH-100: importe per user (already role-scoped by the service). */
  importePorUsuario: DashboardHorasPorUsuarioDto[];
};

/**
 * Scope parameter for `DashboardHorasService.getDashboardData`.
 * The service uses it to restrict the per-user lists to `usuarioId`
 * when the role is NOT administrador/socio.
 */
export type DashboardHorasScope = {
  role: string;
  usuarioId: string;
};
