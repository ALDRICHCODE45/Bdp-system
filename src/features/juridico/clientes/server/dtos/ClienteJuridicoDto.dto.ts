export type ClienteJuridicoDto = {
  id: string;
  nombre: string;
  rfc: string | null;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};
