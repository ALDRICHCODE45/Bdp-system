"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Button } from "@/core/shared/ui/button";
import { EllipsisIcon } from "lucide-react";
import { EntradaSalidaAction } from "./forms/EntradaSalidaActions.config";

interface EntradaSalidaActionsDropdownProps {
  actions: EntradaSalidaAction[];
}

export function EntradaSalidaActionsDropdown({
  actions,
}: EntradaSalidaActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <EllipsisIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={action.onClick}
            className={action.variant === "destructive" ? "text-red-600" : ""}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
