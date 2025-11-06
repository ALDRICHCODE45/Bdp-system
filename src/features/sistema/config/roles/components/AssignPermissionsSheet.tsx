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
import { Separator } from "@/core/shared/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/shared/ui/collapsible";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/core/lib/utils";

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

export const AssignPermissionsSheet = ({
  isOpen,
  onClose,
  roleId,
  roleName,
}: AssignPermissionsSheetProps) => {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

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
  } = useAssignPermissions(roleId);

  const handleSave = async () => {
    const success = await savePermissions();
    if (success) {
      onClose();
    }
  };

  const permissionsByModule = getPermissionsByModule();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="">
        <SheetHeader>
          <SheetTitle>Asignar Permisos</SheetTitle>
          <SheetDescription>
            {roleName
              ? `Selecciona los permisos para el rol "${roleName}"`
              : "Selecciona los permisos para este rol"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4 p-5 h-[70vw] overflow-y-auto">
            {Object.entries(permissionsByModule).map(
              ([module, modulePermissions]) => {
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
                  <div key={module} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {MODULE_LABELS[module] || module}
                      </h3>
                      <Separator className="mt-2" />
                    </div>

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

                        return (
                          <Collapsible
                            key={resource}
                            className="group/collapsible"
                          >
                            <CollapsibleTrigger asChild className="w-full">
                              <Button
                                variant="ghost"
                                className="w-full justify-between px-3 py-2 h-auto font-normal hover:bg-accent"
                              >
                                <span className="font-medium">
                                  {resourceLabel}
                                </span>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    "group-data-[state=open]/collapsible:rotate-180"
                                  )}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pl-4 pt-2">
                              {modularPermission && (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${resource}-gestionar`}
                                    checked={isModular}
                                    onCheckedChange={() =>
                                      toggleModularPermission(resource)
                                    }
                                  />
                                  <Label
                                    htmlFor={`${resource}-gestionar`}
                                    className="font-medium cursor-pointer"
                                  >
                                    Gestionar Todo
                                  </Label>
                                </div>
                              )}

                              {!isModular && (
                                <div className="space-y-2">
                                  {accessPermission && (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${resource}-acceder`}
                                        checked={isPermissionSelected(
                                          accessPermission.id
                                        )}
                                        onCheckedChange={() =>
                                          togglePermission(accessPermission.id)
                                        }
                                      />
                                      <Label
                                        htmlFor={`${resource}-acceder`}
                                        className="cursor-pointer"
                                      >
                                        Acceder
                                      </Label>
                                    </div>
                                  )}

                                  {actionPermissions.map((permission) => (
                                    <div
                                      key={permission.id}
                                      className="flex items-center space-x-2"
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
                                        className="cursor-pointer"
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
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      }
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        <SheetFooter>
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
