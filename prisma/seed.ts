import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@123456';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username: 'admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      confirmed: true,
    },
  });

  console.log(`Admin created: ${email}`);
}

async function seedAppConfig() {
  const existing = await prisma.appConfig.findFirst();
  if (existing) {
    console.log('App config already exists');
    return;
  }

  await prisma.appConfig.create({
    data: {
      lastVersion: '1.0.0',
      requiredVersion: '1.0.0',
      downloadURL: 'https://play.google.com/store/apps/details?id=com.salamty',
    },
  });

  console.log('App config created');
}

async function main() {
  await seedAdmin();
  await seedAppConfig();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
