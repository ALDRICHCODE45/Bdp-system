/**
 * DTO returned by `getJuridicoClientesAction`.
 *
 * Limited projection (id, nombre, rfc) because sheets, filters and report
 * grouping only need enough info to identify a client. We do NOT expose
 * PROVEEDOR rows — the action filters server-side by tipo.
 */
export type JuridicoClienteDirectorioDto = {
  id: string;
  nombre: string;
  rfc: string;
};

export type JuridicoClienteDirectorioDtoArray = JuridicoClienteDirectorioDto[];