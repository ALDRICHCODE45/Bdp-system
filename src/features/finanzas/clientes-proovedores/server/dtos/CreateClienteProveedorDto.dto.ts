export type CreateClienteProveedorDto = {
  nombre: string;
  rfc: string;
  tipo: "cliente" | "proveedor";
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta?: string | null;
  clabe?: string | null;
  banco?: string | null;
  activo: boolean;
  fechaRegistro: Date;
  notas?: string | null;
  socioId?: string | null;
  ingresadoPor?: string | null;
};

