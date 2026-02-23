/**
 * Convierte el nombre técnico de un campo a un nombre legible en español
 */
export function formatFieldName(campo: string): string {
  const fieldNames: Record<string, string> = {
    concepto: "Concepto",
    serie: "Serie",
    folio: "Folio",
    subtotal: "Subtotal",
    totalImpuestosTransladados: "Impuestos Trasladados",
    totalImpuestosRetenidos: "Impuestos Retenidos",
    total: "Total",
    uuid: "UUID",
    metodoPago: "Método de Pago",
    moneda: "Moneda",
    usoCfdi: "Uso CFDI",
    status: "Status",
    nombreEmisor: "Nombre Emisor",
    nombreReceptor: "Nombre Receptor",
    statusPago: "Status de Pago",
    rfcEmisor: "RFC Emisor",
    rfcReceptor: "RFC Receptor",
    fechaPago: "Fecha de Pago",
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

  // Enums - Status
  if (campo === "status") {
    const statusMap: Record<string, string> = {
      borrador: "Borrador",
      enviada: "Enviada",
      pagada: "Pagada",
      cancelada: "Cancelada",
    };
    return statusMap[valor] || valor;
  }

  // Decimal - Subtotal, Total, Impuestos
  if (
    campo === "subtotal" ||
    campo === "total" ||
    campo === "totalImpuestosTransladados" ||
    campo === "totalImpuestosRetenidos"
  ) {
    try {
      const monto = Number(valor);
      if (!isNaN(monto)) {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(monto);
      }
    } catch {
      return valor;
    }
  }

  // DateTime - Fecha de Pago
  if (campo === "fechaPago") {
    try {
      const fecha = new Date(valor);
      if (!isNaN(fecha.getTime())) {
        return new Intl.DateTimeFormat("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(fecha);
      }
    } catch {
      return valor;
    }
  }

  // Valores string normales
  return valor;
}
