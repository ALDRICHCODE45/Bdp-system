/**
 * Convierte el nombre técnico de un campo a un nombre legible en español
 */
export function formatFieldName(campo: string): string {
  const fieldNames: Record<string, string> = {
    nombre: "Nombre",
    rfc: "RFC",
    tipo: "Tipo",
    direccion: "Dirección",
    telefono: "Teléfono",
    email: "Correo electrónico",
    contacto: "Contacto",
    numeroCuenta: "Número de cuenta",
    clabe: "CLABE",
    banco: "Banco",
    activo: "Activo",
    fechaRegistro: "Fecha de registro",
    notas: "Notas",
    socioId: "Socio responsable",
  };

  return fieldNames[campo] || campo;
}

/**
 * Formatea un valor según el tipo de campo
 */
export function formatFieldValue(
  campo: string,
  valor: string | null
): string {
  if (valor === null || valor === "") {
    return "Sin valor";
  }

  // Booleanos (activo)
  if (campo === "activo") {
    return valor === "true" ? "Sí" : "No";
  }

  // Enum (tipo)
  if (campo === "tipo") {
    const tipoMap: Record<string, string> = {
      CLIENTE: "Cliente",
      PROVEEDOR: "Proveedor",
    };
    return tipoMap[valor] || valor;
  }

  // Date (fechaRegistro)
  if (campo === "fechaRegistro") {
    try {
      const fecha = new Date(valor);
      if (!isNaN(fecha.getTime())) {
        return new Intl.DateTimeFormat("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(fecha);
      }
    } catch {
      // Si falla el parseo, retornar el valor original
      return valor;
    }
  }

  // Valores string normales
  return valor;
}

