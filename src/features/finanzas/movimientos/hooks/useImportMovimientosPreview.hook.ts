import { useMutation } from "@tanstack/react-query";
import { previewImportMovimientosAction } from "../server/actions/previewImportMovimientosAction";
import type { MovimientoImportPreviewDto } from "../server/dtos/MovimientoImportPreviewDto.dto";
import { toast } from "sonner";

/**
 * Mutation hook for previewing a movimientos Excel import.
 * Accepts a File, builds FormData internally.
 */
export const useImportMovimientosPreview = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<MovimientoImportPreviewDto> => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await previewImportMovimientosAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al procesar el archivo");
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al procesar el archivo Excel");
    },
  });
};
