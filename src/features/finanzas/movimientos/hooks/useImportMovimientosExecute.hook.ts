import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeImportMovimientosAction } from "../server/actions/executeImportMovimientosAction";
import type { MovimientoImportResultDto } from "../server/dtos/MovimientoImportResultDto.dto";
import { toast } from "sonner";

/**
 * Mutation hook for executing a movimientos Excel import.
 * Accepts the tempFileKey returned by the preview step.
 */
export const useImportMovimientosExecute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      tempFileKey: string;
    }): Promise<MovimientoImportResultDto> => {
      const result = await executeImportMovimientosAction(input);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al ejecutar la importacion"
        );
      }
      return result.data;
    },
    onSuccess: async (data) => {
      const { created, skipped, errors } = data;

      if (errors > 0) {
        toast.warning(
          `Importacion completada: ${created} creados, ${skipped} omitidos, ${errors} errores`
        );
      } else {
        toast.success(
          `Importacion exitosa: ${created} creados, ${skipped} omitidos`
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["movimientos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al ejecutar la importacion");
    },
  });
};
