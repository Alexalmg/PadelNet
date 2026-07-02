import bcrypt from 'bcryptjs';
import { sequelize } from './config/database';
import {
  User, UserRole, Team, League, Division, Season, TeamPlayer,
  Match, MatchResult, Lineup, Achievement, Payment, MvpVote, PlayerStats,
  Announcement, Sponsor, Club,
} from './models';

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

const CLUBS_DATA = [
  { name: 'Madrid Central Padel',             address: 'Calle Boyer 28, 28052 Madrid',                           latitude: 40.4035130, longitude: -3.6062750, phone: '600000001' },
  { name: 'BamVolea Ciudad de la Raqueta',    address: 'Calle Monasterio de El Paular 2, 28049 Madrid',          latitude: 40.5019050, longitude: -3.7029510, phone: '600000002' },
  { name: 'Padel Kas',                         address: 'Calle de Luis I 56, 28031 Madrid',                       latitude: 40.3855730, longitude: -3.6554550, phone: '600000003' },
  { name: 'Indie Padel Club',                 address: 'Avenida de la Democracia 11, 28031 Madrid',              latitude: 40.3801230, longitude: -3.6190890, phone: '600000004' },
  { name: 'Club y Escuela de Padel IberiaMart', address: 'Calle de Orense 34, 28020 Madrid',                    latitude: 40.4578150, longitude: -3.6934500, phone: '600000005' },
  { name: 'Las Tablas Sports Club',           address: 'Avenida del Camino de Santiago 37, 28050 Madrid',        latitude: 40.5052910, longitude: -3.6669920, phone: '600000006' },
  { name: 'Cristalia Club de Pádel',          address: 'Vía de los Poblados 3, 28033 Madrid',                   latitude: 40.4704380, longitude: -3.6358320, phone: '600000007' },
  { name: 'Vim Padel Indoor',                 address: 'Calle del Viento 7, 28022 Madrid',                       latitude: 40.4437380, longitude: -3.6191450, phone: '600000008' },
  { name: 'Bnfit Padel',                      address: 'Calle del Padre Damián 26, 28036 Madrid',                latitude: 40.4568910, longitude: -3.6853240, phone: '600000009' },
  { name: 'MOMO by Making Padel',             address: 'Calle Aracne s/n, C.C. Las Rejas, 28022 Madrid',        latitude: 40.4428010, longitude: -3.5702220, phone: '600000010' },
  { name: 'Club Fuencarral A La Par',         address: 'Calle Monasterio de las Huelgas 15, 28049 Madrid',       latitude: 40.5034120, longitude: -3.7011930, phone: '600000011' },
  { name: 'Pádel Club Usera',                 address: 'Avenida de los Poblados s/n, 28041 Madrid',              latitude: 40.3831380, longitude: -3.7042520, phone: '600000012' },
  { name: 'Pádel 2.0 (Móstoles)',             address: 'Calle Puerto de Navacerrada 59, 28935 Móstoles',         latitude: 40.3168240, longitude: -3.8732950, phone: '600000013' },
  { name: 'Euroindoor Alcorcón',              address: 'Calle de la Física 36, 28923 Alcorcón',                  latitude: 40.3421520, longitude: -3.8441110, phone: '600000014' },
  { name: 'David Lloyd La Finca',             address: 'Paseo del Club Deportivo 4, 28223 Pozuelo de Alarcón',   latitude: 40.4192300, longitude: -3.8052950, phone: '600000015' },
  { name: 'Padel Go Indoor Parla',            address: 'Calle de París 12, 28983 Parla',                         latitude: 40.2361230, longitude: -3.7711200, phone: '600000016' },
  { name: 'Padel Norte (Alcobendas)',         address: 'Avenida de Valdelaparra 69, 28108 Alcobendas',           latitude: 40.5358240, longitude: -3.6368810, phone: '600000017' },
  { name: 'Blue Padel Rivas',                 address: 'Calle del Electrodo 68, 28522 Rivas-Vaciamadrid',        latitude: 40.3541520, longitude: -3.5358120, phone: '600000018' },
  { name: 'BamVolea Padel Training Indoor',   address: 'Calle de la Fundición 4, 28522 Rivas-Vaciamadrid',       latitude: 40.3501230, longitude: -3.5401920, phone: '600000019' },
  { name: 'BamVolea GET Indoor Padel',        address: 'Calle de la Estrategia 2, 28906 Getafe',                 latitude: 40.3012950, longitude: -3.7329120, phone: '600000020' },
];

// Sets: [homeScore, awayScore] per set. Winner = team with more set wins.
// W1..W5 = completed weeks. Each has 4 matches.
const COMPLETED_RESULTS: Array<{ sets: [number, number][] }> = [
  // Week 1: T1vT8, T2vT7, T3vT6, T4vT5
  { sets: [[6,3],[6,4]]       },  // T1 beats T8  2-0
  { sets: [[3,6],[2,6]]       },  // T7 beats T2  0-2 (away wins)
  { sets: [[6,4],[3,6],[6,3]] },  // T3 beats T6  2-1
  { sets: [[4,6],[3,6]]       },  // T5 beats T4  0-2 (away wins)
  // Week 2: T1vT7, T8vT6, T2vT5, T3vT4
  { sets: [[6,2],[6,3]]       },  // T1 beats T7  2-0
  { sets: [[6,4],[3,6],[3,6]] },  // T6 beats T8  1-2 (away wins)
  { sets: [[6,4],[3,6],[2,6]] },  // T5 beats T2  1-2 (away wins)
  { sets: [[6,3],[6,4]]       },  // T3 beats T4  2-0
  // Week 3: T1vT6, T7vT5, T8vT4, T2vT3
  { sets: [[6,1],[6,3]]       },  // T1 beats T6  2-0
  { sets: [[6,4],[2,6],[6,3]] },  // T7 beats T5  2-1
  { sets: [[3,6],[1,6]]       },  // T4 beats T8  0-2 (away wins)
  { sets: [[4,6],[2,6]]       },  // T3 beats T2  0-2 (away wins)
  // Week 4: T1vT5, T6vT4, T7vT3, T8vT2
  { sets: [[6,4],[4,6],[6,3]] },  // T1 beats T5  2-1
  { sets: [[4,6],[3,6]]       },  // T4 beats T6  0-2 (away wins)
  { sets: [[6,3],[3,6],[3,6]] },  // T3 beats T7  1-2 (away wins)
  { sets: [[6,4],[6,3]]       },  // T8 beats T2  2-0
  // Week 5: T1vT4, T5vT3, T6vT2, T7vT8
  { sets: [[6,4],[3,6],[4,6]] },  // T4 beats T1  1-2 (away wins)
  { sets: [[6,4],[3,6],[6,4]] },  // T5 beats T3  2-1
  { sets: [[3,6],[4,6]]       },  // T2 beats T6  0-2 (away wins)
  { sets: [[6,3],[6,2]]       },  // T7 beats T8  2-0
];

function d(dateStr: string, hour = 20, min = 0) {
  const dt = new Date(`${dateStr}T${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`);
  return dt;
}

// Week 6 match schedule (this week, June 29 – July 3)
const WEEK6_DATES = [
  d('2026-06-29', 20, 0),   // T1vT3 – today!
  d('2026-06-29', 21, 30),  // T4vT2 – today!
  d('2026-07-01', 20, 0),   // T5vT8 – Wednesday
  d('2026-07-03', 21, 0),   // T6vT7 – Friday
];

// Week 7 provisional dates (next week)
const WEEK7_DATES = [
  d('2026-07-07', 20, 0),
  d('2026-07-07', 21, 30),
  d('2026-07-09', 20, 0),
  d('2026-07-09', 21, 0),
];

// Past match dates
const PAST_DATES = [
  d('2026-06-02', 20, 0), d('2026-06-02', 21, 30),
  d('2026-06-02', 20, 0), d('2026-06-02', 21, 30),
  d('2026-06-09', 20, 0), d('2026-06-09', 21, 30),
  d('2026-06-09', 20, 0), d('2026-06-09', 21, 30),
  d('2026-06-16', 20, 0), d('2026-06-16', 21, 30),
  d('2026-06-16', 20, 0), d('2026-06-16', 21, 30),
  d('2026-06-21', 10, 0), d('2026-06-21', 12, 0),
  d('2026-06-21', 10, 0), d('2026-06-21', 12, 0),
  d('2026-06-26', 20, 0), d('2026-06-26', 21, 30),
  d('2026-06-26', 20, 0), d('2026-06-26', 21, 30),
];

function generateRoundRobin(teamIds: number[]): { homeTeamId: number; awayTeamId: number; weekNumber: number }[] {
  const n = teamIds.length;
  const teams = [...teamIds];
  const matches: { homeTeamId: number; awayTeamId: number; weekNumber: number }[] = [];
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      matches.push({ homeTeamId: teams[i], awayTeamId: teams[n - 1 - i], weekNumber: round + 1 });
    }
    teams.splice(1, 0, teams.pop()!);
  }
  return matches;
}

export async function runSeed() {
  // ── 1. Truncate everything ──────────────────────────────────────────────
  await sequelize.query(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
      LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE'; END LOOP;
    END $$;
  `);
  console.log('Seed: tablas vaciadas');

  // ── 2. Achievements ─────────────────────────────────────────────────────
  for (const ach of ACHIEVEMENTS_CATALOG) {
    await Achievement.create(ach);
  }

  // ── 3. Clubs ────────────────────────────────────────────────────────────
  const clubs: Club[] = [];
  for (const c of CLUBS_DATA) {
    clubs.push(await Club.create(c));
  }
  console.log(`Seed: ${clubs.length} clubes creados`);

  // ── 4. Admin ────────────────────────────────────────────────────────────
  const adminPwd = await bcrypt.hash('Admin123!', 10);
  const admin = await User.create({
    email: 'admin@padelnet.com', password: adminPwd,
    firstName: 'Admin', lastName: 'PadelNet',
    role: UserRole.ADMIN, emailVerified: true, username: 'admin_padelnet',
  });

  // ── Extra admin ──────────────────────────────────────────────────────────
  const admin2Pwd = await bcrypt.hash('111111', 10);
  await User.create({
    email: 'alejandroaf2005@gmail.com', password: admin2Pwd,
    firstName: 'Alejandro', lastName: 'Admin',
    role: UserRole.ADMIN, emailVerified: true, username: 'alejandro_admin',
  });

  // ── 5. Liga → División → Temporada ──────────────────────────────────────
  const liga = await League.create({
    name: 'Liga PadelNet 2026', description: 'Liga oficial de la temporada 2026', adminId: admin.id,
  });
  const division = await Division.create({ leagueId: liga.id, name: 'División 1', level: 1 });
  const season = await Season.create({
    divisionId: division.id, name: 'Temporada 2026',
    startDate: new Date('2026-06-02'), status: 'active',
  });

  // ── 6. Equipos: capitán + 3 jugadores ───────────────────────────────────
  const captainPwd = await bcrypt.hash('Captain123!', 10);
  const playerPwd  = await bcrypt.hash('Player123!', 10);

  const teamIds: number[] = [];
  const captainByTeam: Record<number, User> = {};    // teamId → captain User
  const playersByTeam: Record<number, User[]> = {};  // teamId → players (including captain)

  for (let i = 0; i < TEAM_NAMES.length; i++) {
    const n = i + 1;
    const slug = TEAM_NAMES[i].toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const captain = await User.create({
      email: `capitan${n}@padelnet.com`, password: captainPwd,
      firstName: 'Capitán', lastName: TEAM_NAMES[i],
      role: UserRole.CAPTAIN, emailVerified: true,
      username: `cap_${slug}`,
    });

    const team = await Team.create({ name: TEAM_NAMES[i], captainId: captain.id, description: `Equipo ${TEAM_NAMES[i]}` });
    teamIds.push(team.id);
    captainByTeam[team.id] = captain;
    playersByTeam[team.id] = [captain];

    await TeamPlayer.create({ teamId: team.id, userId: captain.id });
    await Payment.create({ teamId: team.id, seasonId: season.id, amount: 150, status: 'pending' });

    for (let j = 1; j <= 3; j++) {
      const player = await User.create({
        email: `jugador${n}_${j}@padelnet.com`, password: playerPwd,
        firstName: `Jugador${j}`, lastName: `Equipo${n}`,
        role: UserRole.PLAYER, emailVerified: true,
        username: `jug${n}_${j}_${slug.slice(0, 6)}`,
      });
      await TeamPlayer.create({ teamId: team.id, userId: player.id });
      playersByTeam[team.id].push(player);
    }
  }

  // ── 7. Calendario round-robin ────────────────────────────────────────────
  const calendar = generateRoundRobin(teamIds);

  // Track per-player stats: { matchesPlayed, wins, losses, setsWon, setsLost }
  const statsMap: Record<number, { mp: number; w: number; l: number; sw: number; sl: number; mvp: number }> = {};
  const initStats = (userId: number) => {
    if (!statsMap[userId]) statsMap[userId] = { mp: 0, w: 0, l: 0, sw: 0, sl: 0, mvp: 0 };
  };

  let resultIdx = 0;
  let clubIdx = 0;
  const allMatches: Match[] = [];

  for (const entry of calendar) {
    const { homeTeamId, awayTeamId, weekNumber } = entry;
    const isPast   = weekNumber <= 5;
    const isThisWk = weekNumber === 6;
    const isFuture = weekNumber === 7;

    const matchDateIdx = isPast ? resultIdx : (isThisWk ? weekNumber - 6 : weekNumber - 7);
    const matchDate = isPast
      ? PAST_DATES[resultIdx]
      : isThisWk
      ? WEEK6_DATES[calendar.filter(e => e.weekNumber === 6).indexOf(entry)]
      : WEEK7_DATES[calendar.filter(e => e.weekNumber === 7).indexOf(entry)];

    const clubId = clubs[clubIdx % clubs.length].id;

    const match = await Match.create({
      seasonId: season.id,
      homeTeamId, awayTeamId, weekNumber,
      matchDate,
      status: isPast ? 'completed' : isThisWk ? 'scheduled' : 'pending_proposal',
      homeTeamConfirmed: isPast,
      awayTeamConfirmed: isPast,
      clubId: isPast || isThisWk ? clubId : undefined,
      location: isPast || isThisWk ? clubs[clubIdx % clubs.length].name : undefined,
    });

    allMatches.push(match);
    clubIdx++;

    if (isPast) {
      const res = COMPLETED_RESULTS[resultIdx];
      let homeSetsWon = 0, awaySetsWon = 0, homePtsWon = 0, awayPtsWon = 0;

      for (let g = 0; g < res.sets.length; g++) {
        const [hs, as_] = res.sets[g];
        await MatchResult.create({ matchId: match.id, gameNumber: g + 1, homeTeamScore: hs, awayTeamScore: as_ });
        if (hs > as_) homeSetsWon++; else awaySetsWon++;
        homePtsWon += hs; awayPtsWon += as_;
      }

      const homeWon = homeSetsWon > awaySetsWon;

      // Update stats for all players on both teams
      for (const uid of [...playersByTeam[homeTeamId], ...playersByTeam[awayTeamId]].map(u => u.id)) {
        initStats(uid);
      }
      for (const u of playersByTeam[homeTeamId]) {
        initStats(u.id);
        statsMap[u.id].mp++;
        if (homeWon) statsMap[u.id].w++; else statsMap[u.id].l++;
        statsMap[u.id].sw += homeSetsWon; statsMap[u.id].sl += awaySetsWon;
      }
      for (const u of playersByTeam[awayTeamId]) {
        initStats(u.id);
        statsMap[u.id].mp++;
        if (!homeWon) statsMap[u.id].w++; else statsMap[u.id].l++;
        statsMap[u.id].sw += awaySetsWon; statsMap[u.id].sl += homeSetsWon;
      }

      // MVP vote: home captain votes for a player on away team (and vice versa)
      const homeCap = captainByTeam[homeTeamId];
      const awayCap = captainByTeam[awayTeamId];
      const awayPlayers = playersByTeam[awayTeamId];
      const homePlayers = playersByTeam[homeTeamId];
      const mvpAway = awayPlayers[resultIdx % awayPlayers.length];
      const mvpHome = homePlayers[resultIdx % homePlayers.length];

      await MvpVote.create({ matchId: match.id, votedBy: homeCap.id, mvpUserId: mvpAway.id, ratedTeamId: awayTeamId, fairPlayScore: 4 + (resultIdx % 2) });
      await MvpVote.create({ matchId: match.id, votedBy: awayCap.id, mvpUserId: mvpHome.id, ratedTeamId: homeTeamId, fairPlayScore: 4 + ((resultIdx + 1) % 2) });

      statsMap[mvpAway.id].mvp++;
      statsMap[mvpHome.id].mvp++;

      resultIdx++;
    }
  }

  // ── 8. PlayerStats ───────────────────────────────────────────────────────
  const baseElo = 1000;
  for (const [userIdStr, s] of Object.entries(statsMap)) {
    const userId = parseInt(userIdStr);
    const elo = baseElo + s.w * 15 - s.l * 10 + s.mvp * 5;
    await PlayerStats.create({
      userId, seasonId: season.id,
      matchesPlayed: s.mp, wins: s.w, losses: s.l,
      setsWon: s.sw, setsLost: s.sl,
      mvpCount: s.mvp, elo,
      fairPlayAvg: 4.2 + Math.random() * 0.6,
      fairPlayVotes: s.mp * 2,
      winStreak: Math.min(s.w, 3),
      bestWinStreak: Math.min(s.w, 4),
    });
  }

  // ── 9. Lineups ───────────────────────────────────────────────────────────
  for (const m of allMatches) {
    if (!['completed', 'scheduled', 'in_progress'].includes(m.status)) continue;
    for (const teamId of [m.homeTeamId, m.awayTeamId]) {
      const teamPlayers = playersByTeam[teamId];
      if (!teamPlayers || teamPlayers.length < 2) continue;
      // Prefer non-captain players (indices 1 and 2), fall back if team is small
      const p1 = teamPlayers[Math.min(1, teamPlayers.length - 1)];
      const p2 = teamPlayers[Math.min(2, teamPlayers.length - 1)];
      if (p1.id === p2.id) continue;
      await Lineup.create({ matchId: m.id, teamId, pairNumber: 1, player1Id: p1.id, player2Id: p2.id });
    }
  }

  // ── 10. Announcements ────────────────────────────────────────────────────
  const announcements: Array<{ title: string; content: string; type: 'system' | 'manual'; isPinned: boolean }> = [
    { title: '⚡ Bienvenidos a la Temporada 2026', content: 'Arranca la liga con 8 equipos y 7 jornadas de acción. ¡Mucha suerte a todos!', type: 'system', isPinned: true },
    { title: '🗓️ Jornada 6 – El gran partido', content: 'Esta tarde Raquetas FC vs Los Dinamita. Dos equipos invictos se ven las caras. ¡No te lo pierdas!', type: 'manual', isPinned: true },
    { title: '📍 Nuevos clubes en el mapa', content: 'Ya podéis ver los 20 clubes colaboradores en el mapa de la app. ¡Abridlos en Waze o Apple Maps!', type: 'system', isPinned: false },
    { title: '💳 Recordatorio de cuotas', content: 'Queda un mes para cerrar el periodo de inscripción. Los equipos con cuota pendiente podrían ser excluidos.', type: 'manual', isPinned: false },
    { title: '🏆 Clasificación actualizada', content: 'Raquetas FC y Los Dinamita lideran empatados con 4 victorias. La lucha está más abierta que nunca en el resto de posiciones.', type: 'system', isPinned: false },
  ];
  for (const ann of announcements) {
    await Announcement.create({ ...ann, authorId: admin.id });
  }

  // ── 11. Sponsors ─────────────────────────────────────────────────────────
  await Sponsor.create({ name: 'Head Padel', websiteUrl: 'https://www.head.com', isActive: true });
  await Sponsor.create({ name: 'Bullpadel',  websiteUrl: 'https://www.bullpadel.com', isActive: true });
  await Sponsor.create({ name: 'Nox Sport',  websiteUrl: 'https://www.noxsport.com', isActive: true });

  console.log('✅ Seed completado:');
  console.log('   Admin 1:   admin@padelnet.com / Admin123!');
  console.log('   Admin 2:   alejandroaf2005@gmail.com / 111111');
  console.log('   Capitanes: capitan1@padelnet.com … capitan8@padelnet.com / Captain123!');
  console.log('   Jugadores: jugador1_1@padelnet.com … / Player123!');
  console.log('   Partidos:  20 completados (sem 1-5) + 4 esta semana + 4 pendientes (sem 7)');
  console.log('   Clubes:    20 clubes de Madrid insertados');
  console.log('   Alineaciones: creadas para todos los partidos completados y programados');
}
