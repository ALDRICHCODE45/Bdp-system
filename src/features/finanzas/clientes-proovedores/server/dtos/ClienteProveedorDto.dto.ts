export type ClienteProveedorDto = {
  id: string;
  nombre: string;
  rfc: string;
  tipo: "cliente" | "proveedor";
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta: string | null;
  clabe: string | null;
  banco: string | null;
  activo: boolean;
  fechaRegistro: string;
  notas: string | null;
  socioResponsable: {
    id: string;
    nombre: string;
  } | null;
  ingresadoPor: string | null;
  ingresadoPorNombre: string | null;
  createdAt: string;
  updatedAt: string;
};
