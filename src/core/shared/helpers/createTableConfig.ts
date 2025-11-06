import { TableConfig } from "@/core/shared/components/DataTable/types";

export const createTableConfig = <T>(
  baseConfig: TableConfig<T>,
  handlers: {
    onAdd?: () => void;
  }
): TableConfig<T> => {
  return {
    ...baseConfig,
    filters: {
      ...baseConfig.filters,
      customFilter: baseConfig.filters?.customFilter
        ? {
            ...baseConfig.filters.customFilter,
            props: {
              ...baseConfig.filters.customFilter.props,
              ...handlers,
            },
          }
        : undefined,
    },
    actions: {
      ...baseConfig.actions,
      // Actualizar onAdd directamente si no hay customFilter o si se necesita sobrescribir
      onAdd: handlers.onAdd || baseConfig.actions?.onAdd,
    },
  };
};
