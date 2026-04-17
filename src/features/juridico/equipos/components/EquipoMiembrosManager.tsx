"use client";
import { useState } from "react";
import { Button } from "@/core/shared/ui/button";
import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Badge } from "@/core/shared/ui/badge";
import { Separator } from "@/core/shared/ui/separator";
import { UserMinus, UserPlus, Users } from "lucide-react";
import { useGetActiveUsers } from "../hooks/useGetActiveUsers.hook";
import { useAddMiembroEquipo } from "../hooks/useAddMiembroEquipo.hook";
import { useRemoveMiembroEquipo } from "../hooks/useRemoveMiembroEquipo.hook";
import type { EquipoJuridicoDto, EquipoJuridicoMiembroDto } from "../server/dtos/EquipoJuridicoDto.dto";

interface EquipoMiembrosManagerProps {
  equipo: EquipoJuridicoDto;
}

export function EquipoMiembrosManager({ equipo }: EquipoMiembrosManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: allUsers, isPending: isLoadingUsers } = useGetActiveUsers();
  const addMiembroMutation = useAddMiembroEquipo();
  const removeMiembroMutation = useRemoveMiembroEquipo();

  // Filter out users already in the team
  const memberUserIds = new Set(equipo.miembros.map((m) => m.usuarioId));
  const availableUsers = (allUsers ?? []).filter(
    (u) => !memberUserIds.has(u.id)
  );

  const handleAddMiembro = async () => {
    if (!selectedUserId) return;
    await addMiembroMutation.mutateAsync({
      equipoId: equipo.id,
      usuarioId: selectedUserId,
    });
    setSelectedUserId("");
  };

  const handleRemoveMiembro = async (miembro: EquipoJuridicoMiembroDto) => {
    await removeMiembroMutation.mutateAsync({
      equipoId: equipo.id,
      usuarioId: miembro.usuarioId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Miembros del equipo
        </span>
        <Badge variant="secondary" className="text-xs">
          {equipo.miembros.length}
        </Badge>
      </div>

      {/* Current members list */}
      <div className="space-y-2">
        {equipo.miembros.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Este equipo no tiene miembros aún.
          </p>
        ) : (
          equipo.miembros.map((miembro) => (
            <div
              key={miembro.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium">{miembro.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {miembro.userEmail}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveMiembro(miembro)}
                disabled={removeMiembroMutation.isPending}
                title="Remover miembro"
              >
                <UserMinus className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            </div>
          ))
        )}
      </div>

      <Separator />

      {/* Add member section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Agregar miembro</Label>
        <div className="flex gap-2">
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={isLoadingUsers || availableUsers.length === 0}
          >
            <SelectTrigger className="flex-1">
              <SelectValue
                placeholder={
                  isLoadingUsers
                    ? "Cargando usuarios..."
                    : availableUsers.length === 0
                      ? "No hay usuarios disponibles"
                      : "Selecciona un usuario"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            onClick={handleAddMiembro}
            disabled={
              !selectedUserId ||
              addMiembroMutation.isPending ||
              availableUsers.length === 0
            }
            className="shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
