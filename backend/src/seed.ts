import bcrypt from 'bcryptjs';
import { User, UserRole, Team, League, Division, Season, TeamPlayer, Match, Achievement, Payment } from './models';

const TEAM_NAMES = [
  'Raquetas FC', 'Padel Kings', 'Los Dinamita', 'La Armada',
  'Team Smash', 'Los Lobos', 'Tigres del Sur', 'El Vendaval',
];

const ACHIEVEMENTS_CATALOG = [
  { slug: 'primera_victoria',  name: 'Primera Victoria',      description: 'Gana tu primer partido',                          icon: '🏆' },
  { slug: 'diez_victorias',    name: 'Diez Victorias',        description: 'Acumula 10 victorias en una temporada',            icon: '⭐' },
  { slug: 'veinte_victorias',  name: 'Veinte Victorias',      description: 'Acumula 20 victorias en una temporada',            icon: '🌟' },
  { slug: 'rey_pista',         name: 'Rey de la Pista',       description: 'Alcanza 30 victorias en una temporada',            icon: '👑' },
  { slug: 'mvp_x3',            name: 'MVP Serial',            description: 'Recibe 3 votos MVP en una temporada',              icon: '🎯' },
  { slug: 'racha_5',           name: 'Racha Imparable',       description: 'Consigue 5 victorias consecutivas',                icon: '🔥' },
  { slug: 'veterano',          name: 'Veterano',              description: 'Juega 50 partidos a lo largo de tu carrera',       icon: '🎖️' },
  { slug: 'fair_play_star',    name: 'Estrella Fair Play',    description: 'Mantén un promedio de Fair Play ≥ 4.5 (5+ votos)', icon: '🤝' },
];

function generateRoundRobin(teamIds: number[]): { homeTeamId: number; awayTeamId: number; weekNumber: number }[] {
  const n = teamIds.length;
  const teams = [...teamIds];
  const matches: { homeTeamId: number; awayTeamId: number; weekNumber: number }[] = [];

  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      matches.push({
        homeTeamId: teams[i],
        awayTeamId: teams[n - 1 - i],
        weekNumber: round + 1,
      });
    }
    // Rotate: keep first fixed, rotate the rest
    teams.splice(1, 0, teams.pop()!);
  }
  return matches;
}

export async function runSeed() {
  const existing = await User.findOne({ where: { email: 'admin@padelnet.com' } });
  if (existing) {
    console.log('Seed: datos ya presentes, saltando...');
    return;
  }

  console.log('Seed: generando datos de prueba...');

  // Achievements catalog
  for (const ach of ACHIEVEMENTS_CATALOG) {
    await Achievement.findOrCreate({ where: { slug: ach.slug }, defaults: ach });
  }

  // Admin
  const adminPwd = await bcrypt.hash('Admin123!', 10);
  const admin = await User.create({
    email: 'admin@padelnet.com',
    password: adminPwd,
    firstName: 'Admin',
    lastName: 'PadelNet',
    role: UserRole.ADMIN,
  });

  // Liga → División → Temporada
  const liga = await League.create({
    name: 'Liga PadelNet 2026',
    description: 'Liga oficial de la temporada 2026',
    adminId: admin.id,
  });

  const division = await Division.create({
    leagueId: liga.id,
    name: 'División 1',
    level: 1,
  });

  const season = await Season.create({
    divisionId: division.id,
    name: 'Temporada 2026',
    startDate: new Date('2026-01-05'),
    status: 'active',
  });

  // 8 equipos con su capitán y 2 jugadores cada uno
  const teamIds: number[] = [];

  for (let i = 0; i < TEAM_NAMES.length; i++) {
    const n = i + 1;

    const captainPwd = await bcrypt.hash('Captain123!', 10);
    const captain = await User.create({
      email: `capitan${n}@padelnet.com`,
      password: captainPwd,
      firstName: `Capitán`,
      lastName: `${TEAM_NAMES[i]}`,
      role: UserRole.CAPTAIN,
    });

    const team = await Team.create({
      name: TEAM_NAMES[i],
      captainId: captain.id,
      description: `Equipo ${TEAM_NAMES[i]}`,
    });
    teamIds.push(team.id);

    await TeamPlayer.create({ teamId: team.id, userId: captain.id });

    for (let j = 1; j <= 2; j++) {
      const playerPwd = await bcrypt.hash('Player123!', 10);
      const player = await User.create({
        email: `jugador${n}_${j}@padelnet.com`,
        password: playerPwd,
        firstName: `Jugador${j}`,
        lastName: `Equipo${n}`,
        role: UserRole.PLAYER,
      });
      await TeamPlayer.create({ teamId: team.id, userId: player.id });
    }

    // Create payment record for each team
    await Payment.create({ teamId: team.id, seasonId: season.id, amount: 150 });
  }

  // Round-robin calendar: 7 jornadas x 4 partidos = 28 partidos
  const calendarEntries = generateRoundRobin(teamIds);
  const seasonStart = new Date('2026-01-05');

  for (const entry of calendarEntries) {
    const matchDate = new Date(seasonStart);
    matchDate.setDate(matchDate.getDate() + (entry.weekNumber - 1) * 7);

    await Match.create({
      seasonId: season.id,
      homeTeamId: entry.homeTeamId,
      awayTeamId: entry.awayTeamId,
      weekNumber: entry.weekNumber,
      matchDate,
      status: 'pending_proposal',
    });
  }

  console.log('Seed completado:');
  console.log('  Admin:     admin@padelnet.com / Admin123!');
  console.log('  Capitanes: capitan1@padelnet.com ... capitan8@padelnet.com / Captain123!');
  console.log('  Jugadores: jugador1_1@padelnet.com ... / Player123!');
  console.log(`  Partidos:  ${calendarEntries.length} generados (calendar round-robin)`);
}
