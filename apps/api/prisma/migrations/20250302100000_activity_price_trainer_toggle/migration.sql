-- AlterTable: Activity default price (admin-set)
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "default_price_cents" INTEGER;

-- AlterTable: User trainer flag (admin toggle)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trainer_can_set_own_price" BOOLEAN;

-- AlterTable: TrainerActivity trainer override price
ALTER TABLE "trainer_activity" ADD COLUMN IF NOT EXISTS "price_cents" INTEGER;
