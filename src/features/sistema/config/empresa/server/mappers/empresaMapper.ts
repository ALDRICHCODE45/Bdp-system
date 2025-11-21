import type { EmpresaDto } from "../dtos/EmpresaDto.dto";
import type { Empresa } from "@prisma/client";

/**
 * Convierte una empresa de Prisma a EmpresaDto
 * @param empresa - Empresa de Prisma
 * @returns EmpresaDto
 */
export function toEmpresaDto(empresa: Empresa): EmpresaDto {
  return {
    id: empresa.id,
    razonSocial: empresa.razonSocial,
    nombreComercial: empresa.nombreComercial,
    rfc: empresa.rfc,
    curp: empresa.curp,
    direccionFiscal: empresa.direccionFiscal,
    colonia: empresa.colonia,
    ciudad: empresa.ciudad,
    estado: empresa.estado,
    codigoPostal: empresa.codigoPostal,
    pais: empresa.pais,
    bancoPrincipal: empresa.bancoPrincipal,
    nombreEnTarjetaPrincipal: empresa.nombreEnTarjetaPrincipal,
    numeroCuentaPrincipal: empresa.numeroCuentaPrincipal,
    clabePrincipal: empresa.clabePrincipal,
    fechaExpiracionPrincipal: empresa.fechaExpiracionPrincipal
      ? empresa.fechaExpiracionPrincipal.toISOString()
      : null,
    cvvPrincipal: empresa.cvvPrincipal,
    bancoSecundario: empresa.bancoSecundario,
    nombreEnTarjetaSecundario: empresa.nombreEnTarjetaSecundario,
    numeroCuentaSecundario: empresa.numeroCuentaSecundario,
    clabeSecundaria: empresa.clabeSecundaria,
    fechaExpiracionSecundaria: empresa.fechaExpiracionSecundaria
      ? empresa.fechaExpiracionSecundaria.toISOString()
      : null,
    cvvSecundario: empresa.cvvSecundario,
    createdAt: empresa.createdAt.toISOString(),
    updatedAt: empresa.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de empresas de Prisma a EmpresaDto[]
 * @param empresas - Array de empresas de Prisma
 * @returns Array de EmpresaDto
 */
export function toEmpresaDtoArray(empresas: Empresa[]): EmpresaDto[] {
  return empresas.map(toEmpresaDto);
}

