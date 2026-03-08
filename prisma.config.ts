import { defineConfig } from "prisma/config";
import 'dotenv/config'

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // DATABASE_URL puede no estar disponible en build time (ej: docker build).
    // prisma generate no necesita conexión — solo lee el schema.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
