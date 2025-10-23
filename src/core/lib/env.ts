// TODO: Crear archivo .env.local en la raíz del proyecto con las siguientes variables:

export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "fallback-secret-key",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL,
} as const;

// TODO: Variables de entorno requeridas para .env.local:
/*
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Opcional: Base de datos
# DATABASE_URL=postgresql://username:password@localhost:5432/bdp_system
*/
