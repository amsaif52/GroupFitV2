import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      role: 'customer',
      locale: 'en',
      state: 'CA',
    },
  });
  console.log('Seeded user customer@example.com');

  await prisma.user.upsert({
    where: { email: 'admin@groupfitapp.com' },
    update: {},
    create: {
      email: 'admin@groupfitapp.com',
      name: 'Admin',
      role: 'admin',
      locale: 'en',
      state: 'NA',
    },
  });
  console.log('Seeded user admin@groupfitapp.com (admin role)');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
