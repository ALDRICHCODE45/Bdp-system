"use client";

interface ColaboradorInfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

/**
 * Componente reutilizable para mostrar campos label:value en el perfil del colaborador
 */
export function ColaboradorInfoField({
  label,
  value,
  className,
}: ColaboradorInfoFieldProps) {
  return (
    <div className={className}>
      <div className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

