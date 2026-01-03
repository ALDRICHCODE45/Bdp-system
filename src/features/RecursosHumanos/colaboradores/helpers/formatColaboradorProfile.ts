import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha en formato legible (ej: "5 de marzo, 1996")
 */
export function formatDate(fechaString: string | null): string {
  if (!fechaString) {
    return "No especificado";
  }

  try {
    const fecha = new Date(fechaString);
    return format(fecha, "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return "No especificado";
  }
}

/**
 * Formatea una fecha en formato corto (dd/MM/yyyy)
 */
export function formatDateShort(fechaString: string | null): string {
  if (!fechaString) {
    return "No especificado";
  }

  try {
    const fecha = new Date(fechaString);
    return format(fecha, "dd/MM/yyyy", { locale: es });
  } catch {
    return "No especificado";
  }
}

/**
 * Formatea una cantidad monetaria en pesos mexicanos
 */
export function formatCurrency(amount: string | number | null): string {
  if (amount === null || amount === "") {
    return "No especificado";
  }

  try {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) {
      return "No especificado";
    }

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(numericAmount);
  } catch {
    return "No especificado";
  }
}

/**
 * Formatea el estado del colaborador
 */
export function formatStatus(status: string): { label: string; variant: "success-outline" | "warning-outline" } {
  const statusMap: Record<string, { label: string; variant: "success-outline" | "warning-outline" }> = {
    CONTRATADO: { label: "Contratado", variant: "success-outline" },
    DESPEDIDO: { label: "Despedido", variant: "warning-outline" },
  };

  return statusMap[status] || { label: status, variant: "success-outline" };
}

/**
 * Formatea un valor booleano
 */
export function formatBoolean(value: boolean | null): string {
  if (value === null) {
    return "No especificado";
  }
  return value ? "Sí" : "No";
}

/**
 * Formatea un valor genérico, mostrando "No especificado" si es nulo o vacío
 */
export function formatValue(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }
  return value;
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calculateAge(fechaNacimiento: string | null): number | null {
  if (!fechaNacimiento) {
    return null;
  }

  try {
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
}

