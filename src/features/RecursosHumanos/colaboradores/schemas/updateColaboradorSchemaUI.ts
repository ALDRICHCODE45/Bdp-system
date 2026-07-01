import { z } from "zod";
import { ColaboradorEstado } from "../types/ColaboradorEstado.enum";

export const updateColaboradorSchemaUI = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Email inválido"),
  puesto: z.string().min(1, "El puesto es requerido"),
  status: z.nativeEnum(ColaboradorEstado),
  imss: z.boolean(),
  socioId: z.string(), // Acepta "__none__" o UUID de socio
  // Datos personales
  fechaIngreso: z.string().min(1, "La fecha de ingreso es requerida"),
  genero: z.string().min(1, "El género es requerido"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  nacionalidad: z.string().optional().default(""),
  estadoCivil: z.string().optional().default(""),
  tipoSangre: z.string().optional().default(""),
  // Contacto y dirección
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  // Datos fiscales
  rfc: z.string().optional().default(""),
  curp: z.string().optional().default(""),
  // Académicos y laborales previos
  ultimoGradoEstudios: z.string().optional().default(""),
  escuela: z.string().optional().default(""),
  ultimoTrabajo: z.string().optional().default(""),
  // Referencias personales
  nombreReferenciaPersonal: z.string().optional().default(""),
  telefonoReferenciaPersonal: z.string().optional().default(""),
  parentescoReferenciaPersonal: z.string().optional().default(""),
  // Referencias laborales
  nombreReferenciaLaboral: z.string().optional().default(""),
  telefonoReferenciaLaboral: z.string().optional().default(""),
  // Perfil extendido (rh-colaboradores-completo · P0 — todos opcionales)
  departamento: z.string().optional().default(""),
  nivel: z.string().optional().default(""),
  modalidad: z.string().optional().default(""),
  tipoContrato: z.string().optional().default(""),
  lugarTrabajo: z.string().optional().default(""),
  horario: z.string().optional().default(""),
  fechaSalida: z.string().optional().default(""),
  nombrePreferido: z.string().optional().default(""),
  documentoIdentidad: z.string().optional().default(""),
  emailPersonal: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  banco: z.string().min(1, "El banco es requerido"),
  clabe: z.string().min(1, "La CLABE es requerida"),
  sueldo: z.string().min(1, "El sueldo es requerido"),
  activos: z.array(z.string()),
});

export type UpdateColaboradorFormValues = z.infer<
  typeof updateColaboradorSchemaUI
>;
