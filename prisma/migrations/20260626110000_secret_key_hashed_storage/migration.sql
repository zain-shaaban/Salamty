-- Secret keys are generated in application code and stored as SHA-256 hashes.
ALTER TABLE "User" ALTER COLUMN "secretKey" DROP DEFAULT;
