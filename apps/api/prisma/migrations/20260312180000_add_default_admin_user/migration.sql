-- Insert default admin, trainer, and customer users for initial setup.
-- Safe to run multiple times: skips if email already exists.
-- Login: use OTP to these emails or link Google/Apple in your app.
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'clq0admin000000000000001',
  'admin@groupfit.example',
  'Admin',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'clq0trainer00000000000001',
  'trainer@groupfit.example',
  'Demo Trainer',
  'trainer',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'clq0customer0000000000001',
  'customer@groupfit.example',
  'Demo Customer',
  'customer',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
