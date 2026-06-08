"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Generic import execute mutation hook.
 *
 * Wraps useMutation to call a server action that executes the import
 * (creates/updates records). Invalidates the provided query key on success.
 */

export interface UseImportExecuteOptions<TPreview, TResult> {
  /** Server action that executes the import. */
  mutationFn: (
    preview: TPreview,
    options: Record<string, unknown>
  ) => Promise<{ ok: boolean; data?: TResult; error?: string }>;
  /** Called with the result data on success. */
  onSuccess?: (result: TResult) => void;
  /** Query key(s) to invalidate after a successful import. */
  invalidateQueryKey?: readonly unknown[];
}

export interface ImportExecuteParams<TPreview> {
  preview: TPreview;
  options: Record<string, unknown>;
}

export function useImportExecute<TPreview, TResult>(
  opts: UseImportExecuteOptions<TPreview, TResult>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      preview,
      options,
    }: ImportExecuteParams<TPreview>): Promise<TResult> => {
      const result = await opts.mutationFn(preview, options);
      if (!result.ok) {
        throw new Error(result.error ?? "Error executing import");
      }
      return result.data as TResult;
    },
    onSuccess: async (data) => {
      opts.onSuccess?.(data);

      if (opts.invalidateQueryKey) {
        await queryClient.invalidateQueries({
          queryKey: opts.invalidateQueryKey as unknown[],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error executing the import");
    },
  });
}
