-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN "lastLocation" JSONB,
ADD COLUMN "path" JSONB,
ADD COLUMN "destination" JSONB;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastLocation",
DROP COLUMN "path",
DROP COLUMN "destination";
