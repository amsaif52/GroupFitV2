-- Add feature flags: issociallogin, emaillogin (both false by default)
INSERT INTO "feature_flag" ("id", "name", "status", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'issociallogin', false, NOW()),
  (gen_random_uuid()::text, 'emaillogin', false, NOW())
ON CONFLICT ("name") DO NOTHING;
