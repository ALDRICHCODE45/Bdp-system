#!/bin/sh
set -e

echo "▶ Corriendo migraciones de Prisma..."
./node_modules/.bin/prisma migrate deploy

echo "▶ Iniciando la aplicación..."
exec node server.js
