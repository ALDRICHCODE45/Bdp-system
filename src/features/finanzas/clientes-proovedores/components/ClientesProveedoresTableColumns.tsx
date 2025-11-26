"use client";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";
import { ClienteProveedorRowActions } from "./forms/ClienteProveedorRowActions";
import { ViewNotesColumn } from "./tableColumnsComponents/ViewNotesColumn";
import { ViewAddressColumn } from "./tableColumnsComponents/ViewAddressColumn";
import { ViewClabeInterbancariaPopOver } from "./tableColumnsComponents/ViewClabeInterbancariaPopOver";
import { ViewFechaRegistroColumn } from "./tableColumnsComponents/ViewFechaRegistroColumns";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { UploadClienteProveedorColumn } from "./columns/UploadClienteProveedorColumn";

export const columns: ColumnDef<ClienteProveedorDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 4,
    minSize: 4,
    maxSize: 4,
  },
  {
    header: "Tipo",
    accessorKey: "tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as "cliente" | "proveedor";
      return (
        <Badge
          variant={tipo === "cliente" ? "default" : "secondary"}
          className={cn(
            "text-xs capitalize",
            tipo === "cliente"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          )}
        >
          {tipo}
        </Badge>
      );
    },
    size: 10,
  },
  {
    header: "Nombre",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("nombre")}</div>
    ),
    size: 20,
  },
  {
    header: "RFC",
    accessorKey: "rfc",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">{row.getValue("rfc")}</div>
    ),
    size: 15,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("email")}</div>
    ),
    size: 20,
  },
  {
    header: "Teléfono",
    accessorKey: "telefono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono") as string;
      return <div className="text-sm truncate">{telefono}</div>;
    },
    size: 15,
  },
  {
    header: "Contacto",
    accessorKey: "contacto",
    cell: ({ row }) => {
      const contacto = row.getValue("contacto") as string;
      return <div className="text-sm truncate">{contacto}</div>;
    },
    size: 15,
  },
  {
    header: "Banco",
    accessorKey: "banco",
    cell: ({ row }) => {
      const banco = row.getValue("banco") as string;
      return <div className="text-sm truncate">{banco}</div>;
    },
    size: 15,
  },
  {
    header: "No. Cuenta",
    accessorKey: "numeroCuenta",
    cell: ({ row }) => {
      const cuenta = row.getValue("numeroCuenta") as string;
      return <div className="text-sm truncate">{cuenta}</div>;
    },
    size: 15,
  },
  {
    header: "Clabe Interbancaria",
    accessorKey: "clabe",
    cell: ({ row }) => {
      return (
        <section className="flex justify-center">
          <ViewClabeInterbancariaPopOver column={row} />
        </section>
      );
    },
    size: 15,
  },
  {
    header: "Fecha de Registro",
    accessorKey: "fechaRegistro",
    cell: ({ row }) => {
      return (
        <section className="flex justify-center">
          <ViewFechaRegistroColumn column={row} />
        </section>
      );
    },
    size: 15,
  },
  {
    header: "Socio Responsable",
    accessorKey: "socioResponsable",
    cell: ({ row }) => {
      const socio = row.original.socioResponsable;
      return <div className="text-sm truncate">{socio?.nombre || "N/A"}</div>;
    },
    size: 15,
  },

  {
    header: "Direccion",
    accessorKey: "direccion",
    cell: ({ row }) => {
      return <ViewAddressColumn column={row} />;
    },
    size: 5,
  },
  {
    header: "Notas",
    accessorKey: "notas",
    cell: ({ row }) => {
      return <ViewNotesColumn column={row} />;
    },
    size: 5,
  },
  {
    header: "Estado",
    accessorKey: "activo",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("activo") ? "default" : "secondary"}
        className={cn(
          "text-xs",
          row.getValue("activo")
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {row.getValue("activo") ? "Activo" : "Inactivo"}
      </Badge>
    ),
    size: 10,
  },
  {
    header: "Ingresado Por",
    accessorKey: "ingresadoPorNombre",
    cell: ({ row }) => {
      const ingresadoPorNombre = row.getValue("ingresadoPorNombre") as string | null;
      return (
        <div className="text-sm truncate">
          {ingresadoPorNombre || <span className="text-gray-400">N/A</span>}
        </div>
      );
    },
    size: 15,
  },
  {
    id: "archivos",
    header: "Archivos",
    cell: ({ row }) => {
      const clienteProveedor = row.original;
      return (
        <UploadClienteProveedorColumn clienteProveedorId={clienteProveedor.id} />
      );
    },
    size: 9,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <ClienteProveedorRowActions row={row} />,
    size: 1,
    enableHiding: false,
  },
];
