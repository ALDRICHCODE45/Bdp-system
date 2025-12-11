/**
 * Agrega o actualiza un item en localStorage
 * @param key - La clave del item
 * @param value - El valor a almacenar (se convierte automáticamente a JSON)
 * @returns true si se guardó correctamente, false si hubo un error
 */
export const setLocalStorageItem = <T>(key: string, value: T): boolean => {
  // Verificar si estamos en el cliente (Next.js puede renderizar en servidor)
  if (typeof window === "undefined") {
    console.warn("localStorage no está disponible en el servidor");
    return false;
  }

  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error al guardar en localStorage con key "${key}":`, error);
    return false;
  }
};

/**
 * Obtiene un item de localStorage
 * @param key - La clave del item
 * @param defaultValue - Valor por defecto si no existe o hay error
 * @returns El valor deserializado o el valor por defecto
 */
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error al leer de localStorage con key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Elimina un item de localStorage
 * @param key - La clave del item a eliminar
 * @returns true si se eliminó correctamente, false si hubo un error
 */
export const removeLocalStorageItem = (key: string): boolean => {
  if (typeof window === "undefined") {
    console.warn("localStorage no está disponible en el servidor");
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error al eliminar de localStorage con key "${key}":`, error);
    return false;
  }
};

/**
 * Limpia todo el localStorage
 * @returns true si se limpió correctamente, false si hubo un error
 */
export const clearLocalStorage = (): boolean => {
  if (typeof window === "undefined") {
    console.warn("localStorage no está disponible en el servidor");
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error al limpiar localStorage:", error);
    return false;
  }
};
