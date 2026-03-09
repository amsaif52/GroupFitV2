-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "allowed_days" TEXT,
ADD COLUMN     "single_use_per_customer" BOOLEAN NOT NULL DEFAULT false;
