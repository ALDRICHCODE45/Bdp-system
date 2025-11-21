import { FileText } from "lucide-react";

export const FacturaActionsConfig = (
  onEdit: () => void,
  onDelete: () => void,
  onShowHistory: () => void,
  onExportPdf: () => void
) => [
  {
    id: "edit",
    label: "Editar",
    onClick: onEdit,
  },
  {
    id: "delete",
    label: "Eliminar",
    onClick: onDelete,
    variant: "destructive" as const,
  },
  {
    id: "history",
    label: "Historial",
    onClick: onShowHistory,
  },
  {
    id: "export",
    label: "Exportar",
    subItems: [
      { id: "export_pdf", icon: FileText, onClick: onExportPdf, label: "PDF" },
    ],
  },
];
