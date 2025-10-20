import { ReactNode } from "react";
import { Table } from "@tanstack/react-table";

// Interfaz base para filtros
export interface FilterComponentProps<TData = unknown> {
  table: Table<TData>;
  onGlobalFilterChange?: (value: string) => void;
}

// Interfaz para acciones de la tabla
export interface TableActionProps<TData = unknown> {
  table: Table<TData>;
  onAdd?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  customActions?: ReactNode;
}

// Interfaz para el componente de filtros personalizado
export interface CustomFilterComponent<TData = unknown> {
  component: React.ComponentType<FilterComponentProps<TData>>;
  props?: Record<string, unknown>;
}

// Interfaz para el componente de acciones personalizado
export interface CustomActionComponent<TData = unknown> {
  component: React.ComponentType<TableActionProps<TData>>;
  props?: Record<string, unknown>;
}

// Configuración de filtros
export interface FilterConfig {
  searchColumn?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  customFilter?: CustomFilterComponent<unknown>;
}

// Configuración de acciones
export interface ActionConfig {
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonIcon?: ReactNode;
  onAdd?: () => void;
  showExportButton?: boolean;
  onExport?: () => void;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  customActions?: ReactNode;
  customActionComponent?: CustomActionComponent<unknown>;
}

// Configuración de paginación
export interface PaginationConfig {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPaginationInfo?: boolean;
}

// Configuración de la tabla
export interface TableConfig<TData> {
  filters?: FilterConfig;
  actions?: ActionConfig;
  pagination?: PaginationConfig;
  emptyStateMessage?: string;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
}
