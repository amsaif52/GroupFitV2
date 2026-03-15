-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN DEFAULT false;
