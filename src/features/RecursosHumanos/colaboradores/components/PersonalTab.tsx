"use client";

import { useState } from "react";
import {
  AlertCircle,
  Mail,
  MapPin,
  Phone,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/core/shared/ui/field";
import { Separator } from "@/core/shared/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/shared/ui/alert-dialog";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
} from "../hooks/useEmergencyContacts.hook";

interface PersonalTabProps {
  colaborador: ColaboradorDto;
}

/**
 * P3 — cap4 + cap6 collaborator profile: Personal tab.
 *
 * Two stacked sections:
 *
 * 1. Datos personales (read-only). The corporate email is rendered here as
 *    a strict read-only label and is NOT editable from this tab — preserving
 *    the Asistencia FK semantics (CC6). Editing all of these fields happens
 *    through the existing `EditColaboradorSheet` mounted by the profile
 *    identity rail (separate workstream).
 *
 * 2. Emergency Contacts (CRUD via TanStack Query + Server Actions). All
 *    mutations are gated by `colaboradores:editar` (CC1/CC8). The list
 *    itself only requires `colaboradores:acceder`.
 *
 * No fabrication: any field with a missing/null value renders an honest
 * "Sin registrar" or similar — never a fake placeholder (cap4 req4 / req6).
 */
export function PersonalTab({ colaborador }: PersonalTabProps) {
  return (
    <div className="space-y-6">
      <PersonalDataGrid colaborador={colaborador} />
      <EmergencyContactsSection colaboradorId={colaborador.id} />
    </div>
  );
}

/* ── Datos personales — read-only grid ──────────────────────────────── */

function PersonalDataGrid({ colaborador }: { colaborador: ColaboradorDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos personales</CardTitle>
        <CardDescription>
          Información personal del colaborador. Se edita desde el botón
          &quot;Editar&quot; de la barra lateral (no desde esta pestaña).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <PersonalField label="Nombre completo" value={colaborador.name} placeholder="Sin registrar" />
          <PersonalField
            label="Nombre preferido"
            value={colaborador.nombrePreferido}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="Documento de identidad"
            value={colaborador.documentoIdentidad}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="Nacionalidad"
            value={colaborador.nacionalidad}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="Fecha de nacimiento"
            value={formatDate(colaborador.fechaNacimiento)}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="Género"
            value={colaborador.genero}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="Estado civil"
            value={colaborador.estadoCivil}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="Tipo de sangre"
            value={colaborador.tipoSangre}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="RFC"
            value={colaborador.rfc}
            placeholder="Sin registrar"
          />
          <PersonalField
            label="CURP"
            value={colaborador.curp}
            placeholder="Sin registrar"
          />
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <PersonalField
            icon={MapPin}
            label="Dirección"
            value={colaborador.direccion}
            placeholder="Sin registrar"
          />
          <PersonalField
            icon={Phone}
            label="Teléfono"
            value={colaborador.telefono}
            placeholder="Sin registrar"
          />
          <PersonalField
            icon={Mail}
            label="Email personal"
            value={colaborador.emailPersonal}
            placeholder="Sin registrar"
          />
          {/* Corporate correo is INTENTIONALLY rendered as a read-only
              label and NOT editable here: its value backs the Asistencia
              FK (CC6). Replacing or clearing it is a data-integrity break
              that we deliberately do not expose from this tab. */}
          <ReadOnlyCorporateEmail value={colaborador.correo} />
        </div>
      </CardContent>
    </Card>
  );
}

function ReadOnlyCorporateEmail({ value }: { value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Mail className="h-3 w-3" />
        Correo corporativo
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground break-all">
          {value}
        </span>
        <Badge variant="outline" className="text-[10px]">
          Solo lectura
        </Badge>
      </div>
    </div>
  );
}

function PersonalField({
  icon: Icon,
  label,
  value,
  placeholder,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  placeholder: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>
      <div
        className={
          hasValue
            ? "text-sm font-medium text-foreground break-words"
            : "text-sm italic text-muted-foreground"
        }
      >
        {hasValue ? value : placeholder}
      </div>
    </div>
  );
}

/* ── Emergency Contacts CRUD section ───────────────────────────────── */

function EmergencyContactsSection({ colaboradorId }: { colaboradorId: string }) {
  const { data, isLoading } = useEmergencyContacts(colaboradorId);

  const sortedContacts = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Contactos de emergencia
          </CardTitle>
          <CardDescription>
            Personas a contactar en caso de una emergencia.
          </CardDescription>
        </div>
        <PermissionGuard
          permissions={[
            PermissionActions.colaboradores.editar,
            PermissionActions.colaboradores.gestionar,
          ]}
        >
          <AddEmergencyContactForm colaboradorId={colaboradorId} />
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando contactos…</p>
        ) : sortedContacts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Aún no hay contactos registrados. Agrega al menos uno para
              mantener a familiares o personas cercanas localizables.
            </span>
          </div>
        ) : (
          <ul className="divide-y">
            {sortedContacts.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {c.nombre}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({c.parentesco})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.telefono}
                    </span>
                    {c.email ? (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                    ) : null}
                  </div>
                  {c.notas ? (
                    <p className="text-xs text-muted-foreground italic">
                      {c.notas}
                    </p>
                  ) : null}
                </div>
                <PermissionGuard
                  permissions={[
                    PermissionActions.colaboradores.editar,
                    PermissionActions.colaboradores.gestionar,
                  ]}
                >
                  <DeleteEmergencyContactButton
                    id={c.id}
                    nombre={c.nombre}
                    colaboradorId={colaboradorId}
                  />
                </PermissionGuard>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AddEmergencyContactForm({
  colaboradorId,
}: {
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  const [nombreError, setNombreError] = useState<string | null>(null);
  const [parentescoError, setParentescoError] = useState<string | null>(null);
  const [telefonoError, setTelefonoError] = useState<string | null>(null);

  const create = useCreateEmergencyContact(colaboradorId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const nombre = (fd.get("nombre") as string | null)?.trim() ?? "";
    const parentesco = (fd.get("parentesco") as string | null)?.trim() ?? "";
    const telefono = (fd.get("telefono") as string | null)?.trim() ?? "";

    const newNombreError = nombre ? null : "El nombre es requerido";
    const newParentescoError = parentesco ? null : "El parentesco es requerido";
    const newTelefonoError = telefono ? null : "El teléfono es requerido";
    setNombreError(newNombreError);
    setParentescoError(newParentescoError);
    setTelefonoError(newTelefonoError);
    if (newNombreError || newParentescoError || newTelefonoError) {
      return;
    }

    // Ensure route-bound id is always present in the FormData
    fd.set("colaboradorId", colaboradorId);

    create.mutate(fd, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        setNombreError(null);
        setParentescoError(null);
        setTelefonoError(null);
      },
    });
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <UserPlus className="h-4 w-4" />
        Agregar contacto
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mt-3 rounded-md border bg-muted/30 p-4 space-y-3"
    >
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field data-invalid={Boolean(nombreError)}>
            <FieldLabel>Nombre</FieldLabel>
            <Input name="nombre" placeholder="Ej. María López" />
            {nombreError ? (
              <FieldError errors={[{ message: nombreError } as never]} />
            ) : null}
          </Field>
          <Field data-invalid={Boolean(parentescoError)}>
            <FieldLabel>Parentesco</FieldLabel>
            <Input name="parentesco" placeholder="Ej. Madre" />
            {parentescoError ? (
              <FieldError errors={[{ message: parentescoError } as never]} />
            ) : null}
          </Field>
          <Field data-invalid={Boolean(telefonoError)}>
            <FieldLabel>Teléfono</FieldLabel>
            <Input name="telefono" placeholder="55 0000 0000" />
            {telefonoError ? (
              <FieldError errors={[{ message: telefonoError } as never]} />
            ) : null}
          </Field>
          <Field>
            <FieldLabel>Email (opcional)</FieldLabel>
            <Input
              name="email"
              type="email"
              placeholder="maria@correo.com"
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel>Notas (opcional)</FieldLabel>
            <Input name="notas" placeholder="Información adicional" />
          </Field>
        </div>
      </FieldGroup>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setNombreError(null);
            setParentescoError(null);
            setTelefonoError(null);
          }}
          disabled={create.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={create.isPending}>
          {create.isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}

function DeleteEmergencyContactButton({
  id,
  nombre,
  colaboradorId,
}: {
  id: string;
  nombre: string;
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  const remove = useDeleteEmergencyContact(colaboradorId);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Eliminar contacto ${nombre}`}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contacto de emergencia</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el contacto &quot;{nombre}&quot;? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove.mutate(id, {
                  onSuccess: () => setOpen(false),
                });
              }}
              disabled={remove.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
