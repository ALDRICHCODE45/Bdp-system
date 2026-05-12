export type DashboardHorasFilters = {
  ano?: number;
  semanaDesde?: number;
  semanaHasta?: number;
  equipoJuridicoId?: string;
  clienteJuridicoId?: string;
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
};
