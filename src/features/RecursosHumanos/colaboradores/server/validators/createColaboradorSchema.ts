import { z } from "zod";
import {
  ColaboradorEstado,
  ModalidadTrabajo,
  NivelSeniority,
  TipoContrato,
} from "@prisma/client";

export const createColaboradorSchema = z.object({
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
  // Perfil extendido (rh-colaboradores-completo · P0 — todos opcionales/nullable)
  departamento: z.string().nullable().optional(),
  nivel: z.nativeEnum(NivelSeniority).nullable().optional(),
  modalidad: z.nativeEnum(ModalidadTrabajo).nullable().optional(),
  tipoContrato: z.nativeEnum(TipoContrato).nullable().optional(),
  lugarTrabajo: z.string().nullable().optional(),
  horario: z.string().nullable().optional(),
  fechaSalida: z.date().nullable().optional(),
  nombrePreferido: z.string().nullable().optional(),
  documentoIdentidad: z.string().nullable().optional(),
  emailPersonal: z.string().email("Email inválido").nullable().optional(),
  bio: z.string().nullable().optional(),
});

export type CreateColaboradorSchema = z.infer<typeof createColaboradorSchema>;

