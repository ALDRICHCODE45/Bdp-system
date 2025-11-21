export type EmpresaDto = {
  id: string;
  razonSocial: string | null;
  nombreComercial: string | null;
  rfc: string | null;
  curp: string | null;
  direccionFiscal: string | null;
  colonia: string | null;
  ciudad: string | null;
  estado: string | null;
  codigoPostal: string | null;
  pais: string;
  bancoPrincipal: string | null;
  nombreEnTarjetaPrincipal: string | null;
  numeroCuentaPrincipal: string | null;
  clabePrincipal: string | null;
  fechaExpiracionPrincipal: string | null; // ISO string
  cvvPrincipal: number | null;
  bancoSecundario: string | null;
  nombreEnTarjetaSecundario: string | null;
  numeroCuentaSecundario: string | null;
  clabeSecundaria: string | null;
  fechaExpiracionSecundaria: string | null; // ISO string
  cvvSecundario: number | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

