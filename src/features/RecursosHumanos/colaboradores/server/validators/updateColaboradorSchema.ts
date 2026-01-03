import { z } from "zod";
import { ColaboradorEstado } from "@prisma/client";

export const updateColaboradorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Email inválido"),
  puesto: z.string().min(1, "El puesto es requerido"),
  status: z.nativeEnum(ColaboradorEstado),
  imss: z.boolean(),
  socioId: z.string().optional().nullable(),
  banco: z.string().min(1, "El banco es requerido"),
  clabe: z.string().min(18, "La CLABE debe tener 18 dígitos").max(18),
  sueldo: z.number().positive("El sueldo debe ser mayor a 0"),
  activos: z.array(z.string()),
  // Datos personales
  fechaIngreso: z.date().optional(),
  genero: z.string().nullable().optional(),
  fechaNacimiento: z.date().nullable().optional(),
  nacionalidad: z.string().nullable().optional(),
  estadoCivil: z.string().nullable().optional(),
  tipoSangre: z.string().nullable().optional(),
  // Contacto y dirección
  direccion: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  // Datos fiscales
  rfc: z.string().nullable().optional(),
  curp: z.string().nullable().optional(),
  // Académicos y laborales previos
  ultimoGradoEstudios: z.string().nullable().optional(),
  escuela: z.string().nullable().optional(),
  ultimoTrabajo: z.string().nullable().optional(),
  // Referencias personales
  nombreReferenciaPersonal: z.string().nullable().optional(),
  telefonoReferenciaPersonal: z.string().nullable().optional(),
  parentescoReferenciaPersonal: z.string().nullable().optional(),
  // Referencias laborales
  nombreReferenciaLaboral: z.string().nullable().optional(),
  telefonoReferenciaLaboral: z.string().nullable().optional(),
});

export type UpdateColaboradorSchema = z.infer<typeof updateColaboradorSchema>;
