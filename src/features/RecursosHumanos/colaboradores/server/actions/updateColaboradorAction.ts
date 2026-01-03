"use server";
import { revalidatePath } from "next/cache";
import { makeColaboradorService } from "../services/makeColaboradorService";
import { updateColaboradorSchema } from "../validators/updateColaboradorSchema";
import { toColaboradorDto } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";

export const updateColaboradorAction = async (input: FormData) => {
  // Obtener usuario autenticado
  const session = await auth();
  const usuarioId = session?.user?.id || null;
  const id = input.get("id");
  const name = input.get("name");
  const correo = input.get("correo");
  const puesto = input.get("puesto");
  const status = input.get("status");
  const imss = input.get("imss") === "true";
  const socioId = input.get("socioId") || null;
  const banco = input.get("banco");
  const clabe = input.get("clabe");
  const sueldo = input.get("sueldo");

  // Datos personales
  const fechaIngreso = input.get("fechaIngreso");
  const genero = input.get("genero");
  const fechaNacimiento = input.get("fechaNacimiento");
  const nacionalidad = input.get("nacionalidad");
  const estadoCivil = input.get("estadoCivil");
  const tipoSangre = input.get("tipoSangre");

  // Contacto y dirección
  const direccion = input.get("direccion");
  const telefono = input.get("telefono");

  // Datos fiscales
  const rfc = input.get("rfc");
  const curp = input.get("curp");

  // Académicos y laborales previos
  const ultimoGradoEstudios = input.get("ultimoGradoEstudios");
  const escuela = input.get("escuela");
  const ultimoTrabajo = input.get("ultimoTrabajo");

  // Referencias personales
  const nombreReferenciaPersonal = input.get("nombreReferenciaPersonal");
  const telefonoReferenciaPersonal = input.get("telefonoReferenciaPersonal");
  const parentescoReferenciaPersonal = input.get("parentescoReferenciaPersonal");

  // Referencias laborales
  const nombreReferenciaLaboral = input.get("nombreReferenciaLaboral");
  const telefonoReferenciaLaboral = input.get("telefonoReferenciaLaboral");

  let activos: string[] = [];
  try {
    const activosString = input.get("activos");
    if (
      activosString &&
      typeof activosString === "string" &&
      activosString.trim() !== ""
    ) {
      const parsed = JSON.parse(activosString);
      // Asegurar que sea un array
      activos = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    return { ok: false, error: "Error al parsear activos" };
  }

  // Validación de entrada
  const parsed = updateColaboradorSchema.parse({
    id,
    name,
    correo,
    puesto,
    status,
    imss,
    socioId: socioId === "" ? null : socioId,
    banco,
    clabe,
    sueldo: sueldo ? parseFloat(sueldo as string) : 0,
    activos,
    // Datos personales
    fechaIngreso: fechaIngreso && typeof fechaIngreso === "string" && fechaIngreso.trim() !== "" 
      ? new Date(fechaIngreso) 
      : undefined,
    genero: genero && typeof genero === "string" && genero.trim() !== "" ? genero : null,
    fechaNacimiento: fechaNacimiento && typeof fechaNacimiento === "string" && fechaNacimiento.trim() !== ""
      ? new Date(fechaNacimiento)
      : null,
    nacionalidad: nacionalidad && typeof nacionalidad === "string" && nacionalidad.trim() !== "" ? nacionalidad : null,
    estadoCivil: estadoCivil && typeof estadoCivil === "string" && estadoCivil.trim() !== "" ? estadoCivil : null,
    tipoSangre: tipoSangre && typeof tipoSangre === "string" && tipoSangre.trim() !== "" ? tipoSangre : null,
    // Contacto y dirección
    direccion: direccion && typeof direccion === "string" && direccion.trim() !== "" ? direccion : null,
    telefono: telefono && typeof telefono === "string" && telefono.trim() !== "" ? telefono : null,
    // Datos fiscales
    rfc: rfc && typeof rfc === "string" && rfc.trim() !== "" ? rfc : null,
    curp: curp && typeof curp === "string" && curp.trim() !== "" ? curp : null,
    // Académicos y laborales previos
    ultimoGradoEstudios: ultimoGradoEstudios && typeof ultimoGradoEstudios === "string" && ultimoGradoEstudios.trim() !== "" 
      ? ultimoGradoEstudios 
      : null,
    escuela: escuela && typeof escuela === "string" && escuela.trim() !== "" ? escuela : null,
    ultimoTrabajo: ultimoTrabajo && typeof ultimoTrabajo === "string" && ultimoTrabajo.trim() !== "" ? ultimoTrabajo : null,
    // Referencias personales
    nombreReferenciaPersonal: nombreReferenciaPersonal && typeof nombreReferenciaPersonal === "string" && nombreReferenciaPersonal.trim() !== ""
      ? nombreReferenciaPersonal
      : null,
    telefonoReferenciaPersonal: telefonoReferenciaPersonal && typeof telefonoReferenciaPersonal === "string" && telefonoReferenciaPersonal.trim() !== ""
      ? telefonoReferenciaPersonal
      : null,
    parentescoReferenciaPersonal: parentescoReferenciaPersonal && typeof parentescoReferenciaPersonal === "string" && parentescoReferenciaPersonal.trim() !== ""
      ? parentescoReferenciaPersonal
      : null,
    // Referencias laborales
    nombreReferenciaLaboral: nombreReferenciaLaboral && typeof nombreReferenciaLaboral === "string" && nombreReferenciaLaboral.trim() !== ""
      ? nombreReferenciaLaboral
      : null,
    telefonoReferenciaLaboral: telefonoReferenciaLaboral && typeof telefonoReferenciaLaboral === "string" && telefonoReferenciaLaboral.trim() !== ""
      ? telefonoReferenciaLaboral
      : null,
  });

  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.update({
    ...parsed,
    usuarioId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const colaboradorDto = toColaboradorDto(result.value);
  revalidatePath("/colaboradores");
  return { ok: true, data: colaboradorDto };
};
