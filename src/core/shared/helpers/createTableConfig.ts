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
  };
};
