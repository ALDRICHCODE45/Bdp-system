"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, Phone, Landmark } from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { createClienteProveedorActions } from "../forms/ClienteProveedorActions.config";
import { useDeleteClienteProveedor } from "../../hooks/useDeleteClienteProveedor.hook";
import type { ClienteProveedorDto } from "../../server/dtos/ClienteProveedorDto.dto";

const EditClienteProveedorSheet = dynamic(
  () =>
    import("../EditClienteProveedorSheet").then((mod) => ({
      default: mod.EditClienteProveedorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

const DeleteClienteProveedorAlertDialog = dynamic(
  () =>
    import("../DeleteClienteProveedorAlertDialog").then((mod) => ({
      default: mod.DeleteClienteProveedorAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

const ClienteProveedorHistorySheet = dynamic(
  () =>
    import("../ClienteProveedorHistorySheet").then((mod) => ({
      default: mod.ClienteProveedorHistorySheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

// ── Badge colors (mirror ClientesProveedoresTableColumns) ───────────────────
const TIPO_BADGE: Record<ClienteProveedorDto["tipo"], string> = {
  cliente: "bg-blue-100 text-blue-800",
  proveedor: "bg-purple-100 text-purple-800",
};

interface ClienteProveedorMobileCardProps {
  clienteProveedor: ClienteProveedorDto;
  onViewDetail: (clienteProveedor: ClienteProveedorDto) => void;
}

export function ClienteProveedorMobileCard({
  clienteProveedor,
  onViewDetail,
}: ClienteProveedorMobileCardProps) {
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();
  const {
    isOpen: isHistoryOpen,
    openModal: openHistory,
    closeModal: closeHistory,
  } = useModalState();

  const deleteClienteProveedorMutation = useDeleteClienteProveedor();

  const handleDelete = async () => {
    await deleteClienteProveedorMutation.mutateAsync(clienteProveedor.id);
  };

  // Reuses the same action config as the desktop row actions.
  const actions = createClienteProveedorActions(
    () => onViewDetail(clienteProveedor),
    openModal,
    openDeleteModal,
    openHistory,
  );

  const fechaRegistro = format(
    new Date(clienteProveedor.fechaRegistro),
    "dd MMM yyyy",
    { locale: es },
  );

  const socioNombre = clienteProveedor.socioResponsable?.nombre;

  return (
    <>
      <div className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors">
        {/* ── Línea 1: Tipo + Estado ─────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs capitalize shrink-0",
              TIPO_BADGE[clienteProveedor.tipo],
            )}
          >
            {clienteProveedor.tipo}
          </Badge>
          <Badge
            variant={clienteProveedor.activo ? "default" : "secondary"}
            className={cn(
              "text-xs shrink-0",
              clienteProveedor.activo
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800",
            )}
          >
            {clienteProveedor.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {/* ── Línea 2: Nombre + RFC ──────────────────────────────────────── */}
        <p className="font-medium text-sm leading-tight mb-0.5 truncate">
          {clienteProveedor.nombre}
        </p>
        <p className="font-mono text-xs text-muted-foreground truncate mb-2">
          {clienteProveedor.rfc}
        </p>

        {/* ── Línea 3: Datos de contacto ─────────────────────────────────── */}
        <div className="space-y-1 text-xs text-muted-foreground mb-2.5">
          {clienteProveedor.email && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{clienteProveedor.email}</span>
            </div>
          )}
          {clienteProveedor.telefono && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Phone className="size-3 shrink-0" />
              <span className="truncate">{clienteProveedor.telefono}</span>
            </div>
          )}
          {clienteProveedor.banco && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Landmark className="size-3 shrink-0" />
              <span className="truncate">{clienteProveedor.banco}</span>
            </div>
          )}
        </div>

        {/* ── Footer: fecha de registro + socio + acciones ───────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] text-muted-foreground">
              Registrado el {fechaRegistro}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              Socio: {socioNombre || "N/A"}
            </span>
          </div>

          {/* Dropdown mirrors ClienteProveedorRowActions */}
          <ColaboradorActionsDropdown actions={actions} />
        </div>
      </div>

      {/* ── Delete dialog (same permission as the action) ────────────────── */}
      <PermissionGuard
        permissions={[
          PermissionActions["clientes-proovedores"].eliminar,
          PermissionActions["clientes-proovedores"].gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteClienteProveedorAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDeleteModal}
            onConfirmDelete={handleDelete}
            clienteProveedorToDelete={clienteProveedor.nombre}
            isLoading={deleteClienteProveedorMutation.isPending}
          />
        )}
      </PermissionGuard>

      {/* ── Edit sheet ───────────────────────────────────────────────────── */}
      <PermissionGuard
        permissions={[
          PermissionActions["clientes-proovedores"].editar,
          PermissionActions["clientes-proovedores"].gestionar,
        ]}
      >
        {isOpen && (
          <EditClienteProveedorSheet
            clienteProveedor={clienteProveedor}
            isOpen={true}
            onClose={closeModal}
          />
        )}
      </PermissionGuard>

      {/* ── History sheet ────────────────────────────────────────────────── */}
      {isHistoryOpen && (
        <ClienteProveedorHistorySheet
          isOpen={true}
          onClose={closeHistory}
          clienteProveedorName={clienteProveedor.nombre}
          clienteProveedorId={clienteProveedor.id}
        />
      )}
    </>
  );
}
