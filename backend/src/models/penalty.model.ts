import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PenaltyAttributes {
  id: number;
  teamId: number;
  seasonId: number;
  type: 'automatic' | 'manual';
  reason: 'no_activity' | 'late_result' | 'no_show' | 'other';
  points: number;
  description?: string;
  appliedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PenaltyCreationAttributes extends Optional<PenaltyAttributes, 'id' | 'description' | 'appliedBy'> {}

export class Penalty extends Model<PenaltyAttributes, PenaltyCreationAttributes> implements PenaltyAttributes {
  declare id: number;
  declare teamId: number;
  declare seasonId: number;
  declare type: 'automatic' | 'manual';
  declare reason: 'no_activity' | 'late_result' | 'no_show' | 'other';
  declare points: number;
  declare description?: string;
  declare appliedBy?: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Penalty.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  seasonId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(20), allowNull: false },
  reason: { type: DataTypes.STRING(50), allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  appliedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  sequelize,
  tableName: 'penalties',
  timestamps: true,
});
