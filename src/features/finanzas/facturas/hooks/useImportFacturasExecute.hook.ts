import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeImportFacturasAction } from "../server/actions/executeImportFacturasAction";
import { toast } from "sonner";
import { ImportExcelPreviewDto, ImportOptionsDto } from "../server/dtos/ImportExcelPreviewDto.dto";
import { ImportExecutionResultDto } from "../server/dtos/ImportFacturaResultDto.dto";

type ExecuteImportParams = {
  preview: ImportExcelPreviewDto;
  options: ImportOptionsDto;
};

export const useImportFacturasExecute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      preview,
      options,
    }: ExecuteImportParams): Promise<ImportExecutionResultDto> => {
      const result = await executeImportFacturasAction(preview, options);
      if (!result.ok) {
        throw new Error(result.error || "Error al ejecutar la importación");
      }
      return result.data;
    },
    onSuccess: async (data) => {
      const { creadas, actualizadas, errores } = data;

      if (errores > 0) {
        toast.warning(
          `Importación completada: ${creadas} creadas, ${actualizadas} actualizadas, ${errores} errores`
        );
      } else {
        toast.success(
          `Importación exitosa: ${creadas} creadas, ${actualizadas} actualizadas`
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["facturas"],
      });
      await queryClient.refetchQueries({
        queryKey: ["facturas"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al ejecutar la importación");
    },
  });
};
