import 'reflect-metadata';
import { AppDataSource } from './data-source';
import * as bcrypt from 'bcrypt';

const SEED_USERS = [
  {
    email: 'admin@permits.local',
    password: 'Admin@12345!',
    full_name: 'System Admin',
    role: 'admin',
  },
  {
    email: 'reviewer@permits.local',
    password: 'Reviewer@12345!',
    full_name: 'Jane Reviewer',
    role: 'reviewer',
  },
  {
    email: 'applicant@permits.local',
    password: 'Applicant@12345!',
    full_name: 'John Applicant',
    role: 'applicant',
  },
];

async function runSeed() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  for (const user of SEED_USERS) {
    const password_hash = await bcrypt.hash(user.password, 12);
    await AppDataSource.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4::user_role, true)
       ON CONFLICT (email) DO NOTHING`,
      [user.email, password_hash, user.full_name, user.role],
    );
    console.log(`Seeded (or skipped): ${user.email}`);
  }

  await AppDataSource.destroy();
  console.log('Seed complete');
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

export { runSeed };
