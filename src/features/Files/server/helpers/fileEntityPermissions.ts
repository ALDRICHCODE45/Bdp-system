/**
 * secure-file-access — Phase 4 (shared entityType → permission map).
 *
 * Extracted from `getFilePresignedUrlAction.ts` (Phase 3) so the same source of
 * truth drives every guard in the Files feature. Before this helper existed,
 * each action reimplemented its own `switch (entityType)` and the maps could
 * drift silently (e.g. someone adding a new entityType to the union on the
 * Files side but forgetting one of the actions).
 *
 * The misspelling `clientes-proovedores:acceder` (and its `crear` /
 * `eliminar` siblings) is INTENTIONAL — it matches the literal strings in
 * `permissions.constant.ts`. Mirroring it correctly here keeps
 * `requireAnyPermission` from rejecting valid permissions because of a typo
 * mismatch.
 */

/**
 * Canonical FileAttachment entityType union. Kept local to the helper so
 * callers don't have to import the Prisma model just to typecheck a switch.
 */
export type FileEntityType =
  | "FACTURA"
  | "MOVIMIENTO"
  | "CLIENTE_PROVEEDOR"
  | "COLABORADOR";

/**
 * Map a FileAttachment entityType to the module-level permission required to
 * READ (list / presign) its files. Returned as the granular permission
 * string; module-wide `:gestionar` and `admin:all` are honored automatically
 * by `permission-checker.hasPermission` when this string is checked.
 *
 * Returns `null` for unknown entity types so callers can decide whether to
 * deny (recommended) or fall through.
 */
export function entityTypeToAccessPermission(
  entityType: FileEntityType
): string | null {
  switch (entityType) {
    case "FACTURA":
      return "facturas:acceder";
    case "MOVIMIENTO":
      return "movimientos:acceder";
    case "CLIENTE_PROVEEDOR":
      return "clientes-proovedores:acceder";
    case "COLABORADOR":
      return "colaboradores:acceder";
    default:
      return null;
  }
}

/**
 * Map a FileAttachment entityType to the module-level permission required to
 * CREATE (upload) a new file against it. Same return contract as the read
 * map.
 */
export function entityTypeToCreatePermission(
  entityType: FileEntityType
): string | null {
  switch (entityType) {
    case "FACTURA":
      return "facturas:crear";
    case "MOVIMIENTO":
      return "movimientos:crear";
    case "CLIENTE_PROVEEDOR":
      return "clientes-proovedores:crear";
    case "COLABORADOR":
      return "colaboradores:crear";
    default:
      return null;
  }
}

/**
 * Map a FileAttachment entityType to the module-level permission required to
 * DELETE one of its files. Same return contract as the read map.
 *
 * Note: `uploadFileAction` uses the `:crear` map (creating a file is the same
 * broad gate as creating the owning record); `getFilesByEntityAction` uses the
 * `:acceder` map (listing is a read); `deleteFileAction` uses this `:eliminar`
 * map. The three maps keep actions distinct so a user with only
 * `clientes-proovedores:crear` cannot delete files they uploaded.
 */
export function entityTypeToDeletePermission(
  entityType: FileEntityType
): string | null {
  switch (entityType) {
    case "FACTURA":
      return "facturas:eliminar";
    case "MOVIMIENTO":
      return "movimientos:eliminar";
    case "CLIENTE_PROVEEDOR":
      return "clientes-proovedores:eliminar";
    case "COLABORADOR":
      return "colaboradores:eliminar";
    default:
      return null;
  }
}
