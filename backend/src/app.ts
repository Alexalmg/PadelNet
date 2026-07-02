import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { sequelize } from './config/database';
import './models';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import teamsRoutes from './routes/teams.routes';
import leaguesRoutes from './routes/leagues.routes';
import matchesRoutes from './routes/matches.routes';
import captainRequestsRoutes from './routes/captain-requests.routes';
import matchRequestsRoutes from './routes/match-requests.routes';
import notificationsRoutes from './routes/notifications.routes';
import disputesRoutes from './routes/disputes.routes';
import statsRoutes from './routes/stats.routes';
import achievementsRoutes from './routes/achievements.routes';
import paymentsRoutes from './routes/payments.routes';
import sponsorsRoutes from './routes/sponsors.routes';
import announcementsRoutes from './routes/announcements.routes';
import teamInvitationsRoutes from './routes/team-invitations.routes';
import clubsRoutes from './routes/clubs.routes';
import { startActivityCheckJob } from './jobs/activity-check.job';
import { runSeed } from './seed';

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'production' ? 100 : 10000 }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/leagues', leaguesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/captain-requests', captainRequestsRoutes);
app.use('/api/match-requests', matchRequestsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/team-invitations', teamInvitationsRoutes);
app.use('/api/clubs', clubsRoutes);

async function runSchemaMigrations() {
  await sequelize.query(`ALTER TABLE matches ADD COLUMN IF NOT EXISTS location VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check`);
  await sequelize.query(`
    ALTER TABLE matches ADD CONSTRAINT matches_status_check
    CHECK (status IN ('pending_proposal','proposed','scheduled','in_progress','completed','cancelled','disputed'))
  `);
  // Email verification fields
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(64)`);
  // Mark all pre-existing users (seed/admin) as verified
  await sequelize.query(`UPDATE users SET "emailVerified" = true WHERE "emailVerified" = false AND "createdAt" < NOW() - interval '1 minute'`);
  // User profile fields
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "isProfileComplete" BOOLEAN NOT NULL DEFAULT false`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "profilePhotoUrl" TEXT`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(500)`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "padelLevel" VARCHAR(20)`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferredSide" VARCHAR(10)`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "yearsPlaying" INTEGER`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferredCourt" VARCHAR(20)`);
  // Clubs
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL,
      phone VARCHAR(30),
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await sequelize.query(`ALTER TABLE matches ADD COLUMN IF NOT EXISTS "clubId" INTEGER REFERENCES clubs(id)`);
  // Team join requests
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS team_join_requests (
      id SERIAL PRIMARY KEY,
      "teamId" INTEGER NOT NULL REFERENCES teams(id),
      "userId" INTEGER NOT NULL REFERENCES users(id),
      status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  // clubId on match proposals
  await sequelize.query(`ALTER TABLE match_proposals ADD COLUMN IF NOT EXISTS "clubId" INTEGER REFERENCES clubs(id)`);

  // Team invitations
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS team_invitations (
      id SERIAL PRIMARY KEY,
      "teamId" INTEGER NOT NULL REFERENCES teams(id),
      "invitedUserId" INTEGER NOT NULL REFERENCES users(id),
      "invitedBy" INTEGER NOT NULL REFERENCES users(id),
      status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

// Serve frontend in production (when files are present alongside dist/)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

async function startServer() {
  await sequelize.authenticate();
  console.log('Database connected');
  await sequelize.sync();
  console.log('Models synced');

  await runSchemaMigrations();
  console.log('Schema migrations applied');

  await runSeed();
  console.log('Seed ejecutado');

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));

  startActivityCheckJob();
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
