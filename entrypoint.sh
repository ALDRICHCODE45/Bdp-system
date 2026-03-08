#!/bin/sh
set -e

echo "▶ Corriendo migraciones de Prisma..."
npx prisma migrate deploy

echo "▶ Iniciando la aplicación..."
exec node server.js
