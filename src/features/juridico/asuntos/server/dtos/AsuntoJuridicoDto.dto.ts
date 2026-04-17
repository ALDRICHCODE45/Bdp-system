export type AsuntoJuridicoDto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  clienteJuridicoId: string;
  clienteJuridicoNombre: string | null;
  socioId: string;
  socioNombre: string | null;
  createdAt: string;
  updatedAt: string;
};
