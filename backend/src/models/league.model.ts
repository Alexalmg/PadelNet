import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface LeagueAttributes {
  id: number;
  name: string;
  description?: string;
  adminId?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeagueCreationAttributes extends Optional<LeagueAttributes, 'id' | 'description' | 'adminId' | 'isActive'> {}

export class League extends Model<LeagueAttributes, LeagueCreationAttributes> implements LeagueAttributes {
  declare id: number;
  declare name: string;
  declare description?: string;
  declare adminId?: number;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

League.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  adminId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'leagues',
  timestamps: true,
});
