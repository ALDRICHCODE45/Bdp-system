export type CreateAsistenciaDto = {
  tipo: "Entrada" | "Salida";
  fecha: Date;
  correo: string;
};
