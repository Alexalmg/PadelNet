-- PadelNet — Schema inicial

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('player', 'captain', 'admin')) DEFAULT 'player',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "captainId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leagues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "adminId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS divisions (
  id SERIAL PRIMARY KEY,
  "leagueId" INTEGER REFERENCES leagues(id) ON DELETE CASCADE,
  name VARCHAR(255),
  level INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seasons (
  id SERIAL PRIMARY KEY,
  "divisionId" INTEGER REFERENCES divisions(id) ON DELETE CASCADE,
  name VARCHAR(255),
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  status VARCHAR(20) CHECK (status IN ('planning', 'active', 'finished')) DEFAULT 'planning',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_players (
  id SERIAL PRIMARY KEY,
  "teamId" INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
  "joinedAt" TIMESTAMPTZ DEFAULT NOW(),
  "isActive" BOOLEAN DEFAULT true,
  UNIQUE("teamId", "userId"),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  "seasonId" INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
  "homeTeamId" INTEGER REFERENCES teams(id),
  "awayTeamId" INTEGER REFERENCES teams(id),
  "matchDate" TIMESTAMPTZ,
  "weekNumber" INTEGER,
  status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  "homeTeamConfirmed" BOOLEAN DEFAULT false,
  "awayTeamConfirmed" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_results (
  id SERIAL PRIMARY KEY,
  "matchId" INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  "gameNumber" INTEGER,
  "homeTeamScore" INTEGER,
  "awayTeamScore" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lineups (
  id SERIAL PRIMARY KEY,
  "matchId" INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  "teamId" INTEGER REFERENCES teams(id),
  "pairNumber" INTEGER,
  "player1Id" INTEGER REFERENCES users(id),
  "player2Id" INTEGER REFERENCES users(id),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penalties (
  id SERIAL PRIMARY KEY,
  "teamId" INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  "seasonId" INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('automatic', 'manual')),
  reason VARCHAR(50) CHECK (reason IN ('no_activity', 'late_result', 'no_show', 'other')),
  points INTEGER,
  description TEXT,
  "appliedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  "teamId" INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  "seasonId" INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
  "weekStartDate" DATE,
  "weekEndDate" DATE,
  "matchesPlayed" INTEGER DEFAULT 0,
  "infractionCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function para updatedAt automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON divisions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON team_players FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON match_results FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lineups FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON penalties FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON activity_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS captain_requests (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  message TEXT,
  "reviewedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON captain_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS match_requests (
  id SERIAL PRIMARY KEY,
  "seasonId" INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
  "requestingTeamId" INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  "opposingTeamId" INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  "weekNumber" INTEGER,
  "proposedDate" TIMESTAMPTZ,
  message TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON match_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
