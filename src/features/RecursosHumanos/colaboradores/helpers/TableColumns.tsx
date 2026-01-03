"use client";
import { Badge } from "@/core/shared/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { RhRowActions } from "../components/forms/RhFormRowActions";
import { ActivosRowPopOver } from "../components/ActivosRowPopOver";
import { format, parseISO } from "date-fns";
import { DireccionColaboradorDialog } from "../components/DireccionColaboradorDialog";
import { ColaboradorReferenciaPersonalDialog } from "../components/ColaboradorReferenciaPersonalDialog";
import { ColaboradorReferenciaLaboralDialog } from "../components/ColaboradorReferenciaLaboral";

export const columns: ColumnDef<ColaboradorDto>[] = [
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("name")}</div>
    ),
    size: 20,
  },
  {
    header: "Correo",
    accessorKey: "correo",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("correo")}</div>
    ),
    size: 25,
  },
  {
    header: "Puesto",
    accessorKey: "puesto",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("puesto")}</div>
    ),
    size: 15,
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "CONTRATADO" ? "success-outline" : "warning-outline"
          }
        >
          {status === "CONTRATADO" ? "Contratado" : "Despedido"}
        </Badge>
      );
    },
    size: 8,
  },
  {
    header: "IMSS",
    accessorKey: "imss",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("imss") ? "success-outline" : "warning-outline"}
        className={"text-xs"}
      >
        {row.getValue("imss") ? "Sí" : "No"}
      </Badge>
    ),
    size: 6,
  },
  {
    header: "Socio Responsable",
    accessorKey: "socio",
    cell: ({ row }) => {
      const socio = row.getValue("socio") as { nombre: string } | null;
      return (
        <div className="text-sm truncate">
          {socio ? socio.nombre : "Sin asignar"}
        </div>
      );
    },
    size: 12,
  },
  {
    header: "Banco",
    accessorKey: "banco",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("banco")}</div>
    ),
    size: 8,
  },
  {
    header: "CLABE",
    accessorKey: "clabe",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">{row.getValue("clabe")}</div>
    ),
    size: 10,
  },
  {
    header: "Sueldo",
    accessorKey: "sueldo",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sueldo"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);

      return <div className="font-medium truncate">{formatted}</div>;
    },
    size: 10,
  },
  {
    header: "Activos",
    accessorKey: "activos",
    cell: ({ row }) => {
      return <ActivosRowPopOver row={row} />;
    },
    size: 10,
  },
  //Datos personales
  {
    header: "Fecha Ingreso",
    accessorKey: "Fechaingreso",
    cell: ({ row }) => {
      const fecha = parseISO(row.original.fechaIngreso);
      return (
        <>
          <div>{format(fecha, "MM/dd/yyyy")}</div>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Genero",
    accessorKey: "genero",
    cell: ({ row }) => {
      const genero = row.original.genero ?? "N/A";
      return (
        <>
          <div>{genero}</div>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Fecha Nacimiento",
    accessorKey: "Fecha nacimiento",
    cell: ({ row }) => {
      return (
        <>
          <div>
            {row.original.fechaNacimiento
              ? format(row.original.fechaNacimiento, "MM/dd/yyyy")
              : "N/A"}
          </div>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Nacionalidad",
    accessorKey: "nacionalidad",
    cell: ({ row }) => {
      const nacionalidad = row.original.nacionalidad ?? "N/A";
      return (
        <>
          <div>{nacionalidad}</div>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Estado Civil",
    accessorKey: "EstadoCivil",
    cell: ({ row }) => {
      const estadoCivil = row.original.estadoCivil ?? "N/A";
      return (
        <>
          <div>{estadoCivil}</div>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Tipo de Sangre",
    accessorKey: "tipoSangre",
    cell: ({ row }) => {
      const tipoSangre = row.original.tipoSangre ?? "N/A";
      return (
        <>
          <div>{tipoSangre}</div>
        </>
      );
    },
    size: 10,
  },
  //Contacto y direccion
  {
    header: "Direccion",
    accessorKey: "tipoSangre",
    cell: ({ row }) => {
      const direccion =
        row.original.direccion ??
        "Este colaborador no tiene una direccion asignada";
      return (
        <>
          <DireccionColaboradorDialog direccion={direccion} />
        </>
      );
    },
    size: 10,
  },

  {
    header: "Telefono",
    accessorKey: "telefono",
    cell: ({ row }) => {
      const telefono = row.original.telefono ?? "N/A";
      return (
        <>
          <p>{telefono}</p>
        </>
      );
    },
    size: 10,
  },
  //Datos fiscales
  {
    header: "RFC",
    accessorKey: "RFC",
    cell: ({ row }) => {
      const rfc = row.original.rfc ?? "N/A";
      return (
        <>
          <p>{rfc}</p>
        </>
      );
    },
    size: 10,
  },
  {
    header: "CURP",
    accessorKey: "CURP",
    cell: ({ row }) => {
      const curp = row.original.curp ?? "N/A";
      return (
        <>
          <p>{curp}</p>
        </>
      );
    },
    size: 10,
  },
  //Academicos y laborales previos

  {
    header: "Estudios",
    accessorKey: "estudios",
    cell: ({ row }) => {
      const estudios = row.original.ultimoGradoEstudios ?? "N/A";
      return (
        <>
          <p>{estudios}</p>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Escuela",
    accessorKey: "escuela",
    cell: ({ row }) => {
      const escuela = row.original.escuela ?? "N/A";
      return (
        <>
          <p>{escuela}</p>
        </>
      );
    },
    size: 10,
  },
  {
    header: "Ultimo Empleo",
    accessorKey: "ultimoEmpleo",
    cell: ({ row }) => {
      const ultimoEmpleo = row.original.ultimoTrabajo ?? "N/A";
      return (
        <>
          <p>{ultimoEmpleo}</p>
        </>
      );
    },
    size: 10,
  },
  //Referencias personales
  {
    header: "Referencia Personal",
    accessorKey: "referenciaPersonal",
    cell: ({ row }) => {
      const nombreReferenciaPersonal =
        row.original.nombreReferenciaPersonal ?? "N/A";

      const telefonoReferenciaPersonal =
        row.original.telefonoReferenciaPersonal ?? "N/A";

      const parentescoReferenciaPersonal =
        row.original.parentescoReferenciaPersonal ?? "N/A";

      const colaboradorName = row.original.name;

      return (
        <>
          <ColaboradorReferenciaPersonalDialog
            telefono={telefonoReferenciaPersonal}
            parentesco={parentescoReferenciaPersonal}
            nombre={nombreReferenciaPersonal}
            colaboradorName={colaboradorName}
          />
        </>
      );
    },
    size: 10,
  },

  //Referencias Laborales
  {
    header: "Referencia Laboral",
    accessorKey: "ReferenciaLaboral",

    cell: ({ row }) => {
      const nombreReferenciaLaboral =
        row.original.nombreReferenciaLaboral ?? "N/A";

      const telefonoReferenciaLaboral =
        row.original.telefonoReferenciaLaboral ?? "N/A";

      const colaboradorName = row.original.name;

      return (
        <>
          <ColaboradorReferenciaLaboralDialog
            telefono={telefonoReferenciaLaboral}
            nombre={nombreReferenciaLaboral}
            colaboradorName={colaboradorName}
          />
        </>
      );
    },
    size: 10,
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RhRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
