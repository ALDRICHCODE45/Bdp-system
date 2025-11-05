/**
 * Devuelve los colores para un badge de shadcn basado en el status de usuario.
 * @param status - true para activo, false para inactivo
 * @returns string
 */
const getUserStatusColors = (status: boolean) => {
  return status
    ? "bg-green-100 text-green-700 border-green-500"
    : "bg-red-100 text-red-700 border-red-500";
};

export default getUserStatusColors;
