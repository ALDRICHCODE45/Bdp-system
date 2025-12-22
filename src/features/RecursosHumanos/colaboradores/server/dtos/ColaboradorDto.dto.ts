export type ColaboradorDto = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
  status: string; // ColaboradorEstado serializado como string
  imss: boolean;
  socioId: string | null;
  socio: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  // Datos personales
  fechaIngreso: string;
  genero: string | null;
  fechaNacimiento: string | null;
  nacionalidad: string | null;
  estadoCivil: string | null;
  tipoSangre: string | null;
  // Contacto y dirección
  direccion: string | null;
  telefono: string | null;
  // Datos fiscales
  rfc: string | null;
  curp: string | null;
  // Académicos y laborales previos
  ultimoGradoEstudios: string | null;
  escuela: string | null;
  ultimoTrabajo: string | null;
  // Referencias personales
  nombreReferenciaPersonal: string | null;
  telefonoReferenciaPersonal: string | null;
  parentescoReferenciaPersonal: string | null;
  // Referencias laborales
  nombreReferenciaLaboral: string | null;
  telefonoReferenciaLaboral: string | null;
  banco: string;
  clabe: string;
  sueldo: string; // Decimal as string para el frontend
  activos: string[];
  createdAt: string;
  updatedAt: string;
};
