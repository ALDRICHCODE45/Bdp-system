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
import { Loader2 } from "lucide-react";
import { PERMISSIONS_BY_MODULE } from "@/core/lib/permissions/permissions.constant";

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
      <SheetContent side={sheetSide} className="overflow-y-auto">
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
          <div className="space-y-6 py-4">
            {Object.entries(permissionsByModule).map(([module, modulePermissions]) => {
              // Agrupar permisos por recurso
              const permissionsByResource: Record<string, typeof modulePermissions> = {};
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

                  {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => {
                    const modularPermission = resourcePermissions.find(
                      (p) => p.action === "gestionar"
                    );
                    const actionPermissions = resourcePermissions.filter(
                      (p) => p.action !== "gestionar" && p.action !== "acceder"
                    );
                    const accessPermission = resourcePermissions.find(
                      (p) => p.action === "acceder"
                    );

                    const resourceLabel =
                      resource.charAt(0).toUpperCase() + resource.slice(1).replace(/-/g, " ");

                    return (
                      <div key={resource} className="space-y-2 pl-4">
                        <div className="flex items-center space-x-2">
                          {modularPermission && (
                            <Checkbox
                              id={`${resource}-gestionar`}
                              checked={isModularSelected(resource)}
                              onCheckedChange={() => toggleModularPermission(resource)}
                            />
                          )}
                          <Label
                            htmlFor={`${resource}-gestionar`}
                            className="font-medium cursor-pointer"
                          >
                            {resourceLabel} - Gestionar Todo
                          </Label>
                        </div>

                        {!isModularSelected(resource) && (
                          <div className="pl-6 space-y-2">
                            {accessPermission && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${resource}-acceder`}
                                  checked={isPermissionSelected(accessPermission.id)}
                                  onCheckedChange={() => togglePermission(accessPermission.id)}
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
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={isPermissionSelected(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <Label htmlFor={permission.id} className="cursor-pointer">
                                  {permission.action.charAt(0).toUpperCase() +
                                    permission.action.slice(1)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
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

