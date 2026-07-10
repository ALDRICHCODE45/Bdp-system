"use client";

import { useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { getFacturaPdfPresignedUrlAction } from "@/features/finanzas/facturas/server/actions/getFacturaPdfPresignedUrlAction";

/**
 * secure-file-access — fix: client cell that serves the Factura SAT PDF
 * through the RBAC-gated `getFacturaPdfPresignedUrlAction`.
 *
 * Replaces the previous `<a href={factura.facturaUrl}>` direct render in
 * `FacturasTableColumns.tsx`. `facturaUrl` is no longer a public URL — it
 * is either a raw Spaces object key (new rows) or a legacy public URL
 * (rows pending the backfill). Either way the read path must go through
 * the server action so:
 *   - the auth + module-perm + capturador-ownership checks run server-side
 *     (the table cell is a UX shortcut; the server is the gate), and
 *   - the URL returned is either a fresh presigned GET (10 min TTL) or
 *     the legacy public URL preserved for unbackfilled rows.
 *
 * Inline async on the click handler (matches `FileList.tsx:82-105`):
 * TanStack Query is intentionally NOT used — the URL expires in 600 s, so
 * caching the result across renders would serve a stale signature. The
 * click is one-shot and idempotent (we gate on `loading` to prevent
 * spam-clicks minting multiple URLs).
 */
interface FacturaPdfCellProps {
  facturaId: string;
}

export function FacturaPdfCell({ facturaId }: FacturaPdfCellProps) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await getFacturaPdfPresignedUrlAction(facturaId);
      if (!result.ok) {
        toast.error(result.error || "Error al abrir el PDF");
        return;
      }
      window.open(result.data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Error al abrir el PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Abrir PDF timbrado"
    >
      {loading ? (
        <Loader2 className="size-3 shrink-0 animate-spin" />
      ) : (
        <ExternalLink className="size-3 shrink-0" />
      )}
      {loading ? "Abriendo…" : "PDF"}
    </button>
  );
}