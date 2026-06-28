import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ActivityLogAttributes {
  id: number;
  teamId: number;
  seasonId: number;
  weekStartDate: Date;
  weekEndDate: Date;
  matchesPlayed: number;
  infractionCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ActivityLogCreationAttributes extends Optional<ActivityLogAttributes, 'id' | 'matchesPlayed' | 'infractionCount'> {}

export class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  declare id: number;
  declare teamId: number;
  declare seasonId: number;
  declare weekStartDate: Date;
  declare weekEndDate: Date;
  declare matchesPlayed: number;
  declare infractionCount: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ActivityLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  seasonId: { type: DataTypes.INTEGER, allowNull: false },
  weekStartDate: { type: DataTypes.DATEONLY, allowNull: false },
  weekEndDate: { type: DataTypes.DATEONLY, allowNull: false },
  matchesPlayed: { type: DataTypes.INTEGER, defaultValue: 0 },
  infractionCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  sequelize,
  tableName: 'activity_logs',
  timestamps: true,
});
