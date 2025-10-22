export const filterTipoOptions = [
  { value: "todos", label: "Todos los tipos" },
  { value: "ingreso", label: "Ingreso" },
  { value: "egreso", label: "Egreso" },
] as const;
export const filterEstadoOptions = [
  { value: "todos", label: "Todos los estados" },
  { value: "Pagada", label: "pagada" },
  { value: "Enviada", label: "Enviada" },
  { value: "NoPagada", label: "No pagada" },
  { value: "Cancelada", label: "Cancelada" },
] as const;

export const filterMetodoPagoOptions = [
  { value: "todos", label: "Todos los estados" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Efectivo", label: "Efectivo" },
  { value: "Cheque", label: "Cheque" },
] as const;
