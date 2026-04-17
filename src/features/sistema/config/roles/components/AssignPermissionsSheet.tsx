"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Button } from "@/core/shared/ui/button";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useAssignPermissions } from "../hooks/useAssignPermissions.hook";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { Label } from "@/core/shared/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/core/shared/ui/tabs";
import { Badge } from "@/core/shared/ui/badge";
import { ScrollArea } from "@/core/shared/ui/scroll-area";
import { Separator } from "@/core/shared/ui/separator";
import { Progress } from "@/core/shared/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import {
  Loader2,
  Shield,
  CheckCircle2,
  ChevronDown,
  Building2,
  Users,
  Wallet,
  PhoneIncoming,
  Scale,
  Settings,
  Info,
  CheckCheck,
  X,
} from "lucide-react";
import { cn } from "@/core/lib/utils";
import { useState, useEffect, useRef } from "react";
import type { PermissionDto } from "@/features/sistema/config/permissions/types/PermissionDto.dto";

interface AssignPermissionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string | null;
  roleName?: string;
}

const MODULE_LABELS: Record<string, string> = {
  admin: "Administración",
  rh: "Recursos Humanos",
  finanzas: "Finanzas",
  recepcion: "Recepción",
  juridico: "Jurídico",
  sistema: "Sistema",
};

const MODULE_ORDER = ["admin", "rh", "finanzas", "recepcion", "juridico", "sistema"];

const MODULE_ICONS: Record<string, React.ElementType> = {
  admin: Building2,
  rh: Users,
  finanzas: Wallet,
  recepcion: PhoneIncoming,
  juridico: Scale,
  sistema: Settings,
};

const MODULE_COLORS: Record<
  string,
  { tab: string; dot: string; accent: string }
> = {
  admin: {
    tab: "data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400",
    dot: "bg-violet-500",
    accent: "border-violet-500",
  },
  rh: {
    tab: "data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400",
    dot: "bg-sky-500",
    accent: "border-sky-500",
  },
  finanzas: {
    tab: "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400",
    dot: "bg-emerald-500",
    accent: "border-emerald-500",
  },
  recepcion: {
    tab: "data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400",
    dot: "bg-amber-500",
    accent: "border-amber-500",
  },
  juridico: {
    tab: "data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400",
    dot: "bg-rose-500",
    accent: "border-rose-500",
  },
  sistema: {
    tab: "data-[state=active]:text-slate-600 dark:data-[state=active]:text-slate-400",
    dot: "bg-slate-500",
    accent: "border-slate-500",
  },
};

export const AssignPermissionsSheet = ({
  isOpen,
  onClose,
  roleId,
  roleName,
}: AssignPermissionsSheetProps) => {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  );
  const previousRoleIdRef = useRef<string | null>(null);
  const previousLoadingStateRef = useRef<boolean>(true);

  const {
    permissions,
    selectedPermissionIds,
    isLoading,
    isSaving,
    togglePermission,
    toggleModularPermission,
    savePermissions,
    getPermissionsByModule,
    isModularSelected,
    isPermissionSelected,
    getPermissionStats,
    getTotalAssignedPermissions,
  } = useAssignPermissions(roleId);

  // Auto-expandir recursos con permisos asignados solo cuando se cargan los datos inicialmente
  useEffect(() => {
    const isLoadingJustFinished = previousLoadingStateRef.current && !isLoading;
    const roleIdChanged = previousRoleIdRef.current !== roleId;

    if (
      !isLoading &&
      permissions.length > 0 &&
      (isLoadingJustFinished || roleIdChanged)
    ) {
      const resourcesWithPermissions = new Set<string>();
      permissions.forEach((permission) => {
        if (selectedPermissionIds.includes(permission.id)) {
          resourcesWithPermissions.add(permission.resource);
        }
      });
      setExpandedResources(resourcesWithPermissions);
    } else if (!isLoading && permissions.length === 0) {
      setExpandedResources(new Set());
    }

    previousLoadingStateRef.current = isLoading;
    previousRoleIdRef.current = roleId;
  }, [isLoading, roleId, permissions, selectedPermissionIds]);

  const handleSave = async () => {
    const success = await savePermissions();
    if (success) {
      onClose();
    }
  };

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
    });
  };

  const permissionsByModule = getPermissionsByModule();
  const totalAssigned = getTotalAssignedPermissions();
  const totalPermissions = permissions.length;
  const progressPct =
    totalPermissions > 0
      ? Math.round((totalAssigned / totalPermissions) * 100)
      : 0;

  const sortedModules = Object.keys(permissionsByModule).sort((a, b) => {
    const indexA = MODULE_ORDER.indexOf(a);
    const indexB = MODULE_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Get all permission IDs for a specific module
  const getModulePermissionIds = (module: string): string[] => {
    return (permissionsByModule[module] ?? []).map((p) => p.id);
  };

  // Select all permissions in a module
  const selectAllInModule = (module: string) => {
    const ids = getModulePermissionIds(module);
    // Add all that aren't already selected
    const newIds = Array.from(new Set([...selectedPermissionIds, ...ids]));
    // We need to update via individual toggles — use the ref approach
    ids.forEach((id) => {
      if (!selectedPermissionIds.includes(id)) {
        togglePermission(id);
      }
    });
    void newIds; // suppress unused warning
  };

  // Deselect all permissions in a module
  const deselectAllInModule = (module: string) => {
    const ids = getModulePermissionIds(module);
    ids.forEach((id) => {
      if (selectedPermissionIds.includes(id)) {
        togglePermission(id);
      }
    });
  };

  // Count assigned in a module
  const getModuleAssignedCount = (module: string): number => {
    const ids = getModulePermissionIds(module);
    return ids.filter((id) => selectedPermissionIds.includes(id)).length;
  };

  // Get card accent class based on permission state
  const getCardAccentClass = (
    resource: string,
    module: string
  ): string => {
    const stats = getPermissionStats(resource);
    const colors = MODULE_COLORS[module] ?? MODULE_COLORS["sistema"];
    if (stats.hasModular) {
      return cn("border-l-4", colors.accent);
    }
    if (stats.assignedPermissions > 0) {
      return "border-l-4 border-blue-400";
    }
    return "border-l-4 border-muted";
  };

  const formatResourceLabel = (resource: string): string => {
    return resource
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={sheetSide}
        className="w-full sm:max-w-2xl md:max-w-3xl flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight">
                Asignar Permisos
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {roleName
                  ? `Configurando permisos para "${roleName}"`
                  : "Selecciona los permisos para este rol"}
              </SheetDescription>
            </div>
          </div>

          {/* Summary counter + progress */}
          {!isLoading && permissions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Permisos asignados
                </span>
                <span className="font-semibold text-foreground">
                  {totalAssigned}{" "}
                  <span className="text-muted-foreground font-normal">
                    de {totalPermissions}
                  </span>
                </span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>
          )}
        </SheetHeader>

        {/* Body */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando permisos...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs
              defaultValue={sortedModules[0]}
              className="flex-1 min-h-0 flex flex-col"
            >
              {/* Module tabs */}
              <div className="px-4 pt-3 pb-0">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent -mx-1 px-1">
                  <TabsList className="inline-flex w-auto h-9 gap-0.5 p-1 bg-muted rounded-lg">
                    {sortedModules.map((module) => {
                      const ModuleIcon =
                        MODULE_ICONS[module] ?? Shield;
                      const colors =
                        MODULE_COLORS[module] ?? MODULE_COLORS["sistema"];
                      const assignedCount = getModuleAssignedCount(module);
                      return (
                        <TabsTrigger
                          key={module}
                          value={module}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md",
                            "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
                            "transition-all whitespace-nowrap flex-shrink-0",
                            colors.tab
                          )}
                        >
                          <ModuleIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="hidden sm:inline">
                            {MODULE_LABELS[module] || module}
                          </span>
                          <span className="sm:hidden">
                            {MODULE_LABELS[module]?.split(" ")[0] || module}
                          </span>
                          {assignedCount > 0 && (
                            <span
                              className={cn(
                                "inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] font-bold text-white flex-shrink-0 px-1",
                                colors.dot
                              )}
                            >
                              {assignedCount > 9 ? "9+" : assignedCount}
                            </span>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
              </div>

              {/* Tab contents */}
              {sortedModules.map((module) => {
                const modulePermissions = permissionsByModule[module];
                const moduleTotal = modulePermissions.length;
                const moduleAssigned = getModuleAssignedCount(module);

                // Group by resource
                const permissionsByResource: Record<
                  string,
                  typeof modulePermissions
                > = {};
                modulePermissions.forEach((perm) => {
                  if (!permissionsByResource[perm.resource]) {
                    permissionsByResource[perm.resource] = [];
                  }
                  permissionsByResource[perm.resource].push(perm);
                });

                return (
                  <TabsContent
                    key={module}
                    value={module}
                    className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
                  >
                    {/* Module subheader */}
                    <div className="flex items-center justify-between px-6 py-2.5 bg-muted/20 border-b">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {moduleAssigned}
                        </span>{" "}
                        de {moduleTotal} permisos asignados
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectAllInModule(module)}
                          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
                          type="button"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Seleccionar todos
                        </button>
                        <span className="text-muted-foreground/50">|</span>
                        <button
                          onClick={() => deselectAllInModule(module)}
                          className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                          Deseleccionar todos
                        </button>
                      </div>
                    </div>

                    <ScrollArea className="h-[calc(100vh-380px)]">
                      <div className="p-4 space-y-3">
                        {Object.entries(permissionsByResource).map(
                          ([resource, resourcePermissions]) => {
                            const modularPermission =
                              resourcePermissions.find(
                                (p) => p.action === "gestionar"
                              );
                            const actionPermissions =
                              resourcePermissions.filter(
                                (p) =>
                                  p.action !== "gestionar" &&
                                  p.action !== "acceder"
                              );
                            const accessPermission =
                              resourcePermissions.find(
                                (p) => p.action === "acceder"
                              );

                            const isModular = isModularSelected(resource);
                            const stats = getPermissionStats(resource);
                            const isExpanded = expandedResources.has(resource);
                            const accentClass = getCardAccentClass(
                              resource,
                              module
                            );
                            const resourceLabel =
                              formatResourceLabel(resource);

                            return (
                              <div
                                key={resource}
                                className={cn(
                                  "rounded-lg bg-card border shadow-sm overflow-hidden transition-all duration-200",
                                  accentClass,
                                  isExpanded &&
                                    "shadow-md ring-1 ring-border/50"
                                )}
                              >
                                {/* Resource header */}
                                <button
                                  type="button"
                                  onClick={() => toggleResource(resource)}
                                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <ChevronDown
                                      className={cn(
                                        "h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                                        isExpanded && "rotate-180"
                                      )}
                                    />
                                    <span className="font-semibold text-sm text-foreground truncate">
                                      {resourceLabel}
                                    </span>
                                  </div>

                                  {/* State badge */}
                                  <div className="flex-shrink-0 ml-2">
                                    {stats.hasModular ? (
                                      <Badge
                                        variant="success"
                                        className="flex items-center gap-1 text-[10px]"
                                      >
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        Gestionar Todo
                                      </Badge>
                                    ) : stats.assignedPermissions > 0 ? (
                                      <Badge
                                        variant="info"
                                        className="text-[10px]"
                                      >
                                        {stats.assignedPermissions} de{" "}
                                        {stats.totalPermissions}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] text-muted-foreground"
                                      >
                                        Sin permisos
                                      </Badge>
                                    )}
                                  </div>
                                </button>

                                {/* Resource body (expanded) */}
                                {isExpanded && (
                                  <div className="border-t bg-muted/10 px-4 pt-3 pb-4 space-y-3">
                                    {/* Gestionar Todo row */}
                                    {modularPermission && (
                                      <PermissionRow
                                        permission={modularPermission}
                                        isChecked={isModular}
                                        onToggle={() =>
                                          toggleModularPermission(resource)
                                        }
                                        isProminent
                                      />
                                    )}

                                    {!isModular && (
                                      <>
                                        {(accessPermission ||
                                          actionPermissions.length > 0) && (
                                          <Separator className="my-2" />
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                          {accessPermission && (
                                            <PermissionRow
                                              permission={accessPermission}
                                              isChecked={isPermissionSelected(
                                                accessPermission.id
                                              )}
                                              onToggle={() =>
                                                togglePermission(
                                                  accessPermission.id
                                                )
                                              }
                                            />
                                          )}
                                          {actionPermissions.map(
                                            (permission) => (
                                              <PermissionRow
                                                key={permission.id}
                                                permission={permission}
                                                isChecked={isPermissionSelected(
                                                  permission.id
                                                )}
                                                onToggle={() =>
                                                  togglePermission(
                                                    permission.id
                                                  )
                                                }
                                              />
                                            )
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <SheetFooter className="border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-between w-full gap-3">
            {!isLoading && totalAssigned > 0 && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                <span className="font-medium text-foreground">
                  {totalAssigned}
                </span>{" "}
                permiso{totalAssigned !== 1 ? "s" : ""} seleccionado
                {totalAssigned !== 1 ? "s" : ""}
              </p>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-1.5 h-4 w-4" />
                    Guardar Permisos
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

/* ── Sub-component: single permission row ─────────────────────────────────── */

interface PermissionRowProps {
  permission: PermissionDto;
  isChecked: boolean;
  onToggle: () => void;
  isProminent?: boolean;
}

function PermissionRow({
  permission,
  isChecked,
  onToggle,
  isProminent = false,
}: PermissionRowProps) {
  const actionLabel =
    permission.action.charAt(0).toUpperCase() +
    permission.action.slice(1).replace(/-/g, " ");

  if (isProminent) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer",
          isChecked
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-muted/50 border border-transparent hover:border-border"
        )}
        onClick={onToggle}
      >
        <Checkbox
          id={`${permission.resource}-gestionar`}
          checked={isChecked}
          onCheckedChange={onToggle}
          className={cn(
            isChecked &&
              "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          )}
        />
        <div className="flex-1 min-w-0">
          <Label
            htmlFor={`${permission.resource}-gestionar`}
            className="text-sm font-semibold cursor-pointer leading-tight"
          >
            Gestionar Todo
          </Label>
          {permission.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              {permission.description}
            </p>
          )}
        </div>
        {isChecked ? (
          <Badge variant="success-outline" className="text-[10px] flex-shrink-0">
            Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] flex-shrink-0 text-muted-foreground">
            Inactivo
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors cursor-pointer group",
        "hover:bg-accent/60",
        isChecked && "bg-primary/5"
      )}
      onClick={onToggle}
    >
      <Checkbox
        id={permission.id}
        checked={isChecked}
        onCheckedChange={onToggle}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <Label
          htmlFor={permission.id}
          className="text-xs font-medium cursor-pointer truncate"
        >
          {actionLabel}
        </Label>
        {permission.description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground flex-shrink-0 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">
              {permission.description}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
