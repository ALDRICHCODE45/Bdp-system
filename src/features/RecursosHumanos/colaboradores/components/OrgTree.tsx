"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";

import { Badge } from "@/core/shared/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/shared/ui/collapsible";
import { cn } from "@/core/lib/utils";

import { ColaboradorStatusBadge } from "./ColaboradorStatusBadge";
import type {
  OrgTreeDto,
  OrgTreeNode,
} from "../server/dtos/OrgTreeDto.dto";

interface OrgTreeProps {
  tree: OrgTreeDto;
}

/**
 * P4 — cap7 employee-org-tree (2-level: socio root → colaborador leaves).
 *
 * Rendering rules:
 * - One collapsible `<Collapsible>` per `OrgTreeNode` (one per Socio, plus
 *   the synthetic "Sin socio asignado" bucket).
 * - The current colaborador's row is visually highlighted with a ring +
 *   subtle background (cap7 req2).
 * - The count badge stays visible even when the node is collapsed
 *   (cap7 scenario: "collapse socio → count badge persists").
 * - The current bucket starts expanded by default (so the user always sees
 *   their context); other buckets start collapsed when there are more than
 *   two nodes total (avoids clutter when the org has many socios).
 *
 * No data fetching here — pure presentational, the parent passes the
 * pre-built `OrgTreeDto` straight from the route prefetch.
 */
export function OrgTree({ tree }: OrgTreeProps) {
  const { nodes, currentColaboradorId } = tree;

  if (nodes.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Aún no hay colaboradores registrados.
      </div>
    );
  }

  // Start the current bucket open and all others closed when there are
  // many nodes; when the org has only 1–2 nodes, default-open them all for
  // discoverability.
  const allOpenByDefault = nodes.length <= 2;
  const initiallyOpenIds = new Set<string | null>(
    allOpenByDefault
      ? nodes.map((n) => n.socioId)
      : nodes.filter((n) => n.isCurrentBucket).map((n) => n.socioId)
  );

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <OrgTreeNodeRow
          key={node.socioId ?? "__sin_socio__"}
          node={node}
          currentColaboradorId={currentColaboradorId}
          defaultOpen={initiallyOpenIds.has(node.socioId)}
        />
      ))}
    </div>
  );
}

/* ── Single bucket ─────────────────────────────────────────────────────── */

function OrgTreeNodeRow({
  node,
  currentColaboradorId,
  defaultOpen,
}: {
  node: OrgTreeNode;
  currentColaboradorId: string;
  defaultOpen: boolean;
}) {
  // We mirror `open` in component state so the count badge can sit OUTSIDE
  // the CollapsibleContent — it always renders regardless of collapsed state.
  const [open, setOpen] = useState(defaultOpen);

  const headerLabel = node.label;
  const headerId = `org-tree-bucket-${node.socioId ?? "sin-socio"}`;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "rounded-md border",
        node.isCurrentBucket
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-2 p-3">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-controls={headerId}
            aria-expanded={open}
            className="flex flex-1 items-center gap-2 text-left hover:bg-muted/40 rounded-sm px-1 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">
                {headerLabel}
              </div>
              {node.subLabel ? (
                <div className="text-xs text-muted-foreground truncate">
                  {node.subLabel}
                </div>
              ) : null}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Count badge persists on collapse (cap7 scenario). */}
        <Badge
          variant={node.isCurrentBucket ? "default" : "secondary"}
          className="shrink-0"
          aria-label={`${node.count} colaboradores`}
        >
          {node.count}
        </Badge>
      </div>

      <CollapsibleContent id={headerId}>
        <ul className="divide-y border-t">
          {node.colaboradores.map((c) => {
            const isCurrent = c.id === currentColaboradorId;
            return (
              <li
                key={c.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-2",
                  isCurrent &&
                    "bg-primary/10 ring-1 ring-primary/40 ring-inset rounded-sm"
                )}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm truncate",
                        isCurrent
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      {c.name}
                    </span>
                    {isCurrent ? (
                      <Badge variant="outline" className="text-[10px]">
                        Actual
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.puesto} · {c.correo}
                  </div>
                </div>
                <ColaboradorStatusBadge status={c.status} />
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}