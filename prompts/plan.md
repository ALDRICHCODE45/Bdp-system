Actúas como un Ingeniero de Software Senior Fullstack. Tu objetivo es implementar una funcionalidad de importación de facturas mediante archivos Excel en el módulo de Finanzas.

Fase 1: Análisis de Arquitectura y Base de Datos

    Analiza el schema.prisma para identificar los modelos de Factura, Cliente, Ingreso y Egreso.

    Verifica si el campo de Folio Fiscal (o identificador único de la factura) está indexado.

    Evalúa las relaciones: si es necesario modificar el esquema para permitir facturas sin cliente o sin relación a ingresos/egresos, hazlo inmediatamente.

Fase 2: Lógica de Validación y Control de Duplicados Antes de procesar cada fila del Excel, el sistema debe realizar la siguiente validación:

    Detección de Duplicados: Buscar si ya existe una factura con el mismo Folio Fiscal.

    Intervención del Usuario: Si la factura ya existe, el sistema no debe crearla de nuevo. En su lugar, debe preguntar al usuario mediante la interfaz: "La factura [Folio] ya existe dentro del sistema. ¿Deseas editarla con los campos nuevos?"

        Si el usuario acepta: Actualizar los campos de la factura existente con los datos del Excel.

        Si el usuario rechaza: Ignorar esa fila y no realizar ninguna acción.

Fase 3: Implementación de la Feature

    Frontend (UI/UX):

        Botón "Importar Excel" en la tabla de facturas.

        Dialog de Shadcn con un Dropzone.

        Flujo de confirmación para:

            Creación de nuevos Clientes (si no existen).

            Vinculación/Creación de Ingresos o Egresos.

            Resolución de conflictos (Duplicados encontrados).

    Backend:

        Procesamiento de Excel (usa xlsx o exceljs).

        Lógica condicional: Crear factura de forma independiente si el usuario opta por no vincular Clientes/Ingresos/Egresos.

Fase 4: Reglas Técnicas y Ejecución

    Documentación: Usa el MCP de Context7 para librerías técnicas y el MCP de Shadcn para componentes de UI.

    Base de Datos: Si modificas el schema, ejecuta: bunx prisma migrate dev --name <nombre_migracion>.

    Comandos: Usa exclusivamente bun (bun run build, etc.).

    Autonomía: Tienes libertad total de ejecución. No pidas permiso para ejecutar comandos.

Fase 5: Validación de Producción Al terminar, ejecuta bun run build para asegurar que el proyecto compile sin errores y el tipado sea correcto.
