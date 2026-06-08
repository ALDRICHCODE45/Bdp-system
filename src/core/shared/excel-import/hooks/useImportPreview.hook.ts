"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Generic import preview mutation hook.
 *
 * Wraps useMutation to call a server action that parses an Excel file
 * and returns a preview DTO. The caller provides the action via mutationFn.
 */

export interface UseImportPreviewOptions<TPreview> {
  /** Server action that accepts FormData and returns the preview result. */
  mutationFn: (
    formData: FormData
  ) => Promise<{ ok: boolean; data?: TPreview; error?: string }>;
  /** Called with the preview data on success. */
  onSuccess?: (preview: TPreview) => void;
}

export function useImportPreview<TPreview>(
  opts: UseImportPreviewOptions<TPreview>
) {
  return useMutation({
    mutationFn: async (file: File): Promise<TPreview> => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await opts.mutationFn(formData);
      if (!result.ok) {
        throw new Error(result.error ?? "Error processing file");
      }
      return result.data as TPreview;
    },
    onSuccess: (data) => {
      opts.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error processing the Excel file");
    },
  });
}
