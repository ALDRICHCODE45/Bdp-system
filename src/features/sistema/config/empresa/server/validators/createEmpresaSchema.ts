import { z } from "zod";

export const createEmpresaSchema = z.object({
  razonSocial: z.string().optional().nullable(),
  nombreComercial: z.string().optional().nullable(),
  rfc: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        // RFC puede ser de 12 o 13 caracteres (persona física o moral)
        const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
        return rfcRegex.test(val.toUpperCase());
      },
      { message: "RFC inválido. Debe tener formato válido (ej: ABC123456DEF)" }
    ),
  curp: z.string().optional().nullable(),
  direccionFiscal: z.string().optional().nullable(),
  colonia: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  codigoPostal: z.string().optional().nullable(),
  pais: z.string().optional(),
  bancoPrincipal: z.string().optional().nullable(),
  nombreEnTarjetaPrincipal: z.string().optional().nullable(),
  numeroCuentaPrincipal: z.string().optional().nullable(),
  clabePrincipal: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.length === 18 && /^\d+$/.test(val);
      },
      { message: "La CLABE debe tener exactamente 18 dígitos numéricos" }
    ),
  fechaExpiracionPrincipal: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return !isNaN(Date.parse(val));
      },
      { message: "Fecha de expiración inválida" }
    ),
  cvvPrincipal: z
    .number()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined) return true;
        return val >= 100 && val <= 9999;
      },
      { message: "CVV debe ser un número entre 100 y 9999" }
    ),
  bancoSecundario: z.string().optional().nullable(),
  nombreEnTarjetaSecundario: z.string().optional().nullable(),
  numeroCuentaSecundario: z.string().optional().nullable(),
  clabeSecundaria: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.length === 18 && /^\d+$/.test(val);
      },
      { message: "La CLABE debe tener exactamente 18 dígitos numéricos" }
    ),
  fechaExpiracionSecundaria: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return !isNaN(Date.parse(val));
      },
      { message: "Fecha de expiración inválida" }
    ),
  cvvSecundario: z
    .number()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined) return true;
        return val >= 100 && val <= 9999;
      },
      { message: "CVV debe ser un número entre 100 y 9999" }
    ),
});

export type CreateEmpresaSchema = z.infer<typeof createEmpresaSchema>;

