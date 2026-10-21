import type { ColumnDef, ColumnOrderState } from "@tanstack/react-table";

/** Match TanStack IDs; preserve data order and keep the action menu last. */
export function reconcileColumnOrder<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  storedColumnOrder: ColumnOrderState,
): ColumnOrderState {
  const currentColumnIds = columns
    .map((col) => col.id ?? ("accessorKey" in col ? String(col.accessorKey) : ""))
    .filter(Boolean);

  const storedSet = new Set(storedColumnOrder);
  const newColumns = currentColumnIds.filter((id) => !storedSet.has(id));
  let result = [...storedColumnOrder];

  if (newColumns.includes("select")) result.unshift("select");
  const dataColumns = newColumns.filter((id) => id !== "select" && id !== "actions");
  const actionsIndex = result.indexOf("actions");
  result.splice(actionsIndex === -1 ? result.length : actionsIndex, 0, ...dataColumns);

  // Apply this even to complete saved orders, not only when columns are added.
  result = result.filter((id) => id !== "actions");
  if (currentColumnIds.includes("actions")) result.push("actions");
  return result;
}
