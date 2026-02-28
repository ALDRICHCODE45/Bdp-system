import { Table } from "@tanstack/react-table";
import { CSSProperties } from "react";

export interface StickyOffset {
  position: "left" | "right";
  offset: number;
}

export function calculateStickyOffsets<TData>(
  table: Table<TData>
): Map<string, StickyOffset> {
  const offsets = new Map<string, StickyOffset>();
  const leftPinned = table.getLeftLeafColumns();
  const rightPinned = table.getRightLeafColumns();

  let leftOffset = 0;
  for (const col of leftPinned) {
    offsets.set(col.id, { position: "left", offset: leftOffset });
    leftOffset += col.getSize();
  }

  let rightOffset = 0;
  for (const col of [...rightPinned].reverse()) {
    offsets.set(col.id, { position: "right", offset: rightOffset });
    rightOffset += col.getSize();
  }

  return offsets;
}

export function getStickyStyles(offset: StickyOffset | undefined): CSSProperties {
  if (!offset) return {};
  return {
    position: "sticky",
    [offset.position]: `${offset.offset}px`,
    zIndex: 1,
    backgroundColor: "hsl(var(--background))",
  };
}
