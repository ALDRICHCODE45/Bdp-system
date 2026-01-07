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
import { Collapsible, CollapsibleTrigger } from "@/core/shared/ui/collapsible";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/core/shared/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import { Loader2, ChevronDown, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { useState, useEffect, useMemo, useRef } from "react";

interface AssignPermissionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string | null;
  roleName?: string;
}

const MODULE_LABELS: Record<string, string> = {
  finanzas: "Finanzas",
  rh: "Recursos Humanos",
  recepcion: "Recepción",
  sistema: "Sistema",
  admin: "Administración",
};

const MODULE_ORDER = ["admin", "rh", "finanzas", "recepcion", "sistema"];

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
    hasAnyPermission,
    getPermissionStats,
    getTotalAssignedPermissions,
  } = useAssignPermissions(roleId);

  // Auto-expandir recursos con permisos asignados solo cuando se cargan los datos inicialmente
  useEffect(() => {
    // Solo expandir cuando:
    // 1. Se completa la carga (isLoading cambia de true a false)
    // 2. O cuando cambia el roleId (nuevo rol seleccionado)
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
      // Reset cuando no hay permisos
      setExpandedResources(new Set());
    }

    // Actualizar refs
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

  // Ordenar módulos según el orden definido
  const sortedModules = Object.keys(permissionsByModule).sort((a, b) => {
    const indexA = MODULE_ORDER.indexOf(a);
    const indexB = MODULE_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const getBadgeVariant = (stats: ReturnType<typeof getPermissionStats>) => {
    if (stats.hasModular) return "success";
    if (stats.assignedPermissions > 0) return "info";
    return "outline";
  };

  const getBadgeText = (stats: ReturnType<typeof getPermissionStats>) => {
    if (stats.hasModular) return "Gestionar Todo";
    if (stats.assignedPermissions > 0) {
      return `${stats.assignedPermissions} permiso${
        stats.assignedPermissions > 1 ? "s" : ""
      }`;
    }
    return "Sin permisos";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={sheetSide}
        className="w-full sm:max-w-2xl md:max-w-5xl"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Asignar Permisos
          </SheetTitle>
          <SheetDescription>
            {roleName
              ? `Selecciona los permisos para el rol "${roleName}"`
              : "Selecciona los permisos para este rol"}
            {totalAssigned > 0 && (
              <span className="ml-2 text-primary font-medium">
                • {totalAssigned} permiso{totalAssigned > 1 ? "s" : ""} asignado
                {totalAssigned > 1 ? "s" : ""}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="py-4 px-4">
            <Tabs defaultValue={sortedModules[0]} className="w-full">
              <div className="overflow-x-auto mb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3 lg:grid-cols-5 mb-0">
                  {sortedModules.map((module) => {
                    const modulePermissions = permissionsByModule[module];
                    const moduleResources = new Set(
                      modulePermissions.map((p) => p.resource)
                    );
                    const resourcesWithPermissions = Array.from(
                      moduleResources
                    ).filter((resource) => hasAnyPermission(resource)).length;

                    return (
                      <TabsTrigger
                        key={module}
                        value={module}
                        className="text-[11px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 sm:flex-shrink sm:flex-1 min-w-[100px] sm:min-w-0"
                      >
                        <span className="truncate block sm:inline">
                          {MODULE_LABELS[module] || module}
                        </span>
                        {resourcesWithPermissions > 0 && (
                          <Badge
                            variant="success"
                            className="ml-1 h-3.5 sm:h-4 px-1 text-[9px] sm:text-[10px] flex-shrink-0"
                          >
                            {resourcesWithPermissions}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {sortedModules.map((module) => {
                const modulePermissions = permissionsByModule[module];

                // Agrupar permisos por recurso
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
                    className="mt-0 space-y-3"
                  >
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto p-3">
                      {Object.entries(permissionsByResource).map(
                        ([resource, resourcePermissions]) => {
                          const modularPermission = resourcePermissions.find(
                            (p) => p.action === "gestionar"
                          );
                          const actionPermissions = resourcePermissions.filter(
                            (p) =>
                              p.action !== "gestionar" && p.action !== "acceder"
                          );
                          const accessPermission = resourcePermissions.find(
                            (p) => p.action === "acceder"
                          );

                          const resourceLabel =
                            resource.charAt(0).toUpperCase() +
                            resource.slice(1).replace(/-/g, " ");

                          const isModular = isModularSelected(resource);
                          const stats = getPermissionStats(resource);
                          const isExpanded = expandedResources.has(resource);

                          return (
                            <Card
                              key={resource}
                              className={cn(
                                "transition-all hover:shadow-md",
                                isExpanded && "ring-2 ring-primary/20"
                              )}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Collapsible
                                      open={isExpanded}
                                      onOpenChange={() =>
                                        toggleResource(resource)
                                      }
                                    >
                                      <CollapsibleTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="h-auto p-0 hover:bg-transparent"
                                        >
                                          <ChevronDown
                                            className={cn(
                                              "h-4 w-4 transition-transform duration-200 mr-2",
                                              isExpanded && "rotate-180"
                                            )}
                                          />
                                          <CardTitle className="text-base font-semibold">
                                            {resourceLabel}
                                          </CardTitle>
                                        </Button>
                                      </CollapsibleTrigger>
                                    </Collapsible>
                                  </div>
                                  <Badge
                                    variant={getBadgeVariant(stats)}
                                    className="flex items-center gap-1"
                                  >
                                    {stats.hasModular && (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    {getBadgeText(stats)}
                                  </Badge>
                                </div>
                              </CardHeader>

                              {isExpanded && (
                                <CardContent className="pt-0 space-y-3">
                                  {modularPermission && (
                                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                                      <Checkbox
                                        id={`${resource}-gestionar`}
                                        checked={isModular}
                                        onCheckedChange={() =>
                                          toggleModularPermission(resource)
                                        }
                                      />
                                      <Label
                                        htmlFor={`${resource}-gestionar`}
                                        className="font-medium cursor-pointer flex-1"
                                      >
                                        Gestionar Todo
                                      </Label>
                                      <Badge
                                        variant="success-outline"
                                        className="text-xs"
                                      >
                                        Todos los permisos
                                      </Badge>
                                    </div>
                                  )}

                                  {!isModular && (
                                    <div className="space-y-2 pl-1">
                                      {accessPermission && (
                                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                                          <Checkbox
                                            id={`${resource}-acceder`}
                                            checked={isPermissionSelected(
                                              accessPermission.id
                                            )}
                                            onCheckedChange={() =>
                                              togglePermission(
                                                accessPermission.id
                                              )
                                            }
                                          />
                                          <Label
                                            htmlFor={`${resource}-acceder`}
                                            className="cursor-pointer flex-1"
                                          >
                                            Acceder
                                          </Label>
                                        </div>
                                      )}

                                      {actionPermissions.map((permission) => (
                                        <div
                                          key={permission.id}
                                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                                        >
                                          <Checkbox
                                            id={permission.id}
                                            checked={isPermissionSelected(
                                              permission.id
                                            )}
                                            onCheckedChange={() =>
                                              togglePermission(permission.id)
                                            }
                                          />
                                          <Label
                                            htmlFor={permission.id}
                                            className="cursor-pointer flex-1"
                                          >
                                            {permission.action
                                              .charAt(0)
                                              .toUpperCase() +
                                              permission.action.slice(1)}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              )}
                            </Card>
                          );
                        }
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}

        <SheetFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Permisos"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
