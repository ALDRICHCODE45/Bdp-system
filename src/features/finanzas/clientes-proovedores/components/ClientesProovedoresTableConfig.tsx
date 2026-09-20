import { TableConfig } from "@/core/shared/components/DataTable/types";
import { ClienteProveedor } from "../types/ClienteProveedor.type";
import { Plus } from "lucide-react";
import { ClientesProovedoresTableFilters } from "./ClientesProovedoresTableFilters";
import { Table } from "@tanstack/react-table";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";

/**
 * Default visible columns.
 * New columns start hidden — the user enables them from the column selector.
 * `false` = hidden, `true` (or absent) = visible.
 */
export const clienteProveedorDefaultColumnVisibility = {
  // Visible by default
  tipo: true,
  nombre: true,
  rfc: true,
  email: true,
  telefono: true,
  activo: true,
  fechaRegistro: true,
  // Hidden by default
  contacto: false,
  banco: false,
  numeroCuenta: false,
  clabe: false,
  socioResponsable: false,
  direccion: false,
  notas: false,
  ingresadoPorNombre: false,
  archivos: false,
};

export const ClientesProovedoresTableConfig: TableConfig<ClienteProveedor> = {
  filters: {
    customFilter: {
      component: ClientesProovedoresTableFilters,
      props: {
        addButtonIcon: Plus,
        addButtonText: "Agregar Cliente/Proovedor",
        showAddButton: true,
      },
    },
    // searchColumn: "nombre",
    // searchPlaceholder: "Buscar por nombre del Proovedor",
    // showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: (table: Table<unknown>) => {
      exportToExcel(table as Table<ClienteProveedor>, "clientes-proveedores");
    },
    showAddButton: true,
    addButtonText: "Agregar Cliente/Proovedor",
  },
  emptyStateMessage: "No se encontraron Clientes o proovedores",
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 15, 20],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  enableColumnVisibility: true,
  enableRowSelection: true,
  enableSorting: true,
  columnOrder: {
    enabled: true,
    persistKey: "clientes-proveedores-table",
    defaultOrder: [
      "tipo",
      "nombre",
      "rfc",
      "email",
      "telefono",
      "activo",
      "fechaRegistro",
    ],
  },
  defaultColumnVisibility: clienteProveedorDefaultColumnVisibility,
};
