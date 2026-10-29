import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

const BCRYPT_SALT_ROUNDS = 10;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: 'Admin',
          role: 'ADMIN',
          emailVerified: true,
          onboardingCompleted: true,
        },
      });
      console.log(`Admin user ${email} created`);
    } else if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
      console.log(`Existing user ${email} promoted to ADMIN`);
    } else {
      console.log(`Admin user ${email} already exists — nothing to do`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
