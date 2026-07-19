import { config } from "dotenv";

// Los scripts de seed corren bajo `tsx` (runtime Node), que —a diferencia de
// `bun run`— no carga automáticamente los archivos .env. Cargamos las variables
// ANTES de importar cualquier módulo que lea process.env en tiempo de import
// (por ejemplo env.config.ts, que valida y lanza si faltan variables).
//
// Las variables requeridas están repartidas entre ambos archivos, así que se
// cargan los dos: `.env.local` tiene precedencia sobre `.env`, igual que en
// Next.js. Los archivos ausentes se ignoran, por lo que en producción se usan
// las variables reales del entorno del contenedor.
config({ path: [".env.local", ".env"] });
