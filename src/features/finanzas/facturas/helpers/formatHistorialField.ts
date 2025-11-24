/**
 * Convierte el nombre técnico de un campo a un nombre legible en español
 */
export function formatFieldName(campo: string): string {
  const fieldNames: Record<string, string> = {
    tipoOrigen: "Tipo de Origen",
    origenId: "ID Origen",
    clienteProveedorId: "ID Cliente/Proveedor",
    clienteProveedor: "Cliente/Proveedor",
    concepto: "Concepto",
    monto: "Monto",
    periodo: "Período",
    numeroFactura: "Número de Factura",
    folioFiscal: "Folio Fiscal",
    fechaEmision: "Fecha de Emisión",
    fechaVencimiento: "Fecha de Vencimiento",
    estado: "Estado",
    formaPago: "Forma de Pago",
    rfcEmisor: "RFC Emisor",
    rfcReceptor: "RFC Receptor",
    direccionEmisor: "Dirección Emisor",
    direccionReceptor: "Dirección Receptor",
    fechaPago: "Fecha de Pago",
    fechaRegistro: "Fecha de Registro",
    creadoPor: "Creado Por",
    autorizadoPor: "Autorizado Por",
    notas: "Notas",
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

  // Enums - Estado
  if (campo === "estado") {
    const estadoMap: Record<string, string> = {
      borrador: "Borrador",
      enviada: "Enviada",
      pagada: "Pagada",
      cancelada: "Cancelada",
    };
    return estadoMap[valor] || valor;
  }

  // Enums - Forma de Pago
  if (campo === "formaPago") {
    const formaPagoMap: Record<string, string> = {
      transferencia: "Transferencia",
      efectivo: "Efectivo",
      cheque: "Cheque",
    };
    return formaPagoMap[valor] || valor;
  }

  // Enums - Tipo de Origen
  if (campo === "tipoOrigen") {
    const tipoOrigenMap: Record<string, string> = {
      ingreso: "Ingreso",
      egreso: "Egreso",
    };
    return tipoOrigenMap[valor] || valor;
  }

  // Decimal - Monto
  if (campo === "monto") {
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

  // DateTime - Fecha de Emisión
  if (campo === "fechaEmision") {
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
      return valor;
    }
  }

  // DateTime - Fecha de Vencimiento
  if (campo === "fechaVencimiento") {
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

  // DateTime - Fecha de Registro
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
      return valor;
    }
  }

  // Valores string normales
  return valor;
}

