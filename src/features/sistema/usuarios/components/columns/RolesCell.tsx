import { Badge } from "@/core/shared/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";

export function RolesCell({ roles }: { roles: string[] }) {
  // Si no hay roles
  if (!roles || roles.length === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        Sin roles
      </Badge>
    );
  }

  // Si hay 1-2 roles, mostrar todos sin el "+N más"
  if (roles.length <= 2) {
    return (
      <div className="flex gap-1 flex-wrap">
        {roles.map((role) => (
          <Badge key={role} variant="secondary" className="text-xs">
            {role}
          </Badge>
        ))}
      </div>
    );
  }

  // Si hay más de 2 roles, mostrar los primeros 2 + "+N más"
  const visibleRoles = roles.slice(0, 2);
  const remainingCount = roles.length - 2;

  return (
    <div className="flex gap-1 flex-wrap items-center">
      {visibleRoles.map((role) => (
        <Badge key={role} variant="secondary" className="text-xs">
          {role}
        </Badge>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className="text-xs cursor-pointer hover:bg-accent transition-colors"
          >
            +{remainingCount} más
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <div className="text-sm font-medium mb-2">Todos los roles:</div>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
