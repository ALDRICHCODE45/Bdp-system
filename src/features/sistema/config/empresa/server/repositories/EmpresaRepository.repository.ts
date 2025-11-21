import { Empresa } from "@prisma/client";

export type CreateEmpresaArgs = {
  razonSocial?: string | null;
  nombreComercial?: string | null;
  rfc?: string | null;
  curp?: string | null;
  direccionFiscal?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  pais?: string;
  bancoPrincipal?: string | null;
  nombreEnTarjetaPrincipal?: string | null;
  numeroCuentaPrincipal?: string | null;
  clabePrincipal?: string | null;
  fechaExpiracionPrincipal?: Date | null;
  cvvPrincipal?: number | null;
  bancoSecundario?: string | null;
  nombreEnTarjetaSecundario?: string | null;
  numeroCuentaSecundario?: string | null;
  clabeSecundaria?: string | null;
  fechaExpiracionSecundaria?: Date | null;
  cvvSecundario?: number | null;
};

export type UpdateEmpresaArgs = {
  id: string;
  razonSocial?: string | null;
  nombreComercial?: string | null;
  rfc?: string | null;
  curp?: string | null;
  direccionFiscal?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  pais?: string;
  bancoPrincipal?: string | null;
  nombreEnTarjetaPrincipal?: string | null;
  numeroCuentaPrincipal?: string | null;
  clabePrincipal?: string | null;
  fechaExpiracionPrincipal?: Date | null;
  cvvPrincipal?: number | null;
  bancoSecundario?: string | null;
  nombreEnTarjetaSecundario?: string | null;
  numeroCuentaSecundario?: string | null;
  clabeSecundaria?: string | null;
  fechaExpiracionSecundaria?: Date | null;
  cvvSecundario?: number | null;
};

export interface EmpresaRepository {
  create(data: CreateEmpresaArgs): Promise<Empresa>;
  update(data: UpdateEmpresaArgs): Promise<Empresa>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<Empresa | null>;
  getFirst(): Promise<Empresa | null>;
  findByRfc(data: { rfc: string }): Promise<Empresa | null>;
}

