/**
 * DTO (server→client boundary) for a ResponsabilidadCargo entry.
 *
 * Dates are serialized as ISO strings on the way to the client to keep the
 * payload `JSON.stringify`-safe and decoupled from the Prisma `Date` runtime
 * (CC7).
 */
export type ResponsabilidadCargoDto = {
  id: string;
  colaboradorId: string;
  descripcion: string;
  orden: number;
  completada: boolean;
  createdAt: string;
  updatedAt: string;
};
