#!/bin/sh
set -e

echo "Waiting for database and applying migrations..."
npx prisma migrate deploy

echo "Seeding database (idempotent)..."
npx prisma db seed

echo "Starting application..."
exec "$@"
