export function getColumnMinWidth(size: number, columnId?: string): number {
  if (columnId === "select" || columnId === "actions") return 48;
  return Math.max(size * 7, 60);
}
