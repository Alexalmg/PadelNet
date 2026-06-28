import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchRequestAttributes {
  id: number;
  seasonId: number;
  requestingTeamId: number;
  opposingTeamId: number;
  weekNumber: number;
  proposedDate: Date;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchRequestCreationAttributes extends Optional<MatchRequestAttributes, 'id' | 'status' | 'message'> {}

export class MatchRequest extends Model<MatchRequestAttributes, MatchRequestCreationAttributes> implements MatchRequestAttributes {
  declare id: number;
  declare seasonId: number;
  declare requestingTeamId: number;
  declare opposingTeamId: number;
  declare weekNumber: number;
  declare proposedDate: Date;
  declare message?: string;
  declare status: 'pending' | 'accepted' | 'rejected';
  declare createdAt: Date;
  declare updatedAt: Date;
}

MatchRequest.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  seasonId: { type: DataTypes.INTEGER, allowNull: false },
  requestingTeamId: { type: DataTypes.INTEGER, allowNull: false },
  opposingTeamId: { type: DataTypes.INTEGER, allowNull: false },
  weekNumber: { type: DataTypes.INTEGER, allowNull: false },
  proposedDate: { type: DataTypes.DATE, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
}, {
  sequelize,
  tableName: 'match_requests',
  timestamps: true,
});
