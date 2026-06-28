import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TeamAttributes {
  id: number;
  name: string;
  captainId?: number;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamCreationAttributes extends Optional<TeamAttributes, 'id' | 'captainId' | 'description' | 'isActive'> {}

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  declare id: number;
  declare name: string;
  declare captainId?: number;
  declare description?: string;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Team.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  captainId: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'teams',
  timestamps: true,
});
