"use client";

import type { ReactNode } from "react";
import { Button } from "@/core/shared/ui/button";
import { ScrollArea } from "@/core/shared/ui/scroll-area";

export interface GenericResultsProps<TResult> {
  result: TResult;
  /** Render the summary cards (created/updated/skipped/errors). */
  renderSummary: (result: TResult) => ReactNode;
  /** Render the detail accordion content. */
  renderDetails: (result: TResult) => ReactNode;
  onClose: () => void;
  onReset: () => void;
}

export function GenericResults<TResult>({
  result,
  renderSummary,
  renderDetails,
  onClose,
  onReset,
}: GenericResultsProps<TResult>) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {renderSummary(result)}

      {/* Detail accordion */}
      <ScrollArea className="h-[300px] pr-4">{renderDetails(result)}</ScrollArea>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="flex-1">
          New import
        </Button>
        <Button onClick={onClose} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );
}
