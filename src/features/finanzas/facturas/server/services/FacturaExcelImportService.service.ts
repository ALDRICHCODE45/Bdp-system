import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { Result, Err, Ok } from "@/core/shared/result/result";
import {
  ImportFacturaExcelRowDto,
  ValidatedExcelRowDto,
} from "../dtos/ImportFacturaExcelRowDto.dto";
import {
  ImportExcelPreviewDto,
  DuplicadaDto,
  ClienteNuevoDto,
  ErrorValidacionDto,
  ImportOptionsDto,
} from "../dtos/ImportExcelPreviewDto.dto";
import {
  ImportFacturaResultDto,
  ImportExecutionResultDto,
} from "../dtos/ImportFacturaResultDto.dto";
import {
  importFacturaExcelRowSchema,
  EXCEL_COLUMN_TO_FIELD_MAP,
  REQUIRED_EXCEL_COLUMNS,
} from "../validators/importFacturaExcelRowSchema";
import { FacturaRepository } from "../repositories/FacturaRepository.repository";
import { toFacturaDto } from "../mappers/facturaMapper";
import { FacturaHistorialService } from "./FacturaHistorialService.service";

type RawExcelRow = Record<string, unknown>;

export class FacturaExcelImportService {
  constructor(
    private facturaRepository: FacturaRepository,
    private historialService: FacturaHistorialService,
    private prisma: PrismaClient
  ) {}

  /**
   * Parsea un archivo Excel y extrae las filas de datos
   */
  async parseExcelFile(
    fileBuffer: ArrayBuffer
  ): Promise<Result<RawExcelRow[], Error>> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return Err(new Error("El archivo Excel no contiene hojas"));
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
        raw: false,
        dateNF: "yyyy-mm-dd",
      });

      if (jsonData.length === 0) {
        return Err(new Error("El archivo Excel no contiene datos"));
      }

      // Validar que las columnas requeridas estén presentes
      const headers = Object.keys(jsonData[0]);
      const missingColumns = REQUIRED_EXCEL_COLUMNS.filter(
        (col) => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        return Err(
          new Error(
            `Faltan las siguientes columnas requeridas: ${missingColumns.join(", ")}`
          )
        );
      }

      return Ok(jsonData);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al procesar el archivo Excel")
      );
    }
  }

  /**
   * Convierte una fila cruda del Excel al formato del DTO
   */
  private mapRawRowToDto(
    rawRow: RawExcelRow,
    rowNumber: number
  ): Partial<ImportFacturaExcelRowDto> {
    const mapped: Record<string, unknown> = { rowNumber };

    for (const [excelColumn, fieldName] of Object.entries(EXCEL_COLUMN_TO_FIELD_MAP)) {
      const value = rawRow[excelColumn];

      if (fieldName === "monto" && value !== undefined) {
        // Convertir monto a número
        const numValue = typeof value === "string"
          ? parseFloat(value.replace(/[,$]/g, ""))
          : Number(value);
        mapped[fieldName] = isNaN(numValue) ? value : numValue;
      } else if (
        (fieldName === "fechaEmision" || fieldName === "fechaVencimiento") &&
        value !== undefined
      ) {
        // Convertir fechas
        if (value instanceof Date) {
          mapped[fieldName] = value;
        } else if (typeof value === "string") {
          const dateValue = new Date(value);
          mapped[fieldName] = isNaN(dateValue.getTime()) ? value : dateValue;
        } else if (typeof value === "number") {
          // Excel serial date
          const dateValue = XLSX.SSF.parse_date_code(value);
          if (dateValue) {
            mapped[fieldName] = new Date(dateValue.y, dateValue.m - 1, dateValue.d);
          }
        }
      } else if (fieldName === "formaPago" && typeof value === "string") {
        // Normalizar forma de pago
        mapped[fieldName] = value.toUpperCase().trim();
      } else {
        mapped[fieldName] = value;
      }
    }

    return mapped as Partial<ImportFacturaExcelRowDto>;
  }

  /**
   * Valida las filas del Excel usando el schema Zod
   */
  validateRows(
    rawRows: RawExcelRow[]
  ): { valid: Partial<ImportFacturaExcelRowDto>[]; errors: ErrorValidacionDto[] } {
    const valid: Partial<ImportFacturaExcelRowDto>[] = [];
    const errors: ErrorValidacionDto[] = [];

    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // +2 porque Excel empieza en 1 y la fila 1 es el header
      const mappedRow = this.mapRawRowToDto(rawRow, rowNumber);

      const result = importFacturaExcelRowSchema.safeParse(mappedRow);

      if (result.success) {
        valid.push({ ...result.data, rowNumber });
      } else {
        errors.push({
          rowNumber,
          errors: result.error.issues.map(
            (e) => `${e.path.join(".")}: ${e.message}`
          ),
          rawData: mappedRow,
        });
      }
    });

    return { valid, errors };
  }

  /**
   * Busca facturas duplicadas por folioFiscal
   */
  async checkDuplicates(
    rows: Partial<ImportFacturaExcelRowDto>[]
  ): Promise<{ nuevas: Partial<ImportFacturaExcelRowDto>[]; duplicadas: DuplicadaDto[] }> {
    const nuevas: Partial<ImportFacturaExcelRowDto>[] = [];
    const duplicadas: DuplicadaDto[] = [];

    const foliosFiscales = rows
      .map((r) => r.folioFiscal)
      .filter((f): f is string => !!f);

    // Buscar todas las facturas existentes con esos folios fiscales
    const existingFacturas = await this.prisma.factura.findMany({
      where: {
        folioFiscal: { in: foliosFiscales },
      },
      include: {
        clienteProveedorRef: true,
        ingresadoPorRef: true,
        creadoPorRef: true,
        autorizadoPorRef: true,
      },
    });

    const existingMap = new Map(
      existingFacturas.map((f) => [f.folioFiscal, f])
    );

    for (const row of rows) {
      const existing = existingMap.get(row.folioFiscal!);
      if (existing) {
        duplicadas.push({
          row: row as ValidatedExcelRowDto,
          existing: toFacturaDto(existing),
          shouldUpdate: false,
        });
      } else {
        nuevas.push(row);
      }
    }

    return { nuevas, duplicadas };
  }

  /**
   * Busca clientes existentes por RFC y determina cuáles son nuevos
   */
  async checkClientes(
    rows: Partial<ImportFacturaExcelRowDto>[]
  ): Promise<{
    clientesExistentes: Map<string, { id: string; nombre: string; rfc: string }>;
    clientesNuevos: ClienteNuevoDto[];
  }> {
    const rfcSet = new Set(
      rows.map((r) => r.rfcClienteProveedor).filter((rfc): rfc is string => !!rfc)
    );

    // Buscar clientes existentes
    const existingClientes = await this.prisma.clienteProveedor.findMany({
      where: {
        rfc: { in: Array.from(rfcSet) },
      },
      select: {
        id: true,
        nombre: true,
        rfc: true,
      },
    });

    const clientesExistentes = new Map(
      existingClientes.map((c) => [c.rfc, c])
    );

    // Determinar clientes nuevos
    const clientesNuevosMap = new Map<string, ClienteNuevoDto>();

    for (const row of rows) {
      const rfc = row.rfcClienteProveedor;
      if (rfc && !clientesExistentes.has(rfc)) {
        const existing = clientesNuevosMap.get(rfc);
        if (existing) {
          existing.rowNumbers.push(row.rowNumber!);
        } else {
          clientesNuevosMap.set(rfc, {
            nombre: row.clienteProveedor || "",
            rfc,
            rowNumbers: [row.rowNumber!],
          });
        }
      }
    }

    return {
      clientesExistentes,
      clientesNuevos: Array.from(clientesNuevosMap.values()),
    };
  }

  /**
   * Busca Ingreso o Egreso por folioFiscal para vinculación automática
   */
  async findOrigenByFolioFiscal(
    folioFiscal: string
  ): Promise<{ tipoOrigen: "INGRESO" | "EGRESO"; origenId: string } | null> {
    // Buscar primero en Ingresos
    const ingreso = await this.prisma.ingreso.findFirst({
      where: { folioFiscal },
      select: { id: true },
    });

    if (ingreso) {
      return { tipoOrigen: "INGRESO", origenId: ingreso.id };
    }

    // Buscar en Egresos
    const egreso = await this.prisma.egreso.findFirst({
      where: { folioFiscal },
      select: { id: true },
    });

    if (egreso) {
      return { tipoOrigen: "EGRESO", origenId: egreso.id };
    }

    return null;
  }

  /**
   * Genera un preview completo de la importación
   */
  async previewImport(
    fileBuffer: ArrayBuffer,
    fileName: string
  ): Promise<Result<ImportExcelPreviewDto, Error>> {
    // 1. Parsear Excel
    const parseResult = await this.parseExcelFile(fileBuffer);
    if (!parseResult.ok) {
      return parseResult;
    }

    const rawRows = parseResult.value;

    // 2. Validar filas
    const { valid, errors } = this.validateRows(rawRows);

    // 3. Verificar duplicados
    const { nuevas, duplicadas } = await this.checkDuplicates(valid);

    // 4. Verificar clientes
    const { clientesExistentes, clientesNuevos } = await this.checkClientes([
      ...nuevas,
      ...duplicadas.map((d) => d.row),
    ]);

    // 5. Buscar vinculación con I/E para cada fila
    const validatedNuevas: ValidatedExcelRowDto[] = [];
    let totalConVinculacion = 0;
    let totalSinVinculacion = 0;

    for (const row of nuevas) {
      const vinculacion = await this.findOrigenByFolioFiscal(row.folioFiscal!);
      const clienteInfo = clientesExistentes.get(row.rfcClienteProveedor!) || {
        id: null,
        nombre: row.clienteProveedor!,
        rfc: row.rfcClienteProveedor!,
      };

      const validated: ValidatedExcelRowDto = {
        ...(row as ImportFacturaExcelRowDto),
        isValid: true,
        errors: [],
        vinculacion: vinculacion
          ? { ...vinculacion, encontrado: true }
          : null,
        clienteInfo: {
          ...clienteInfo,
          existe: clientesExistentes.has(row.rfcClienteProveedor!),
        },
      };

      validatedNuevas.push(validated);

      if (vinculacion) {
        totalConVinculacion++;
      } else {
        totalSinVinculacion++;
      }
    }

    // Actualizar también las duplicadas con info de vinculación
    for (const dup of duplicadas) {
      const vinculacion = await this.findOrigenByFolioFiscal(dup.row.folioFiscal!);
      const clienteInfo = clientesExistentes.get(dup.row.rfcClienteProveedor!) || {
        id: null,
        nombre: dup.row.clienteProveedor!,
        rfc: dup.row.rfcClienteProveedor!,
      };

      dup.row = {
        ...(dup.row as ImportFacturaExcelRowDto),
        isValid: true,
        errors: [],
        vinculacion: vinculacion ? { ...vinculacion, encontrado: true } : null,
        clienteInfo: {
          ...clienteInfo,
          existe: clientesExistentes.has(dup.row.rfcClienteProveedor!),
        },
      };
    }

    const preview: ImportExcelPreviewDto = {
      fileName,
      totalRows: rawRows.length,
      nuevas: validatedNuevas,
      duplicadas,
      clientesNuevos,
      errores: errors,
      resumen: {
        totalNuevas: validatedNuevas.length,
        totalDuplicadas: duplicadas.length,
        totalClientesNuevos: clientesNuevos.length,
        totalErrores: errors.length,
        totalConVinculacion,
        totalSinVinculacion,
      },
    };

    return Ok(preview);
  }

  /**
   * Ejecuta la importación basándose en el preview
   */
  async executeImport(
    preview: ImportExcelPreviewDto,
    options: ImportOptionsDto,
    usuarioId: string | null
  ): Promise<Result<ImportExecutionResultDto, Error>> {
    const resultados: ImportFacturaResultDto[] = [];
    let creadas = 0;
    let actualizadas = 0;
    let omitidas = 0;
    let errores = 0;
    let clientesCreados = 0;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Importar dinámicamente los repositorios para la transacción
        const { PrismaFacturaRepository } = await import(
          "../repositories/PrismaFacturaRepository.repository"
        );
        const { PrismaFacturaHistorialRepository } = await import(
          "../repositories/PrismaFacturaHistorialRepository.repository"
        );
        const { FacturaHistorialService } = await import(
          "./FacturaHistorialService.service"
        );

        const tempFacturaRepository = new PrismaFacturaRepository(tx);
        const tempHistorialRepository = new PrismaFacturaHistorialRepository(tx);
        const tempHistorialService = new FacturaHistorialService(tempHistorialRepository);

        // Mapa para almacenar clientes creados (RFC -> ID)
        const clientesCreatedMap = new Map<string, string>();

        // 1. Crear clientes nuevos primero
        for (const clienteNuevo of preview.clientesNuevos) {
          const newCliente = await tx.clienteProveedor.create({
            data: {
              nombre: clienteNuevo.nombre,
              rfc: clienteNuevo.rfc,
              tipo: "CLIENTE",
              direccion: "",
              telefono: "",
              email: "",
              contacto: "",
              activo: true,
              ingresadoPor: usuarioId,
            },
          });
          clientesCreatedMap.set(clienteNuevo.rfc, newCliente.id);
          clientesCreados++;
        }

        // 2. Obtener primer socio para creadoPor y autorizadoPor (valor por defecto)
        const defaultSocio = await tx.socio.findFirst({
          where: { activo: true },
          select: { id: true, nombre: true },
        });

        if (!defaultSocio) {
          throw new Error("No se encontró un socio activo para asignar como creador");
        }

        // 3. Procesar facturas nuevas
        for (const row of preview.nuevas) {
          try {
            // Obtener cliente ID
            let clienteProveedorId = row.clienteInfo.id;
            if (!clienteProveedorId) {
              clienteProveedorId = clientesCreatedMap.get(row.rfcClienteProveedor) || null;
            }

            if (!clienteProveedorId) {
              // Buscar por RFC en la base de datos
              const cliente = await tx.clienteProveedor.findFirst({
                where: { rfc: row.rfcClienteProveedor },
                select: { id: true },
              });
              clienteProveedorId = cliente?.id || null;
            }

            if (!clienteProveedorId) {
              resultados.push({
                rowNumber: row.rowNumber,
                folioFiscal: row.folioFiscal,
                status: "error",
                message: `No se encontró el cliente con RFC: ${row.rfcClienteProveedor}`,
              });
              errores++;
              continue;
            }

            // Determinar origen
            let tipoOrigen: "INGRESO" | "EGRESO" = "INGRESO";
            let origenId: string | null = null;

            if (row.vinculacion?.encontrado) {
              tipoOrigen = row.vinculacion.tipoOrigen;
              origenId = row.vinculacion.origenId;
            } else {
              // Si no hay vinculación, buscar un ingreso/egreso existente para vincular
              // o crear la factura sin vinculación (origenId vacío temporal)
              // Por ahora usamos un placeholder - esto se puede ajustar según requerimientos
              resultados.push({
                rowNumber: row.rowNumber,
                folioFiscal: row.folioFiscal,
                status: "skipped",
                message: "No se encontró Ingreso/Egreso para vincular con folioFiscal",
              });
              omitidas++;
              continue;
            }

            const newFactura = await tempFacturaRepository.create({
              tipoOrigen,
              origenId,
              clienteProveedorId,
              clienteProveedor: row.clienteProveedor,
              concepto: row.concepto,
              monto: row.monto,
              periodo: row.periodo,
              numeroFactura: row.numeroFactura,
              folioFiscal: row.folioFiscal,
              fechaEmision: row.fechaEmision,
              fechaVencimiento: row.fechaVencimiento,
              estado: "BORRADOR",
              formaPago: row.formaPago,
              rfcEmisor: row.rfcEmisor,
              rfcReceptor: row.rfcReceptor,
              direccionEmisor: row.direccionEmisor || "",
              direccionReceptor: row.direccionReceptor || "",
              numeroCuenta: row.numeroCuenta || "",
              clabe: row.clabe || "",
              banco: row.banco || "",
              fechaPago: null,
              fechaRegistro: new Date(),
              creadoPor: defaultSocio.nombre,
              creadoPorId: defaultSocio.id,
              autorizadoPor: defaultSocio.nombre,
              autorizadoPorId: defaultSocio.id,
              notas: row.notas || `Importado desde Excel: ${preview.fileName}`,
              ingresadoPor: usuarioId,
            });

            // Crear historial
            await tempHistorialService.createHistorialForNewFactura(
              newFactura,
              usuarioId
            );

            resultados.push({
              rowNumber: row.rowNumber,
              folioFiscal: row.folioFiscal,
              status: "created",
              message: "Factura creada exitosamente",
              facturaId: newFactura.id,
              clienteCreado: clientesCreatedMap.has(row.rfcClienteProveedor)
                ? {
                    id: clientesCreatedMap.get(row.rfcClienteProveedor)!,
                    nombre: row.clienteProveedor,
                    rfc: row.rfcClienteProveedor,
                  }
                : undefined,
            });
            creadas++;
          } catch (error) {
            resultados.push({
              rowNumber: row.rowNumber,
              folioFiscal: row.folioFiscal,
              status: "error",
              message: error instanceof Error ? error.message : "Error desconocido",
            });
            errores++;
          }
        }

        // 4. Procesar duplicadas que el usuario quiere actualizar
        const duplicadasAActualizar = options.actualizarTodasDuplicadas
          ? preview.duplicadas
          : preview.duplicadas.filter((d) =>
              options.duplicadasAActualizar.includes(d.existing.id)
            );

        for (const dup of duplicadasAActualizar) {
          try {
            const existingFactura = await tx.factura.findUnique({
              where: { id: dup.existing.id },
              include: {
                clienteProveedorRef: true,
                ingresadoPorRef: true,
                creadoPorRef: true,
                autorizadoPorRef: true,
              },
            });

            if (!existingFactura) {
              resultados.push({
                rowNumber: dup.row.rowNumber,
                folioFiscal: dup.row.folioFiscal,
                status: "error",
                message: "Factura existente no encontrada",
              });
              errores++;
              continue;
            }

            // Obtener cliente ID para la actualización
            let clienteProveedorId = dup.row.clienteInfo.id;
            if (!clienteProveedorId) {
              clienteProveedorId = clientesCreatedMap.get(dup.row.rfcClienteProveedor) || null;
            }
            if (!clienteProveedorId) {
              const cliente = await tx.clienteProveedor.findFirst({
                where: { rfc: dup.row.rfcClienteProveedor },
                select: { id: true },
              });
              clienteProveedorId = cliente?.id || existingFactura.clienteProveedorId;
            }

            const updatedFactura = await tempFacturaRepository.update({
              id: dup.existing.id,
              tipoOrigen: existingFactura.tipoOrigen,
              origenId: existingFactura.origenId,
              clienteProveedorId: clienteProveedorId!,
              clienteProveedor: dup.row.clienteProveedor,
              concepto: dup.row.concepto,
              monto: dup.row.monto,
              periodo: dup.row.periodo,
              numeroFactura: dup.row.numeroFactura,
              folioFiscal: dup.row.folioFiscal,
              fechaEmision: dup.row.fechaEmision,
              fechaVencimiento: dup.row.fechaVencimiento,
              estado: existingFactura.estado,
              formaPago: dup.row.formaPago,
              rfcEmisor: dup.row.rfcEmisor,
              rfcReceptor: dup.row.rfcReceptor,
              direccionEmisor: dup.row.direccionEmisor || existingFactura.direccionEmisor,
              direccionReceptor: dup.row.direccionReceptor || existingFactura.direccionReceptor,
              numeroCuenta: dup.row.numeroCuenta || existingFactura.numeroCuenta,
              clabe: dup.row.clabe || existingFactura.clabe,
              banco: dup.row.banco || existingFactura.banco,
              fechaPago: existingFactura.fechaPago,
              fechaRegistro: existingFactura.fechaRegistro,
              creadoPor: existingFactura.creadoPorRef?.nombre || defaultSocio.nombre,
              creadoPorId: existingFactura.creadoPorId || defaultSocio.id,
              autorizadoPor: existingFactura.autorizadoPorRef?.nombre || defaultSocio.nombre,
              autorizadoPorId: existingFactura.autorizadoPorId || defaultSocio.id,
              notas: dup.row.notas || existingFactura.notas,
            });

            // Crear historial de actualización
            await tempHistorialService.createHistorialForUpdate(
              existingFactura,
              updatedFactura,
              usuarioId
            );

            resultados.push({
              rowNumber: dup.row.rowNumber,
              folioFiscal: dup.row.folioFiscal,
              status: "updated",
              message: "Factura actualizada exitosamente",
              facturaId: updatedFactura.id,
            });
            actualizadas++;
          } catch (error) {
            resultados.push({
              rowNumber: dup.row.rowNumber,
              folioFiscal: dup.row.folioFiscal,
              status: "error",
              message: error instanceof Error ? error.message : "Error desconocido",
            });
            errores++;
          }
        }

        // Las duplicadas no seleccionadas se marcan como omitidas
        const duplicadasOmitidas = preview.duplicadas.filter(
          (d) =>
            !options.actualizarTodasDuplicadas &&
            !options.duplicadasAActualizar.includes(d.existing.id)
        );

        for (const dup of duplicadasOmitidas) {
          resultados.push({
            rowNumber: dup.row.rowNumber,
            folioFiscal: dup.row.folioFiscal,
            status: "skipped",
            message: "Factura duplicada - no seleccionada para actualizar",
          });
          omitidas++;
        }
      });

      return Ok({
        success: true,
        totalProcesadas: preview.totalRows,
        creadas,
        actualizadas,
        omitidas,
        errores,
        clientesCreados,
        resultados,
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al ejecutar la importación")
      );
    }
  }
}
