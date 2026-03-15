-- AlterTable
ALTER TABLE "User" ADD COLUMN "trainer_profile_complete_at" TIMESTAMP(3);

-- Backfill: mark existing trainers with required profile fields as complete so they remain visible
UPDATE "User"
SET "trainer_profile_complete_at" = NOW()
WHERE "role" = 'trainer'
  AND "name" IS NOT NULL AND TRIM("name") != ''
  AND "about" IS NOT NULL AND TRIM("about") != ''
  AND "years_experience" IS NOT NULL
  AND "language_spoken" IS NOT NULL AND TRIM("language_spoken") != ''
  AND "street_line1" IS NOT NULL AND TRIM("street_line1") != ''
  AND "city" IS NOT NULL AND TRIM("city") != ''
  AND "postal_code" IS NOT NULL AND TRIM("postal_code") != '';
