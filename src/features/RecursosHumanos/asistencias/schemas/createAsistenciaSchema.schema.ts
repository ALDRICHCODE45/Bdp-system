import z from "zod";

export const createAsistenciaSchema = z.object({
  email: z.email("Formato de correo no valido"),
  tipo: z.enum(["Entrada", "Salida"], {
    error: "El rol es obligatorio",
  }),
});
