"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  FileText,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/core/shared/ui/field";
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
import { Separator } from "@/core/shared/ui/separator";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/core/shared/ui/empty";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FileList } from "@/core/shared/components/Files/FileList";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";
import {
  useCreateEducationEntry,
  useDeleteEducationEntry,
  useEducationEntries,
  useReorderEducationEntries,
  useUpdateEducationEntry,
} from "../hooks/useEducationEntries.hook";
import type { EducationEntryDto } from "../server/dtos/EducationEntryDto.dto";
import type { FileEntity } from "@/features/Files/server/entities/File.entity";

/**
 * FileUploadDropzone is `"use client"` AND uses `useState` for the file
 * queue. Lazy-loaded via `next/dynamic` with `ssr: false` so the interactive
 * layer never runs on the server (mirrors `UploadFacturaColumn`).
 */
const FileUploadDropZone = dynamic(
  () =>
    import("@/core/shared/components/Files/UploadFileDropzone").then((mod) => ({
      default: mod.FileUploadDropZone,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface CvTabProps {
  colaboradorId: string;
}

const CV_MIME = "application/pdf";
const CV_REJECTION_MESSAGE = "Solo se aceptan archivos PDF";

/**
 * P5 — cap10 CV tab.
 *
 * Two stacked sections:
 *
 * 1. Educación (EducationEntry CRUD via TanStack Query + Server Actions).
 *    Add / edit / delete / reorder are gated by `colaboradores:editar` (CC1/CC8).
 *    The list itself only requires `colaboradores:acceder`. Each entry shows
 *    institucion + titulo + anio with up/down reorder buttons (cap10 req3).
 *
 * 2. Curriculum (PDF-only upload via the widened `UploadFileDropzone`). The
 *    dropzone is configured with `acceptedMimeTypes = ['application/pdf']`
 *    so non-PDF files are rejected client-side (cap10 req5, a SHOULD). The
 *    stored FileEntity shares the same
 *    `COLABORADOR` entityType as the Documentos tab but is visually separated
 *    into its own card so users don't confuse a CV with a contrato.
 *
 * Cap10 req4: CV is a separate top-level tab from Documentos — both are
 * tabs of the profile, not nested.
 */
export function CvTab({ colaboradorId }: CvTabProps) {
  const queryClient = useQueryClient();

  const { data: cvFiles = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ["colaborador-cv-files", colaboradorId],
    queryFn: async () => {
      const result = await getFilesByEntityAction("COLABORADOR", colaboradorId);
      if (!result.ok || !result.data) return [] as FileEntity[];
      // Filter to PDF-only at the UI layer. The server stores all COLABORADOR
      // files in the same table; the CV section is "everything PDF uploaded
      // from this tab". If a Documentos-tab user uploads a PDF it would land
      // here too — that's the documented behavior (single entityType, two UI
      // views filtered client-side).
      return (result.data as FileEntity[]).filter(
        (f) => f.mimeType === CV_MIME
      );
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["colaborador-cv-files", colaboradorId],
    });
    // Bust the Documentos list too because both share the same query key.
    queryClient.invalidateQueries({
      queryKey: ["colaborador-files", colaboradorId],
    });
  };

  return (
    <div className="space-y-6">
      <EducationSection colaboradorId={colaboradorId} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Currículum
          </CardTitle>
          <CardDescription>
            Sube el CV en formato PDF. Esta sección está separada de los
            demás documentos para mantener el expediente limpio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDropZone
            entityType="COLABORADOR"
            entityId={colaboradorId}
            onUploadSuccess={handleUploadSuccess}
            acceptedMimeTypes={[CV_MIME]}
            mimeRejectionMessage={CV_REJECTION_MESSAGE}
          />
          <Separator className="my-4" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Archivos de CV</h3>
              {cvFiles.length > 0 ? (
                <Badge variant="secondary" className="text-[10px]">
                  {cvFiles.length}
                </Badge>
              ) : null}
            </div>
          </div>
          {isLoadingFiles ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <FileList
              files={cvFiles}
              entityType="COLABORADOR"
              onFileDeleted={handleUploadSuccess}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Education section (cap10 req2/3) ──────────────────────────────────── */

function EducationSection({ colaboradorId }: { colaboradorId: string }) {
  const { data, isLoading } = useEducationEntries(colaboradorId);
  const entries = data ?? [];

  const reorder = useReorderEducationEntries(colaboradorId);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = entries.map((e) => e.id);
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    reorder.mutate(next);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Formación académica
          </CardTitle>
          <CardDescription>
            Instituciones y títulos del colaborador. Ordena con las flechas.
          </CardDescription>
        </div>
        <PermissionGuard
          permissions={[
            PermissionActions.colaboradores.editar,
            PermissionActions.colaboradores.gestionar,
          ]}
        >
          <AddEducationEntryForm colaboradorId={colaboradorId} />
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando formación…</p>
        ) : entries.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>Sin formación registrada</EmptyTitle>
              <EmptyDescription>
                Agrega la primera entrada con institución, título y año.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y">
            {entries.map((entry, idx) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {entry.institucion}
                    <span className="ml-2 text-xs text-muted-foreground">
                      · {entry.anio}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.titulo}
                  </div>
                </div>
                <PermissionGuard
                  permissions={[
                    PermissionActions.colaboradores.editar,
                    PermissionActions.colaboradores.gestionar,
                  ]}
                >
                  <EducationEntryRowControls
                    entry={entry}
                    colaboradorId={colaboradorId}
                    isFirst={idx === 0}
                    isLast={idx === entries.length - 1}
                    onMoveUp={() => move(idx, -1)}
                    onMoveDown={() => move(idx, 1)}
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

function EducationEntryRowControls({
  entry,
  colaboradorId,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  entry: EducationEntryDto;
  colaboradorId: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const remove = useDeleteEducationEntry(colaboradorId);

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={onMoveUp}
        disabled={isFirst}
        aria-label="Mover arriba"
        className="h-8 w-8"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onMoveDown}
        disabled={isLast}
        aria-label="Mover abajo"
        className="h-8 w-8"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setEditOpen(true)}
        aria-label={`Editar entrada ${entry.institucion}`}
        className="h-8 w-8"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setConfirmDeleteOpen(true)}
        aria-label={`Eliminar entrada ${entry.institucion}`}
        className="h-8 w-8 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {editOpen ? (
        <EditEducationEntryDialog
          entry={entry}
          colaboradorId={colaboradorId}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar entrada de formación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar &quot;{entry.institucion} · {entry.titulo}&quot;? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove.mutate(entry.id, {
                  onSuccess: () => setConfirmDeleteOpen(false),
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
    </div>
  );
}

function AddEducationEntryForm({
  colaboradorId,
}: {
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Plus className="h-4 w-4" />
        Agregar entrada
      </Button>
      {open ? (
        <AddEducationEntryDialog
          open={open}
          onOpenChange={setOpen}
          colaboradorId={colaboradorId}
        />
      ) : null}
    </>
  );
}

function AddEducationEntryDialog({
  open,
  onOpenChange,
  colaboradorId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  colaboradorId: string;
}) {
  const [institucion, setInstitucion] = useState("");
  const [titulo, setTitulo] = useState("");
  const [anio, setAnio] = useState("");
  const [errors, setErrors] = useState<{
    institucion?: string;
    titulo?: string;
    anio?: string;
  }>({});

  const create = useCreateEducationEntry(colaboradorId);

  const reset = () => {
    setInstitucion("");
    setTitulo("");
    setAnio("");
    setErrors({});
  };

  const handleClose = (next: boolean) => {
    if (create.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const anioParsed = Number(anio.trim());
    const anioValid =
      Number.isInteger(anioParsed) && anioParsed >= 1900 && anioParsed <= 2100;

    const newErrors: typeof errors = {};
    if (!institucion.trim())
      newErrors.institucion = "La institución es requerida";
    if (!titulo.trim()) newErrors.titulo = "El título es requerido";
    if (!anioValid) newErrors.anio = "El año debe estar entre 1900 y 2100";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    fd.set("institucion", institucion.trim());
    fd.set("titulo", titulo.trim());
    fd.set("anio", String(anioParsed));
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar formación académica</DialogTitle>
          <DialogDescription>
            Registra una nueva entrada de formación con institución, título y
            año.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field data-invalid={Boolean(errors.institucion)}>
                <FieldLabel>Institución</FieldLabel>
                <Input
                  name="institucion"
                  placeholder="Ej. UNAM"
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                />
                {errors.institucion ? (
                  <FieldError
                    errors={[{ message: errors.institucion } as never]}
                  />
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.titulo)}>
                <FieldLabel>Título</FieldLabel>
                <Input
                  name="titulo"
                  placeholder="Ej. Ingeniería en Sistemas"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                {errors.titulo ? (
                  <FieldError
                    errors={[{ message: errors.titulo } as never]}
                  />
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.anio)}>
                <FieldLabel>Año</FieldLabel>
                <Input
                  name="anio"
                  type="number"
                  min={1900}
                  max={2100}
                  placeholder="2024"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                />
                {errors.anio ? (
                  <FieldError errors={[{ message: errors.anio } as never]} />
                ) : null}
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

function EditEducationEntryDialog({
  entry,
  colaboradorId,
  open,
  onClose,
}: {
  entry: EducationEntryDto;
  colaboradorId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [institucionError, setInstitucionError] = useState<string | null>(null);
  const [tituloError, setTituloError] = useState<string | null>(null);
  const [anioError, setAnioError] = useState<string | null>(null);

  const update = useUpdateEducationEntry(colaboradorId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const institucion = (fd.get("institucion") as string | null)?.trim() ?? "";
    const titulo = (fd.get("titulo") as string | null)?.trim() ?? "";
    const anioRaw = (fd.get("anio") as string | null)?.trim() ?? "";
    const anioParsed = Number(anioRaw);
    const anioValid =
      Number.isInteger(anioParsed) && anioParsed >= 1900 && anioParsed <= 2100;

    const newInstitucionError = institucion ? null : "La institución es requerida";
    const newTituloError = titulo ? null : "El título es requerido";
    const newAnioError = anioValid ? null : "El año debe estar entre 1900 y 2100";

    setInstitucionError(newInstitucionError);
    setTituloError(newTituloError);
    setAnioError(newAnioError);
    if (newInstitucionError || newTituloError || newAnioError) return;

    fd.set("id", entry.id);
    fd.set("anio", String(anioParsed));

    update.mutate(fd, {
      onSuccess: () => {
        onClose();
        setInstitucionError(null);
        setTituloError(null);
        setAnioError(null);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Editar entrada de formación</AlertDialogTitle>
          <AlertDialogDescription>
            Actualiza los datos académicos de esta entrada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <Field data-invalid={Boolean(institucionError)}>
              <FieldLabel>Institución</FieldLabel>
              <Input
                name="institucion"
                defaultValue={entry.institucion}
                placeholder="Ej. UNAM"
              />
              {institucionError ? (
                <FieldError errors={[{ message: institucionError } as never]} />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(tituloError)}>
              <FieldLabel>Título</FieldLabel>
              <Input
                name="titulo"
                defaultValue={entry.titulo}
                placeholder="Ej. Ingeniería en Sistemas"
              />
              {tituloError ? (
                <FieldError errors={[{ message: tituloError } as never]} />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(anioError)}>
              <FieldLabel>Año</FieldLabel>
              <Input
                name="anio"
                type="number"
                min={1900}
                max={2100}
                defaultValue={entry.anio}
              />
              {anioError ? (
                <FieldError errors={[{ message: anioError } as never]} />
              ) : null}
            </Field>
          </FieldGroup>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={update.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}