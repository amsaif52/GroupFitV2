-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "apple_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_google_id_key" ON "User"("google_id");
CREATE UNIQUE INDEX IF NOT EXISTS "User_apple_id_key" ON "User"("apple_id");
