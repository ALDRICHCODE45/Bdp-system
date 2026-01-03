"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/core/shared/ui/card";
import { Button } from "@/core/shared/ui/button";
import { Edit } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface ColaboradorProfileSectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  className?: string;
}

/**
 * Wrapper reutilizable para cada sección/card del perfil del colaborador
 */
export function ColaboradorProfileSection({
  title,
  children,
  onEdit,
  className,
}: ColaboradorProfileSectionProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {onEdit && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

