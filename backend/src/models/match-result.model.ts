import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchResultAttributes {
  id: number;
  matchId: number;
  gameNumber: number;
  homeTeamScore: number;
  awayTeamScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchResultCreationAttributes extends Optional<MatchResultAttributes, 'id'> {}

export class MatchResult extends Model<MatchResultAttributes, MatchResultCreationAttributes> implements MatchResultAttributes {
  declare id: number;
  declare matchId: number;
  declare gameNumber: number;
  declare homeTeamScore: number;
  declare awayTeamScore: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

MatchResult.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false },
  gameNumber: { type: DataTypes.INTEGER, allowNull: false },
  homeTeamScore: { type: DataTypes.INTEGER, allowNull: false },
  awayTeamScore: { type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  tableName: 'match_results',
  timestamps: true,
});
