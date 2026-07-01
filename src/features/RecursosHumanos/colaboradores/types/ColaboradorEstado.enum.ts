/**
 * Enum para el estado de un colaborador
 * Replica el enum ColaboradorEstado de Prisma para uso en el cliente
 * (rh-colaboradores-completo · P0: + EN_LICENCIA)
 */
export enum ColaboradorEstado {
  CONTRATADO = "CONTRATADO",
  DESPEDIDO = "DESPEDIDO",
  EN_LICENCIA = "EN_LICENCIA",
}

/**
 * Type guard para verificar si un valor es un ColaboradorEstado válido
 */
export function isColaboradorEstado(value: string): value is ColaboradorEstado {
  return Object.values(ColaboradorEstado).includes(value as ColaboradorEstado);
}
