# Patrón de Modales para Tablas

Este patrón permite manejar la apertura de modales, sheets, drawers, etc. desde los botones de las tablas de forma escalable y mantenible.

## Componentes Creados

### 1. `useModalState` Hook

Maneja el estado de los modales, sheets, drawers, etc. de forma centralizada.

```typescript
const { isOpen, openModal, closeModal } = useModalState();

// Abrir modal
openModal();

// Cerrar modal
closeModal();
```

### 2. `createTableConfig` Helper

Simplifica la configuración de tablas con handlers.

```typescript
const tableConfig = createTableConfig(MyTableConfig, {
  onAdd: handleAdd,
});
```

## Cómo Implementar en Otras Tablas

### Paso 1: Crear el Modal

```typescript
// components/MyEntityModal.tsx
export const MyEntityModal = ({
  isOpen,
  onClose,
  mode,
}: MyEntityModalProps) => {
  // Implementación del modal
};
```

### Paso 2: Actualizar la Página de la Tabla

```typescript
// pages/MyEntityTablePage.tsx
"use client";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";

// Lazy loading del modal
const MyEntityModal = dynamic(
  () =>
    import("../components/MyEntityModal").then((mod) => ({
      default: mod.MyEntityModal,
    })),
  {
    ssr: false,
    loading: () => <div>Cargando modal...</div>,
  }
);

export const MyEntityTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(MyEntityTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation />
      <DataTable config={tableConfig} />

      {/* Modal con lazy loading */}
      {isOpen && (
        <MyEntityModal isOpen={true} onClose={closeModal} mode="add" />
      )}
    </div>
  );
};
```

### Paso 3: Actualizar el Componente de Filtros

```typescript
// components/MyEntityTableFilters.tsx
interface MyEntityTableFilters extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  onAdd?: () => void; // ← Agregar esta prop
}

export const MyEntityTableFilters = ({
  // ... otras props
  onAdd, // ← Agregar esta prop
}: MyEntityTableFilters) => {
  return (
    <FilterHeaderActions
      // ... otras props
      onAdd={onAdd} // ← Pasar la prop
    />
  );
};
```

## Ventajas del Patrón

✅ **Mantenible**: Lógica centralizada en hooks reutilizables
✅ **Limpia**: Separación clara de responsabilidades  
✅ **Reutilizable**: Mismo patrón para todas las tablas
✅ **Escalable**: Fácil agregar nuevos tipos de acciones
✅ **Type-safe**: TypeScript garantiza consistencia
✅ **Eficiente**: Lazy loading de modales
✅ **Consistente**: Mismo comportamiento en todas las tablas

## Notas Importantes

- Los modales solo se renderizan cuando `isOpen` es `true`
- El lazy loading evita cargar JavaScript innecesario
- El patrón está optimizado para Next.js 15
- Se puede extender fácilmente para otros tipos de modales (edit, delete, view)
