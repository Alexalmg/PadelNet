import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PlayerStatsAttributes {
  id: number;
  userId: number;
  seasonId: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  mvpCount: number;
  elo: number;
  fairPlayAvg: number;
  fairPlayVotes: number;
  winStreak: number;
  bestWinStreak: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlayerStatsCreationAttributes extends Optional<PlayerStatsAttributes, 'id' | 'matchesPlayed' | 'wins' | 'losses' | 'setsWon' | 'setsLost' | 'mvpCount' | 'elo' | 'fairPlayAvg' | 'fairPlayVotes' | 'winStreak' | 'bestWinStreak'> {}

export class PlayerStats extends Model<PlayerStatsAttributes, PlayerStatsCreationAttributes> implements PlayerStatsAttributes {
  declare id: number;
  declare userId: number;
  declare seasonId: number;
  declare matchesPlayed: number;
  declare wins: number;
  declare losses: number;
  declare setsWon: number;
  declare setsLost: number;
  declare mvpCount: number;
  declare elo: number;
  declare fairPlayAvg: number;
  declare fairPlayVotes: number;
  declare winStreak: number;
  declare bestWinStreak: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PlayerStats.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  seasonId: { type: DataTypes.INTEGER, allowNull: false },
  matchesPlayed: { type: DataTypes.INTEGER, defaultValue: 0 },
  wins: { type: DataTypes.INTEGER, defaultValue: 0 },
  losses: { type: DataTypes.INTEGER, defaultValue: 0 },
  setsWon: { type: DataTypes.INTEGER, defaultValue: 0 },
  setsLost: { type: DataTypes.INTEGER, defaultValue: 0 },
  mvpCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  elo: { type: DataTypes.INTEGER, defaultValue: 1000 },
  fairPlayAvg: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0 },
  fairPlayVotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  winStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
  bestWinStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  sequelize,
  tableName: 'player_stats',
  timestamps: true,
});
