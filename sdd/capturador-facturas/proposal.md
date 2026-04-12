# Proposal: Rol Capturador de Facturas

## Intent

Introducir un nuevo rol "Capturador" que permite a usuarios registrar facturas propias en el sistema sin acceso al Dashboard general ni capacidad de edición de facturas ajenas. Resuelve la necesidad de que personal administrativo capture comprobantes sin privilegios de manager.

## Scope

### In Scope
- Nuevo permiso `facturas:capturar` para server actions
- Formulario de captura con allowlist de campos permitidos (RFC emisor/receptor, UUID, concepto, serie, folio, uso CFDI, moneda, subtotal, IVA, impuestos)
- Restricción de visibility: solo ve facturas propias (`ingresadoPor = userId`)
- Restricción de edición: solo facturas propias con <24h de antigüedad
- Status default `VIGENTE` para facturas creadas por Capturador
- Restricción de acceso a Dashboard y funciones de exportar/importar/eliminar

### Out of Scope
- Multi-tenant (fuera del alcance actual)
- Notificaciones en tiempo real de cambios de rol
- Row-level security a nivel de base de datos (Postgres RLS)
- API REST para integración externa

## Approach

1. **Permiso nuevo**: Agregar `facturas:capturar` en seed — no rompe permisos existentes
2. **Ownership**: Usar campo `ingresadoPor` existente en `Factura` — no requiere migración
3. **Sanitización back-end**: Allowlist explícita en server action, nunca confiar en front
4. **Restricción temporal**: Lógica `< 24h` en server action (no es regla de dominio)
5. **Formulario condicional**: Reutilizar form existente con prop `mode: "capturador"`
6. **Columnas dinámicas**: Extender sistema de visibility por rol existente

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Agregar `facturas:capturar` a enum de permisos (si existe) o seed |
| `src/core/lib/permissions/` | Modified | Actualizar requireAnyPermission con `facturas:capturar` |
| `src/features/finanzas/facturas/server/actions/` | Modified | Agregar create/update con ownership y allowlist |
| `src/features/finanzas/facturas/server/services/FacturaService.service.ts` | Modified | Filtro por userId en queries |
| `src/features/finanzas/facturas/components/FacturaForm.tsx` | Modified | Agregar prop `mode` con secciones condicionales |
| `src/features/finanzas/facturas/components/FacturaTable.tsx` | Modified | Filtering por ownership |
| `src/features/finanzas/facturas/pages/` | Modified | Pages condicionales por rol |
| `src/app/(Dashboard)/facturas/` | Modified | Middleware/route config para capturador |
| `src/core/lib/permissions/server-permissions-guard.ts` | Modified | Agregar `facturas:capturar` |
| `seed/*.ts` | Modified | Insertar nuevo rol y permiso |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Retraso en propagación de cambios de rol (JWT no refresh) | Medium | Documentar que requiere re-login para aplicar |
| Edge case: factura exactamente en 24h | Low | Usar `< 24h` (strictly less than) |
| Capturador intenta manipular form/Request | High | Allowlist obligatoria en server action |

## Rollback Plan

1. Remover `facturas:capturar` del seed
2. Quitar lógica de ownership en service/actions
3. Revertir cambios en form y table
4. No requiere migración DB (ownership usa campo existente)

## Dependencies

- `Factura.ingresadoPor` campo existente en schema (no migración)
- Sistema de permisos `resource:action` existente
- Formulario y tabla de facturas existentes

## Success Criteria

- [ ] Usuario con rol Capturador solo ve sus propias facturas
- [ ] Capturador no puede editar facturas >24h old
- [ ] Capturador no ve campos de status/pago en formulario
- [ ] BACK protege todos los campos no permitidos aunque front oculte
- [ ] Capturador no tiene acceso a Dashboard ni exportar/importar