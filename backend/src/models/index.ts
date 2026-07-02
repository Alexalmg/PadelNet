export { User, UserRole } from './user.model';
export { Team } from './team.model';
export { League } from './league.model';
export { Division } from './division.model';
export { Season } from './season.model';
export { TeamPlayer } from './team-player.model';
export { Match } from './match.model';
export { MatchResult } from './match-result.model';
export { Lineup } from './lineup.model';
export { Penalty } from './penalty.model';
export { ActivityLog } from './activity-log.model';
export { CaptainRequest } from './captain-request.model';
export { MatchRequest } from './match-request.model';
export { MatchProposal } from './match-proposal.model';
export { MatchMessage } from './match-message.model';
export { MatchDispute } from './match-dispute.model';
export { MvpVote } from './mvp-vote.model';
export { PlayerStats } from './player-stats.model';
export { Achievement } from './achievement.model';
export { UserAchievement } from './user-achievement.model';
export { Payment } from './payment.model';
export { Sponsor } from './sponsor.model';
export { Announcement } from './announcement.model';
export { TeamInvitation } from './team-invitation.model';
export { TeamJoinRequest } from './team-join-request.model';
export { Club } from './club.model';

import { User } from './user.model';
import { Team } from './team.model';
import { League } from './league.model';
import { Division } from './division.model';
import { Season } from './season.model';
import { TeamPlayer } from './team-player.model';
import { Match } from './match.model';
import { MatchResult } from './match-result.model';
import { Lineup } from './lineup.model';
import { Penalty } from './penalty.model';
import { ActivityLog } from './activity-log.model';
import { CaptainRequest } from './captain-request.model';
import { MatchRequest } from './match-request.model';
import { MatchProposal } from './match-proposal.model';
import { MatchMessage } from './match-message.model';
import { MatchDispute } from './match-dispute.model';
import { MvpVote } from './mvp-vote.model';
import { PlayerStats } from './player-stats.model';
import { Achievement } from './achievement.model';
import { UserAchievement } from './user-achievement.model';
import { Payment } from './payment.model';
import { Sponsor } from './sponsor.model';
import { Announcement } from './announcement.model';
import { TeamInvitation } from './team-invitation.model';
import { TeamJoinRequest } from './team-join-request.model';
import { Club } from './club.model';

// Teams & Users
Team.belongsTo(User, { foreignKey: 'captainId', as: 'captain' });
User.hasMany(Team, { foreignKey: 'captainId', as: 'captainedTeams' });

// Leagues
League.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// Divisions
Division.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });
League.hasMany(Division, { foreignKey: 'leagueId', as: 'divisions' });

// Seasons
Season.belongsTo(Division, { foreignKey: 'divisionId', as: 'division' });
Division.hasMany(Season, { foreignKey: 'divisionId', as: 'seasons' });

// Team players
TeamPlayer.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
TeamPlayer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Team.hasMany(TeamPlayer, { foreignKey: 'teamId', as: 'players' });
User.hasMany(TeamPlayer, { foreignKey: 'userId', as: 'teamMemberships' });

// Matches
Match.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
Match.belongsTo(Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
Match.belongsTo(Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });
Match.hasMany(MatchResult, { foreignKey: 'matchId', as: 'results' });
Match.hasMany(Lineup, { foreignKey: 'matchId', as: 'lineups' });

// Lineups
Lineup.belongsTo(Team, { foreignKey: 'teamId', as: 'lineupTeam' });
Lineup.belongsTo(User, { foreignKey: 'player1Id', as: 'player1' });
Lineup.belongsTo(User, { foreignKey: 'player2Id', as: 'player2' });

// Penalties
Penalty.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Penalty.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
Penalty.belongsTo(User, { foreignKey: 'appliedBy', as: 'appliedByUser' });

// Activity logs
ActivityLog.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
ActivityLog.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

// Captain requests
CaptainRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CaptainRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
User.hasMany(CaptainRequest, { foreignKey: 'userId', as: 'captainRequests' });

// Match requests
MatchRequest.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
MatchRequest.belongsTo(Team, { foreignKey: 'requestingTeamId', as: 'requestingTeam' });
MatchRequest.belongsTo(Team, { foreignKey: 'opposingTeamId', as: 'opposingTeam' });

// Match proposals
MatchProposal.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MatchProposal.belongsTo(Team, { foreignKey: 'proposingTeamId', as: 'proposingTeam' });
MatchProposal.belongsTo(User, { foreignKey: 'proposedBy', as: 'proposer' });
Match.hasMany(MatchProposal, { foreignKey: 'matchId', as: 'proposals' });

// Match messages
MatchMessage.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MatchMessage.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Match.hasMany(MatchMessage, { foreignKey: 'matchId', as: 'messages' });

// Match disputes
MatchDispute.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MatchDispute.belongsTo(User, { foreignKey: 'raisedBy', as: 'raisedByUser' });
MatchDispute.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolvedByUser' });
Match.hasMany(MatchDispute, { foreignKey: 'matchId', as: 'disputes' });

// MVP votes
MvpVote.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MvpVote.belongsTo(User, { foreignKey: 'votedBy', as: 'voter' });
MvpVote.belongsTo(User, { foreignKey: 'mvpUserId', as: 'mvpPlayer' });
MvpVote.belongsTo(Team, { foreignKey: 'ratedTeamId', as: 'ratedTeam' });
Match.hasMany(MvpVote, { foreignKey: 'matchId', as: 'mvpVotes' });

// Player stats
PlayerStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PlayerStats.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
User.hasMany(PlayerStats, { foreignKey: 'userId', as: 'stats' });

// Achievements
UserAchievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId', as: 'achievement' });
User.hasMany(UserAchievement, { foreignKey: 'userId', as: 'userAchievements' });
Achievement.hasMany(UserAchievement, { foreignKey: 'achievementId', as: 'userAchievements' });

// Payments
Payment.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Payment.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
Team.hasMany(Payment, { foreignKey: 'teamId', as: 'payments' });

// Announcements
Announcement.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Team invitations
TeamInvitation.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
TeamInvitation.belongsTo(User, { foreignKey: 'invitedUserId', as: 'invitedUser' });
TeamInvitation.belongsTo(User, { foreignKey: 'invitedBy', as: 'inviter' });
Team.hasMany(TeamInvitation, { foreignKey: 'teamId', as: 'invitations' });
User.hasMany(TeamInvitation, { foreignKey: 'invitedUserId', as: 'teamInvitations' });

// Clubs & matches
Match.belongsTo(Club, { foreignKey: 'clubId', as: 'club' });
Club.hasMany(Match, { foreignKey: 'clubId', as: 'matches' });

// Team join requests
TeamJoinRequest.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
TeamJoinRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Team.hasMany(TeamJoinRequest, { foreignKey: 'teamId', as: 'joinRequests' });
User.hasMany(TeamJoinRequest, { foreignKey: 'userId', as: 'joinRequests' });
