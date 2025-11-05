"use client";
import { Row } from "@tanstack/react-table";
import { UserDto } from "../../server/dtos/UserDto.dto";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Button } from "@/core/shared/ui/button";
import { EllipsisIcon } from "lucide-react";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";

const EditUserSheet = dynamic(
  () =>
    import("../EditUserSheet").then((mod) => ({
      default: mod.EditUserSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);
export function RowCellActions({ row }: { row: Row<UserDto> }) {
  const {
    isOpen: isEditUserModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
    modalType: editModalType,
  } = useModalState();

  const handleEditModal = () => {
    openEditModal("add");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              handleEditModal();
            }}
          >
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal con lazy loading */}
      {isEditUserModalOpen && editModalType === "add" && (
        <EditUserSheet
          isOpen={true}
          onClose={closeEditModal}
          mode="add"
          userId={row.original.id}
        />
      )}
    </>
  );
}
