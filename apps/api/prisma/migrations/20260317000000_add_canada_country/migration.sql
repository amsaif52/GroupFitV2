-- Add Canada to country table with ISD code +1 (only if not already present)
INSERT INTO "country" ("id", "name", "isd_code", "updated_by_id", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'Canada', '+1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "country" WHERE "name" = 'Canada' AND "isd_code" = '+1');
