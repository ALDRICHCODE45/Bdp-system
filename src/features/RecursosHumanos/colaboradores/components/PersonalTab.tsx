"use client";

import { useState } from "react";
import {
  AlertCircle,
  Mail,
  MapPin,
  Pencil,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import type { EmergencyContactDto } from "../server/dtos/EmergencyContactDto.dto";
import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
  useUpdateEmergencyContact,
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
                  <div className="flex items-center gap-1">
                    <EditEmergencyContactButton
                      contacto={c}
                      colaboradorId={colaboradorId}
                    />
                    <DeleteEmergencyContactButton
                      id={c.id}
                      nombre={c.nombre}
                      colaboradorId={colaboradorId}
                    />
                  </div>
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
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <UserPlus className="h-4 w-4" />
        Agregar contacto
      </Button>
      {open ? (
        <AddEmergencyContactDialog
          open={open}
          onOpenChange={setOpen}
          colaboradorId={colaboradorId}
        />
      ) : null}
    </>
  );
}

function AddEmergencyContactDialog({
  open,
  onOpenChange,
  colaboradorId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  colaboradorId: string;
}) {
  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [errors, setErrors] = useState<{
    nombre?: string;
    parentesco?: string;
    telefono?: string;
  }>({});

  const create = useCreateEmergencyContact(colaboradorId);

  const reset = () => {
    setNombre("");
    setParentesco("");
    setTelefono("");
    setEmail("");
    setNotas("");
    setErrors({});
  };

  const handleClose = (next: boolean) => {
    if (create.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!parentesco.trim())
      newErrors.parentesco = "El parentesco es requerido";
    if (!telefono.trim()) newErrors.telefono = "El teléfono es requerido";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    fd.set("nombre", nombre.trim());
    fd.set("parentesco", parentesco.trim());
    fd.set("telefono", telefono.trim());
    fd.set("email", email.trim());
    fd.set("notas", notas.trim());
    // Ensure route-bound id is always present in the FormData
    fd.set("colaboradorId", colaboradorId);

    create.mutate(fd, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar contacto de emergencia</DialogTitle>
          <DialogDescription>
            Registra una persona de contacto para este colaborador. El nombre,
            parentesco y teléfono son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={Boolean(errors.nombre)}>
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  name="nombre"
                  placeholder="Ej. María López"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                {errors.nombre ? (
                  <FieldError errors={[{ message: errors.nombre } as never]} />
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.parentesco)}>
                <FieldLabel>Parentesco</FieldLabel>
                <Input
                  name="parentesco"
                  placeholder="Ej. Madre"
                  value={parentesco}
                  onChange={(e) => setParentesco(e.target.value)}
                />
                {errors.parentesco ? (
                  <FieldError
                    errors={[{ message: errors.parentesco } as never]}
                  />
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.telefono)}>
                <FieldLabel>Teléfono</FieldLabel>
                <Input
                  name="telefono"
                  placeholder="55 0000 0000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                {errors.telefono ? (
                  <FieldError
                    errors={[{ message: errors.telefono } as never]}
                  />
                ) : null}
              </Field>
              <Field>
                <FieldLabel>Email (opcional)</FieldLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="maria@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel>Notas (opcional)</FieldLabel>
                <Input
                  name="notas"
                  placeholder="Información adicional"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={create.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={create.isPending}>
              {create.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditEmergencyContactButton({
  contacto,
  colaboradorId,
}: {
  contacto: EmergencyContactDto;
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Editar contacto ${contacto.nombre}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {open ? (
        <EditEmergencyContactDialog
          open={open}
          onOpenChange={setOpen}
          contacto={contacto}
          colaboradorId={colaboradorId}
        />
      ) : null}
    </>
  );
}

function EditEmergencyContactDialog({
  open,
  onOpenChange,
  contacto,
  colaboradorId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  contacto: EmergencyContactDto;
  colaboradorId: string;
}) {
  const [nombre, setNombre] = useState(contacto.nombre);
  const [parentesco, setParentesco] = useState(contacto.parentesco);
  const [telefono, setTelefono] = useState(contacto.telefono);
  const [email, setEmail] = useState(contacto.email ?? "");
  const [notas, setNotas] = useState(contacto.notas ?? "");
  const [errors, setErrors] = useState<{
    nombre?: string;
    parentesco?: string;
    telefono?: string;
  }>({});

  const update = useUpdateEmergencyContact(colaboradorId);

  const handleClose = (next: boolean) => {
    if (update.isPending) return;
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!parentesco.trim())
      newErrors.parentesco = "El parentesco es requerido";
    if (!telefono.trim()) newErrors.telefono = "El teléfono es requerido";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    fd.set("nombre", nombre.trim());
    fd.set("parentesco", parentesco.trim());
    fd.set("telefono", telefono.trim());
    fd.set("email", email.trim());
    fd.set("notas", notas.trim());
    // Ensure the route-bound id is always present in the FormData so the
    // server action can identify the row being patched.
    fd.set("id", contacto.id);

    update.mutate(fd, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar contacto de emergencia</DialogTitle>
          <DialogDescription>
            Actualiza los datos de esta persona de contacto. El nombre,
            parentesco y teléfono son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={Boolean(errors.nombre)}>
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  name="nombre"
                  placeholder="Ej. María López"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                {errors.nombre ? (
                  <FieldError errors={[{ message: errors.nombre } as never]} />
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.parentesco)}>
                <FieldLabel>Parentesco</FieldLabel>
                <Input
                  name="parentesco"
                  placeholder="Ej. Madre"
                  value={parentesco}
                  onChange={(e) => setParentesco(e.target.value)}
                />
                {errors.parentesco ? (
                  <FieldError
                    errors={[{ message: errors.parentesco } as never]}
                  />
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.telefono)}>
                <FieldLabel>Teléfono</FieldLabel>
                <Input
                  name="telefono"
                  placeholder="55 0000 0000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                {errors.telefono ? (
                  <FieldError
                    errors={[{ message: errors.telefono } as never]}
                  />
                ) : null}
              </Field>
              <Field>
                <FieldLabel>Email (opcional)</FieldLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="maria@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel>Notas (opcional)</FieldLabel>
                <Input
                  name="notas"
                  placeholder="Información adicional"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={update.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={update.isPending}>
              {update.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
