# DataTable Reutilizable

El componente `DataTable` ha sido refactorizado para ser completamente reutilizable y configurable. Ahora puedes usar filtros personalizados, acciones personalizadas y configuraciones específicas para cada módulo.

## Características

- ✅ **Filtros personalizados**: Puedes crear componentes de filtros específicos para cada módulo
- ✅ **Acciones personalizadas**: Botones de agregar, exportar, actualizar configurables
- ✅ **Paginación configurable**: Tamaños de página, opciones personalizables
- ✅ **Búsqueda flexible**: Columna de búsqueda configurable
- ✅ **Estado vacío personalizable**: Mensaje cuando no hay datos
- ✅ **Funcionalidades opcionales**: Ordenamiento, selección de filas, visibilidad de columnas

## Uso Básico

```tsx
import { DataTable } from "@/core/shared/components/DataTable";

function MiTabla() {
  return <DataTable columns={misColumnas} data={misDatos} />;
}
```

## Uso con Configuración Personalizada

```tsx
import { DataTable } from "@/core/shared/components/DataTable";
import { TableConfig } from "@/core/shared/components/DataTable/types";

function MiTabla() {
  const config: TableConfig<any> = {
    filters: {
      searchColumn: "nombre",
      searchPlaceholder: "Buscar por nombre...",
      showSearch: true,
    },
    actions: {
      showAddButton: true,
      addButtonText: "Agregar",
      onAdd: () => console.log("Agregar nuevo"),
    },
    pagination: {
      defaultPageSize: 20,
      showPageSizeSelector: true,
    },
    emptyStateMessage: "No hay datos disponibles.",
  };

  return <DataTable columns={misColumnas} data={misDatos} config={config} />;
}
```

## Uso con Filtros Personalizados

### 1. Crear un Componente de Filtros

```tsx
// components/MiFiltroPersonalizado.tsx
import { FilterComponentProps } from "@/core/shared/components/DataTable/types";

export function MiFiltroPersonalizado({
  table,
  onGlobalFilterChange,
}: FilterComponentProps<any>) {
  return (
    <div className="filtros-personalizados">
      {/* Tu lógica de filtros personalizada aquí */}
      <input
        placeholder="Buscar..."
        onChange={(e) => {
          table.getColumn("nombre")?.setFilterValue(e.target.value);
          onGlobalFilterChange?.(e.target.value);
        }}
      />
    </div>
  );
}
```

### 2. Usar el Filtro Personalizado

```tsx
import { DataTable } from "@/core/shared/components/DataTable";
import { MiFiltroPersonalizado } from "./components/MiFiltroPersonalizado";

function MiTabla() {
  const config: TableConfig<any> = {
    filters: {
      customFilter: {
        component: MiFiltroPersonalizado,
        props: {
          // Props adicionales para tu componente de filtros
        },
      },
    },
  };

  return <DataTable columns={misColumnas} data={misDatos} config={config} />;
}
```

## Configuración Completa

### FilterConfig

```tsx
interface FilterConfig {
  searchColumn?: string; // Columna por la que buscar
  searchPlaceholder?: string; // Placeholder del input de búsqueda
  showSearch?: boolean; // Mostrar input de búsqueda
  customFilter?: CustomFilterComponent<any>; // Componente de filtros personalizado
}
```

### ActionConfig

```tsx
interface ActionConfig {
  showAddButton?: boolean; // Mostrar botón de agregar
  addButtonText?: string; // Texto del botón de agregar
  addButtonIcon?: ReactNode; // Icono del botón de agregar
  onAdd?: () => void; // Función al hacer clic en agregar
  showExportButton?: boolean; // Mostrar botón de exportar
  onExport?: () => void; // Función al hacer clic en exportar
  showRefreshButton?: boolean; // Mostrar botón de actualizar
  onRefresh?: () => void; // Función al hacer clic en actualizar
  customActions?: ReactNode; // Acciones personalizadas
  customActionComponent?: CustomActionComponent<any>; // Componente de acciones personalizado
}
```

### PaginationConfig

```tsx
interface PaginationConfig {
  defaultPageSize?: number; // Tamaño de página por defecto
  pageSizeOptions?: number[]; // Opciones de tamaño de página
  showPageSizeSelector?: boolean; // Mostrar selector de tamaño
  showPaginationInfo?: boolean; // Mostrar información de paginación
}
```

## Ejemplos por Módulo

### Módulo de Ingresos

- Filtros: Búsqueda, tipo de ingreso, estado, rango de fechas
- Acciones: Agregar ingreso, exportar, actualizar

### Módulo de Egresos

- Filtros: Búsqueda, categoría, estado, rango de fechas, rango de monto
- Acciones: Agregar egreso, exportar, actualizar

### Módulo de Facturas

- Filtros: Búsqueda por número de factura (filtro simple)
- Acciones: Agregar factura, exportar, actualizar

## Ventajas del Nuevo Sistema

1. **Reutilización**: Un solo componente DataTable para todos los módulos
2. **Flexibilidad**: Filtros y acciones específicas para cada caso de uso
3. **Mantenibilidad**: Cambios centralizados en un solo lugar
4. **Consistencia**: UI/UX consistente en toda la aplicación
5. **Escalabilidad**: Fácil agregar nuevos módulos con sus propios filtros

## Migración

Para migrar tablas existentes:

1. Identifica los filtros específicos del módulo
2. Crea un componente de filtros personalizado
3. Configura el DataTable con el nuevo sistema
4. Prueba la funcionalidad

El sistema es retrocompatible, por lo que las tablas existentes seguirán funcionando con la configuración por defecto.
