export type ColaboradorDto = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
  status: "CONTRATADO" | "DESPEDIDO" | "EN_LICENCIA"; // ColaboradorEstado serializado como string
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
  // Perfil extendido (rh-colaboradores-completo · P0 — todos nullable)
  departamento: string | null;
  nivel: "JUNIOR" | "SEMI_SENIOR" | "SENIOR" | "LEAD" | "GERENCIAL" | null;
  modalidad: "REMOTO" | "HIBRIDO" | "PRESENCIAL" | null;
  tipoContrato:
    | "INDEFINIDO"
    | "TEMPORAL"
    | "POR_OBRA"
    | "PRACTICAS"
    | "HONORARIOS"
    | null;
  lugarTrabajo: string | null;
  horario: string | null;
  fechaSalida: string | null;
  nombrePreferido: string | null;
  documentoIdentidad: string | null;
  emailPersonal: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};