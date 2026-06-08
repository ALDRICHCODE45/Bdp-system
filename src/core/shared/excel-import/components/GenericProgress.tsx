"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/core/shared/ui/progress";

export interface GenericProgressProps {
  message?: string;
}

export function GenericProgress({
  message = "Processing import...",
}: GenericProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>

      <div className="space-y-2 text-center">
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">
          Please wait while the data is being processed...
        </p>
      </div>

      <div className="w-full max-w-xs">
        <Progress value={undefined} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground">
        This process may take several seconds depending on the amount of data.
      </p>
    </div>
  );
}
