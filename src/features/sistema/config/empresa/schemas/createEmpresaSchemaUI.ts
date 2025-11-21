import { z } from "zod";

export const createEmpresaSchemaUI = z.object({
  id: z.string().optional(),
  razonSocial: z.string().optional(),
  nombreComercial: z.string().optional(),
  rfc: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
        return rfcRegex.test(val.toUpperCase());
      },
      { message: "RFC inválido. Debe tener formato válido (ej: ABC123456DEF)" }
    ),
  curp: z.string().optional(),
  direccionFiscal: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
  pais: z.string().optional(),
  bancoPrincipal: z.string().optional(),
  nombreEnTarjetaPrincipal: z.string().optional(),
  numeroCuentaPrincipal: z.string().optional(),
  clabePrincipal: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.length === 18 && /^\d+$/.test(val);
      },
      { message: "La CLABE debe tener exactamente 18 dígitos numéricos" }
    ),
  fechaExpiracionPrincipal: z.string().optional(),
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
  bancoSecundario: z.string().optional(),
  nombreEnTarjetaSecundario: z.string().optional(),
  numeroCuentaSecundario: z.string().optional(),
  clabeSecundaria: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.length === 18 && /^\d+$/.test(val);
      },
      { message: "La CLABE debe tener exactamente 18 dígitos numéricos" }
    ),
  fechaExpiracionSecundaria: z.string().optional(),
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

export type CreateEmpresaFormValues = z.infer<
  typeof createEmpresaSchemaUI
>;

