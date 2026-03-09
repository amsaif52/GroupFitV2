-- AlterTable: Activity extra columns for admin list (logo, group, trainer share, status, created/updated by)
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "activity_group" TEXT;
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "trainer_share_percent" INTEGER;
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "created_by_id" TEXT;
ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "updated_by_id" TEXT;

-- Foreign keys for createdBy/updatedBy (optional; Prisma relations work without them)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activity_created_by_id_fkey') THEN
    ALTER TABLE "activity" ADD CONSTRAINT "activity_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activity_updated_by_id_fkey') THEN
    ALTER TABLE "activity" ADD CONSTRAINT "activity_updated_by_id_fkey"
      FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
