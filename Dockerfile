# syntax=docker.io/docker/dockerfile:1

# ──────────────────────────────────────────────
# BASE: Node Alpine + Bun instalado una sola vez
# ──────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl bash
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN curl -fsSL https://bun.sh/install | bash

# ──────────────────────────────────────────────
# DEPS: Instalar dependencias con Bun
# ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ──────────────────────────────────────────────
# BUILDER: Compilar Next.js (standalone output)
# ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma client antes del build
RUN bunx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# ── Build-time ENV placeholders ──────────────────────────────────────────────
# Next.js ejecuta código server-side al hacer "Collecting page data".
# El validador Zod de env.config.ts necesita estas vars en build time.
# Son valores DUMMY — las reales las inyecta Dockploy en runtime.
# Estas ENVs NO viajan al runner stage (multi-stage aislado).
ENV AUTH_SECRET="build-time-placeholder-secret-xxxxxxxxxxxxxxxx" \
    NEXTAUTH_URL="http://localhost:3000" \
    AUTH_ORIGIN="http://localhost:3000" \
    AUTH_TRUST_HOST="true" \
    DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    DO_SPACES_ENDPOINT="https://placeholder.digitaloceanspaces.com" \
    DO_ACCESS_KEY="placeholder-key" \
    DO_SECRET_KEY="placeholder-secret" \
    DO_SPACES_BUCKET="placeholder-bucket" \
    DO_SPACES_REGION="placeholder-region"

RUN bun run build

# ──────────────────────────────────────────────
# RUNNER: Imagen final mínima de producción
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Assets estáticos
COPY --from=builder /app/public ./public

# Output standalone de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema + migrations para poder correr migrate deploy en runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# CLI de Prisma v6 (node_modules/.bin/prisma) necesario para migrate deploy en runtime.
# npx sin versión bajaria Prisma 7 que tiene breaking changes incompatibles con este proyecto.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Entrypoint: corre migraciones y luego levanta la app
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

CMD ["./entrypoint.sh"]
