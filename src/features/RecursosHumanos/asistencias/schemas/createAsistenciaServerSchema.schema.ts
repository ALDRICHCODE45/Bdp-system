import z from "zod";

/**
 * Server-side validator for `CreateAsistenciaDto`.
 *
 * Kept intentionally separate from the client `createAsistenciaSchema`
 * (which validates the TanStack Form fields `{ email, tipo }`). The server
 * schema matches the real DTO shape that arrives at the Server Action
 * boundary `{ tipo, fecha, correo }`.
 */
export const createAsistenciaServerSchema = z.object({
  tipo: z.enum(["Entrada", "Salida"]),
  fecha: z.date(),
  correo: z.string().email(),
});