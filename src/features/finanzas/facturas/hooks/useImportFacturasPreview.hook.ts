import { useMutation } from "@tanstack/react-query";
import { previewImportFacturasAction } from "../server/actions/previewImportFacturasAction";
import { toast } from "sonner";
import { ImportExcelPreviewDto } from "../server/dtos/ImportExcelPreviewDto.dto";

export const useImportFacturasPreview = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<ImportExcelPreviewDto> => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await previewImportFacturasAction(formData);
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
