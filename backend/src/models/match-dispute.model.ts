import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchDisputeAttributes {
  id: number;
  matchId: number;
  raisedBy: number;
  reason: string;
  status: 'open' | 'resolved';
  resolution?: string;
  resolvedBy?: number;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchDisputeCreationAttributes extends Optional<MatchDisputeAttributes, 'id' | 'status'> {}

export class MatchDispute extends Model<MatchDisputeAttributes, MatchDisputeCreationAttributes> implements MatchDisputeAttributes {
  declare id: number;
  declare matchId: number;
  declare raisedBy: number;
  declare reason: string;
  declare status: 'open' | 'resolved';
  declare resolution: string;
  declare resolvedBy: number;
  declare resolvedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

MatchDispute.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false },
  raisedBy: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'open' },
  resolution: { type: DataTypes.TEXT },
  resolvedBy: { type: DataTypes.INTEGER },
  resolvedAt: { type: DataTypes.DATE },
}, {
  sequelize,
  tableName: 'match_disputes',
  timestamps: true,
});
