import { TableConfig, ServerSideConfig } from "@/core/shared/components/DataTable/types";

export const createTableConfig = <T>(
  baseConfig: TableConfig<T>,
  handlers: {
    onAdd?: () => void;
    onImport?: () => void;
    onBulkDelete?: (rows: T[]) => void;
    serverSide?: ServerSideConfig;
    /** Props adicionales para el componente customFilter (server-side filters, etc.) */
    customFilterProps?: Record<string, unknown>;
    [key: string]: unknown;
  }
): TableConfig<T> => {
  const { onBulkDelete, serverSide, customFilterProps, onAdd, onImport, ...rest } = handlers;

  // Props base del customFilter + props explícitos (customFilterProps) + otros handlers residuales
  const mergedCustomFilterProps = {
    ...baseConfig.filters?.customFilter?.props,
    // handlers que el customFilter puede necesitar directamente
    ...(onAdd ? { onAdd } : {}),
    ...(onImport ? { onImport } : {}),
    ...rest,
    // customFilterProps tiene prioridad — son los filtros controlados
    ...(customFilterProps ?? {}),
  };

  return {
    ...baseConfig,
    filters: {
      ...baseConfig.filters,
      customFilter: baseConfig.filters?.customFilter
        ? {
            ...baseConfig.filters.customFilter,
            props: mergedCustomFilterProps,
          }
        : undefined,
    },
    actions: {
      ...baseConfig.actions,
      onAdd: onAdd ?? baseConfig.actions?.onAdd,
      ...(onBulkDelete !== undefined
        ? { onBulkDelete: onBulkDelete as (rows: unknown[]) => void }
        : {}),
    },
    ...(serverSide !== undefined ? { serverSide } : {}),
  };
};
