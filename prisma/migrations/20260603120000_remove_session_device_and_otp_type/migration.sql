-- DropIndex
DROP INDEX "UserAuthOtp_userId_type_idx";

-- AlterTable
ALTER TABLE "UserAuthOtp" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "deviceInfo",
DROP COLUMN "ipAddress";

-- DropEnum
DROP TYPE "OtpType";

-- CreateIndex
CREATE INDEX "UserAuthOtp_userId_idx" ON "UserAuthOtp"("userId");
