export type AsistenciaColaboradorDto = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
};

export type AsistenciaDto = {
  id: string;
  tipo: "Entrada" | "Salida";
  fecha: Date;
  correo: string;
  colaborador: AsistenciaColaboradorDto;
};
