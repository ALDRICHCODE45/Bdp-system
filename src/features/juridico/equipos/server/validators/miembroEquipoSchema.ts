import { z } from "zod";

export const miembroEquipoSchema = z.object({
  equipoId: z.string().uuid("ID de equipo jurídico inválido"),
  usuarioId: z.string().uuid("ID de usuario inválido"),
});

export type MiembroEquipoSchema = z.infer<typeof miembroEquipoSchema>;
