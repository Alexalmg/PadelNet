import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DivisionAttributes {
  id: number;
  leagueId: number;
  name: string;
  level: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DivisionCreationAttributes extends Optional<DivisionAttributes, 'id' | 'isActive'> {}

export class Division extends Model<DivisionAttributes, DivisionCreationAttributes> implements DivisionAttributes {
  declare id: number;
  declare leagueId: number;
  declare name: string;
  declare level: number;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Division.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  level: { type: DataTypes.INTEGER, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'divisions',
  timestamps: true,
});
