'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new client_1.PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash,
      role: 'customer',
      locale: 'en',
    },
  });
  console.log('Seeded user customer@example.com / password123');
}
main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
//# sourceMappingURL=seed.js.map
