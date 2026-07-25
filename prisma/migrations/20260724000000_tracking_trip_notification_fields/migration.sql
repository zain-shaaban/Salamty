-- AlterTable: Notification gains a human-readable title/body for a persistent inbox.
-- Added with a temporary default so the migration is safe on tables that already
-- hold rows; the default is dropped immediately to match the schema (no DB default).
ALTER TABLE "Notification" ADD COLUMN "title" TEXT NOT NULL DEFAULT '',
ADD COLUMN "body" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Notification" ALTER COLUMN "title" DROP DEFAULT,
ALTER COLUMN "body" DROP DEFAULT;

-- AlterTable: Trip stores its destination + estimated arrival directly.
ALTER TABLE "Trip" ADD COLUMN "destinationLat" DOUBLE PRECISION,
ADD COLUMN "destinationLng" DOUBLE PRECISION,
ADD COLUMN "estimatedArrival" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Trip_userId_status_idx" ON "Trip"("userId", "status");
