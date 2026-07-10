-- AlterTable
-- Mirrors the FileAttachment.originalFileUrl pattern (migration
-- 20260709150000_add_file_original_url). One nullable column per
-- direct-URL column whose value the ACL backfill needs to be able to
-- restore on `--revert`. Empty string/null before the backfill runs;
-- populated lazily by scripts/migrate-file-acl.ts only on rows whose
-- `facturaUrl` still starts with `http` (legacy public URL).
ALTER TABLE "Factura" ADD COLUMN     "originalFacturaUrl" TEXT;