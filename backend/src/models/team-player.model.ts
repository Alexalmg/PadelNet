import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TeamPlayerAttributes {
  id: number;
  teamId: number;
  userId: number;
  joinedAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamPlayerCreationAttributes extends Optional<TeamPlayerAttributes, 'id' | 'joinedAt' | 'isActive'> {}

export class TeamPlayer extends Model<TeamPlayerAttributes, TeamPlayerCreationAttributes> implements TeamPlayerAttributes {
  declare id: number;
  declare teamId: number;
  declare userId: number;
  declare joinedAt: Date;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

TeamPlayer.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'team_players',
  timestamps: true,
});
