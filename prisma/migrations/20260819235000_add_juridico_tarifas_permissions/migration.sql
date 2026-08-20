-- Seed idempotente de permisos del módulo de tarifas jurídicas.
--
-- Se ejecuta automáticamente en producción a través de `prisma migrate deploy`
-- (entrypoint del contenedor en cada deploy), sin depender de que el seed
-- corra en CI. Es idempotente: si los permisos ya existen (por seed manual o
-- deploy anterior), no hace nada.

-- Permiso granular: acceder al módulo de tarifas
INSERT INTO "Permission" ("id", "name", "resource", "action", "description", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text,
       'juridico-tarifas:acceder',
       'juridico-tarifas',
       'acceder',
       'Acceder al módulo de tarifas por abogado y asunto',
       NOW(),
       NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Permission" WHERE "name" = 'juridico-tarifas:acceder'
);

-- Permiso modular: administrar tarifas
INSERT INTO "Permission" ("id", "name", "resource", "action", "description", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text,
       'juridico-tarifas:gestionar',
       'juridico-tarifas',
       'gestionar',
       'Administrar tarifas por abogado y asunto',
       NOW(),
       NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Permission" WHERE "name" = 'juridico-tarifas:gestionar'
);

-- Asignar 'juridico-tarifas:gestionar' al rol 'socio' si existe (REQ-PR-101).
-- El rol admin ya lo cubre vía 'admin:all'. Idempotente por @@unique([roleId, permissionId]).
INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT gen_random_uuid()::text, r.id, p.id, NOW()
FROM "Role" r
JOIN "Permission" p ON p.name = 'juridico-tarifas:gestionar'
WHERE r.name = 'socio'
  AND NOT EXISTS (
    SELECT 1 FROM "RolePermission" rp
    WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
  );
