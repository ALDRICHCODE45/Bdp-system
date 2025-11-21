/**
 * Convierte el nombre técnico de un campo a un nombre legible en español
 */
export function formatFieldName(campo: string): string {
  const fieldNames: Record<string, string> = {
    name: "Nombre",
    correo: "Correo electrónico",
    puesto: "Puesto",
    status: "Estado",
    imss: "IMSS",
    socioId: "Socio",
    banco: "Banco",
    clabe: "CLABE",
    sueldo: "Sueldo",
    activos: "Activos",
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

  // Arrays (activos)
  if (campo === "activos") {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          return "Ninguno";
        }
        return parsed.join(", ");
      }
    } catch {
      // Si no es JSON válido, retornar el valor original
      return valor;
    }
  }

  // Booleanos (imss)
  if (campo === "imss") {
    return valor === "true" ? "Sí" : "No";
  }

  // Decimal (sueldo)
  if (campo === "sueldo") {
    try {
      const amount = parseFloat(valor);
      if (!isNaN(amount)) {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(amount);
      }
    } catch {
      // Si falla el parseo, retornar el valor original
      return valor;
    }
  }

  // Status enum
  if (campo === "status") {
    const statusMap: Record<string, string> = {
      CONTRATADO: "Contratado",
      DESPEDIDO: "Despedido",
    };
    return statusMap[valor] || valor;
  }

  // Valores string normales
  return valor;
}

