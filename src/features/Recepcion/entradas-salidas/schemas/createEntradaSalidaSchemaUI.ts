import { z } from "zod";

export const createEntradaSalidaSchemaUI = z
  .object({
    visitante: z.string().min(3, "El visitante debe tener al menos 3 caracteres"),
    destinatario: z.string().min(3, "El destinatario debe tener al menos 3 caracteres"),
    motivo: z.string().min(2, "El motivo debe tener al menos 2 caracteres"),
    telefono: z.string(),
    correspondencia: z.string(),
    fecha: z.date({
      message: "La fecha es requerida",
    }),
    hora_entrada: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La hora de entrada debe estar en formato HH:mm"),
    hora_salida: z
      .string()
      .refine(
        (val) => {
          // Permitir string vacío o formato HH:mm válido
          if (!val || val === "") return true;
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
        },
        {
          message: "La hora de salida debe estar en formato HH:mm",
        }
      ),
  })
  .refine(
    (data) => {
      // Solo validar si hora_salida está presente y no está vacío
      if (!data.fecha || !data.hora_entrada || !data.hora_salida || data.hora_salida === "") {
        return true;
      }
      
      const [entradaHours, entradaMinutes] = data.hora_entrada.split(":").map(Number);
      const [salidaHours, salidaMinutes] = data.hora_salida.split(":").map(Number);
      
      const horaEntradaDate = new Date(data.fecha);
      horaEntradaDate.setHours(entradaHours, entradaMinutes, 0, 0);
      
      const horaSalidaDate = new Date(data.fecha);
      horaSalidaDate.setHours(salidaHours, salidaMinutes, 0, 0);
      
      return horaSalidaDate > horaEntradaDate;
    },
    {
      message: "La hora de salida debe ser posterior a la hora de entrada",
      path: ["hora_salida"],
    }
  );

export type CreateEntradaSalidaFormValues = z.infer<
  typeof createEntradaSalidaSchemaUI
>;

