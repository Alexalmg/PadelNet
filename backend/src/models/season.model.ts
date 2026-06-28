import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SeasonAttributes {
  id: number;
  divisionId: number;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'finished';
  createdAt?: Date;
  updatedAt?: Date;
}

interface SeasonCreationAttributes extends Optional<SeasonAttributes, 'id' | 'endDate' | 'status'> {}

export class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  declare id: number;
  declare divisionId: number;
  declare name: string;
  declare startDate: Date;
  declare endDate?: Date;
  declare status: 'planning' | 'active' | 'finished';
  declare createdAt: Date;
  declare updatedAt: Date;
}

Season.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  divisionId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(20), defaultValue: 'planning' },
}, {
  sequelize,
  tableName: 'seasons',
  timestamps: true,
});
