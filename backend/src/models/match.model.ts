import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type MatchStatus = 'pending_proposal' | 'proposed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

interface MatchAttributes {
  id: number;
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  matchDate?: Date;
  weekNumber: number;
  status: MatchStatus;
  location?: string;
  clubId?: number;
  homeTeamConfirmed: boolean;
  awayTeamConfirmed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchCreationAttributes extends Optional<MatchAttributes, 'id' | 'status' | 'homeTeamConfirmed' | 'awayTeamConfirmed'> {}

export class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  declare id: number;
  declare seasonId: number;
  declare homeTeamId: number;
  declare awayTeamId: number;
  declare matchDate: Date;
  declare weekNumber: number;
  declare status: MatchStatus;
  declare location: string;
  declare clubId?: number;
  declare homeTeamConfirmed: boolean;
  declare awayTeamConfirmed: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Match.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  seasonId: { type: DataTypes.INTEGER, allowNull: false },
  homeTeamId: { type: DataTypes.INTEGER, allowNull: false },
  awayTeamId: { type: DataTypes.INTEGER, allowNull: false },
  matchDate: { type: DataTypes.DATE },
  weekNumber: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending_proposal' },
  location: { type: DataTypes.STRING(255) },
  clubId: { type: DataTypes.INTEGER, allowNull: true },
  homeTeamConfirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
  awayTeamConfirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  tableName: 'matches',
  timestamps: true,
});
