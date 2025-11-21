"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/core/shared/ui/dropdown-menu";
import { Button } from "@/core/shared/ui/button";
import { EllipsisIcon } from "lucide-react";
import { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";

interface ColaboradorActionsDropdownProps {
  actions: ColaboradorAction[];
}

export function ColaboradorActionsDropdown({
  actions,
}: ColaboradorActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <EllipsisIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={action.onClick}
            className={action.variant === "destructive" ? "text-red-600" : ""}
          >
            {action.icon && <action.icon />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
