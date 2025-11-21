"use server";
import { revalidatePath } from "next/cache";
import { makeEmpresaService } from "../services/makeEmpresaService";
import { updateEmpresaSchema } from "../validators/updateEmpresaSchema";
import { toEmpresaDto } from "../mappers/empresaMapper";
import prisma from "@/core/lib/prisma";

const parseFormDataValue = (value: FormDataEntryValue | null): string | null => {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return null;
  }
  return value;
};

const parseFormDataNumber = (
  value: FormDataEntryValue | null
): number | null => {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

export const updateEmpresaAction = async (input: FormData) => {
  // Parsear todos los campos del FormData
  const id = input.get("id");
  const razonSocial = parseFormDataValue(input.get("razonSocial"));
  const nombreComercial = parseFormDataValue(input.get("nombreComercial"));
  const rfc = parseFormDataValue(input.get("rfc"));
  const curp = parseFormDataValue(input.get("curp"));
  const direccionFiscal = parseFormDataValue(input.get("direccionFiscal"));
  const colonia = parseFormDataValue(input.get("colonia"));
  const ciudad = parseFormDataValue(input.get("ciudad"));
  const estado = parseFormDataValue(input.get("estado"));
  const codigoPostal = parseFormDataValue(input.get("codigoPostal"));
  const pais = parseFormDataValue(input.get("pais"));
  const bancoPrincipal = parseFormDataValue(input.get("bancoPrincipal"));
  const nombreEnTarjetaPrincipal = parseFormDataValue(
    input.get("nombreEnTarjetaPrincipal")
  );
  const numeroCuentaPrincipal = parseFormDataValue(
    input.get("numeroCuentaPrincipal")
  );
  const clabePrincipal = parseFormDataValue(input.get("clabePrincipal"));
  const fechaExpiracionPrincipalString = parseFormDataValue(
    input.get("fechaExpiracionPrincipal")
  );
  const cvvPrincipal = parseFormDataNumber(input.get("cvvPrincipal"));
  const bancoSecundario = parseFormDataValue(input.get("bancoSecundario"));
  const nombreEnTarjetaSecundario = parseFormDataValue(
    input.get("nombreEnTarjetaSecundario")
  );
  const numeroCuentaSecundario = parseFormDataValue(
    input.get("numeroCuentaSecundario")
  );
  const clabeSecundaria = parseFormDataValue(input.get("clabeSecundaria"));
  const fechaExpiracionSecundariaString = parseFormDataValue(
    input.get("fechaExpiracionSecundaria")
  );
  const cvvSecundario = parseFormDataNumber(input.get("cvvSecundario"));

  // Validación de entrada
  const parsed = updateEmpresaSchema.parse({
    id,
    razonSocial,
    nombreComercial,
    rfc,
    curp,
    direccionFiscal,
    colonia,
    ciudad,
    estado,
    codigoPostal,
    pais,
    bancoPrincipal,
    nombreEnTarjetaPrincipal,
    numeroCuentaPrincipal,
    clabePrincipal,
    fechaExpiracionPrincipal: fechaExpiracionPrincipalString,
    cvvPrincipal,
    bancoSecundario,
    nombreEnTarjetaSecundario,
    numeroCuentaSecundario,
    clabeSecundaria,
    fechaExpiracionSecundaria: fechaExpiracionSecundariaString,
    cvvSecundario,
  });

  const empresaService = makeEmpresaService({ prisma });
  const result = await empresaService.update({
    id: parsed.id,
    razonSocial: parsed.razonSocial,
    nombreComercial: parsed.nombreComercial,
    rfc: parsed.rfc,
    curp: parsed.curp,
    direccionFiscal: parsed.direccionFiscal,
    colonia: parsed.colonia,
    ciudad: parsed.ciudad,
    estado: parsed.estado,
    codigoPostal: parsed.codigoPostal,
    pais: parsed.pais ?? undefined,
    bancoPrincipal: parsed.bancoPrincipal,
    nombreEnTarjetaPrincipal: parsed.nombreEnTarjetaPrincipal,
    numeroCuentaPrincipal: parsed.numeroCuentaPrincipal,
    clabePrincipal: parsed.clabePrincipal,
    fechaExpiracionPrincipal: parsed.fechaExpiracionPrincipal
      ? new Date(parsed.fechaExpiracionPrincipal)
      : null,
    cvvPrincipal: parsed.cvvPrincipal,
    bancoSecundario: parsed.bancoSecundario,
    nombreEnTarjetaSecundario: parsed.nombreEnTarjetaSecundario,
    numeroCuentaSecundario: parsed.numeroCuentaSecundario,
    clabeSecundaria: parsed.clabeSecundaria,
    fechaExpiracionSecundaria: parsed.fechaExpiracionSecundaria
      ? new Date(parsed.fechaExpiracionSecundaria)
      : null,
    cvvSecundario: parsed.cvvSecundario,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const empresaDto = toEmpresaDto(result.value);
  revalidatePath("/config/empresa");
  return { ok: true, data: empresaDto };
};

