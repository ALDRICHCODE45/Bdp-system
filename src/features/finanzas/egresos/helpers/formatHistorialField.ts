/**
 * Convierte el nombre técnico de un campo a un nombre legible en español
 */
export function formatFieldName(campo: string): string {
  const fieldNames: Record<string, string> = {
    concepto: "Concepto",
    clasificacion: "Clasificación",
    categoria: "Categoría",
    proveedor: "Proveedor",
    proveedorId: "ID Proveedor",
    solicitante: "Solicitante",
    autorizador: "Autorizador",
    numeroFactura: "Número de Factura",
    folioFiscal: "Folio Fiscal",
    periodo: "Período",
    formaPago: "Forma de Pago",
    origen: "Origen",
    numeroCuenta: "Número de Cuenta",
    clabe: "CLABE",
    cargoAbono: "Cargo/Abono",
    cantidad: "Cantidad",
    estado: "Estado",
    fechaPago: "Fecha de Pago",
    fechaRegistro: "Fecha de Registro",
    facturadoPor: "Facturado Por",
    clienteProyecto: "Cliente/Proyecto",
    clienteProyectoId: "ID Cliente/Proyecto",
    facturaId: "ID Factura",
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

  // Enums - Clasificación
  if (campo === "clasificacion") {
    const clasificacionMap: Record<string, string> = {
      GASTO_OP: "Gasto Operativo",
      HONORARIOS: "Honorarios",
      SERVICIOS: "Servicios",
      ARRENDAMIENTO: "Arrendamiento",
      COMISIONES: "Comisiones",
      DISPOSICION: "Disposición",
    };
    return clasificacionMap[valor] || valor;
  }

  // Enums - Categoría
  if (campo === "categoria") {
    const categoriaMap: Record<string, string> = {
      FACTURACION: "Facturación",
      COMISIONES: "Comisiones",
      DISPOSICION: "Disposición",
      BANCARIZACIONES: "Bancarizaciones",
    };
    return categoriaMap[valor] || valor;
  }

  // Enums - Solicitante/Autorizador
  if (campo === "solicitante" || campo === "autorizador") {
    const solicitanteMap: Record<string, string> = {
      RJS: "RJS",
      RGZ: "RGZ",
      CALFC: "CALFC",
    };
    return solicitanteMap[valor] || valor;
  }

  // Enums - Forma de Pago
  if (campo === "formaPago") {
    const formaPagoMap: Record<string, string> = {
      TRANSFERENCIA: "Transferencia",
      EFECTIVO: "Efectivo",
      CHEQUE: "Cheque",
    };
    return formaPagoMap[valor] || valor;
  }

  // Enums - Cargo/Abono
  if (campo === "cargoAbono") {
    const cargoAbonoMap: Record<string, string> = {
      BDP: "BDP",
      CALFC: "CALFC",
      GLOBAL: "Global",
      RJZ: "RJZ",
      APP: "APP",
    };
    return cargoAbonoMap[valor] || valor;
  }

  // Enums - Estado
  if (campo === "estado") {
    const estadoMap: Record<string, string> = {
      PAGADO: "Pagado",
      PENDIENTE: "Pendiente",
      CANCELADO: "Cancelado",
    };
    return estadoMap[valor] || valor;
  }

  // Enums - Facturado Por
  if (campo === "facturadoPor") {
    const facturadoPorMap: Record<string, string> = {
      BDP: "BDP",
      CALFC: "CALFC",
      GLOBAL: "Global",
      RGZ: "RGZ",
      RJS: "RJS",
      APP: "APP",
    };
    return facturadoPorMap[valor] || valor;
  }

  // Decimal - Cantidad
  if (campo === "cantidad") {
    try {
      const cantidad = Number(valor);
      if (!isNaN(cantidad)) {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(cantidad);
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

