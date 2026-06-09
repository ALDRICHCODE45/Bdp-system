"use client";

import { useCallback, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  Search,
} from "lucide-react";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { DataTableMultiTabs, type MultiTabConfig } from "@/core/shared/components/DataTable/DataTableMultiTabs";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { useDebounce } from "@/core/shared/hooks/use-debounce";
import { usePermissions } from "@/core/shared/hooks/use-permissions";
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
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent } from "@/core/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { Input } from "@/core/shared/ui/input";
import type { MovimientoFilterInput } from "../server/actions/getMovimientosAction";
import type { MovimientoListDto } from "../server/dtos/MovimientoListDto.dto";
import { CreateEgresoSheet } from "../components/CreateEgresoSheet";
import { CreateIngresoSheet } from "../components/CreateIngresoSheet";
import { EditMovimientoSheet } from "../components/EditMovimientoSheet";
import { ImportMovimientosDialog } from "../components/ImportMovimientosDialog";
import { MovimientoDetailSheet } from "../components/MovimientoDetailSheet";
import { MovimientosTable } from "../components/MovimientosTable";
import { useDeleteMovimiento } from "../hooks/useDeleteMovimiento.hook";
import { useDistinctTitulares } from "../hooks/useDistinctTitulares.hook";
import { useMovimientos } from "../hooks/useMovimientos.hook";

interface MovimientosTablePageProps {
  initialData?: MovimientoListDto;
  initialDataUpdatedAt?: number;
}

const DEFAULT_PAGE_SIZE = 20;

type MovimientoTabId = "all" | "ingresos" | "egresos";
type MovimientoTipoFilter = NonNullable<MovimientoFilterInput["tipo"]>;

function getTabIdFromTipo(tipo: MovimientoTipoFilter): MovimientoTabId {
  if (tipo === "INGRESO") return "ingresos";
  if (tipo === "EGRESO") return "egresos";
  return "all";
}

function getTipoFromTabId(tabId: MovimientoTabId): MovimientoTipoFilter {
  if (tabId === "ingresos") return "INGRESO";
  if (tabId === "egresos") return "EGRESO";
  return "ALL";
}

export function MovimientosTablePage({
  initialData,
  initialDataUpdatedAt,
}: MovimientosTablePageProps) {
  const { hasAnyPermission, isAdmin } = usePermissions();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [filters, setFilters] = useState<MovimientoFilterInput>({
    tipo: "ALL",
  });
  const [activeTabId, setActiveTabId] = useState<MovimientoTabId>("all");

  const [createIngresoOpen, setCreateIngresoOpen] = useState(false);
  const [createEgresoOpen, setCreateEgresoOpen] = useState(false);
  const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [detailMovimientoId, setDetailMovimientoId] = useState<string | null>(null);
  const [editMovimientoId, setEditMovimientoId] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    movimientoId: string | null;
  }>({
    open: false,
    movimientoId: null,
  });

  const queryParams = useMemo<MovimientoFilterInput>(
    () => ({
      ...filters,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: debouncedSearch || undefined,
      sortBy: sorting[0]?.id,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [debouncedSearch, filters, pagination.pageIndex, pagination.pageSize, sorting],
  );

  const {
    data,
    error,
    isError,
    isPending,
    isFetching,
  } = useMovimientos(queryParams, initialData, initialDataUpdatedAt);
  const { data: titulares = [] } = useDistinctTitulares();
  const deleteMovimiento = useDeleteMovimiento();

  const canCreateMovimiento =
    isAdmin ||
    hasAnyPermission([
      PermissionActions.movimientos.crear,
      PermissionActions.movimientos.gestionar,
    ]);
  const canImportMovimiento =
    isAdmin ||
    hasAnyPermission([
      PermissionActions.movimientos.importar,
      PermissionActions.movimientos.gestionar,
    ]);

  const activeTabs = useMemo(
    () => (activeTabId === "all" ? [] : [activeTabId]),
    [activeTabId],
  );

  const handleTabsChange = useCallback((nextTabs: string[]) => {
    const selectedTab = (nextTabs[nextTabs.length - 1] ?? "all") as MovimientoTabId;
    const nextTipo = getTipoFromTabId(selectedTab);

    setActiveTabId(getTabIdFromTipo(nextTipo));

    setFilters((current) => ({
      ...current,
      tipo: nextTipo,
    }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const handleFiltersChange = useCallback((nextFilters: MovimientoFilterInput) => {
    const nextTipo = nextFilters.tipo ?? filters.tipo ?? "ALL";

    setActiveTabId(getTabIdFromTipo(nextTipo));

    setFilters((current) => ({
      ...current,
      ...nextFilters,
      tipo: nextTipo,
    }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [filters.tipo]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSorting([]);
    setFilters((current) => ({ tipo: current.tipo ?? "ALL" }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const handleAddMovimiento = useCallback(() => {
    if (filters.tipo === "INGRESO") {
      setCreateIngresoOpen(true);
      return;
    }

    if (filters.tipo === "EGRESO") {
      setCreateEgresoOpen(true);
      return;
    }

    setCreateTypeDialogOpen(true);
  }, [filters.tipo]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.movimientoId) return;

    try {
      await deleteMovimiento.mutateAsync(deleteState.movimientoId);
      setDeleteState({ open: false, movimientoId: null });
    } catch {
      // Toast feedback is handled in the mutation hook.
    }
  }, [deleteMovimiento, deleteState.movimientoId]);

  const aggregates = data?.aggregates ?? initialData?.aggregates;
  const totalCount = data?.pagination.total ?? initialData?.pagination.total ?? 0;
  const allTabCount = aggregates
    ? (aggregates.countIngresos ?? 0) + (aggregates.countEgresos ?? 0)
    : totalCount;

  const tabs = useMemo<MultiTabConfig[]>(() => [
    {
      id: "all",
      label: "Todos",
      count: allTabCount,
      icon: CircleDollarSign,
    },
    {
      id: "ingresos",
      label: "Ingresos",
      count: aggregates?.countIngresos ?? 0,
      icon: ArrowUpCircle,
    },
    {
      id: "egresos",
      label: "Egresos",
      count: aggregates?.countEgresos ?? 0,
      icon: ArrowDownCircle,
    },
  ], [aggregates?.countEgresos, aggregates?.countIngresos, allTabCount]);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <TablePresentation
        title="Ingresos / Egresos"
        subtitle="Administra movimientos unificados con filtros, agregados, importación y acciones por fila"
      />

      <DataTableMultiTabs
        tabs={tabs}
        activeTabs={activeTabs}
        onTabsChange={handleTabsChange}
      />

      <Card>
        <CardContent className="py-4">
          <div className="relative max-w-xl">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por descripción, concepto, titular, cliente o proveedor"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar los movimientos."}
          </CardContent>
        </Card>
      ) : null}

      <PermissionGuard
        permissions={[
          PermissionActions.movimientos.acceder,
          PermissionActions.movimientos.gestionar,
        ]}
      >
        <MovimientosTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          pageCount={data?.pagination.totalPages ?? 0}
          aggregates={aggregates}
          filters={queryParams}
          onFiltersChange={handleFiltersChange}
          isLoading={isPending}
          isFetching={isFetching}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          onGlobalFilterChange={setSearch}
          onView={setDetailMovimientoId}
          onEdit={setEditMovimientoId}
          onDelete={(movimientoId) =>
            setDeleteState({ open: true, movimientoId })
          }
          onImport={canImportMovimiento ? () => setImportDialogOpen(true) : undefined}
          onAdd={canCreateMovimiento ? handleAddMovimiento : undefined}
          onClearFilters={handleClearFilters}
          titulares={titulares}
        />
      </PermissionGuard>

      <Dialog open={createTypeDialogOpen} onOpenChange={setCreateTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elegí el tipo de movimiento</DialogTitle>
            <DialogDescription>
              Desde la pestaña Todos necesitás indicar si querés registrar un ingreso o un egreso.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className="justify-start"
              onClick={() => {
                setCreateTypeDialogOpen(false);
                setCreateIngresoOpen(true);
              }}
            >
              Crear ingreso
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => {
                setCreateTypeDialogOpen(false);
                setCreateEgresoOpen(true);
              }}
            >
              Crear egreso
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateTypeDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteState.open}
        onOpenChange={(open) =>
          setDeleteState((current) => ({
            open,
            movimientoId: open ? current.movimientoId : null,
          }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el movimiento seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMovimiento.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMovimiento.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateIngresoSheet
        isOpen={createIngresoOpen}
        onClose={() => setCreateIngresoOpen(false)}
      />
      <CreateEgresoSheet
        isOpen={createEgresoOpen}
        onClose={() => setCreateEgresoOpen(false)}
      />
      <EditMovimientoSheet
        movimientoId={editMovimientoId}
        isOpen={Boolean(editMovimientoId)}
        onClose={() => setEditMovimientoId(null)}
      />
      <MovimientoDetailSheet
        movimientoId={detailMovimientoId}
        isOpen={Boolean(detailMovimientoId)}
        onClose={() => setDetailMovimientoId(null)}
      />
      <ImportMovimientosDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
